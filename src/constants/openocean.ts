import { ChainId } from '@kyberswap/ks-sdk-core'

// OpenOcean Router addresses for each supported chain
export const OPENOCEAN_ROUTER_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.CRONOS]: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
}

// OpenOcean Exchange Proxy addresses for token approvals
export const OPENOCEAN_EXCHANGE_PROXY_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.CRONOS]: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
}

// Default gas limit for swaps
export const OPENOCEAN_DEFAULT_GAS_LIMIT = '500000'

// Max approval amount for tokens
export const OPENOCEAN_MAX_APPROVAL_AMOUNT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

// Minimum amount for price impact warning (2%)
export const OPENOCEAN_PRICE_IMPACT_WARNING = 2

// Maximum amount for price impact error (15%)
export const OPENOCEAN_PRICE_IMPACT_ERROR = 15

// API Base URL
export const OPENOCEAN_API_URL = 'https://open-api.openocean.finance/v3'

// Chain mapping for OpenOcean API
export const OPENOCEAN_CHAIN_IDS: { [chainId in ChainId]?: string } = {
  [ChainId.CRONOS]: 'cronos',
}

// Native token addresses for each chain
export const OPENOCEAN_NATIVE_TOKEN_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.CRONOS]: '0x0000000000000000000000000000000000000000',
}

// Default slippage tolerance (1%)
export const OPENOCEAN_DEFAULT_SLIPPAGE = 1

// Maximum allowed slippage (50%)
export const OPENOCEAN_MAX_SLIPPAGE = 50

// Minimum allowed slippage (0.05%)
export const OPENOCEAN_MIN_SLIPPAGE = 0.05

// Gas price multiplier for estimations (1.5x)
export const OPENOCEAN_GAS_MULTIPLIER = 1.5

// Supported DEXes by chain
export const OPENOCEAN_SUPPORTED_DEXES: { [chainId in ChainId]?: string[] } = {
  [ChainId.CRONOS]: [
    'VVS',
    'CronaSwap',
    'CrodexV2',
    'PhotonSwap',
    'MMF',
  ],
}

// Error messages
export const OPENOCEAN_ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  PRICE_IMPACT_TOO_HIGH: 'Price impact too high',
  SLIPPAGE_TOO_HIGH: 'Slippage too high',
  TRANSACTION_FAILED: 'Transaction failed',
  APPROVAL_NEEDED: 'Token approval needed',
  UNKNOWN_ERROR: 'Unknown error occurred',
}

// Transaction states
export enum OpenOceanTxState {
  INVALID = 'INVALID',
  LOADING = 'LOADING',
  VALID = 'VALID',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// Supported token types
export enum OpenOceanTokenType {
  ERC20 = 'ERC20',
  NATIVE = 'NATIVE',
}

// Interface for token info
export interface OpenOceanTokenInfo {
  address: string
  symbol: string
  decimals: number
  name: string
  type: OpenOceanTokenType
  logoURI?: string
}
