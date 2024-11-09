import { Currency, CurrencyAmount } from '../types/currency'
import { ethers } from 'ethers'
import { CRONOS_DEXES } from '../constants/dex'
import { DexQuote } from '../types/openocean'

// Uniswap V2 Router ABI (used by all Uniswap forks)
const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
]

const WCRO_ADDRESS = '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23'

function getTokenAddressForDex(currency: Currency): string {
  if (currency.isNative) {
    return WCRO_ADDRESS // Use WCRO address for DEX router calls
  }
  return currency.wrapped.address
}

export async function getDirectDexQuotes(
  chainId: number,
  currencyIn: Currency,
  currencyOut: Currency,
  amount: CurrencyAmount<Currency>,
): Promise<DexQuote[]> {
  const quotes: DexQuote[] = []
  const provider = new ethers.providers.JsonRpcProvider('https://evm.cronos.org')
  const inTokenAddress = getTokenAddressForDex(currencyIn)
  const outTokenAddress = getTokenAddressForDex(currencyOut)
  const inputAmount = amount.raw.toString()
  
  const path = [inTokenAddress, outTokenAddress]

  console.log('Getting direct DEX quotes for:', {
    chainId,
    inToken: {
      symbol: currencyIn.symbol,
      address: inTokenAddress,
      isNative: currencyIn.isNative,
      decimals: currencyIn.decimals,
      amount: ethers.utils.formatUnits(inputAmount, currencyIn.decimals),
    },
    outToken: {
      symbol: currencyOut.symbol,
      address: outTokenAddress,
      isNative: currencyOut.isNative,
      decimals: currencyOut.decimals,
    },
  })

  // Get quotes from each DEX in parallel
  const quotePromises = Object.entries(CRONOS_DEXES).map(async ([dexKey, dex]) => {
    try {
      console.log(`Getting quote from ${dex.name} (${dex.routerAddress})`)
      
      const router = new ethers.Contract(dex.routerAddress, ROUTER_ABI, provider)
      
      // Add a timeout to the quote request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Quote request timeout for ${dex.name}`)), 5000)
      })
      
      const quotePromise = router.getAmountsOut(inputAmount, path)
      const amounts = await Promise.race([quotePromise, timeoutPromise]) as ethers.BigNumber[]
      
      // Get output amount
      const outAmount = amounts[amounts.length - 1].toString()

      const quote = {
        dex: dex.name,
        outAmount,
        routerAddress: dex.routerAddress,
        gasEstimate: dex.gasEstimate,
      }

      console.log(`Got quote from ${dex.name}:`, {
        ...quote,
        formattedOutAmount: ethers.utils.formatUnits(outAmount, currencyOut.decimals),
      })

      return quote
    } catch (error) {
      console.error(`Failed to get quote from ${dex.name}:`, error)
      return null
    }
  })

  try {
    const results = await Promise.all(quotePromises)
    
    // Filter out null results and add valid quotes
    results.forEach(quote => {
      if (quote && ethers.BigNumber.from(quote.outAmount).gt(0)) {
        quotes.push(quote)
      }
    })

    // Sort quotes by output amount (descending)
    quotes.sort((a, b) => {
      const aAmount = ethers.BigNumber.from(a.outAmount)
      const bAmount = ethers.BigNumber.from(b.outAmount)
      if (bAmount.gt(aAmount)) return 1
      if (bAmount.lt(aAmount)) return -1
      // If output amounts are equal, prefer the one with lower gas
      const aGas = ethers.BigNumber.from(a.gasEstimate)
      const bGas = ethers.BigNumber.from(b.gasEstimate)
      return aGas.lt(bGas) ? -1 : 1
    })

    console.log('All direct DEX quotes:', quotes.map(q => ({
      dex: q.dex,
      formattedOutAmount: ethers.utils.formatUnits(q.outAmount, currencyOut.decimals),
      gasEstimate: q.gasEstimate,
    })))

    return quotes
  } catch (error) {
    console.error('Error getting direct DEX quotes:', error)
  }

  return quotes
}

export async function createSwapTransaction(
  routerAddress: string,
  currencyIn: Currency,
  currencyOut: Currency,
  amount: string,
  minOutAmount: string,
  recipient: string,
  deadline: number
): Promise<{ data: string; value: string }> {
  try {
    const router = new ethers.Contract(routerAddress, ROUTER_ABI)
    const path = [getTokenAddressForDex(currencyIn), getTokenAddressForDex(currencyOut)]

    console.log('Creating swap transaction:', {
      router: routerAddress,
      path,
      formattedAmount: ethers.utils.formatUnits(amount, currencyIn.decimals),
      formattedMinOutAmount: ethers.utils.formatUnits(minOutAmount, currencyOut.decimals),
      recipient,
      deadline,
      isNativeIn: currencyIn.isNative,
      isNativeOut: currencyOut.isNative,
    })

    let data: string
    let value = '0'

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

    console.log('Created swap transaction:', {
      data: data.slice(0, 66) + '...', // Log first 66 chars of data
      value,
    })

    return { data, value }
  } catch (error) {
    console.error('Error creating swap transaction:', error)
    throw error
  }
}
