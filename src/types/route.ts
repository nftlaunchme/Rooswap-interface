import { Currency, CurrencyAmount } from './currency'

export enum ChargeFeeBy {
  CURRENCY_IN = 'currency_in',
  CURRENCY_OUT = 'currency_out'
}

export interface ExtraFeeConfig {
  chargeFeeBy: ChargeFeeBy
  feeAmount: string
  feeAmountUsd: string
  isInBps: boolean
}

export interface DetailedRouteSummary {
  parsedAmountIn: CurrencyAmount<Currency>
  parsedAmountOut: CurrencyAmount<Currency>
  priceImpact: string
  executionPrice: string
  gasUsd: string
  gasCostUSD: string
  amountInUsd: string
  amountOutUsd: string
  route: string[]
  routerAddress: string
  extraFee: ExtraFeeConfig
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  fee?: {
    currency: Currency
    currencyAmount: CurrencyAmount<Currency>
    formattedAmount: string
    formattedAmountUsd: string
  }
}

export interface Route {
  pool: string
  tokenIn: string
  tokenOut: string
  limitReturnAmount: string
  swapAmount: string
  amountOut: string
  exchange: string
  poolLength: number
  poolType: string
  poolExtra: any
  extra: any
}

export interface BuildRouteResult {
  amountIn: string
  amountInUsd: string
  amountOut: string
  amountOutUsd: string
  priceImpact: string
  executionPrice: string
  gas: string
  gasUsd: string
  extraFee: ExtraFeeConfig
  route: Route[]
  routerAddress: string
}
