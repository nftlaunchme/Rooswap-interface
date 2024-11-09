import { useCallback, useEffect, useState } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useWalletClient, usePublicClient } from 'wagmi'
import { Address } from 'viem'
import { Currency, CurrencyAmount } from '../types/currency'
import { OpenOceanQuote, OpenOceanSwapResult } from '../types/openocean'
import { getOpenOceanQuote, getOpenOceanSwapData } from '../services/openocean'

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export function useOpenOceanQuote(
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  slippage: number,
) {
  const { chainId } = useActiveWeb3React()
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<OpenOceanQuote | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuote = async () => {
      if (!currencyIn || !currencyOut || !parsedAmount || !chainId) {
        setQuote(null)
        setError(null)
        return
      }

      setLoading(true)
      try {
        const quoteData = await getOpenOceanQuote(
          chainId,
          currencyIn,
          currencyOut,
          parsedAmount,
          slippage,
        )
        setQuote(quoteData)
        setError(null)
      } catch (err) {
        console.error('Quote error:', err)
        setQuote(null)
        setError(err.message || 'Failed to get quote')
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [currencyIn, currencyOut, parsedAmount, chainId, slippage])

  return { loading, quote, error }
}

export function useOpenOceanSwapCallback(
  currencyIn: Currency | undefined,
  currencyOut: Currency | undefined,
  parsedAmount: CurrencyAmount<Currency> | undefined,
  slippage: number,
  recipient: string | null,
) {
  const { account, chainId } = useActiveWeb3React()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [error, setError] = useState<string | null>(null)

  const checkAndApproveToken = useCallback(
    async (tokenAddress: string, spender: string, amount: string) => {
      if (!walletClient || !account) throw new Error('No wallet client or account')

      const allowance = await publicClient.readContract({
        address: tokenAddress as Address,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account as Address, spender as Address],
      }) as bigint

      if (allowance < BigInt(amount)) {
        const hash = await walletClient.writeContract({
          address: tokenAddress as Address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [spender as Address, BigInt(amount)],
        })
        await publicClient.waitForTransactionReceipt({ hash })
      }
    },
    [walletClient, publicClient, account],
  )

  const swap = useCallback(async () => {
    if (!currencyIn || !currencyOut || !parsedAmount || !chainId || !account || !walletClient) {
      throw new Error('Missing dependencies')
    }

    try {
      const swapData = await getOpenOceanSwapData(
        chainId,
        currencyIn,
        currencyOut,
        parsedAmount,
        slippage,
        account,
        recipient,
      )

      // Check and approve if needed for token input
      if (!currencyIn.isNative) {
        await checkAndApproveToken(
          currencyIn.getAddress(),
          swapData.to,
          parsedAmount.raw,
        )
      }

      // Execute swap
      const hash = await walletClient.sendTransaction({
        to: swapData.to as Address,
        data: swapData.data as `0x${string}`,
        value: currencyIn.isNative ? BigInt(swapData.value) : 0n,
      })

      await publicClient.waitForTransactionReceipt({ hash })
      return hash

    } catch (err) {
      console.error('Swap error:', err)
      throw new Error(err.message || 'Failed to execute swap')
    }
  }, [currencyIn, currencyOut, parsedAmount, chainId, account, walletClient, publicClient, slippage, recipient, checkAndApproveToken])

  return { swap, error }
}
