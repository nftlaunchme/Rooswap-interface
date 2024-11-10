import { rgba } from 'polished'
import React, { useState, useEffect, useMemo } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { Currency, CurrencyAmount } from '../../types/currency'
import { OutputCurrencyPanelProps } from './types'
import useTheme from 'hooks/useTheme'
import TokenSelector from './TokenSelector'

const OutputPanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: ${({ theme }) => rgba(theme.buttonBlack, 0.4)};
  border-radius: 20px;
`

const OutputRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const OutputAmount = styled.div`
  font-size: 28px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TokenButton = styled.button<{ hasToken?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: ${({ theme, hasToken }) => hasToken ? rgba(theme.buttonGray, 0.4) : theme.primary};
  border: none;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.2s ease;

  :hover {
    background: ${({ theme, hasToken }) => hasToken ? rgba(theme.buttonGray, 0.6) : rgba(theme.primary, 0.8)};
  }
`

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`

const BalanceText = styled(Text)`
  display: flex;
  align-items: center;
  gap: 4px;
`

const BalanceLabel = styled.span`
  color: ${({ theme }) => theme.subText};
`

const BalanceAmount = styled.span`
  color: ${({ theme }) => theme.text};
`

const UsdValue = styled(Text)`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.subText};
`

const OutputCurrencyPanel: React.FC<OutputCurrencyPanelProps> = ({
  parsedAmountIn,
  parsedAmountOut,
  currencyIn,
  currencyOut,
  amountOutUsd,
  onChangeCurrencyOut,
  customChainId,
}) => {
  const theme = useTheme()
  const { account } = useActiveWeb3React()
  const [showTokenSelector, setShowTokenSelector] = useState(false)
  const [balance, setBalance] = useState<string>()

  // Fetch balance directly from OpenOcean API
  useEffect(() => {
    if (!account || !currencyOut) return

    const fetchBalance = async () => {
      try {
        const tokenAddress = currencyOut.isNative ? 
          '0x0000000000000000000000000000000000000000' : 
          currencyOut.wrapped.address

        const params = new URLSearchParams({
          account,
          inTokenAddress: tokenAddress,
        })

        const response = await fetch(`https://open-api.openocean.finance/v3/cronos/getBalance?${params}`)
        const data = await response.json()

        if (data.code === 200 && data.data && data.data[0]) {
          setBalance(data.data[0].raw)
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 10000)
    return () => clearInterval(interval)
  }, [account, currencyOut])

  const formattedBalance = useMemo(() => {
    if (!balance || !currencyOut) return undefined
    return CurrencyAmount.fromRaw(currencyOut, balance)
  }, [balance, currencyOut])

  return (
    <>
      <TokenSelector
        isOpen={showTokenSelector}
        onDismiss={() => setShowTokenSelector(false)}
        onSelect={onChangeCurrencyOut}
        selectedCurrency={currencyOut}
        otherCurrency={currencyIn}
      />

      <OutputPanelWrapper>
        <Text fontSize={12} fontWeight={500} color={theme.subText}>
          You Receive
        </Text>

        <OutputRow>
          <OutputAmount>
            {parsedAmountOut ? parsedAmountOut.toSignificant(6) : '0.0'}
          </OutputAmount>
          <TokenButton 
            hasToken={!!currencyOut} 
            onClick={() => setShowTokenSelector(true)}
          >
            {currencyOut?.symbol || 'Select Token'}
          </TokenButton>
        </OutputRow>

        <InfoRow>
          <BalanceText>
            <BalanceLabel>Balance:</BalanceLabel>
            {formattedBalance ? (
              <BalanceAmount>
                {formattedBalance.toSignificant(6)} {currencyOut?.symbol}
              </BalanceAmount>
            ) : (
              <BalanceAmount>-</BalanceAmount>
            )}
          </BalanceText>

          {amountOutUsd && (
            <UsdValue>≈ ${parseFloat(amountOutUsd).toFixed(2)}</UsdValue>
          )}
        </InfoRow>
      </OutputPanelWrapper>
    </>
  )
}

export default OutputCurrencyPanel
