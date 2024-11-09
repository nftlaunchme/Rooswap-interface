import { useCallback, useMemo } from 'react'
import { useOpenOceanQuote, useOpenOceanSwapCallback } from './useOpenOceanSwap'
import { DetailedRouteSummary } from '../types/route'
import { Currency, CurrencyAmount } from '../types/currency'
import { useAppSelector } from '../state/hooks'
import { useActiveWeb3React } from '../hooks'
import { ethers } from 'ethers'

type BuildRouteResult = {
  data?: undefined
  error: string
}

function createRouteSummary(
  currencyIn: Currency,
  currencyOut: Currency,
  parsedAmount: CurrencyAmount<Currency>,
  quote: any
): DetailedRouteSummary | null {
  try {
    // Validate quote
    if (!quote || !quote.outAmount || ethers.BigNumber.from(quote.outAmount).lte(0)) {
      console.error('Invalid quote:', quote)
      return null
    }

    const outputAmount = CurrencyAmount.fromRaw(currencyOut, quote.outAmount)

    // Validate output amount
    if (!outputAmount || outputAmount.raw === '0') {
      console.error('Invalid output amount:', outputAmount)
      return null
    }

    const summary: DetailedRouteSummary = {
      openOceanQuote: quote,
      inputAmount: parsedAmount,
      outputAmount,
      parsedAmountIn: parsedAmount,
      parsedAmountOut: outputAmount,
      priceImpact: quote.priceImpact,
      gasCostUSD: quote.gasUsd,
      amountInUsd: quote.amountInUsd,
      amountOutUsd: quote.amountOutUsd,
      executionPrice: {
        price: quote.price,
        baseSymbol: currencyIn.symbol || '',
        quoteSymbol: currencyOut.symbol || '',
      }
    }

    // Log summary for debugging
    console.log('Created route summary:', {
      inputAmount: {
        value: summary.inputAmount.toExact(),
        currency: currencyIn.symbol,
      },
      outputAmount: {
        value: summary.outputAmount.toExact(),
        currency: currencyOut.symbol,
      },
      priceImpact: summary.priceImpact + '%',
      gasCostUSD: '$' + summary.gasCostUSD,
    })

    return summary
  } catch (error) {
    console.error('Failed to create route summary:', error)
    return null
  }
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
    if (!quote || !currencyIn || !currencyOut || !parsedAmount) {
      return undefined
    }

    // Create and validate route summary
    const summary = createRouteSummary(currencyIn, currencyOut, parsedAmount, quote)
    if (!summary) {
      console.error('Failed to create valid route summary')
      return undefined
    }

    // Validate price impact
    const priceImpact = parseFloat(summary.priceImpact)
    if (priceImpact > 15) {
      console.error('Price impact too high:', priceImpact + '%')
      return undefined
    }

    return summary
  }, [quote, currencyIn, currencyOut, parsedAmount])

  const buildRoute = useCallback(async (): Promise<BuildRouteResult> => {
    // Validate dependencies
    if (!chainId) {
      return { error: 'No chain ID' }
    }
    if (!routeSummary) {
      return { error: 'No valid route available' }
    }

    // Validate price impact
    const priceImpact = parseFloat(routeSummary.priceImpact)
    if (priceImpact > 15) {
      return { error: 'Price impact too high (>15%). Try a smaller amount.' }
    }

    try {
      // Log swap attempt
      console.log('Attempting swap:', {
        chainId,
        currencyIn: currencyIn?.symbol,
        currencyOut: currencyOut?.symbol,
        amount: parsedAmount?.toExact(),
        slippage,
        priceImpact: routeSummary.priceImpact + '%',
      })

      await swap()
      return { error: '' }
    } catch (error: any) {
      console.error('Swap error:', error)

      // Return user-friendly error message
      if (error.code === -32603) {
        if (error.data?.message?.includes('TRANSFER_FROM_FAILED')) {
          return { error: 'Insufficient token balance' }
        }
        if (error.data?.message?.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
          return { error: 'Price impact too high. Try a smaller amount or increase slippage tolerance.' }
        }
        return { error: 'Transaction reverted. The swap may fail due to price impact or low liquidity.' }
      }
      
      return { error: error.message || 'Failed to build route' }
    }
  }, [swap, chainId, routeSummary, currencyIn, currencyOut, parsedAmount, slippage])

  return {
    isLoading: quoteLoading,
    routeSummary,
    buildRoute,
    error: quoteError || swapError,
  }
}
