import { Currency, CurrencyAmount } from './currency'

export enum ChargeFeeBy {
  CURRENCY_IN = 'currency_in',
  CURRENCY_OUT = 'currency_out'
}

export interface DetailedRouteSummary {
  parsedAmountIn: CurrencyAmount<Currency>
  parsedAmountOut: CurrencyAmount<Currency>
  priceImpact: string
  executionPrice: string
  gasUsd: string
  amountInUsd: string
  amountOutUsd: string
  route: string[]
  routerAddress: string
  fee?: {
    currency: Currency
    currencyAmount: CurrencyAmount<Currency>
    formattedAmount: string
    formattedAmountUsd: string
  }
}
