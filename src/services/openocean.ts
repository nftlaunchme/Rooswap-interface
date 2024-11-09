import { Currency, CurrencyAmount } from '../types/currency'
import { OpenOceanQuote, OpenOceanSwapResult, TokenInfo, DexQuote } from '../types/openocean'
import { ethers } from 'ethers'
import { getDirectDexQuotes, createSwapTransaction } from './dexService'
import { CRONOS_DEXES } from '../constants/dex'

const OPENOCEAN_API_URL = 'https://open-api.openocean.finance/v3'

// Default referrer fee (required by API to be >= 0.01)
const DEFAULT_REFERRER_FEE = '0.01'
// Default referrer address
const DEFAULT_REFERRER = '0x0000000000000000000000000000000000000000'

// Thresholds for route validation
const MAX_PRICE_IMPACT = 15 // 15%
const MIN_OUTPUT_USD = 0.001 // $0.001
const MIN_LIQUIDITY_USD = 1000 // $1k

function getTokenAddress(currency: Currency): string {
  if (currency.isNative) {
    return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  }
  return currency.wrapped.address
}

function isValidRoute(quote: OpenOceanQuote): boolean {
  console.log('Validating route:', {
    priceImpact: quote.priceImpact + '%',
    outputUsd: '$' + quote.amountOutUsd,
    inputUsd: '$' + quote.amountInUsd,
  })

  // Skip if price impact is too high
  if (parseFloat(quote.priceImpact) > MAX_PRICE_IMPACT) {
    console.log(`Route rejected: Price impact too high (${quote.priceImpact}% > ${MAX_PRICE_IMPACT}%)`)
    return false
  }

  // Skip if output amount is too small
  if (parseFloat(quote.amountOutUsd) < MIN_OUTPUT_USD) {
    console.log(`Route rejected: Output too small ($${quote.amountOutUsd} < $${MIN_OUTPUT_USD})`)
    return false
  }

  // Calculate implied liquidity
  const impliedLiquidity = Math.sqrt(parseFloat(quote.amountInUsd || '0') * parseFloat(quote.amountOutUsd || '0')) * 100
  if (impliedLiquidity < MIN_LIQUIDITY_USD) {
    console.log(`Route rejected: Low liquidity ($${impliedLiquidity.toFixed(2)} < $${MIN_LIQUIDITY_USD})`)
    return false
  }

  console.log('Route accepted:', {
    priceImpact: quote.priceImpact + '%',
    outputUsd: '$' + quote.amountOutUsd,
    impliedLiquidity: '$' + impliedLiquidity.toFixed(2),
  })

  return true
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

async function getOpenOceanRoute(
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

    console.log('Getting OpenOcean quote with params:', Object.fromEntries(params))
    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/quote?${params}`)
    const data = await response.json()

    console.log('OpenOcean Quote response:', data)

    if (!data || data.code !== 200 || !data.data) {
      console.error('Invalid OpenOcean quote response:', data)
      return null
    }

    const quote = {
      inAmount: data.data.inAmount,
      outAmount: data.data.outAmount,
      price: data.data.price || '0',
      priceImpact: data.data.price_impact?.replace('%', '') || '0',
      gasPrice: data.data.gasPrice || gasPrice,
      gasUsd: data.data.gasUsd || '0',
      amountInUsd: data.data.inUSD || '0',
      amountOutUsd: data.data.outUSD || '0',
      route: data.data.path?.routes?.map((r: any) => JSON.stringify(r)) || [],
      routerAddress: data.data.to || '',
      estimatedGas: data.data.estimatedGas || '250000',
    }

    // Validate the route
    if (!isValidRoute(quote)) {
      console.log('OpenOcean route failed validation')
      return null
    }

    return quote
  } catch (error) {
    console.error('OpenOcean route error:', error)
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
    console.log('Getting quotes for:', {
      chainId,
      currencyIn: currencyIn.symbol,
      currencyOut: currencyOut.symbol,
      amount: amount.toExact(),
      slippage,
    })

    // Get direct DEX quotes
    const directQuotes = await getDirectDexQuotes(chainId, currencyIn, currencyOut, amount)
    console.log('Direct DEX quotes:', directQuotes)

    // Get OpenOcean route
    const openOceanQuote = await getOpenOceanRoute(chainId, currencyIn, currencyOut, amount, slippage)
    console.log('OpenOcean quote:', openOceanQuote)

    // Find best direct quote
    let bestDirectQuote: DexQuote | null = null
    if (directQuotes.length > 0) {
      bestDirectQuote = directQuotes[0] // Already sorted by output amount
    }

    // Compare direct vs OpenOcean route
    if (bestDirectQuote && openOceanQuote) {
      const directOutput = ethers.BigNumber.from(bestDirectQuote.outAmount)
      const openOceanOutput = ethers.BigNumber.from(openOceanQuote.outAmount)
      const gasPrice = ethers.BigNumber.from(openOceanQuote.gasPrice)

      // Calculate gas costs
      const directGasEstimate = ethers.BigNumber.from(bestDirectQuote.gasEstimate || '200000')
      const openOceanGasEstimate = ethers.BigNumber.from(openOceanQuote.estimatedGas || '250000')

      const directGasCost = gasPrice.mul(directGasEstimate)
      const openOceanGasCost = gasPrice.mul(openOceanGasEstimate)

      // Convert gas costs to output token terms for fair comparison
      const outputDecimals = currencyOut.decimals
      const gasCostScaling = ethers.BigNumber.from(10).pow(outputDecimals)
      const scaledDirectGasCost = directGasCost.mul(gasCostScaling)
      const scaledOpenOceanGasCost = openOceanGasCost.mul(gasCostScaling)

      // Compare net outputs
      const directNet = directOutput.sub(scaledDirectGasCost)
      const openOceanNet = openOceanOutput.sub(scaledOpenOceanGasCost)

      console.log('Route comparison:', {
        direct: {
          dex: bestDirectQuote.dex,
          output: directOutput.toString(),
          gasCost: directGasCost.toString(),
          netOutput: directNet.toString(),
        },
        openOcean: {
          output: openOceanOutput.toString(),
          gasCost: openOceanGasCost.toString(),
          netOutput: openOceanNet.toString(),
        }
      })

      // Use direct route if it's better
      if (directNet.gt(openOceanNet)) {
        const directQuote = {
          inAmount: amount.raw.toString(),
          outAmount: bestDirectQuote.outAmount,
          price: openOceanQuote.price,
          priceImpact: '0', // Direct routes don't calculate price impact
          gasPrice: gasPrice.toString(),
          gasUsd: openOceanQuote.gasUsd,
          amountInUsd: openOceanQuote.amountInUsd,
          amountOutUsd: openOceanQuote.amountOutUsd,
          route: [JSON.stringify({
            dexId: bestDirectQuote.dex,
            dexName: bestDirectQuote.dex,
            swapAmount: bestDirectQuote.outAmount,
          })],
          routerAddress: bestDirectQuote.routerAddress,
          estimatedGas: bestDirectQuote.gasEstimate,
        }

        // Validate the direct route
        if (!isValidRoute(directQuote)) {
          console.log('Direct route failed validation, falling back to OpenOcean route')
          return openOceanQuote
        }

        return directQuote
      }
    }

    // If only OpenOcean quote is available and valid
    if (openOceanQuote) {
      return openOceanQuote
    }

    // If only direct route is available
    if (bestDirectQuote) {
      const gasPrice = await getGasPrice(chainId)
      const directQuote = {
        inAmount: amount.raw.toString(),
        outAmount: bestDirectQuote.outAmount,
        price: '0',
        priceImpact: '0',
        gasPrice,
        gasUsd: '0',
        amountInUsd: '0',
        amountOutUsd: '0',
        route: [JSON.stringify({
          dexId: bestDirectQuote.dex,
          dexName: bestDirectQuote.dex,
          swapAmount: bestDirectQuote.outAmount,
        })],
        routerAddress: bestDirectQuote.routerAddress,
        estimatedGas: bestDirectQuote.gasEstimate,
      }

      // Validate the direct route
      if (!isValidRoute(directQuote)) {
        throw new Error('No valid routes available')
      }

      return directQuote
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
    console.log('Getting swap data for:', {
      chainId,
      currencyIn: currencyIn.symbol,
      currencyOut: currencyOut.symbol,
      amount: amount.toExact(),
      slippage,
      account,
      recipient,
    })

    // Get the best route
    const quote = await getOpenOceanQuote(chainId, currencyIn, currencyOut, amount, slippage)

    // Validate the quote
    if (!isValidRoute(quote)) {
      throw new Error('No valid route available')
    }

    const effectiveRecipient = recipient || account
    const inAmount = amount.raw.toString()

    // Check if this is a direct DEX route
    let firstRoute
    try {
      firstRoute = JSON.parse(quote.route[0])
      console.log('Parsed route:', firstRoute)
    } catch (e) {
      console.error('Failed to parse route info:', e)
    }

    // If this is a direct DEX route, create the swap transaction directly
    if (firstRoute?.dexName && CRONOS_DEXES[firstRoute.dexName]) {
      console.log('Using direct DEX route:', firstRoute)
      const deadline = Math.floor(Date.now() / 1000) + 20 * 60 // 20 minutes
      const minOutAmount = ethers.BigNumber.from(quote.outAmount)
        .mul(1000 - Math.floor(slippage * 10)) // Convert slippage to basis points
        .div(1000)
        .toString()

      const { data, value } = await createSwapTransaction(
        quote.routerAddress,
        currencyIn,
        currencyOut,
        inAmount,
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

    // Otherwise use OpenOcean's swap quote
    const paramsObj: Record<string, string> = {
      inTokenAddress: getTokenAddress(currencyIn),
      outTokenAddress: getTokenAddress(currencyOut),
      amount: inAmount,
      gasPrice: quote.gasPrice,
      slippage: slippage.toString(),
      account,
      recipient: effectiveRecipient,
      chainId: chainId.toString(),
      referrer: DEFAULT_REFERRER,
      referrerFee: DEFAULT_REFERRER_FEE,
    }

    console.log('Getting OpenOcean swap quote with params:', paramsObj)

    const params = new URLSearchParams(paramsObj)
    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/swap_quote?${params}`)
    const data = await response.json()

    console.log('OpenOcean swap quote response:', data)

    if (!data || data.code !== 200 || !data.data) {
      console.error('Invalid swap quote response:', data)
      throw new Error(data?.message || data?.error?.msg || 'Failed to get swap data')
    }

    if (!data.data.to || !data.data.data) {
      console.error('Missing required swap data:', data.data)
      throw new Error('Invalid swap data response')
    }

    const result = {
      data: data.data.data,
      to: data.data.to,
      value: data.data.value || '0',
      gasPrice: data.data.gasPrice || quote.gasPrice,
      estimatedGas: quote.estimatedGas,
    }

    console.log('Swap data result:', result)
    return result
  } catch (error) {
    console.error('OpenOcean swap data error:', error)
    throw error
  }
}
