import { rgba } from 'polished'
import React, { useCallback, useEffect, useState } from 'react'
import { Search } from 'react-feather'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { Currency, Token, NATIVE_TOKEN } from '../../../types/currency'
import useTheme from 'hooks/useTheme'

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => rgba(theme.black, 0.7)};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`

const ModalContent = styled.div`
  background: ${({ theme }) => theme.background};
  border-radius: 20px;
  width: 90%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  background: ${({ theme }) => rgba(theme.buttonBlack, 0.4)};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  outline: none;
  margin-bottom: 16px;

  ::placeholder {
    color: ${({ theme }) => theme.subText};
  }
`

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TokenItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  :hover {
    background: ${({ theme }) => rgba(theme.buttonBlack, 0.4)};
  }
`

const commonTokens: Currency[] = [
  NATIVE_TOKEN,
  {
    isToken: true,
    isNative: false,
    chainId: 25,
    address: '0x66e428c3f67a68878562e79A0234c1F83c208770',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD Coin',
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
  } as Token,
  {
    isToken: true,
    isNative: false,
    chainId: 25,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
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
  } as Token,
]

interface Props {
  isOpen: boolean
  onDismiss: () => void
  onSelect: (currency: Currency) => void
  selectedCurrency?: Currency
  otherCurrency?: Currency
}

const TokenSelector: React.FC<Props> = ({
  isOpen,
  onDismiss,
  onSelect,
  selectedCurrency,
  otherCurrency,
}) => {
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTokens, setFilteredTokens] = useState<Currency[]>(commonTokens)

  useEffect(() => {
    // Filter tokens based on search query
    const filtered = commonTokens.filter(token => 
      token.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.getAddress().toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredTokens(filtered)
  }, [searchQuery])

  const handleSelect = useCallback((currency: Currency) => {
    onSelect(currency)
    onDismiss()
  }, [onSelect, onDismiss])

  if (!isOpen) return null

  return (
    <Modal onClick={onDismiss}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Text fontSize={20} fontWeight={500} marginBottom="16px">
          Select a Token
        </Text>

        <Flex sx={{ position: 'relative', marginBottom: '16px' }}>
          <SearchInput
            placeholder="Search by name or paste address"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search
            size={20}
            color={theme.subText}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        </Flex>

        <TokenList>
          {filteredTokens.map((token, index) => (
            <TokenItem
              key={index}
              onClick={() => handleSelect(token)}
              disabled={
                selectedCurrency?.equals(token) ||
                otherCurrency?.equals(token)
              }
            >
              <Text>{token.symbol}</Text>
              <Text color={theme.subText} fontSize={14}>
                {token.name}
              </Text>
            </TokenItem>
          ))}
        </TokenList>
      </ModalContent>
    </Modal>
  )
}

export default TokenSelector
