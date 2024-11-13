import { RubicRoute } from 'services/rubic'

export interface CrossChainState {
  listTokenIn: any[]
  listTokenOut: any[]
  listChainOut: number[]
  chains: number[]
  currencyIn: any | null
  currencyOut: any | null
  chainIdOut: number | null
  loadingToken: boolean
  inputAmount: string
  formatRoute: {
    outputAmount?: string
    amountUsdIn?: string
    amountUsdOut?: string
    exchangeRate?: string
    priceImpact?: string
    duration?: number
    totalFeeUsd?: string
  }
}

export interface CrossChainSetting {
  slippageTolerance: number
}

export interface CrossChainTrade {
  route: RubicRoute | null
  loading: boolean
  error: Error | null
  requestId: string
}

export interface CrossChainValidation {
  state?: 'warn' | 'error'
  tip?: string
  desc?: string
  insufficientFund?: boolean
}

export interface CrossChainTxsPayload {
  walletAddress?: string
  srcChainId: string
  dstChainId: string
  srcTxHash: string
  srcTokenAddress: string
  dstTokenAddress: string
  srcAmount: string
  dstAmount: string
}
