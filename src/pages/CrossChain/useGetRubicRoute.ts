import { useCallback, useEffect, useMemo, useState } from 'react'
import { RubicRoute, RubicService } from 'services/rubic'
import { getTokenAddress } from 'utils/tokenInfo'

interface UseGetRubicRouteParams {
  fromAddress?: string
  fromChain?: string
  toChain?: string
  fromToken?: any
  toToken?: any
  fromAmount?: string
  slippage?: number
}

export default function useGetRubicRoute(params?: UseGetRubicRouteParams) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [route, setRoute] = useState<RubicRoute | null>(null)
  const [requestId, setRequestId] = useState<string>('')

  const getRoute = useCallback(async () => {
    if (!params?.fromToken || !params?.toToken || !params?.fromAmount || !params?.fromChain || !params?.toChain) {
      setRoute(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const quoteParams = {
        srcTokenAddress: getTokenAddress(params.fromToken),
        srcTokenAmount: params.fromAmount,
        srcTokenBlockchain: params.fromChain,
        dstTokenAddress: getTokenAddress(params.toToken),
        dstTokenBlockchain: params.toChain,
        fromAddress: params.fromAddress
      }

      console.log('Requesting quote with params:', quoteParams)
      const response = await RubicService.quoteBest(quoteParams)
      console.log('Quote response:', response)

      setRoute(response)
      setRequestId(response.id)
    } catch (err: any) {
      console.error('Error fetching Rubic route:', err)
      setError(err)
      setRoute(null)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    getRoute()
  }, [getRoute])

  const formatRoute = useMemo(() => {
    if (!route || !route.estimate) {
      return {
        outputAmount: undefined,
        amountUsdIn: undefined,
        amountUsdOut: undefined,
        exchangeRate: undefined,
        priceImpact: undefined,
        duration: undefined,
        totalFeeUsd: undefined,
      }
    }

    const {
      destinationWeiAmount,
      destinationTokenAmount,
      destinationUsdAmount,
      priceImpact,
      durationInMinutes
    } = route.estimate

    const fees = route.fees?.gasTokenFees
    const totalFeeUsd = fees ? (
      (fees.protocol?.fixedUsdAmount || 0) +
      (fees.provider?.fixedUsdAmount || 0) +
      (fees.gas?.totalUsdAmount || 0)
    ) : undefined

    return {
      outputAmount: destinationWeiAmount,
      amountUsdIn: undefined, // Will be calculated based on input amount and token price
      amountUsdOut: destinationUsdAmount,
      exchangeRate: destinationTokenAmount && params?.fromAmount
        ? (Number(destinationTokenAmount) / Number(params.fromAmount)).toString()
        : undefined,
      priceImpact: priceImpact,
      duration: durationInMinutes ? durationInMinutes * 60 : undefined, // Convert to seconds
      totalFeeUsd,
    }
  }, [route, params?.fromAmount])

  return {
    route,
    getRoute,
    error,
    loading,
    requestId,
    formatRoute,
  }
}
