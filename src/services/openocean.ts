import { Currency, CurrencyAmount } from '../types/currency'
import { OpenOceanQuote, OpenOceanSwapResult } from '../types/openocean'

const OPENOCEAN_API_URL = 'https://open-api.openocean.finance/v3'

// Helper to get the correct token address format for OpenOcean
function getTokenAddress(currency: Currency): string {
  if (currency.isNative) {
    // Use OpenOcean's native token address format
    return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  }
  return currency.getAddress()
}

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  logoURI?: string
}

export async function getTokenList(chainId: number): Promise<TokenInfo[]> {
  try {
    // Use the correct OpenOcean token list endpoint for Cronos
    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/tokenList`)
    const data = await response.json()

    console.log('OpenOcean token list response:', data)

    if (data.code !== 200 || !data.data) {
      throw new Error('Failed to get token list')
    }

    // Map the response to our TokenInfo format
    return data.data.map((token: any) => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: parseInt(token.decimals),
      chainId,
      logoURI: token.logoURI,
    }))
  } catch (error) {
    console.error('Failed to fetch token list:', error)
    return []
  }
}

export async function getTokenBalances(
  chainId: number,
  account: string,
  tokens: string[]
): Promise<{ [address: string]: string }> {
  try {
    const params = new URLSearchParams({
      account,
      chainId: chainId.toString(),
      tokens: tokens.join(','),
    })

    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/balance?${params}`)
    const data = await response.json()

    console.log('OpenOcean balance response:', data)

    if (data.code !== 200 || !data.data) {
      throw new Error('Failed to get token balances')
    }

    // Convert the response to our expected format
    const balances: { [address: string]: string } = {}
    Object.entries(data.data).forEach(([address, balance]) => {
      balances[address.toLowerCase()] = balance.toString()
    })

    return balances
  } catch (error) {
    console.error('Failed to fetch token balances:', error)
    return {}
  }
}

export async function getOpenOceanQuote(
  chainId: number,
  currencyIn: Currency,
  currencyOut: Currency,
  amount: CurrencyAmount<Currency>,
  slippage: number,
): Promise<OpenOceanQuote> {
  try {
    const inTokenAddress = getTokenAddress(currencyIn)
    const outTokenAddress = getTokenAddress(currencyOut)

    console.log('Getting OpenOcean quote with params:', {
      chainId,
      inTokenAddress,
      outTokenAddress,
      amount: amount.raw,
      slippage: slippage / 100,
    })

    const params = new URLSearchParams({
      inTokenAddress,
      outTokenAddress,
      amount: amount.raw,
      gasPrice: '5000000000000', // 5000 gwei for Cronos
      slippage: (slippage / 100).toString(),
      chainId: chainId.toString(),
      referrer: '0x0000000000000000000000000000000000000000',
      referrerFee: '0',
    })

    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/quote?${params}`)
    const data = await response.json()

    console.log('OpenOcean quote response:', data)

    if (data.code !== 200 || !data.data) {
      throw new Error(data.message || 'Failed to get quote')
    }

    // Use the price directly from the API
    const price = data.data.price || '0'

    return {
      inAmount: data.data.inAmount || amount.raw,
      outAmount: data.data.outAmount || '0',
      price,
      priceImpact: data.data.priceImpact || '0',
      gasPrice: data.data.gasPrice || '5000000000000',
      gasUsd: data.data.gasUsd || '0',
      amountInUsd: data.data.inUSD || '0',
      amountOutUsd: data.data.outUSD || '0',
      route: data.data.path || [],
      routerAddress: data.data.to || '',
    }
  } catch (error) {
    console.error('OpenOcean quote error:', error)
    throw error
  }
}

export async function getOpenOceanSwapData(
  chainId: number,
  currencyIn: Currency,
  currencyOut: Currency,
  amount: CurrencyAmount<Currency>,
  slippage: number,
  account: string,
  recipient: string | null,
): Promise<OpenOceanSwapResult> {
  try {
    const effectiveRecipient = recipient || account
    const inTokenAddress = getTokenAddress(currencyIn)
    const outTokenAddress = getTokenAddress(currencyOut)

    console.log('Getting OpenOcean swap data with params:', {
      chainId,
      inTokenAddress,
      outTokenAddress,
      amount: amount.raw,
      slippage: slippage / 100,
      account,
      recipient: effectiveRecipient,
    })

    const params = new URLSearchParams({
      inTokenAddress,
      outTokenAddress,
      amount: amount.raw,
      gasPrice: '5000000000000', // 5000 gwei for Cronos
      slippage: (slippage / 100).toString(),
      account,
      recipient: effectiveRecipient,
      chainId: chainId.toString(),
      referrer: '0x0000000000000000000000000000000000000000',
      referrerFee: '0',
    })

    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/swap_quote?${params}`)
    const data = await response.json()

    console.log('OpenOcean swap data response:', data)

    if (data.code !== 200 || !data.data) {
      throw new Error(data.message || 'Failed to get swap data')
    }

    return {
      data: data.data.data || '',
      to: data.data.to || '',
      value: data.data.value || '0',
      gasPrice: data.data.gasPrice || '5000000000000',
    }
  } catch (error) {
    console.error('OpenOcean swap data error:', error)
    throw error
  }
}
