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

// Get quotes from all DEXs
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

  // Get quotes from each DEX in parallel
  const quotePromises = Object.entries(CRONOS_DEXES).map(async ([dexKey, dex]) => {
    try {
      const router = new ethers.Contract(dex.routerAddress, ROUTER_ABI, provider)
      const amounts = await router.getAmountsOut(inputAmount, path)
      const outAmount = amounts[amounts.length - 1].toString()

      console.log(`Got quote from ${dex.name}:`, {
        dex: dex.name,
        formattedInput: ethers.utils.formatUnits(inputAmount, currencyIn.decimals),
        formattedOutput: ethers.utils.formatUnits(outAmount, currencyOut.decimals),
      })

      return {
        dex: dex.name,
        outAmount,
        routerAddress: dex.routerAddress,
        gasEstimate: dex.gasEstimate,
      }
    } catch (error) {
      console.error(`Failed to get quote from ${dex.name}:`, error)
      return null
    }
  })

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
    formattedOutput: ethers.utils.formatUnits(q.outAmount, currencyOut.decimals),
  })))

  return quotes
}

// Create direct swap transaction
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
      formattedInput: ethers.utils.formatUnits(amount, currencyIn.decimals),
      formattedMinOutput: ethers.utils.formatUnits(minOutAmount, currencyOut.decimals),
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

    return { data, value }
  } catch (error) {
    console.error('Error creating swap transaction:', error)
    throw error
  }
}
