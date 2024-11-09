import { Currency, CurrencyAmount } from './currency'
import { DetailedRouteSummary } from './route'

interface TokenData {
  address: string
  decimals: number
  symbol: string
  name: string
  usd: string
  volume: number
}

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

  // Convert amounts to decimal format for display
  const inAmountDecimal = CurrencyAmount.fromRaw(currencyIn, quote.inAmount).toExact()
  const outAmountDecimal = parsedAmountOut.toExact()

  // Calculate price as outAmount/inAmount
  const price = (Number(outAmountDecimal) / Number(inAmountDecimal)).toString()

  return {
    parsedAmountIn,
    parsedAmountOut,
    priceImpact: quote.priceImpact,
    executionPrice: price,
    gasUsd: quote.gasUsd,
    amountInUsd: quote.amountInUsd,
    amountOutUsd: quote.amountOutUsd,
    route: quote.route,
    routerAddress: quote.routerAddress,
  }
}
