import { Currency } from './currency'
import { ChargeFeeBy, ExtraFeeConfig } from './route'
import { ExtendedCurrencyAmount } from '../utils/currencyConverter'

export interface DexInfo {
  name: string
  routerAddress: string
  factory: string
  gasEstimate: string
  quoterAddress?: string
}

export interface TokenInfo {
  symbol: string
  name: string
  address: string
  decimals: number
  chainId: number
  logoURI?: string
}

export interface SwapRoute {
  dex: DexInfo
  path: string[]
  amounts: string[]
}

export interface OpenOceanQuote {
  inToken: TokenInfo
  outToken: TokenInfo
  inAmount: string
  outAmount: string
  amountOut: string
  estimatedGas: string
  routes: SwapRoute[]
  gasPrice: string
  price: string
  priceImpact: string
  routerAddress: string
  gasUsd: string
  amountInUsd: string
  amountOutUsd: string
  route: string[]
}

export interface DexQuote {
  dex: string
  amountOut: string
  amountIn: string
  path: string[]
}

export interface OpenOceanSwapResult {
  data: string
  outAmount: string
  inAmount: string
  estimatedGas: string
  to: string
  value: string
  gasPrice: string
}

export enum OpenOceanSwapCallbackState {
  INVALID,
  LOADING,
  VALID,
  ERROR
}

export interface OpenOceanDetailedRouteSummary {
  parsedAmountIn: ExtendedCurrencyAmount<Currency>
  parsedAmountOut: ExtendedCurrencyAmount<Currency>
  priceImpact: string
  executionPrice: string
  gasUsd: string
  gasCostUSD: string
  amountInUsd: string
  amountOutUsd: string
  route: string[]
  routerAddress: string
  openOceanQuote: OpenOceanQuote
  extraFee: ExtraFeeConfig
  inputAmount: ExtendedCurrencyAmount<Currency>
  outputAmount: ExtendedCurrencyAmount<Currency>
}

export interface OpenOceanBuildRouteResult {
  amountIn: string
  amountInUsd: string
  amountOut: string
  amountOutUsd: string
  priceImpact: string
  executionPrice: string
  gas: string
  gasUsd: string
  extraFee: ExtraFeeConfig
  route: string[]
  routerAddress: string
  error: string
  data: string
  value: string
  to: string
}
