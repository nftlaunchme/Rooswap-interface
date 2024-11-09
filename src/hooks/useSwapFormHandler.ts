import { useCallback } from 'react'
import { Currency, CurrencyAmount } from '../types/currency'
import { useOpenOceanSwapForm } from './useOpenOceanSwapForm'
import { adaptAnyCurrency, ensureCurrencyAmount } from '../utils/currency'
import { WrapType } from '../state/swap/slice'

interface Args {
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  typedValue: string
  recipient: string | null
  slippage: number
  wrapType: WrapType
  onWrap?: () => Promise<void>
}

export default function useSwapFormHandler({
  currencyIn,
  currencyOut,
  typedValue,
  recipient,
  slippage,
  wrapType,
  onWrap,
}: Args) {
  const adaptedCurrencyIn = adaptAnyCurrency(currencyIn)
  const adaptedCurrencyOut = adaptAnyCurrency(currencyOut)

  const parsedAmount = typedValue && adaptedCurrencyIn 
    ? CurrencyAmount.fromRaw(adaptedCurrencyIn, typedValue)
    : undefined

  const {
    isLoading,
    routeSummary,
    buildRoute,
    error,
  } = useOpenOceanSwapForm(adaptedCurrencyIn, adaptedCurrencyOut, parsedAmount, slippage)

  const onBuildRoute = useCallback(async () => {
    try {
      if (wrapType !== WrapType.NOT_APPLICABLE && onWrap) {
        await onWrap()
        return { error: '' }
      }
      const result = await buildRoute()
      return result
    } catch (error) {
      console.error('Build route error:', error)
      return { error: error.message || 'Failed to build route' }
    }
  }, [buildRoute, wrapType, onWrap])

  return {
    isLoading,
    routeSummary,
    buildRoute: onBuildRoute,
    error,
  }
}
