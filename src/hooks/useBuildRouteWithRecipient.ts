import { useCallback } from 'react'
import { Currency, CurrencyAmount } from '../types/currency'
import { useOpenOceanSwapForm } from './useOpenOceanSwapForm'
import { adaptAnyCurrency, stringToCurrencyAmount } from '../utils/currency'

interface Args {
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  typedValue: string
  recipient: string | null
  slippage: number
}

export default function useBuildRouteWithRecipient({
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

    if (!adaptedCurrencyIn || !adaptedCurrencyOut) {
      return { error: 'Select tokens' }
    }

    try {
      console.log('Building route with:', {
        currencyIn: adaptedCurrencyIn.symbol,
        currencyOut: adaptedCurrencyOut.symbol,
        amount: parsedAmount.toExact(),
        slippage,
        recipient
      })
      
      const result = await buildRoute()
      
      if (result.error) {
        console.error('Route build error:', result.error)
      }
      
      return result
    } catch (error: any) {
      console.error('Build route error:', error)
      return { error: error.message || 'Failed to build route' }
    }
  }, [buildRoute, parsedAmount, adaptedCurrencyIn, adaptedCurrencyOut, slippage, recipient])

  return {
    isLoading,
    routeSummary,
    buildRoute: onBuildRoute,
    error,
  }
}
