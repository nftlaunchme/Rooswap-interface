// @ts-nocheck 
import { Currency as KyberCurrency, Token as KyberToken, NativeCurrency as KyberNativeCurrency, CurrencyAmount as KyberCurrencyAmount } from '@kyberswap/ks-sdk-core'
import { Currency, Token, NativeCurrency, CurrencyAmount, Fraction } from '../types/currency'

export class ExtendedCurrencyAmount<T extends Currency = Currency> extends CurrencyAmount<T> {
  constructor(currency: T, amount: string | bigint) {
    super(currency, amount)
  }

  static fromRaw<T extends Currency>(currency: T, raw: string): ExtendedCurrencyAmount<T> {
    return new ExtendedCurrencyAmount(currency, raw)
  }

  static fromKyberAmount(amount: KyberCurrencyAmount<KyberCurrency>): ExtendedCurrencyAmount<Currency> {
    const currency = convertFromKyberCurrency(amount.currency)
    if (!currency) throw new Error('Invalid currency conversion')
    return new ExtendedCurrencyAmount(currency, amount.quotient.toString())
  }

  override add(other: CurrencyAmount<T>): ExtendedCurrencyAmount<T> {
    const fraction = this.addFraction(other)
    return new ExtendedCurrencyAmount(this.currency, fraction.numerator)
  }

  override subtract(other: CurrencyAmount<T>): ExtendedCurrencyAmount<T> {
    const fraction = this.subtractFraction(other)
    return new ExtendedCurrencyAmount(this.currency, fraction.numerator)
  }

  override multiply(other: bigint): ExtendedCurrencyAmount<T> {
    const fraction = this.multiplyFraction(new Fraction(other))
    return new ExtendedCurrencyAmount(this.currency, fraction.numerator)
  }

  override divide(other: bigint): ExtendedCurrencyAmount<T> {
    const fraction = this.divideFraction(new Fraction(other))
    return new ExtendedCurrencyAmount(this.currency, fraction.numerator)
  }
}

export function convertFromKyberCurrency(currency: KyberCurrency | undefined): Currency | undefined {
  if (!currency) return undefined

  if (currency.isNative) {
    const nativeCurrency = currency as KyberNativeCurrency
    return {
      isNative: true,
      isToken: false,
      chainId: nativeCurrency.chainId,
      decimals: nativeCurrency.decimals,
      symbol: nativeCurrency.symbol,
      name: nativeCurrency.name,
      equals: (other: Currency) => other.isNative && other.chainId === nativeCurrency.chainId,
      wrapped: convertFromKyberToken(nativeCurrency.wrapped),
      getAddress: () => '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    } as NativeCurrency
  }

  const token = currency as KyberToken
  return {
    isToken: true,
    isNative: false,
    chainId: token.chainId,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
    address: token.address,
    equals: (other: Currency) => !other.isNative && other.getAddress().toLowerCase() === token.address.toLowerCase(),
    sortsBefore: (other: Token) => token.address.toLowerCase() < other.address.toLowerCase(),
    wrapped: convertFromKyberToken(token),
    getAddress: () => token.address
  } as Token
}

export function convertFromKyberToken(token: KyberToken): Token {
  return {
    isToken: true,
    isNative: false,
    chainId: token.chainId,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
    address: token.address,
    equals: (other: Currency) => !other.isNative && other.getAddress().toLowerCase() === token.address.toLowerCase(),
    sortsBefore: (other: Token) => token.address.toLowerCase() < other.address.toLowerCase(),
    wrapped: {} as Token, // Self-referential
    getAddress: () => token.address
  } as Token
}

export function convertToKyberCurrency(currency: Currency | undefined): KyberCurrency | undefined {
  if (!currency) return undefined
  
  if (currency.isNative) {
    return new KyberNativeCurrency(currency.chainId, currency.decimals, currency.symbol, currency.name)
  }

  return new KyberToken(
    currency.chainId,
    currency.getAddress(),
    currency.decimals,
    currency.symbol,
    currency.name
  )
}

export function convertFromKyberCurrencyAmount(amount: KyberCurrencyAmount<KyberCurrency> | undefined): ExtendedCurrencyAmount<Currency> | undefined {
  if (!amount) return undefined
  return ExtendedCurrencyAmount.fromKyberAmount(amount)
}

export function convertToKyberCurrencyAmount(amount: CurrencyAmount<Currency> | undefined): KyberCurrencyAmount<KyberCurrency> | undefined {
  if (!amount) return undefined

  const currency = convertToKyberCurrency(amount.currency)
  if (!currency) return undefined

  return KyberCurrencyAmount.fromRawAmount(
    currency,
    amount.quotient.toString()
  )
}
