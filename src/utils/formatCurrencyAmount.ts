import { CurrencyAmount, Currency } from '../types/currency'

export function formatCurrencyAmount(
  amount: CurrencyAmount<Currency> | undefined,
  significantDigits = 6
): string {
  if (!amount) {
    return ''
  }

  return amount.toSignificant(significantDigits)
}
