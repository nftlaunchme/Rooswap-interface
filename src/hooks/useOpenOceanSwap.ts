import { useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Currency, CurrencyAmount } from '../types/currency'
import { OpenOceanQuote } from '../types/openocean'
import { getOpenOceanQuote, getOpenOceanSwapData } from '../services/openocean'
import { useActiveWeb3React } from '../hooks'
import { useEthersProvider } from './useEthersProvider'

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
          console.log('OpenOcean quote:', quote)
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
        data: swapData.data.slice(0, 66) + '...' // Log first 66 chars of data
      })

      // Send the transaction
      const signer = provider.getSigner(account)

      // Estimate gas first
      const gasEstimate = await signer.estimateGas({
        from: account,
        to: swapData.to,
        data: swapData.data,
        value: ethers.BigNumber.from(swapData.value),
      })

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate.mul(120).div(100)

      // Send transaction with estimated gas limit
      const tx = await signer.sendTransaction({
        from: account,
        to: swapData.to,
        data: swapData.data,
        value: ethers.BigNumber.from(swapData.value),
        gasPrice: ethers.BigNumber.from(swapData.gasPrice),
        gasLimit,
      })

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
        errorMessage = 'Unable to estimate gas'
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [chainId, account, provider, currencyIn, currencyOut, parsedAmount, slippage, recipient])

  return {
    swap,
    error,
  }
}
