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
import { ChainId } from 'constants/networks/chainIds'

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

// Icon overrides for different connectors
export const CONNECTOR_ICON_OVERRIDE_MAP: { [key: string]: string } = {
  [CONNECTION.METAMASK_RDNS]: '/images/wallets/metamask.png',
  [CONNECTION.COINBASE_RDNS]: '/images/wallets/coinbase.svg',
  [CONNECTION.DEFI_WALLET_ID]: '/images/wallets/defi.svg',
  [CONNECTION.REOWN_ID]: '/images/wallets/reown.svg',
  [CONNECTION.BLOCTO_ID]: '/images/wallets/blocto.svg',
  [CONNECTION.SAFE_CONNECTOR_ID]: '/images/wallets/safe.svg'
}

// Define supported chain
const supportedChain = {
  id: ChainId.CRONOS,
  name: 'Cronos',
  network: 'cronos',
  nativeCurrency: {
    name: 'Cronos',
    symbol: 'CRO',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://evm.cronos.org'] },
    public: { http: ['https://evm.cronos.org'] },
  },
  blockExplorers: {
    default: { name: 'CronosScan', url: 'https://cronoscan.com' },
  },
  testnet: false,
}

// Helper function to get connector with ID
export const getConnectorWithId = (id: string) => {
  switch (id) {
    case CONNECTION.WALLET_CONNECT_CONNECTOR_ID:
      return walletConnect({
        projectId,
        showQrModal: true,
        metadata: {
          name: 'RooSwap',
          description: 'RooSwap Interface',
          url: window.location.origin,
          icons: ['/logo.svg']
        }
      })
    case CONNECTION.INJECTED_CONNECTOR_ID:
      return injected()
    default:
      return injected()
  }
}

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [supportedChain],
  projectId,
  ssr: true,
  transports: {
    [ChainId.CRONOS]: http('https://evm.cronos.org')
  },
  connectors: [
    injected(),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'RooSwap',
        description: 'RooSwap Interface',
        url: window.location.origin,
        icons: ['/logo.svg']
      }
    })
  ]
})

// Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [supportedChain],
  projectId,
  metadata: {
    name: 'RooSwap',
    description: 'RooSwap Interface',
    url: window.location.origin,
    icons: ['/logo.svg']
  },
  features: {
    analytics: true
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'reownapp',
    'defiwallet'
  ],
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'reownapp',
    'defiwallet'
  ],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-z-index': '1000',
    '--w3m-accent-color': '#31CB9E',
    '--w3m-accent-fill-color': '#222222',
    '--w3m-background-color': '#0F0F0F'
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
      onChange(chainId: number) {
        // Only allow Cronos chain
        if (chainId === ChainId.CRONOS) {
          dispatch(updateChainId(chainId))
        }
      }
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
