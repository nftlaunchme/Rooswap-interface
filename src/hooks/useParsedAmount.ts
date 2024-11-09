import { useMemo } from 'react'
import { Currency, CurrencyAmount } from '../types/currency'
import { stringToCurrencyAmount } from '../utils/currency'

export default function useParsedAmount(
  currency: Currency | undefined,
  value: string | undefined
): CurrencyAmount<Currency> | undefined {
  return useMemo(() => {
    if (!currency || !value) return undefined
    try {
      return stringToCurrencyAmount(currency, value)
    } catch (error) {
      console.error('Failed to parse amount:', error)
      return undefined
    }
  }, [currency, value])
}
