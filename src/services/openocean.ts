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

    // Convert amount to proper decimals
    const rawAmount = amount.raw
    const decimals = currencyIn.decimals

    console.log('Getting OpenOcean quote with params:', {
      chainId,
      inTokenAddress,
      outTokenAddress,
      amount: rawAmount,
      decimals,
      slippage: slippage / 100, // Convert basis points to percentage
    })

    const params = new URLSearchParams({
      inTokenAddress,
      outTokenAddress,
      amount: rawAmount,
      gasPrice: '5000000000000', // 5000 gwei for Cronos
      slippage: (slippage / 100).toString(),
      chainId: chainId.toString(),
      referrer: '0x0000000000000000000000000000000000000000',
      referrerFee: '0',
    })

    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/quote?${params}`)
    const data = await response.json()

    console.log('OpenOcean quote response:', data)

    if (data.code !== 200) {
      console.error('OpenOcean quote error:', data)
      throw new Error(data.message || 'Failed to get quote')
    }

    if (!data.data) {
      console.error('OpenOcean quote missing data:', data)
      throw new Error('Invalid quote response')
    }

    // Calculate price as outAmount/inAmount considering decimals
    const inAmount = BigInt(data.data.inAmount || amount.raw)
    const outAmount = BigInt(data.data.outAmount || '0')
    const inDecimals = BigInt(currencyIn.decimals)
    const outDecimals = BigInt(currencyOut.decimals)

    // Normalize amounts to same decimal places (18) for price calculation
    const normalizedInAmount = inAmount * BigInt(10) ** (18n - inDecimals)
    const normalizedOutAmount = outAmount * BigInt(10) ** (18n - outDecimals)

    // Calculate price with 6 decimal places
    const price = normalizedOutAmount * BigInt(1000000) / normalizedInAmount
    const priceString = (Number(price) / 1000000).toString()

    return {
      inAmount: data.data.inAmount || amount.raw,
      outAmount: data.data.outAmount || '0',
      price: priceString,
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

    if (data.code !== 200) {
      console.error('OpenOcean swap quote error:', data)
      throw new Error(data.message || 'Failed to get swap data')
    }

    if (!data.data) {
      console.error('OpenOcean swap quote missing data:', data)
      throw new Error('Invalid swap quote response')
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
