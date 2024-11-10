import { Connector, useConnect } from 'wagmi'
import { CONNECTION } from 'components/Web3Provider'

// Order wallets will appear in the modal
const WALLET_PRIORITIES = [
  CONNECTION.METAMASK_RDNS,
  CONNECTION.REOWN_ID,
  CONNECTION.DEFI_WALLET_ID,
  CONNECTION.WALLET_CONNECT_CONNECTOR_ID
]

export function useOrderedConnections(): Connector[] {
  const { connectors } = useConnect()

  // Sort connectors based on priority
  return connectors.sort((a, b) => {
    const aIndex = WALLET_PRIORITIES.indexOf(a.id)
    const bIndex = WALLET_PRIORITIES.indexOf(b.id)
    
    // If both connectors are in our priority list, sort by priority
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    
    // If only one connector is in our list, prioritize it
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    // For connectors not in our list, maintain their original order
    return 0
  })
}
