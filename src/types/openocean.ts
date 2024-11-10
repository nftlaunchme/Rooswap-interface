import { Currency } from './currency'
import { BigNumber } from 'ethers'

export interface TokenInfo {
  id?: number
  code?: string
  name: string
  address: string
  decimals: number
  symbol: string
  icon?: string
  chainId?: number
  logoURI?: string
  hasFeeOnTransfer?: boolean
}

export interface SplitRoute {
  dex: string
  percentage: number
  inputAmount: string
  outputAmount: string
  routerAddress: string
  gasEstimate: string
  priceImpact?: string
}

export interface DexQuote {
  dex: string
  outAmount: string
  routerAddress: string
  gasEstimate: string
  priceImpact?: string
  effectiveOutput?: string
  splitRoutes?: SplitRoute[]
}

export interface DexError {
  dex: string
  error: {
    code: string
    message: string
    data?: any
  }
  routerAddress: string
}

export interface DexInfo {
  name: string
  routerAddress: string
  quoterAddress?: string
  factory?: string
  gasEstimate: string
}

export interface DexMap {
  [key: string]: DexInfo
}

export interface RouteQuote {
  route: string[]
  inputAmount: string
  outputAmount: string
  gasEstimate: string
  priceImpact: string
  effectiveOutput: string
}

export interface SwapParams {
  chainId: number
  currencyIn: Currency
  currencyOut: Currency
  amount: string
  slippage: number
  recipient: string
  deadline: number
  splitRoutes?: SplitRoute[]
}

export interface SwapTransaction {
  data: string
  value: string
  to: string
  gasLimit?: BigNumber
  gasPrice?: BigNumber
}
