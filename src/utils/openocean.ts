import { ChainId } from '@kyberswap/ks-sdk-core'
import { OPENOCEAN_API_URL, OPENOCEAN_CHAIN_IDS } from '../constants/openocean'

export type OpenOceanToken = {
  address: string
  decimals: number
  symbol: string
  name: string
  usd: string
  volume: number
}

export type OpenOceanQuoteResponse = {
  code: number
  data: {
    inToken: OpenOceanToken
    outToken: OpenOceanToken
    inAmount: string
    outAmount: string
    estimatedGas: string
    price_impact: string
    dexes: Array<{
      dexIndex: number
      dexCode: string
      swapAmount: string
    }>
  }
}

export type OpenOceanSwapResponse = {
  code: number
  data: {
    inToken: OpenOceanToken
    outToken: OpenOceanToken
    inAmount: string
    outAmount: string
    minOutAmount: string
    estimatedGas: number
    from: string
    to: string
    value: string
    data: string
    gasPrice: string
    chainId: number
    price_impact: string
  }
}

export const getOpenOceanChainId = (chainId: ChainId): string => {
  const openOceanChainId = OPENOCEAN_CHAIN_IDS[chainId]
  if (!openOceanChainId) {
    throw new Error('Chain not supported by OpenOcean')
  }
  return openOceanChainId
}

export const fetchOpenOceanQuote = async (
  chainId: ChainId,
  inTokenAddress: string,
  outTokenAddress: string,
  amount: string,
  gasPrice: string,
  slippage: number,
  account?: string,
): Promise<OpenOceanQuoteResponse> => {
  const openOceanChainId = getOpenOceanChainId(chainId)
  const url = new URL(`${OPENOCEAN_API_URL}/${openOceanChainId}/quote`)
  
  const params = {
    inTokenAddress,
    outTokenAddress,
    amount,
    gasPrice,
    slippage: slippage.toString(),
    ...(account && { account })
  }
  
  url.search = new URLSearchParams(params).toString()
  
  const response = await fetch(url.toString())
  const data = await response.json()
  
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to fetch quote')
  }
  
  return data
}

export const buildOpenOceanTx = async (
  chainId: ChainId,
  inTokenAddress: string,
  outTokenAddress: string,
  amount: string,
  gasPrice: string,
  slippage: number,
  account: string,
): Promise<OpenOceanSwapResponse> => {
  const openOceanChainId = getOpenOceanChainId(chainId)
  const url = new URL(`${OPENOCEAN_API_URL}/${openOceanChainId}/swap_quote`)
  
  const params = {
    inTokenAddress,
    outTokenAddress,
    amount,
    gasPrice,
    slippage: slippage.toString(),
    account
  }
  
  url.search = new URLSearchParams(params).toString()
  
  const response = await fetch(url.toString())
  const data = await response.json()
  
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to build transaction')
  }
  
  return data
}

export const getOpenOceanGasPrice = async (chainId: ChainId): Promise<string> => {
  const openOceanChainId = getOpenOceanChainId(chainId)
  const url = `${OPENOCEAN_API_URL}/${openOceanChainId}/gasPrice`
  
  const response = await fetch(url)
  const data = await response.json()
  
  if (data.code !== 200) {
    throw new Error('Failed to fetch gas price')
  }
  
  return data.data.standard
}
