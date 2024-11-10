import { ChainId } from '@kyberswap/ks-sdk-core'
import { useSwitchChain } from 'wagmi'

import { NETWORKS_INFO } from 'constants/networks/supportedNetworks'
import { NetworkInfo } from 'constants/networks/type'

// Type assertion to help TypeScript understand our network info structure
const networksInfo = NETWORKS_INFO as { [key: number]: NetworkInfo }

export default function useSwitchNetwork() {
  const { switchChain } = useSwitchChain()

  const switchNetwork = async (chainId: ChainId) => {
    try {
      await switchChain({ chainId })
      return true
    } catch (error) {
      const networkInfo = networksInfo[chainId]
      if (!networkInfo) {
        console.error('Network info not found for chainId:', chainId)
        return false
      }

      const addChainParameter = {
        chainId,
        chainName: networkInfo.name,
        nativeCurrency: {
          name: networkInfo.nativeToken.name,
          symbol: networkInfo.nativeToken.symbol,
          decimals: networkInfo.nativeToken.decimal
        },
        rpcUrls: [networkInfo.defaultRpcUrl],
        blockExplorerUrls: [networkInfo.etherscanUrl]
      }

      try {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [addChainParameter]
        })
        return true
      } catch (addError) {
        console.error('Failed to add network:', addError)
        return false
      }
    }
  }

  return { switchNetwork }
}
