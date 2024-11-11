import { BigNumber } from 'ethers'

export interface DexQuote {
  dex: string
  outAmount: string
  routerAddress: string
  gasEstimate: string
  priceImpact?: string
  effectiveOutput?: string
  path?: string[]
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

export interface V3Quote {
  outAmount: string
  priceImpact: number
  fee: number
}

export interface GasCalculationParams {
  gasAmount: number
  outputDecimals: number
}

export interface SplitRoute {
  percent: number
  path: string[]
  dex: string
  outAmount: string
}

export interface SwapTransaction {
  data: string
  value: string
  to: string
}

export interface QuoteCacheKey {
  dexKey: string
  inToken: string
  outToken: string
  amount: string
}

// Constants
export const WCRO_ADDRESS = '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23'

// Router ABI
export const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
]
