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

interface OpenOceanTokenListResponse {
  code: number
  data: TokenInfo[]
}

interface OpenOceanBalanceResponse {
  code: number
  data: { [address: string]: { balance: string } }
}

export async function getTokenList(chainId: number): Promise<TokenInfo[]> {
  try {
    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/token/list`)
    const data = await response.json() as OpenOceanTokenListResponse

    console.log('OpenOcean token list response:', data)

    if (data.code !== 200 || !data.data) {
      throw new Error('Failed to get token list')
    }

    return data.data.map((token: TokenInfo) => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
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
      inTokenAddress: tokens.join(','),
    })

    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/getBalance?${params}`)
    const data = await response.json()

    console.log('OpenOcean balance response:', data)

    if (data.code !== 200 || !data.data) {
      throw new Error('Failed to get token balances')
    }

    // Convert the response to our expected format
    const balances: { [address: string]: string } = {}
    data.data.forEach((token: any) => {
      balances[token.tokenAddress.toLowerCase()] = token.raw.toString()
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

    // Convert to decimal format without decimals as per API docs
    const inAmount = amount.toExact()

    console.log('Getting OpenOcean quote with params:', {
      chainId,
      inTokenAddress,
      outTokenAddress,
      amount: inAmount,
      slippage,
    })

    const params = new URLSearchParams({
      inTokenAddress,
      outTokenAddress,
      amount: inAmount,
      gasPrice: '5', // 5 gwei
      slippage: slippage.toString(),
      chainId: chainId.toString(),
    })

    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/quote?${params}`)
    const data = await response.json()

    console.log('OpenOcean quote response:', data)

    if (data.code !== 200 || !data.data) {
      throw new Error(data.message || 'Failed to get quote')
    }

    // Get the raw amounts with decimals
    const inAmountRaw = data.data.inAmount
    const outAmountRaw = data.data.outAmount

    // Calculate price using the token volumes from the API
    const inVolume = Number(data.data.inToken.volume)
    const outVolume = Number(data.data.outToken.volume)
    const price = (outVolume / inVolume).toString()

    return {
      inAmount: inAmountRaw,
      outAmount: outAmountRaw,
      price,
      priceImpact: data.data.price_impact?.replace('%', '') || '0',
      gasPrice: data.data.gasPrice || '5000000000',
      gasUsd: data.data.gasUsd || '0',
      amountInUsd: (inVolume * Number(data.data.inToken.usd)).toString(),
      amountOutUsd: (outVolume * Number(data.data.outToken.usd)).toString(),
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
    const inAmount = amount.toExact()

    console.log('Getting OpenOcean swap data with params:', {
      chainId,
      inTokenAddress,
      outTokenAddress,
      amount: inAmount,
      slippage,
      account,
      recipient: effectiveRecipient,
    })

    const params = new URLSearchParams({
      inTokenAddress,
      outTokenAddress,
      amount: inAmount,
      gasPrice: '5', // 5 gwei
      slippage: slippage.toString(),
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
      gasPrice: data.data.gasPrice || '5000000000',
    }
  } catch (error) {
    console.error('OpenOcean swap data error:', error)
    throw error
  }
}
