import { Currency as KyberCurrency, NativeCurrency as KyberNativeCurrency, Token as KyberToken } from '@kyberswap/ks-sdk-core'
import { Currency, NativeCurrency, Token } from '../types/currency'

export function convertToKyberCurrency(currency: Currency | null | undefined): KyberCurrency | undefined {
  if (!currency) return undefined

  if (currency.isNative) {
    // For native currency, we'll use a KyberToken with the native token address
    // since KyberSwap's NativeCurrency is abstract and can't be instantiated directly
    return new KyberToken(
      currency.chainId,
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      currency.decimals,
      currency.symbol,
      currency.name
    )
  } else {
    // Convert to KyberSwap's Token
    const token = currency as Token
    return new KyberToken(
      token.chainId,
      token.address,
      token.decimals,
      token.symbol,
      token.name
    )
  }
}

export function convertFromKyberCurrency(currency: KyberCurrency | null | undefined): Currency | undefined {
  if (!currency) return undefined

  if (currency.isNative || currency.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
    return {
      isNative: true,
      isToken: false,
      chainId: currency.chainId,
      decimals: currency.decimals,
      symbol: currency.symbol,
      name: currency.name,
      equals: (other: Currency) => other.isNative && other.chainId === currency.chainId,
      wrapped: {} as Token, // This should be set properly in your app
      getAddress: () => '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    } as NativeCurrency
  } else {
    const token = currency as KyberToken
    return {
      isToken: true,
      isNative: false,
      chainId: token.chainId,
      decimals: token.decimals,
      symbol: token.symbol,
      name: token.name,
      address: token.address,
      equals: (other: Currency) => !other.isNative && other.getAddress().toLowerCase() === token.address.toLowerCase(),
      sortsBefore: (other: Token) => token.address.toLowerCase() < other.address.toLowerCase(),
      wrapped: {} as Token, // This should be set properly in your app
      getAddress: () => token.address
    } as Token
  }
}
