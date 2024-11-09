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
  // For direct routes without USD values, consider them valid
  if (!quote.amountInUsd || !quote.amountOutUsd) {
    return true
  }

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
  const impliedLiquidity = Math.sqrt(parseFloat(quote.amountInUsd) * parseFloat(quote.amountOutUsd)) * 100
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

    console.log('Getting OpenOcean quote with params:', {
      ...Object.fromEntries(params),
      formattedAmount: ethers.utils.formatUnits(inAmount, currencyIn.decimals),
    })

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

    // Verify output amount is valid
    if (!quote.outAmount || ethers.BigNumber.from(quote.outAmount).lte(0)) {
      console.log('OpenOcean quote rejected: Invalid output amount')
      return null
    }

    console.log('Parsed OpenOcean quote:', {
      ...quote,
      formattedInAmount: ethers.utils.formatUnits(quote.inAmount, currencyIn.decimals),
      formattedOutAmount: ethers.utils.formatUnits(quote.outAmount, currencyOut.decimals),
    })

    return quote
  } catch (error) {
    console.error('OpenOcean route error:', error)
    return null
  }
}

async function selectBestQuote(
  quotes: OpenOceanQuote[],
  currencyIn: Currency,
  currencyOut: Currency
): Promise<OpenOceanQuote> {
  let bestQuote: OpenOceanQuote | null = null
  let bestOutput: ethers.BigNumber = ethers.constants.Zero

  for (const quote of quotes) {
    try {
      const outputAmount = ethers.BigNumber.from(quote.outAmount)
      if (outputAmount.gt(bestOutput)) {
        bestOutput = outputAmount
        bestQuote = quote
      }

      const dexName = quote.route[0] ? JSON.parse(quote.route[0]).dexName : 'OpenOcean'
      console.log('Quote comparison:', {
        dex: dexName,
        formattedOutput: ethers.utils.formatUnits(quote.outAmount, currencyOut.decimals),
        gasEstimate: quote.estimatedGas,
      })
    } catch (error) {
      console.error('Error comparing quote:', error)
    }
  }

  if (!bestQuote) {
    throw new Error('No valid quotes available')
  }

  return bestQuote
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
      formattedAmount: ethers.utils.formatUnits(amount.raw.toString(), currencyIn.decimals),
      slippage,
    })

    // Get direct DEX quotes
    const directQuotes = await getDirectDexQuotes(chainId, currencyIn, currencyOut, amount)
    console.log('Direct DEX quotes:', directQuotes.map(q => ({
      ...q,
      formattedOutAmount: ethers.utils.formatUnits(q.outAmount, currencyOut.decimals),
    })))

    // Get OpenOcean route
    const openOceanQuote = await getOpenOceanRoute(chainId, currencyIn, currencyOut, amount, slippage)
    if (openOceanQuote) {
      console.log('OpenOcean quote:', {
        ...openOceanQuote,
        formattedInAmount: ethers.utils.formatUnits(openOceanQuote.inAmount, currencyIn.decimals),
        formattedOutAmount: ethers.utils.formatUnits(openOceanQuote.outAmount, currencyOut.decimals),
      })
    }

    // Combine all quotes
    const allQuotes: OpenOceanQuote[] = []

    // Add direct quotes
    const gasPrice = await getGasPrice(chainId)
    for (const directQuote of directQuotes) {
      // Skip quotes with zero or invalid output
      if (!directQuote.outAmount || ethers.BigNumber.from(directQuote.outAmount).lte(0)) {
        continue
      }

      const quote: OpenOceanQuote = {
        inAmount: amount.raw.toString(),
        outAmount: directQuote.outAmount,
        price: '0',
        priceImpact: '0',
        gasPrice,
        gasUsd: '0',
        amountInUsd: '0',
        amountOutUsd: '0',
        route: [JSON.stringify({
          dexId: directQuote.dex,
          dexName: directQuote.dex,
          swapAmount: directQuote.outAmount,
        })],
        routerAddress: directQuote.routerAddress,
        estimatedGas: directQuote.gasEstimate || '200000',
      }
      allQuotes.push(quote)
    }

    // Add OpenOcean quote if available
    if (openOceanQuote) {
      allQuotes.push(openOceanQuote)
    }

    if (allQuotes.length === 0) {
      throw new Error('No quotes available')
    }

    // Select best quote based on output amount
    const bestQuote = await selectBestQuote(allQuotes, currencyIn, currencyOut)
    console.log('Selected best quote:', {
      ...bestQuote,
      formattedInAmount: ethers.utils.formatUnits(bestQuote.inAmount, currencyIn.decimals),
      formattedOutAmount: ethers.utils.formatUnits(bestQuote.outAmount, currencyOut.decimals),
    })

    return bestQuote
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
      formattedAmount: ethers.utils.formatUnits(amount.raw.toString(), currencyIn.decimals),
      slippage,
      account,
      recipient,
    })

    // Get the best quote
    const quote = await getOpenOceanQuote(chainId, currencyIn, currencyOut, amount, slippage)
    const effectiveRecipient = recipient || account

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

      console.log('Direct swap parameters:', {
        formattedAmount: ethers.utils.formatUnits(amount.raw.toString(), currencyIn.decimals),
        formattedMinOutAmount: ethers.utils.formatUnits(minOutAmount, currencyOut.decimals),
      })

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

    // Otherwise use OpenOcean's swap quote
    const paramsObj: Record<string, string> = {
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
    }

    console.log('Getting OpenOcean swap quote with params:', {
      ...paramsObj,
      formattedAmount: ethers.utils.formatUnits(amount.raw.toString(), currencyIn.decimals),
    })

    const params = new URLSearchParams(paramsObj)
    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/swap_quote?${params}`)
    const data = await response.json()

    console.log('OpenOcean swap quote response:', data)

    if (!data || data.code !== 200 || !data.data || !data.data.to || !data.data.data) {
      console.error('Invalid swap quote response:', data)
      throw new Error('Failed to build transaction')
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
