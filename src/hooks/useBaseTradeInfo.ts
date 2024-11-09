import { Currency } from '../types/currency'
import { useEffect, useMemo } from 'react'
import { useActiveWeb3React } from '../hooks'
import useDebounce from '../hooks/useDebounce'
import { useOpenOceanQuote } from './useOpenOceanSwap'

export type BaseTradeInfo = {
  priceUsdIn: string
  priceUsdOut: string
  marketRate: number
  invertRate: number
}

function useBaseTradeInfo(currencyIn: Currency | undefined, currencyOut: Currency | undefined) {
  const { chainId } = useActiveWeb3React()

  const {
    loading,
    quote,
    error,
  } = useOpenOceanQuote(currencyIn, currencyOut, undefined, 50) // 0.5% slippage for price check

  const tradeInfo: BaseTradeInfo | undefined = useMemo(() => {
    if (!quote || error) return undefined

    const marketRate = parseFloat(quote.price)
    return {
      priceUsdIn: quote.amountInUsd,
      priceUsdOut: quote.amountOutUsd,
      marketRate,
      invertRate: 1 / marketRate,
    }
  }, [quote, error])

  return { 
    loading, 
    tradeInfo,
    refetch: () => {} // OpenOcean auto-refreshes
  }
}

export function useBaseTradeInfoLimitOrder(
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
) {
  const { loading, tradeInfo, refetch } = useBaseTradeInfo(currencyIn, currencyOut)
  const debouncedLoading = useDebounce(loading, 100) // prevent flip flop UI when loading from true to false
  return { loading: loading || debouncedLoading, tradeInfo, refetch }
}

export const useBaseTradeInfoWithAggregator = (args: { currencyIn?: Currency, currencyOut?: Currency }) => {
  const { currencyIn, currencyOut } = args
  const {
    loading,
    quote,
    error,
  } = useOpenOceanQuote(currencyIn, currencyOut, undefined, 50) // 0.5% slippage for price check

  const executionPrice = useMemo(() => {
    if (!quote || error || !currencyIn || !currencyOut) {
      return undefined
    }
    return quote.price
  }, [quote, error, currencyIn, currencyOut])

  return {
    fetcher: () => {}, // OpenOcean auto-refreshes
    result: executionPrice,
  }
}
