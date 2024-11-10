import { ethers, BigNumber } from 'ethers'
import { Currency } from '@kyberswap/ks-sdk-core'
import { CRONOS_DEXES } from '../constants/dex'
import {
  DexQuote,
  DexError,
  DexInfo,
  SwapTransaction,
  QuoteCacheKey,
  V3Quote,
  GasCalculationParams,
  SplitRoute,
  WCRO_ADDRESS,
  ROUTER_ABI
} from './types'

// Export types for external use
export type {
  DexQuote,
  DexError,
  DexInfo,
  SwapTransaction,
  QuoteCacheKey,
  V3Quote,
  GasCalculationParams,
  SplitRoute
}

// Constants
const QUOTE_CACHE_DURATION = 10000 // 10 seconds
const BATCH_SIZE = 2 // Process two requests at a time
const RATE_LIMIT_DELAY = 500 // 500ms between batches
const CRO_USD_PRICE = 0.1 // TODO: Get real price
const MIN_OUTPUT_IMPROVEMENT = 0.005 // 0.5% minimum improvement for complex routes
const SPLIT_PERCENTAGES = [
  [100], // Single pool
  [60, 40], // Two pools
  [50, 30, 20], // Three pools
]

// Node configuration
const NODE_CONFIG = {
  http: 'https://nd-200-297-889.p2pify.com/35f91dc125d54db6fd802c93ddadf167',
  username: 'jovial-payne',
  password: 'shrank-chrome-single-cried-chaps-recopy'
}

// Router ABIs
const V3_ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
  'function exactInput((bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum)) external payable returns (uint256 amountOut)'
]

const V3_QUOTER_ABI = [
  'function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)',
  'function quote(bytes memory path, uint256 amountIn) external returns (uint256 amountOut, uint160[] memory sqrtPriceX96AfterList, uint32[] memory initializedTicksCrossedList, uint256 gasEstimate)'
]

// Initialize provider with authentication
const provider = new ethers.providers.JsonRpcProvider({
  url: NODE_CONFIG.http,
  headers: {
    Authorization: 'Basic ' + Buffer.from(`${NODE_CONFIG.username}:${NODE_CONFIG.password}`).toString('base64')
  }
})

// Quote cache
const quoteCache = new Map<string, { quote: DexQuote | DexError; timestamp: number }>()

// Helper functions
export function getTokenAddressForDex(currency: Currency): string {
  if (currency.isNative) {
    return WCRO_ADDRESS
  }
  return currency.wrapped.address
}

function getCacheKey(dexKey: string, inToken: string, outToken: string, amount: string): string {
  return `${dexKey}-${inToken}-${outToken}-${amount}`
}

function isValidCache(timestamp: number): boolean {
  return Date.now() - timestamp < QUOTE_CACHE_DURATION
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Process quotes in batches
async function processBatch<T>(
  items: [string, DexInfo][],
  fn: (item: [string, DexInfo]) => Promise<T>
): Promise<T[]> {
  const results: T[] = []
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)
    if (i + BATCH_SIZE < items.length) {
      await sleep(RATE_LIMIT_DELAY)
    }
  }
  return results
}

// Calculate gas cost in output token
async function calculateGasCost(
  gasAmount: number,
  outputDecimals: number
): Promise<BigNumber> {
  const gasPrice = await provider.getGasPrice()
  const gasCostCRO = gasPrice.mul(gasAmount)
  const gasCostUSD = parseFloat(ethers.utils.formatEther(gasCostCRO)) * CRO_USD_PRICE

  console.log('Gas cost calculation:', {
    gasAmount,
    gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') + ' gwei',
    gasCostCRO: ethers.utils.formatEther(gasCostCRO) + ' CRO',
    gasCostUSD: `$${gasCostUSD.toFixed(4)}`
  })

  return ethers.utils.parseUnits(gasCostUSD.toFixed(outputDecimals), outputDecimals)
}

// Get quote from V3 DEX
async function getV3Quote(
  dex: DexInfo,
  inTokenAddress: string,
  outTokenAddress: string,
  inputAmount: string,
  inputDecimals: number,
  outputDecimals: number
): Promise<V3Quote> {
  const quoter = new ethers.Contract(dex.quoterAddress || dex.routerAddress, V3_QUOTER_ABI, provider)
  
  // Try different fee tiers
  const feeTiers = [100, 500, 3000, 10000]
  let bestOutput = BigNumber.from(0)
  let bestImpact = 100
  let bestFee = 3000 // Default fee tier

  for (const fee of feeTiers) {
    try {
      // Get quote for current fee tier
      const outAmount = await quoter.callStatic.quoteExactInputSingle(
        inTokenAddress,
        outTokenAddress,
        fee,
        inputAmount,
        0
      )

      // Calculate price impact
      const smallAmount = ethers.utils.parseUnits('1', inputDecimals)
      const spotQuote = await quoter.callStatic.quoteExactInputSingle(
        inTokenAddress,
        outTokenAddress,
        fee,
        smallAmount,
        0
      )

      const expectedOutput = BigNumber.from(inputAmount).mul(spotQuote).div(smallAmount)
      const impact = expectedOutput.sub(outAmount).mul(10000).div(expectedOutput).toNumber() / 100

      if (outAmount.gt(bestOutput)) {
        bestOutput = outAmount
        bestImpact = impact
        bestFee = fee
      }
    } catch (error) {
      // Skip failed fee tiers
      continue
    }
  }

  return {
    outAmount: bestOutput.toString(),
    priceImpact: bestImpact,
    fee: bestFee
  }
}

// Get quote from a single DEX with caching
async function getQuoteFromDex(
  dexKey: string,
  dex: DexInfo,
  inTokenAddress: string,
  outTokenAddress: string,
  inputAmount: string,
  inputDecimals: number,
  outputDecimals: number
): Promise<DexQuote | DexError> {
  const cacheKey = getCacheKey(dexKey, inTokenAddress, outTokenAddress, inputAmount)
  const cached = quoteCache.get(cacheKey)

  if (cached && isValidCache(cached.timestamp)) {
    return cached.quote
  }

  try {
    let outAmount: string
    let priceImpact: number
    let fee: number | undefined

    // Handle V3 DEXs differently
    if (dexKey === 'VVS_V3') {
      const quote = await getV3Quote(
        dex,
        inTokenAddress,
        outTokenAddress,
        inputAmount,
        inputDecimals,
        outputDecimals
      )
      outAmount = quote.outAmount
      priceImpact = quote.priceImpact
      fee = quote.fee
    } else {
      // V2 quote logic
      const router = new ethers.Contract(dex.routerAddress, ROUTER_ABI, provider)
      const amounts = await router.getAmountsOut(inputAmount, [inTokenAddress, outTokenAddress])
      outAmount = amounts[amounts.length - 1].toString()

      // Calculate V2 price impact
      const smallAmount = ethers.utils.parseUnits('1', inputDecimals)
      const smallQuote = await router.getAmountsOut(smallAmount, [inTokenAddress, outTokenAddress])
      const spotPrice = smallQuote[1]
      const expectedOutput = BigNumber.from(inputAmount).mul(spotPrice).div(smallAmount)
      priceImpact = expectedOutput.sub(BigNumber.from(outAmount))
        .mul(10000)
        .div(expectedOutput)
        .toNumber() / 100
    }

    // Skip if no output or price impact too high
    if (BigNumber.from(outAmount).eq(0) || priceImpact > 15) {
      return {
        dex: dex.name,
        error: {
          code: 'INSUFFICIENT_LIQUIDITY',
          message: 'Insufficient liquidity or price impact too high',
          data: { priceImpact }
        },
        routerAddress: dex.routerAddress,
      }
    }

    // Calculate gas cost
    const gasCost = await calculateGasCost(parseInt(dex.gasEstimate), outputDecimals)
    const effectiveOutput = BigNumber.from(outAmount).sub(gasCost)

    console.log(`Quote from ${dex.name}:`, {
      inputAmount: ethers.utils.formatUnits(inputAmount, inputDecimals),
      outputAmount: ethers.utils.formatUnits(outAmount, outputDecimals),
      gasCost: ethers.utils.formatUnits(gasCost, outputDecimals),
      effectiveOutput: ethers.utils.formatUnits(effectiveOutput, outputDecimals),
      priceImpact: `${priceImpact.toFixed(2)}%`,
      ...(fee && { fee: `${fee / 10000}%` })
    })

    const quote: DexQuote = {
      dex: dex.name,
      outAmount,
      routerAddress: dex.routerAddress,
      gasEstimate: dex.gasEstimate,
      priceImpact: priceImpact.toString(),
      effectiveOutput: effectiveOutput.toString(),
      path: [inTokenAddress, outTokenAddress]
    }

    quoteCache.set(cacheKey, { quote, timestamp: Date.now() })
    return quote
  } catch (error) {
    // Don't log errors for pairs that don't exist
    if (!error.message?.includes('execution reverted')) {
      console.error(`Error getting quote from ${dex.name}:`, error)
    }
    return {
      dex: dex.name,
      error: {
        code: 'QUOTE_FAILED',
        message: error.message || 'Failed to get quote',
        data: error
      },
      routerAddress: dex.routerAddress,
    }
  }
}

// Calculate split route output
async function calculateSplitRouteOutput(
  quotes: DexQuote[],
  percentages: number[],
  totalInput: BigNumber,
  outputDecimals: number
): Promise<{
  totalOutput: BigNumber
  effectiveOutput: BigNumber
  routes: SplitRoute[]
  totalPriceImpact: number
}> {
  let totalOutput = BigNumber.from(0)
  let totalEffectiveOutput = BigNumber.from(0)
  const routes: SplitRoute[] = []
  let weightedPriceImpact = 0

  for (let i = 0; i < percentages.length && i < quotes.length; i++) {
    const quote = quotes[i]
    const percentage = percentages[i]
    const inputAmount = totalInput.mul(percentage).div(100)
    
    // Calculate proportional output based on input percentage
    const quoteOutput = BigNumber.from(quote.outAmount)
    const outputAmount = quoteOutput.mul(percentage).div(100)
    const effectiveOutput = BigNumber.from(quote.effectiveOutput || quote.outAmount).mul(percentage).div(100)
    
    // Add weighted price impact
    weightedPriceImpact += (parseFloat(quote.priceImpact || '0') * percentage) / 100

    totalOutput = totalOutput.add(outputAmount)
    totalEffectiveOutput = totalEffectiveOutput.add(effectiveOutput)

    routes.push({
      percent: percentage,
      path: quote.path || [],
      dex: quote.dex,
      outAmount: outputAmount.toString()
    })
  }

  console.log('Split route calculation:', {
    routes: routes.map(r => ({
      dex: r.dex,
      percentage: r.percent,
      output: ethers.utils.formatUnits(r.outAmount, outputDecimals)
    })),
    totalOutput: ethers.utils.formatUnits(totalOutput, outputDecimals),
    effectiveOutput: ethers.utils.formatUnits(totalEffectiveOutput, outputDecimals),
    totalPriceImpact: `${weightedPriceImpact.toFixed(2)}%`
  })

  return {
    totalOutput,
    effectiveOutput: totalEffectiveOutput,
    routes,
    totalPriceImpact: weightedPriceImpact
  }
}

// Get quotes from all DEXs
export async function getDirectDexQuotes(
  chainId: number,
  currencyIn: Currency,
  currencyOut: Currency,
  amount: { raw: { toString: () => string } }
): Promise<DexQuote[]> {
  const quotes: DexQuote[] = []
  const inTokenAddress = getTokenAddressForDex(currencyIn)
  const outTokenAddress = getTokenAddressForDex(currencyOut)
  const inputAmount = amount.raw.toString()

  console.log('Getting quotes for:', {
    inputAmount: ethers.utils.formatUnits(inputAmount, currencyIn.decimals),
    inputToken: currencyIn.symbol,
    outputToken: currencyOut.symbol
  })

  // Get direct quotes from all DEXs
  const dexEntries = Object.entries(CRONOS_DEXES)
    .filter(([key]) => !['VVS_V3', 'FULCROM'].includes(key)) as [string, DexInfo][]

  const directResults = await processBatch(dexEntries, async ([dexKey, dex]) => {
    return getQuoteFromDex(
      dexKey,
      dex,
      inTokenAddress,
      outTokenAddress,
      inputAmount,
      currencyIn.decimals,
      currencyOut.decimals
    )
  })

  // Filter out errors and get valid quotes
  const validQuotes = directResults.filter((result): result is DexQuote => !('error' in result))

  if (validQuotes.length === 0) {
    return []
  }

  // Sort quotes by effective output (descending)
  validQuotes.sort((a, b) => {
    const aOutput = BigNumber.from(a.effectiveOutput || a.outAmount)
    const bOutput = BigNumber.from(b.effectiveOutput || b.outAmount)
    return bOutput.gt(aOutput) ? 1 : -1
  })

  // Try different split percentages
  const totalInput = BigNumber.from(inputAmount)
  let bestOutput = BigNumber.from(validQuotes[0].effectiveOutput || validQuotes[0].outAmount)
  let bestRoutes: SplitRoute[] = []
  let bestPriceImpact = parseFloat(validQuotes[0].priceImpact || '0')

  // Only try split routes if we have multiple DEXs with reasonable price impact
  const viableDexes = validQuotes.filter(q => {
    const impact = parseFloat(q.priceImpact || '100')
    return impact < 10 // Less than 10% impact
  })
  
  if (viableDexes.length > 1) {
    for (const percentages of SPLIT_PERCENTAGES) {
      if (percentages.length > viableDexes.length) continue

      const { effectiveOutput, routes, totalPriceImpact } = await calculateSplitRouteOutput(
        viableDexes,
        percentages,
        totalInput,
        currencyOut.decimals
      )

      // Only consider routes with reasonable price impact that are significantly better
      if (totalPriceImpact < 15 && // Max 15% total impact
          effectiveOutput.gt(bestOutput.mul(100 + Math.floor(MIN_OUTPUT_IMPROVEMENT * 100)).div(100))) {
        bestOutput = effectiveOutput
        bestRoutes = routes
        bestPriceImpact = totalPriceImpact

        // Add split route quote
        const splitQuote: DexQuote = {
          dex: `Split: ${routes.map(r => `${r.percent}% ${r.dex}`).join(' + ')}`,
          outAmount: effectiveOutput.toString(),
          routerAddress: routes[0].path[0], // Use first route's router
          gasEstimate: '0', // Gas estimate will be calculated later
          priceImpact: totalPriceImpact.toString(),
          effectiveOutput: effectiveOutput.toString(),
          splitRoutes: routes
        }

        // Insert split quote at the beginning if it's better
        quotes.unshift(splitQuote)
      }
    }
  }

  // Add direct quotes
  validQuotes.forEach(quote => quotes.push(quote))

  return quotes
}

// Create swap transaction
export async function createSwapTransaction(
  routerAddress: string,
  currencyIn: Currency,
  currencyOut: Currency,
  amount: string,
  minOutAmount: string,
  recipient: string,
  deadline: number,
  splitRoutes?: SplitRoute[],
  isV3?: boolean,
  feeTier?: number
): Promise<SwapTransaction> {
  try {
    const inTokenAddress = getTokenAddressForDex(currencyIn)
    const outTokenAddress = getTokenAddressForDex(currencyOut)
    let data: string
    let value = '0'

    // Handle split routes
    if (splitRoutes && splitRoutes.length > 1) {
      // TODO: Implement split routing contract
      console.warn('Split routing not yet implemented for transactions')
    }

    if (isV3) {
      const router = new ethers.Contract(routerAddress, V3_ROUTER_ABI)
      const params = {
        tokenIn: inTokenAddress,
        tokenOut: outTokenAddress,
        fee: feeTier || 3000,
        recipient,
        deadline,
        amountIn: amount,
        amountOutMinimum: minOutAmount,
        sqrtPriceLimitX96: 0
      }

      if (currencyIn.isNative) {
        data = router.interface.encodeFunctionData('exactInputSingle', [params])
        value = amount
      } else {
        data = router.interface.encodeFunctionData('exactInputSingle', [params])
      }
    } else {
      const router = new ethers.Contract(routerAddress, ROUTER_ABI)
      const path = [inTokenAddress, outTokenAddress]

      if (currencyIn.isNative) {
        data = router.interface.encodeFunctionData('swapExactETHForTokens', [
          minOutAmount,
          path,
          recipient,
          deadline
        ])
        value = amount
      } else if (currencyOut.isNative) {
        data = router.interface.encodeFunctionData('swapExactTokensForETH', [
          amount,
          minOutAmount,
          path,
          recipient,
          deadline
        ])
      } else {
        data = router.interface.encodeFunctionData('swapExactTokensForTokens', [
          amount,
          minOutAmount,
          path,
          recipient,
          deadline
        ])
      }
    }

    return { data, value, to: routerAddress }
  } catch (error) {
    console.error('Error creating swap transaction:', error)
    throw error
  }
}
