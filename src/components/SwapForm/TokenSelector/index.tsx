import { rgba } from 'polished'
import React, { useCallback, useEffect, useState } from 'react'
import { Search } from 'react-feather'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { Currency, CurrencyAmount } from '../../../types/currency'
import useTheme from 'hooks/useTheme'
import { useTokens } from 'hooks/useTokens'

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

const TokenItem = styled.button<{ hasBalance?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;

  :hover {
    background: ${({ theme }) => rgba(theme.buttonBlack, 0.4)};
  }

  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ hasBalance, theme }) =>
    hasBalance &&
    `
    border-color: ${rgba(theme.primary, 0.5)};
    background: ${rgba(theme.primary, 0.1)};
  `}
`

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const TokenLogo = styled.div<{ src?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.buttonBlack};
  background-image: ${({ src }) => src ? `url(${src})` : 'none'};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.text};
  font-size: 12px;
  font-weight: 500;
`

const TokenSymbol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

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
  const { tokens, loading } = useTokens()
  const [filteredTokens, setFilteredTokens] = useState<Currency[]>(tokens)

  useEffect(() => {
    // Filter tokens based on search query
    const filtered = tokens.filter(token => {
      const searchLower = searchQuery.toLowerCase()
      return (
        token.symbol?.toLowerCase().includes(searchLower) ||
        token.name?.toLowerCase().includes(searchLower) ||
        token.getAddress().toLowerCase() === searchLower
      )
    })
    setFilteredTokens(filtered)
  }, [searchQuery, tokens])

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
            autoFocus
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
          {loading ? (
            <Text color={theme.subText} textAlign="center" padding="20px">
              Loading tokens...
            </Text>
          ) : filteredTokens.length === 0 ? (
            <Text color={theme.subText} textAlign="center" padding="20px">
              No tokens found.
            </Text>
          ) : (
            filteredTokens.map((token, index) => (
              <TokenItem
                key={index}
                onClick={() => handleSelect(token)}
                disabled={
                  selectedCurrency?.equals(token) ||
                  otherCurrency?.equals(token)
                }
                hasBalance={!!token.balance && !token.balance.equalTo(CurrencyAmount.fromRaw(token, '0'))}
              >
                <TokenInfo>
                  <TokenLogo src={token.logoURI}>
                    {!token.logoURI && token.symbol?.[0]}
                  </TokenLogo>
                  <TokenSymbol>
                    <Text fontWeight={500}>{token.symbol}</Text>
                    <Text color={theme.subText} fontSize={12}>
                      {token.name}
                    </Text>
                  </TokenSymbol>
                </TokenInfo>
                {token.balance && !token.balance.equalTo(CurrencyAmount.fromRaw(token, '0')) && (
                  <Text color={theme.primary} fontSize={14} fontWeight={500}>
                    {token.balance.toSignificant(6)}
                  </Text>
                )}
              </TokenItem>
            ))
          )}
        </TokenList>
      </ModalContent>
    </Modal>
  )
}

export default TokenSelector
