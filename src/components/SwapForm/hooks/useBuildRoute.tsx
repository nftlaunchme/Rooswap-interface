import { useCallback } from 'react'
import { Currency, CurrencyAmount } from '../../../types/currency'
import { useOpenOceanSwapForm } from '../../../hooks/useOpenOceanSwapForm'
import { adaptAnyCurrency, stringToCurrencyAmount } from '../../../utils/currency'

interface Args {
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  typedValue: string
  recipient: string | null
  slippage: number
}

export default function useBuildRoute({
  currencyIn,
  currencyOut,
  typedValue,
  recipient,
  slippage,
}: Args) {
  const adaptedCurrencyIn = adaptAnyCurrency(currencyIn)
  const adaptedCurrencyOut = adaptAnyCurrency(currencyOut)

  const parsedAmount = adaptedCurrencyIn && typedValue
    ? stringToCurrencyAmount(adaptedCurrencyIn, typedValue)
    : undefined

  const {
    isLoading,
    routeSummary,
    buildRoute,
    error,
  } = useOpenOceanSwapForm(adaptedCurrencyIn, adaptedCurrencyOut, parsedAmount, slippage)

  const onBuildRoute = useCallback(async () => {
    if (!parsedAmount) {
      return { error: 'Invalid amount' }
    }

    try {
      const result = await buildRoute()
      return result
    } catch (error) {
      console.error('Build route error:', error)
      return { error: error.message || 'Failed to build route' }
    }
  }, [buildRoute, parsedAmount])

  return {
    isLoading,
    routeSummary,
    buildRoute: onBuildRoute,
    error,
  }
}
