import { Currency, CurrencyAmount } from './currency'

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
  estimatedGas: string
  hasFeeOnTransfer?: boolean
  feeOnTransferAmount?: string
}

export interface OpenOceanSwapResult {
  data: string
  to: string
  value: string
  gasPrice: string
  estimatedGas: string
  error?: {
    code: string
    message: string
    data?: any
  }
}

export interface OpenOceanRoute {
  dexId: string
  dexName: string
  protocol?: string
  routerAddress?: string
  swapAmount: string
  swapPercentage?: number
  hasFeeOnTransfer?: boolean
  feeOnTransferAmount?: string
}

export interface DexQuote {
  dex: string
  outAmount: string
  routerAddress: string
  gasEstimate: string
  error?: {
    code: string
    message: string
    data?: any
  }
  hasFeeOnTransfer?: boolean
  feeOnTransferAmount?: string
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
