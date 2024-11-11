import { ChainId } from '@kyberswap/ks-sdk-core'

export interface NativeToken {
  name: string
  symbol: string
  decimal: number
  logo: string
  minForGas: string
}

export interface ClassicConfig {
  oldStatic?: {
    factory: string
    router: string
    zap: string
  }
  static: {
    factory: string
    router: string
    zap: string
  }
  dynamic?: {
    factory: string
    router: string
    zap: string
  }
  claimReward?: string
  defaultSubgraph: string
  fairlaunchV2?: Record<string, any>
}

export interface ElasticConfig {
  coreFactory: string
  nonfungiblePositionManager: string
  tickReader: string
  initCodeHash: string
  quoter: string
  routers: string[]
  defaultSubgraph: string
  startBlock?: number
  farmv2Quoter?: string
  zap?: {
    helper: string
    router: string
    validator: string
    executor: string
  }
  farmV2S?: string[]
  'farmV2.1S'?: string[]
  farms: string[][]
}

export interface KyberDAOConfig {
  staking?: string
  dao?: string
  rewardsDistributor?: string
  KNCAddress?: string
  KNCLAddress?: string
}

export interface NetworkInfo {
  chainId: ChainId
  name: string
  route: string
  defaultRpcUrl: string
  etherscanUrl: string
  etherscanName?: string
  nativeToken: NativeToken
  icon: string
  aggregatorRoute: string
  geckoTermialId?: string
  coingeckoNetworkId: string
  coingeckoNativeTokenId: string
  defaultBlockSubgraph: string
  kyberDAO?: KyberDAOConfig
  classic: ClassicConfig
  elastic: ElasticConfig
  multicall: string
  limitOrder?: Record<string, any>
  averageBlockTimeInSeconds?: number
  priceRoute: string
  state?: number
  ksSettingRoute?: string
}
