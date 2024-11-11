// @ts-nocheck 
import { ChainId } from '@kyberswap/ks-sdk-core'
import { NetworkInfo } from './type'

export const SUPPORTED_NETWORKS = [
  ChainId.CRONOS,
] as const

export type SupportedNetworks = typeof SUPPORTED_NETWORKS[number]

export function isSupportedChainId(chainId: number): chainId is SupportedNetworks {
  return SUPPORTED_NETWORKS.includes(chainId as SupportedNetworks)
}

export const NETWORKS_INFO: { [chainId: number]: NetworkInfo } = {
  [ChainId.CRONOS]: {
    chainId: ChainId.CRONOS,
    name: 'Cronos',
    route: 'cronos',
    defaultRpcUrl: 'https://evm.cronos.org',
    etherscanUrl: 'https://cronoscan.com',
    etherscanName: 'Cronoscan',
    nativeToken: {
      name: 'Cronos',
      symbol: 'CRO',
      decimal: 18,
      logo: '/cronos.svg',
      minForGas: '10000000000000000' // 0.01 CRO
    },
    icon: '/cronos.svg',
    aggregatorRoute: 'cronos',
    coingeckoNetworkId: 'cronos',
    coingeckoNativeTokenId: 'crypto-com-chain',
    defaultBlockSubgraph: 'https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/cronos-blocks',
    multicall: '0x63Abb9973506189dC3741f61d25d4ed508151E6d',
    classic: {
      static: {
        factory: '0x1c758aF0688502e49140230F6b0EBd376d429be5',
        router: '0x5649B4DD00780e99Bab7Abb4A3d581Ea1aEB23D0',
        zap: '0x2abE8750e4a65584d7452316356128C936273e0D'
      },
      dynamic: {
        factory: '0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE',
        router: '0x78df70615ffc8066cc0887917f2Cd72092C86409',
        zap: '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31'
      },
      defaultSubgraph: 'https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-exchange-cronos'
    },
    elastic: {
      coreFactory: '0x5F1dddbf348aC2fbe22a163e30F99F9ECE3DD50a',
      nonfungiblePositionManager: '0x2B1c7b41f6A8F2b2bc45C3233a5d5FB3cD6dC9A8',
      tickReader: '0x165c68077ac06c83800d19200e6E2B08D02dE75D',
      initCodeHash: '0xc597aba1bb02db42ba24a8878837965718c032f8b46be94a6e46452a9f89ca01',
      quoter: '0x0D125c15D54cA1F8a813C74A81aEe34ebB508C1f',
      routers: ['0xC1e7dFE73E1598E3910EF4C7845B68A9Ab6F4c83'],
      defaultSubgraph: 'https://cronos-graph.kyberengineering.io/subgraphs/name/kybernetwork/kyberswap-elastic-cronos',
      farms: []
    },
    kyberDAO: {},
    averageBlockTimeInSeconds: 6,
    priceRoute: 'cronos',
    ksSettingRoute: 'cronos'
  }
}

export default SUPPORTED_NETWORKS
