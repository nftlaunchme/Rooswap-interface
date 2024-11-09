import { useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Currency, CurrencyAmount } from '../types/currency'
import { OpenOceanQuote } from '../types/openocean'
import { getOpenOceanQuote, getOpenOceanSwapData } from '../services/openocean'
import { useActiveWeb3React } from '../hooks'
import { useEthersProvider } from './useEthersProvider'

const ERC20_ABI = [
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
]

async function checkAndApproveToken(
  tokenAddress: string,
  owner: string,
  spender: string,
  amount: string,
  signer: ethers.Signer
): Promise<boolean> {
  try {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
    const allowance = await token.allowance(owner, spender)

    if (allowance.lt(amount)) {
      console.log('Approving token:', {
        token: tokenAddress,
        owner,
        spender,
        amount,
      })

      // Approve max uint256
      const maxUint256 = ethers.constants.MaxUint256
      const tx = await token.approve(spender, maxUint256, {
        gasLimit: 100000 // Fixed gas limit for approvals
      })
      await tx.wait()
      
      console.log('Token approved:', tx.hash)
      return true
    }

    return true
  } catch (error) {
    console.error('Token approval error:', error)
    throw new Error('Failed to approve token')
  }
}

export function useOpenOceanQuote(
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  slippage: number,
) {
  const { chainId } = useActiveWeb3React()
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<OpenOceanQuote>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let stale = false

    async function fetchQuote() {
      if (!chainId || !currencyIn || !currencyOut || !parsedAmount) {
        setQuote(undefined)
        return
      }

      try {
        setLoading(true)
        setError(undefined)
        const quote = await getOpenOceanQuote(chainId, currencyIn, currencyOut, parsedAmount, slippage)
        
        if (!stale) {
          console.log('OpenOcean quote:', {
            ...quote,
            formattedInAmount: ethers.utils.formatUnits(quote.inAmount, currencyIn.decimals),
            formattedOutAmount: ethers.utils.formatUnits(quote.outAmount, currencyOut.decimals),
          })
          setQuote(quote)
        }
      } catch (error) {
        console.error('Quote error:', error)
        if (!stale) {
          setError(error.message || 'Failed to get quote')
          setQuote(undefined)
        }
      } finally {
        if (!stale) {
          setLoading(false)
        }
      }
    }

    fetchQuote()

    // Refresh quote every 10 seconds
    const interval = setInterval(fetchQuote, 10000)

    return () => {
      stale = true
      clearInterval(interval)
    }
  }, [chainId, currencyIn, currencyOut, parsedAmount, slippage])

  return {
    loading,
    quote,
    error,
  }
}

export function useOpenOceanSwapCallback(
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  slippage: number,
  recipient: string | null,
) {
  const { chainId, account } = useActiveWeb3React()
  const provider = useEthersProvider({ chainId })
  const [error, setError] = useState<string>()

  const swap = useCallback(async () => {
    if (!chainId || !account || !currencyIn || !currencyOut || !parsedAmount || !provider) {
      console.error('Missing dependencies:', {
        chainId,
        account,
        currencyIn: currencyIn?.symbol,
        currencyOut: currencyOut?.symbol,
        parsedAmount: parsedAmount?.toExact(),
        provider: !!provider,
      })
      throw new Error('Missing dependencies')
    }

    try {
      setError(undefined)
      const swapData = await getOpenOceanSwapData(
        chainId,
        currencyIn,
        currencyOut,
        parsedAmount,
        slippage,
        account,
        recipient,
      )

      // Log the swap data for debugging
      console.log('Sending transaction:', {
        from: account,
        to: swapData.to,
        value: swapData.value,
        gasPrice: swapData.gasPrice,
        data: swapData.data.slice(0, 66) + '...', // Log first 66 chars of data
        formattedAmount: ethers.utils.formatUnits(parsedAmount.raw.toString(), currencyIn.decimals),
      })

      const signer = provider.getSigner(account)

      // Check and approve token if needed
      if (!currencyIn.isNative) {
        await checkAndApproveToken(
          currencyIn.wrapped.address,
          account,
          swapData.to,
          parsedAmount.raw.toString(),
          signer
        )
      }

      // Prepare transaction parameters
      const txParams: any = {
        from: account,
        to: swapData.to,
        data: swapData.data,
        gasPrice: ethers.BigNumber.from(swapData.gasPrice),
      }

      // Add value for native token swaps
      if (currencyIn.isNative) {
        txParams.value = ethers.BigNumber.from(swapData.value)
      }

      // Estimate gas with a try-catch to get more detailed error info
      let gasEstimate
      try {
        gasEstimate = await signer.estimateGas(txParams)
        console.log('Gas estimate:', gasEstimate.toString())
      } catch (error: any) {
        console.error('Gas estimation failed:', {
          error,
          code: error.code,
          message: error.message,
          data: error.data,
          txParams,
        })

        // Check for specific error cases
        if (error.data?.message?.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
          throw new Error('Price impact too high or insufficient liquidity')
        }
        if (error.data?.message?.includes('TRANSFER_FROM_FAILED')) {
          throw new Error('Insufficient token balance')
        }
        if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
          throw new Error('Transaction would fail: Insufficient liquidity or high price impact')
        }

        throw error
      }

      // Add gas limit with 20% buffer
      txParams.gasLimit = gasEstimate.mul(120).div(100)

      // Send transaction
      const tx = await signer.sendTransaction(txParams)
      console.log('Transaction sent:', tx.hash)
      
      // Wait for transaction to be mined
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)

      return receipt
    } catch (error: any) {
      console.error('Swap error:', error)
      let errorMessage = 'Transaction failed'

      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for gas'
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Transaction would fail: Insufficient liquidity or high price impact'
      } else if (error.code === -32603) {
        if (error.data?.message?.includes('TRANSFER_FROM_FAILED')) {
          errorMessage = 'Insufficient token balance'
        } else if (error.data?.message?.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
          errorMessage = 'Price impact too high. Try a smaller amount or increase slippage tolerance.'
        } else {
          errorMessage = 'Transaction reverted. The swap may fail due to price impact or low liquidity.'
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      throw error
    }
  }, [chainId, account, provider, currencyIn, currencyOut, parsedAmount, slippage, recipient])

  return {
    swap,
    error,
  }
}
