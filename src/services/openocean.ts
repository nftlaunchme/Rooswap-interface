import { Currency, CurrencyAmount } from '../types/currency'
import { OpenOceanQuote, OpenOceanSwapResult, TokenInfo, DexQuote } from '../types/openocean'
import { ethers } from 'ethers'
import { getDirectDexQuotes, createSwapTransaction } from './dexService'

const OPENOCEAN_API_URL = 'https://open-api.openocean.finance/v3'

// Default referrer fee (required by API to be >= 0.01)
const DEFAULT_REFERRER_FEE = '0.01'
// Default referrer address
const DEFAULT_REFERRER = '0x0000000000000000000000000000000000000000'

function getTokenAddress(currency: Currency): string {
  if (currency.isNative) {
    return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  }
  return currency.wrapped.address
}

async function getGasPrice(chainId: number): Promise<string> {
  try {
    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/gasPrice`)
    const data = await response.json()
    if (data.code === 200 && data.data) {
      return data.data.standard || '5000000000' // Default to 5 Gwei
    }
    return '5000000000'
  } catch (error) {
    console.error('Failed to fetch gas price:', error)
    return '5000000000'
  }
}

export async function getTokenList(chainId: number): Promise<TokenInfo[]> {
  try {
    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/tokenList`)
    const data = await response.json()
    if (data.code === 200 && data.data) {
      return data.data
    }
    return []
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

    if (data.code === 200 && data.data) {
      const balances: { [address: string]: string } = {}
      data.data.forEach((token: { tokenAddress: string; raw: string }) => {
        if (token.tokenAddress) {
          balances[token.tokenAddress.toLowerCase()] = token.raw
        }
      })
      return balances
    }
    return {}
  } catch (error) {
    console.error('Failed to fetch token balances:', error)
    return {}
  }
}

async function getMultiHopQuote(
  chainId: number,
  currencyIn: Currency,
  currencyOut: Currency,
  amount: CurrencyAmount<Currency>,
  slippage: number,
): Promise<OpenOceanQuote | null> {
  try {
    const inTokenAddress = getTokenAddress(currencyIn)
    const outTokenAddress = getTokenAddress(currencyOut)
    const inAmount = amount.raw.toString()
    const gasPrice = await getGasPrice(chainId)

    const params = new URLSearchParams({
      inTokenAddress,
      outTokenAddress,
      amount: inAmount,
      gasPrice,
      slippage: slippage.toString(),
      chainId: chainId.toString(),
      gasInclude: '1',
      referrer: DEFAULT_REFERRER,
      referrerFee: DEFAULT_REFERRER_FEE,
    })

    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/quote?${params}`)
    const data = await response.json()

    if (!data || data.code !== 200 || !data.data) {
      return null
    }

    // Check if this is a multi-hop route
    const routes = data.data.path?.routes || []
    if (routes.length <= 1) {
      return null // Not a multi-hop route
    }

    return {
      inAmount: data.data.inAmount,
      outAmount: data.data.outAmount,
      price: data.data.price || '0',
      priceImpact: data.data.price_impact?.replace('%', '') || '0',
      gasPrice: data.data.gasPrice || gasPrice,
      gasUsd: data.data.gasUsd || '0',
      amountInUsd: data.data.inUSD || '0',
      amountOutUsd: data.data.outUSD || '0',
      route: routes.map((r: any) => JSON.stringify(r)),
      routerAddress: data.data.to || '',
      estimatedGas: data.data.estimatedGas || '250000',
    }
  } catch (error) {
    console.error('Failed to get multi-hop quote:', error)
    return null
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
    // Try direct DEX quotes first
    const directQuotes = await getDirectDexQuotes(chainId, currencyIn, currencyOut, amount)
    if (directQuotes.length > 0) {
      const bestQuote = directQuotes[0] // Already sorted by output amount
      const gasPrice = await getGasPrice(chainId)

      return {
        inAmount: amount.raw.toString(),
        outAmount: bestQuote.outAmount,
        price: '0',
        priceImpact: '0',
        gasPrice,
        gasUsd: '0',
        amountInUsd: '0',
        amountOutUsd: '0',
        route: [JSON.stringify({
          dexId: bestQuote.dex,
          dexName: bestQuote.dex,
          swapAmount: bestQuote.outAmount,
        })],
        routerAddress: bestQuote.routerAddress,
        estimatedGas: bestQuote.gasEstimate || '200000',
      }
    }

    // Try multi-hop route
    const multiHopQuote = await getMultiHopQuote(chainId, currencyIn, currencyOut, amount, slippage)
    if (multiHopQuote) {
      return multiHopQuote
    }

    throw new Error('No valid routes found')
  } catch (error) {
    console.error('Quote error:', error)
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
    const quote = await getOpenOceanQuote(chainId, currencyIn, currencyOut, amount, slippage)
    const effectiveRecipient = recipient || account

    // Parse route info
    const firstRoute = JSON.parse(quote.route[0])
    const isDirectRoute = quote.route.length === 1

    // For direct routes, use DEX router directly
    if (isDirectRoute) {
      const deadline = Math.floor(Date.now() / 1000) + 20 * 60 // 20 minutes
      const minOutAmount = ethers.BigNumber.from(quote.outAmount)
        .mul(1000 - Math.floor(slippage * 10)) // Convert slippage to basis points
        .div(1000)
        .toString()

      const { data, value } = await createSwapTransaction(
        quote.routerAddress,
        currencyIn,
        currencyOut,
        amount.raw.toString(),
        minOutAmount,
        effectiveRecipient,
        deadline
      )

      return {
        data,
        to: quote.routerAddress,
        value,
        gasPrice: quote.gasPrice,
        estimatedGas: quote.estimatedGas,
      }
    }

    // For multi-hop routes, use OpenOcean API
    const params = new URLSearchParams({
      inTokenAddress: getTokenAddress(currencyIn),
      outTokenAddress: getTokenAddress(currencyOut),
      amount: amount.raw.toString(),
      gasPrice: quote.gasPrice,
      slippage: slippage.toString(),
      account,
      recipient: effectiveRecipient,
      chainId: chainId.toString(),
      referrer: DEFAULT_REFERRER,
      referrerFee: DEFAULT_REFERRER_FEE,
    })

    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/swap_quote?${params}`)
    const data = await response.json()

    if (!data || data.code !== 200 || !data.data || !data.data.to || !data.data.data) {
      throw new Error('Failed to build multi-hop transaction')
    }

    return {
      data: data.data.data,
      to: data.data.to,
      value: data.data.value || '0',
      gasPrice: data.data.gasPrice || quote.gasPrice,
      estimatedGas: quote.estimatedGas,
    }
  } catch (error) {
    console.error('OpenOcean swap data error:', error)
    throw error
  }
}
