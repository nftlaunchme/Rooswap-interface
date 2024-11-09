import { Currency, CurrencyAmount, Token, NativeCurrency, NATIVE_TOKEN } from '../types/currency'

export function adaptAnyCurrency(currency: any): Currency | undefined {
  if (!currency) return undefined
  
  // If it's already a proper Currency type, return it
  if (currency.getAddress && typeof currency.getAddress === 'function') {
    return currency as Currency
  }

  // Create a proper Token or NativeCurrency object
  if (currency.isNative) {
    return NATIVE_TOKEN
  } else if (currency.address) {
    const token: Token = {
      isToken: true,
      isNative: false,
      chainId: currency.chainId || 25, // Default to Cronos
      decimals: currency.decimals || 18,
      symbol: currency.symbol,
      name: currency.name,
      address: currency.address,
      equals: function(other: Currency): boolean {
        return !other.isNative && other.getAddress().toLowerCase() === this.address.toLowerCase()
      },
      sortsBefore: function(other: Token): boolean {
        return this.address.toLowerCase() < other.address.toLowerCase()
      },
      wrapped: {} as Token,
      getAddress: function(): string {
        return this.address
      }
    }
    token.wrapped = token
    return token
  }

  return undefined
}

export function adaptAnyToCurrencyAmount(amount: any): CurrencyAmount<Currency> | undefined {
  if (!amount) return undefined
  if (amount instanceof CurrencyAmount) return amount
  
  // If it's a raw amount with currency info
  if (amount.currency && amount.raw) {
    const currency = adaptAnyCurrency(amount.currency)
    if (!currency) return undefined
    return CurrencyAmount.fromRaw(currency, amount.raw)
  }
  
  return undefined
}

export function ensureCurrencyAmount(amount: any): CurrencyAmount<Currency> | undefined {
  if (!amount) return undefined
  if (amount instanceof CurrencyAmount) return amount
  return adaptAnyToCurrencyAmount(amount)
}

export function stringToCurrencyAmount(currency: Currency | undefined, value: string): CurrencyAmount<Currency> | undefined {
  if (!currency || !value) return undefined
  try {
    // Remove any commas and validate the number format
    const cleanValue = value.replace(/,/g, '')
    if (!/^\d*\.?\d*$/.test(cleanValue)) return undefined

    // Convert decimal value to raw amount with proper decimal handling
    const [whole = '0', decimal = ''] = cleanValue.split('.')
    const decimals = currency.decimals
    const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals)
    const rawAmount = `${whole}${paddedDecimal}`

    // Remove leading zeros
    const normalizedAmount = rawAmount.replace(/^0+/, '') || '0'

    return CurrencyAmount.fromRaw(currency, normalizedAmount)
  } catch (error) {
    console.error('Failed to create currency amount:', error)
    return undefined
  }
}

export function formatCurrencyAmount(amount: CurrencyAmount<Currency> | undefined, decimals = 6): string {
  if (!amount) return '0'
  try {
    const value = amount.toExact()
    const [whole, fraction = ''] = value.split('.')
    return `${whole}${fraction ? '.' + fraction.slice(0, decimals) : ''}`
  } catch (error) {
    console.error('Failed to format currency amount:', error)
    return '0'
  }
}
