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

export interface OpenOceanDetailedRouteSummary {
  parsedAmountIn: CurrencyAmount<Currency>
  parsedAmountOut: CurrencyAmount<Currency>
  priceImpact: string
  executionPrice: {
    price: string
    baseSymbol: string
    quoteSymbol: string
  }
  gasUsd: string
  amountInUsd: string
  amountOutUsd: string
  route: string[]
  routerAddress: string
  openOceanQuote: OpenOceanQuote
}

export interface OpenOceanBuildRouteResult {
  amountIn: string
  amountInUsd: string
  amountOut: string
  amountOutUsd: string
  priceImpact: string
  executionPrice: {
    price: string
    baseSymbol: string
    quoteSymbol: string
  }
  gas: string
  gasUsd: string
  extraFee: {
    chargeFeeBy: string
    feeAmount: string
    feeAmountUsd: string
    isInBps: boolean
  }
  route: string[]
  routerAddress: string
}
