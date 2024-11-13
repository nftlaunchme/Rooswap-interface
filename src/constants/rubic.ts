import { ChainId } from '@kyberswap/ks-sdk-core'

// Map our chain IDs to Rubic's blockchain names
export const RUBIC_CHAIN_MAP: { [key in ChainId]?: string } = {
  [ChainId.MAINNET]: 'ETH',
  [ChainId.BSCMAINNET]: 'BSC',
  [ChainId.MATIC]: 'POLYGON',
  [ChainId.AVAXMAINNET]: 'AVALANCHE',
  [ChainId.FANTOM]: 'FANTOM',
  [ChainId.ARBITRUM]: 'ARBITRUM',
  [ChainId.OPTIMISM]: 'OPTIMISM',
  [ChainId.CRONOS]: 'CRONOS',
  [ChainId.ZKSYNC]: 'ZKSYNC',
  [ChainId.LINEA]: 'LINEA',
  [ChainId.BASE]: 'BASE'
}

export function getRubicChainName(chainId: ChainId): string {
  const chainName = RUBIC_CHAIN_MAP[chainId]
  if (!chainName) {
    throw new Error(`Chain ${chainId} not supported by Rubic`)
  }
  return chainName
}
