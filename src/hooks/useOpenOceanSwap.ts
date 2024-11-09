import { useCallback, useEffect, useState } from 'react'
import { Currency, CurrencyAmount } from '../types/currency'
import { OpenOceanQuote } from '../types/openocean'
import { getOpenOceanQuote, getOpenOceanSwapData } from '../services/openocean'
import { useActiveWeb3React } from '../hooks'

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
  const [error, setError] = useState<string>()

  const swap = useCallback(async () => {
    if (!chainId || !account || !currencyIn || !currencyOut || !parsedAmount) {
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

      // Here you would typically send the transaction using web3
      console.log('Swap data:', swapData)
      
      return swapData
    } catch (error) {
      console.error('Swap error:', error)
      setError(error.message || 'Failed to swap')
      throw error
    }
  }, [chainId, account, currencyIn, currencyOut, parsedAmount, slippage, recipient])

  return {
    swap,
    error,
  }
}
