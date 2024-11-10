import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Currency } from '../../types/currency'
import Modal from '../Modal'
import { Text } from 'rebass'
import CurrencyLogo from '../CurrencyLogo'
import { useActiveWeb3React } from '../../hooks'
import { getTokenBalances } from '../../services/openocean'
import { DEFAULT_OUTPUT_TOKEN_BY_CHAIN, NativeCurrencies } from '../../constants/tokens'
import { convertFromKyberCurrency } from '../../utils/currencyConverter'

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 16px;
`

const TokenRow = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  background-color: ${({ selected, theme }) => selected ? theme.bg3 : 'transparent'};
  
  :hover {
    background-color: ${({ theme }) => theme.bg2};
  }
`

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
`

const TokenBalance = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
`

interface TokenSelectorProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
  otherCurrency?: Currency | null
}

export default function TokenSelector({
  isOpen,
  onDismiss,
  selectedCurrency,
  onSelect,
  otherCurrency
}: TokenSelectorProps) {
  const { account, chainId } = useActiveWeb3React()
  const [balances, setBalances] = useState<{[address: string]: string}>({})

  // Fetch token balances
  const fetchBalances = useCallback(async () => {
    if (!account || !chainId) return
    
    try {
      const tokenAddresses = tokens.map(token => token.getAddress())
      const balances = await getTokenBalances(chainId, account, tokenAddresses)
      setBalances(balances)
    } catch (error) {
      console.error('Failed to fetch balances:', error)
    }
  }, [account, chainId, tokens])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  // Common tokens list
  const tokens = useMemo(() => {
    if (!chainId) return []

    const defaultTokens: Currency[] = [
      convertFromKyberCurrency(NativeCurrencies[chainId])!, // Native token
    ]

    // Add default output token for the chain if it exists
    const defaultOutputToken = DEFAULT_OUTPUT_TOKEN_BY_CHAIN[chainId]
    if (defaultOutputToken) {
      defaultTokens.push(convertFromKyberCurrency(defaultOutputToken)!)
    }

    // Sort by balance
    return defaultTokens.sort((a, b) => {
      const balanceA = balances[a.getAddress().toLowerCase()] || '0'
      const balanceB = balances[b.getAddress().toLowerCase()] || '0'
      return parseFloat(balanceB) - parseFloat(balanceA)
    })
  }, [chainId, balances])

  const handleSelect = useCallback((currency: Currency) => {
    onSelect(currency)
    onDismiss()
  }, [onSelect, onDismiss])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={60}>
      <TokenList>
        {tokens.map((token) => {
          const isSelected = selectedCurrency?.equals(token) ?? false
          const balance = balances[token.getAddress().toLowerCase()]

          return (
            <TokenRow
              key={token.getAddress()}
              selected={isSelected}
              onClick={() => handleSelect(token)}
            >
              <CurrencyLogo currency={token} size="24px" />
              <TokenInfo>
                <Text fontWeight={500}>{token.symbol}</Text>
                <TokenBalance>
                  {balance ? parseFloat(balance).toFixed(6) : '0.00'}
                </TokenBalance>
              </TokenInfo>
            </TokenRow>
          )
        })}
      </TokenList>
    </Modal>
  )
}
