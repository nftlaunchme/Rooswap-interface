import { Currency, Token } from '../types/currency'

const OPENOCEAN_API_URL = 'https://open-api.openocean.finance/v3'

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  balance?: string
}

export async function getTokenList(chainId: number): Promise<TokenInfo[]> {
  try {
    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/tokenList`)
    const data = await response.json()

    if (!data.data) {
      throw new Error('Failed to get token list')
    }

    return data.data
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
      tokens: tokens.join(','),
    })

    const response = await fetch(`${OPENOCEAN_API_URL}/${chainId}/tokenBalance?${params}`)
    const data = await response.json()

    if (!data.data) {
      throw new Error('Failed to get token balances')
    }

    return data.data
  } catch (error) {
    console.error('Failed to fetch token balances:', error)
    return {}
  }
}

export function createToken(tokenInfo: TokenInfo): Token {
  return {
    isToken: true,
    isNative: false,
    chainId: tokenInfo.chainId,
    address: tokenInfo.address,
    decimals: tokenInfo.decimals,
    symbol: tokenInfo.symbol,
    name: tokenInfo.name,
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
