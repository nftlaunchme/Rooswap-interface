import { useEffect, useMemo, useState } from 'react'
import { Currency, CurrencyAmount, NATIVE_TOKEN, Token } from '../types/currency'
import { getTokenBalances, getTokenList, TokenInfo, createToken } from '../services/tokens'
import { useActiveWeb3React } from '../hooks'

export function useTokens() {
  const { chainId, account } = useActiveWeb3React()
  const [tokenList, setTokenList] = useState<TokenInfo[]>([])
  const [balances, setBalances] = useState<{ [address: string]: string }>({})
  const [loading, setLoading] = useState(true)

  // Fetch token list
  useEffect(() => {
    if (!chainId) return

    const fetchTokens = async () => {
      setLoading(true)
      try {
        const tokens = await getTokenList(chainId)
        setTokenList(tokens)
      } catch (error) {
        console.error('Failed to fetch tokens:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [chainId])

  // Fetch balances
  useEffect(() => {
    if (!chainId || !account || tokenList.length === 0) return

    const fetchBalances = async () => {
      try {
        const tokenAddresses = tokenList.map(token => token.address)
        const balances = await getTokenBalances(chainId, account, tokenAddresses)
        setBalances(balances)
      } catch (error) {
        console.error('Failed to fetch balances:', error)
      }
    }

    fetchBalances()
    // Refresh balances every 10 seconds
    const interval = setInterval(fetchBalances, 10000)
    return () => clearInterval(interval)
  }, [chainId, account, tokenList])

  const tokens = useMemo(() => {
    return [
      NATIVE_TOKEN,
      ...tokenList.map(tokenInfo => {
        const token = createToken(tokenInfo)
        const balance = balances[token.address]
        if (balance) {
          token.balance = CurrencyAmount.fromRaw(token, balance)
        }
        return token
      })
    ]
  }, [tokenList, balances])

  const getBalance = (currency: Currency | undefined) => {
    if (!currency) return undefined
    if (currency.isNative) {
      // Native token balance would be handled separately
      return undefined
    }
    const balance = balances[currency.getAddress()]
    if (!balance) return undefined
    return CurrencyAmount.fromRaw(currency, balance)
  }

  return {
    tokens,
    loading,
    getBalance,
  }
}

export function useTokenBalance(currency: Currency | undefined) {
  const { getBalance } = useTokens()
  return useMemo(() => getBalance(currency), [currency, getBalance])
}
