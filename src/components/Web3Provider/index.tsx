import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'
import { http } from 'viem'
import { cronos } from 'viem/chains'
import { watchChainId } from '@wagmi/core'
import { useAppDispatch } from 'state/hooks'
import { updateChainId } from 'state/user/actions'
import { isSupportedChainId } from 'constants/networks'
import { injected, walletConnect } from 'wagmi/connectors'

// Create QueryClient
export const queryClient = new QueryClient()

// Project ID from reown Cloud
const projectId = '7b7cd4d698d7ca7ddab6825056af50ef'

// Connection types
export const CONNECTION = {
  WALLET_CONNECT_CONNECTOR_ID: 'walletConnect',
  UNISWAP_WALLET_CONNECT_CONNECTOR_ID: 'uniswapWalletConnect',
  INJECTED_CONNECTOR_ID: 'injected',
  INJECTED_CONNECTOR_TYPE: 'injected',
  COINBASE_SDK_CONNECTOR_ID: 'coinbaseWalletSDK',
  COINBASE_RDNS: 'com.coinbase.wallet',
  METAMASK_RDNS: 'io.metamask',
  REOWN_ID: 'reownapp',
  DEFI_WALLET_ID: 'defiwallet',
  BLOCTO_ID: 'blocto',
  SAFE_CONNECTOR_ID: 'safe',
} as const

// Metadata for the dApp
const metadata = {
  name: 'RooSwap',
  description: 'RooSwap Interface',
  url: window.location.origin,
  icons: ['https://kyberswap.com/favicon.svg']
}

// Create Wagmi Adapter with custom RPC URL for Cronos
const wagmiAdapter = new WagmiAdapter({
  networks: [cronos],
  projectId,
  ssr: true,
  transports: {
    [cronos.id]: http('https://evm.cronos.org')
  }
})

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [cronos],
  projectId,
  metadata,
  features: {
    analytics: true
  },
  // Configure supported wallets
  featuredWalletIds: [
    'reownapp', // Reown Wallet
    'defiwallet', // DeFi Wallet
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96' // MetaMask
  ],
  // Only show our supported wallets
  includeWalletIds: [
    'reownapp',
    'defiwallet',
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'
  ],
  // Customize modal appearance
  themeMode: 'dark',
  themeVariables: {
    '--w3m-z-index': '1000',
    '--w3m-accent-color': '#31CB9E',
    '--w3m-accent-fill-color': '#222222',
    '--w3m-background-color': '#0F0F0F',
  }
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiAdapter.wagmiConfig
  }
}

export default function Web3Provider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    const unwatch = watchChainId(wagmiAdapter.wagmiConfig, {
      onChange(chainId) {
        if (isSupportedChainId(chainId)) {
          dispatch(updateChainId(chainId as any))
        }
      },
    })
    return () => {
      unwatch()
    }
  }, [dispatch])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
