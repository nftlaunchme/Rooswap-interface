import { useMemo } from 'react'
import { Currency, CurrencyAmount } from '../../../types/currency'

interface Args {
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  typedValue: string
  recipient: string | null
  balanceIn: CurrencyAmount<Currency> | undefined
  parsedAmountFromTypedValue: CurrencyAmount<Currency> | undefined
}

export default function useGetInputError({
  currencyIn,
  currencyOut,
  typedValue,
  recipient,
  balanceIn,
  parsedAmountFromTypedValue,
}: Args): string | undefined {
  return useMemo(() => {
    if (!currencyIn || !currencyOut) {
      return 'Select a token'
    }

    if (!typedValue) {
      return 'Enter an amount'
    }

    if (!parsedAmountFromTypedValue) {
      return 'Invalid amount'
    }

    if (balanceIn && parsedAmountFromTypedValue.greaterThan(balanceIn)) {
      return `Insufficient ${currencyIn.symbol} balance`
    }

    if (recipient !== null) {
      if (!recipient || recipient.length === 0) {
        return 'Enter a recipient'
      }
      const address = recipient.toLowerCase()
      if (address.length !== 42 || !address.startsWith('0x')) {
        return 'Enter a valid recipient'
      }
    }

    return undefined
  }, [currencyIn, currencyOut, typedValue, recipient, balanceIn, parsedAmountFromTypedValue])
}
