import { useCallback, useMemo } from 'react'
import { Currency, CurrencyAmount } from '../../../types/currency'
import { useOpenOceanQuote } from '../../../hooks/useOpenOceanSwap'
import { useActiveWeb3React } from '../../../hooks'

export type ArgsGetRoute = {
  parsedAmount: CurrencyAmount<Currency> | undefined
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  customChain?: number
  isProcessingSwap?: boolean
}

export const getRouteTokenAddressParam = (currency: Currency) => currency.getAddress()

const useGetRoute = (args: ArgsGetRoute) => {
  const { parsedAmount, currencyIn, currencyOut, customChain, isProcessingSwap } = args
  const { chainId: currentChain } = useActiveWeb3React()
  const chainId = customChain || currentChain

  const {
    loading,
    quote,
    error,
  } = useOpenOceanQuote(currencyIn, currencyOut, parsedAmount, 50) // 0.5% slippage for quotes

  const result = useMemo(() => {
    if (loading || error || !quote) {
      return {
        data: undefined,
        error,
        isLoading: loading,
      }
    }

    return {
      data: {
        data: quote,
      },
      error: undefined,
      isLoading: false,
    }
  }, [loading, error, quote])

  const fetcher = useCallback(() => {
    // OpenOcean quotes are automatically fetched via useEffect in useOpenOceanQuote
    return Promise.resolve(undefined)
  }, [])

  return { fetcher, result }
}

export default useGetRoute
