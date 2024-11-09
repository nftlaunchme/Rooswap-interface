import { Currency, CurrencyAmount } from '../../types/currency'
import { DetailedRouteSummary } from '../../types/route'
import { OpenOceanQuote } from '../../types/openocean'

export const calculatePriceImpact = (amountInUsd: string, amountOutUsd: string): string => {
  const inUsd = parseFloat(amountInUsd)
  const outUsd = parseFloat(amountOutUsd)
  if (!outUsd || !inUsd) return '0'
  const impact = ((inUsd - outUsd) * 100) / inUsd
  return impact.toFixed(2)
}

export const parseOpenOceanQuote = (
  quote: OpenOceanQuote,
  currencyIn: Currency,
  currencyOut: Currency,
  parsedAmountIn: CurrencyAmount<Currency>
): DetailedRouteSummary => {
  const parsedAmountOut = CurrencyAmount.fromRaw(currencyOut, quote.outAmount)

  return {
    parsedAmountIn,
    parsedAmountOut,
    priceImpact: quote.priceImpact,
    executionPrice: quote.price,
    gasUsd: quote.gasUsd,
    amountInUsd: quote.amountInUsd,
    amountOutUsd: quote.amountOutUsd,
    route: quote.route,
    routerAddress: quote.routerAddress
  }
}
