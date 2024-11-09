import { useEffect, useMemo, useState } from 'react'
import { Currency, CurrencyAmount, NATIVE_TOKEN, Token } from '../types/currency'
import { getTokenBalances, getTokenList, TokenInfo } from '../services/openocean'
import { useActiveWeb3React } from '../hooks'

function createToken(tokenInfo: TokenInfo): Token {
  return {
    isToken: true,
    isNative: false,
    chainId: tokenInfo.chainId || 25, // Default to Cronos if chainId is not provided
    decimals: tokenInfo.decimals,
    symbol: tokenInfo.symbol,
    name: tokenInfo.name,
    address: tokenInfo.address,
    logoURI: tokenInfo.logoURI,
    equals: function(other: Currency): boolean {
      return !other.isNative && other.getAddress().toLowerCase() === this.address.toLowerCase()
    },
    sortsBefore: function(other: Token): boolean {
      return this.address.toLowerCase() < other.address.toLowerCase()
    },
    wrapped: {} as Token,
    getAddress: function(): string {
      return this.address
    }
  }
}

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
        console.log('Fetched tokens:', tokens)
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
        console.log('Fetched balances:', balances)
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
    const nativeToken = {
      ...NATIVE_TOKEN,
      balance: balances[NATIVE_TOKEN.getAddress()] 
        ? CurrencyAmount.fromRaw(NATIVE_TOKEN, balances[NATIVE_TOKEN.getAddress()])
        : undefined
    }

    const tokenObjects = tokenList.map(tokenInfo => {
      const token = createToken(tokenInfo)
      const balance = balances[token.address.toLowerCase()]
      if (balance) {
        return {
          ...token,
          balance: CurrencyAmount.fromRaw(token, balance)
        }
      }
      return token
    })

    // Sort tokens: Native token first, then by symbol
    return [
      nativeToken,
      ...tokenObjects.sort((a, b) => {
        if (!a.symbol || !b.symbol) return 0
        return a.symbol.localeCompare(b.symbol)
      })
    ]
  }, [tokenList, balances])

  const getBalance = (currency: Currency | undefined) => {
    if (!currency) return undefined
    if (currency.isNative) {
      return balances[currency.getAddress()] 
        ? CurrencyAmount.fromRaw(currency, balances[currency.getAddress()])
        : undefined
    }
    const balance = balances[currency.getAddress().toLowerCase()]
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
