import { Currency, CurrencyAmount } from './currency'
import { DetailedRouteSummary } from './route'

export interface OpenOceanQuote {
  inAmount: string
  outAmount: string
  price: string
  priceImpact: string
  gasPrice: string
  gasUsd: string
  amountInUsd: string
  amountOutUsd: string
  route: string[]
  routerAddress: string
}

export interface OpenOceanSwapResult {
  data: string
  to: string
  value: string
  gasPrice: string
}

export function createOpenOceanRouteSummary(
  currencyIn: Currency,
  currencyOut: Currency,
  parsedAmountIn: CurrencyAmount<Currency>,
  quote: OpenOceanQuote,
): DetailedRouteSummary {
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
    routerAddress: quote.routerAddress,
  }
}
