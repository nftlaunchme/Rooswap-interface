import { rgba } from 'polished'
import React, { useState } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

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

const UsdValueRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
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
  const [showTokenSelector, setShowTokenSelector] = useState(false)

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

        <UsdValueRow>
          {amountOutUsd && (
            <Text>≈ ${parseFloat(amountOutUsd).toFixed(2)}</Text>
          )}
        </UsdValueRow>
      </OutputPanelWrapper>
    </>
  )
}

export default OutputCurrencyPanel
