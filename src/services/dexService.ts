import { Currency, CurrencyAmount } from '../types/currency'
import { ethers } from 'ethers'
import { CRONOS_DEXES } from '../constants/dex'
import { DexQuote } from '../types/openocean'

const ROUTER_ABI = [
  // Read functions
  'function WETH() external pure returns (address)',
  'function factory() external pure returns (address)',
  'function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) public pure returns (uint amountIn)',
  'function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) public pure returns (uint amountOut)',
  'function getAmountsIn(uint amountOut, address[] memory path) public view returns (uint[] memory amounts)',
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  'function quote(uint amountA, uint reserveA, uint reserveB) public pure returns (uint amountB)',
  
  // Write functions
  'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)',
  'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)',
  'function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)',
  'function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)',
  'function removeLiquidityETHSupportingFeeOnTransferTokens(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountETH)',
  'function removeLiquidityETHWithPermit(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) external returns (uint amountToken, uint amountETH)',
  'function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) external returns (uint amountETH)',
  'function removeLiquidityWithPermit(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) external returns (uint amountA, uint amountB)',
  'function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external',
  'function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
]

const WCRO_ADDRESS = '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23'

function getTokenAddressForDex(currency: Currency): string {
  if (currency.isNative) {
    return WCRO_ADDRESS // Use WCRO address for DEX router calls
  }
  return currency.wrapped.address
}

function getTokenAddressForOpenOcean(currency: Currency): string {
  if (currency.isNative) {
    return '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
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
  const amountIn = amount.raw.toString()
  
  const path = [inTokenAddress, outTokenAddress]

  console.log('Getting direct DEX quotes for:', {
    chainId,
    inToken: {
      symbol: currencyIn.symbol,
      address: inTokenAddress,
      isNative: currencyIn.isNative,
    },
    outToken: {
      symbol: currencyOut.symbol,
      address: outTokenAddress,
      isNative: currencyOut.isNative,
    },
    amountIn,
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
      
      let amounts: ethers.BigNumber[]
      
      try {
        // First try regular getAmountsOut
        const quotePromise = router.getAmountsOut(amountIn, path)
        amounts = await Promise.race([quotePromise, timeoutPromise]) as ethers.BigNumber[]
      } catch (error) {
        console.log(`Regular getAmountsOut failed for ${dex.name}, trying with fee on transfer support`)
        
        // If regular call fails, try getting amounts manually using getAmountOut
        const reserves = await router.getReserves(inTokenAddress, outTokenAddress)
        const amountOut = await router.getAmountOut(amountIn, reserves[0], reserves[1])
        amounts = [ethers.BigNumber.from(amountIn), amountOut]
      }
      
      const quote = {
        dex: dex.name,
        outAmount: amounts[amounts.length - 1].toString(),
        routerAddress: dex.routerAddress,
        gasEstimate: dex.gasEstimate,
      }

      console.log(`Got quote from ${dex.name}:`, {
        ...quote,
        dexKey,
        path,
        amounts: amounts.map(a => a.toString()),
      })

      return quote
    } catch (error) {
      // Log detailed error information
      console.error(`Failed to get quote from ${dex.name}:`, {
        error: error.message,
        code: error.code,
        data: error.data,
        router: dex.routerAddress,
        path,
        amountIn,
        dexKey,
      })
      return null
    }
  })

  try {
    const results = await Promise.all(quotePromises)
    
    // Filter out null results and add valid quotes
    results.forEach(quote => {
      if (quote) {
        quotes.push(quote)
      }
    })

    console.log('All direct DEX quotes:', quotes.map(q => ({
      dex: q.dex,
      outAmount: q.outAmount,
      gasEstimate: q.gasEstimate,
    })))
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
      amount,
      minOutAmount,
      recipient,
      deadline,
      isNativeIn: currencyIn.isNative,
      isNativeOut: currencyOut.isNative,
    })

    let data: string
    let value = '0'

    if (currencyIn.isNative) {
      // Try fee-supporting function first for better compatibility
      try {
        data = router.interface.encodeFunctionData('swapExactETHForTokensSupportingFeeOnTransferTokens', [
          minOutAmount,
          path,
          recipient,
          deadline
        ])
      } catch {
        data = router.interface.encodeFunctionData('swapExactETHForTokens', [
          minOutAmount,
          path,
          recipient,
          deadline
        ])
      }
      value = amount
    } else if (currencyOut.isNative) {
      try {
        data = router.interface.encodeFunctionData('swapExactTokensForETHSupportingFeeOnTransferTokens', [
          amount,
          minOutAmount,
          path,
          recipient,
          deadline
        ])
      } catch {
        data = router.interface.encodeFunctionData('swapExactTokensForETH', [
          amount,
          minOutAmount,
          path,
          recipient,
          deadline
        ])
      }
    } else {
      try {
        data = router.interface.encodeFunctionData('swapExactTokensForTokensSupportingFeeOnTransferTokens', [
          amount,
          minOutAmount,
          path,
          recipient,
          deadline
        ])
      } catch {
        data = router.interface.encodeFunctionData('swapExactTokensForTokens', [
          amount,
          minOutAmount,
          path,
          recipient,
          deadline
        ])
      }
    }

    console.log('Created swap transaction:', {
      data: data.slice(0, 66) + '...', // Log first 66 chars of data
      value,
    })

    return { data, value }
  } catch (error) {
    console.error('Error creating swap transaction:', {
      error: error.message,
      code: error.code,
      data: error.data,
      router: routerAddress,
      currencyIn: currencyIn.symbol,
      currencyOut: currencyOut.symbol,
    })
    throw error
  }
}
