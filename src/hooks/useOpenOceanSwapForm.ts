import { useCallback, useMemo } from 'react'
import { useOpenOceanQuote, useOpenOceanSwapCallback } from './useOpenOceanSwap'
import { createOpenOceanRouteSummary } from '../types/openocean'
import { DetailedRouteSummary } from '../types/route'
import { Currency, CurrencyAmount } from '../types/currency'
import { useAppSelector } from '../state/hooks'
import { useActiveWeb3React } from '../hooks'

type BuildRouteResult = {
  data?: undefined
  error: string
}

export function useOpenOceanSwapForm(
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  slippage: number,
) {
  const { chainId } = useActiveWeb3React()
  const recipient = useAppSelector(state => state.swap.recipient)

  const {
    loading: quoteLoading,
    quote,
    error: quoteError,
  } = useOpenOceanQuote(currencyIn, currencyOut, parsedAmount, slippage)

  const {
    swap,
    error: swapError,
  } = useOpenOceanSwapCallback(currencyIn, currencyOut, parsedAmount, slippage, recipient)

  const routeSummary: DetailedRouteSummary | undefined = useMemo(() => {
    if (!quote || !currencyIn || !currencyOut || !parsedAmount) return undefined
    return createOpenOceanRouteSummary(currencyIn, currencyOut, parsedAmount, quote)
  }, [quote, currencyIn, currencyOut, parsedAmount])

  const buildRoute = useCallback(async (): Promise<BuildRouteResult> => {
    if (!chainId) {
      return { error: 'No chain ID' }
    }

    try {
      await swap()
      return { error: '' }
    } catch (error) {
      console.error('Swap error:', error)
      return { error: error.message || 'Failed to build route' }
    }
  }, [swap, chainId])

  return {
    isLoading: quoteLoading,
    routeSummary,
    buildRoute,
    error: quoteError || swapError,
  }
}
