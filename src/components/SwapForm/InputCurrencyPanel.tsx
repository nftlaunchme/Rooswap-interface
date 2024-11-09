import { rgba } from 'polished'
import React, { useState } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { Currency, CurrencyAmount } from '../../types/currency'
import { InputCurrencyPanelProps } from './types'
import useTheme from 'hooks/useTheme'
import TokenSelector from './TokenSelector'

const InputPanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: ${({ theme }) => rgba(theme.buttonBlack, 0.4)};
  border-radius: 20px;
`

const InputRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const StyledInput = styled.input`
  width: 0;
  flex: 1 1 auto;
  font-size: 28px;
  font-weight: 500;
  outline: none;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text};
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0;
  appearance: textfield;
  transition: color 0.2s ease;
  
  ::placeholder {
    color: ${({ theme }) => theme.subText};
  }

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
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

const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.subText};
`

const MaxButton = styled.button`
  padding: 2px 8px;
  background: ${({ theme }) => rgba(theme.primary, 0.2)};
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  :hover {
    background: ${({ theme }) => rgba(theme.primary, 0.4)};
  }
`

const InputCurrencyPanel: React.FC<InputCurrencyPanelProps> = ({
  typedValue,
  setTypedValue,
  currencyIn,
  currencyOut,
  balanceIn,
  onChangeCurrencyIn,
  customChainId,
}) => {
  const theme = useTheme()
  const [showTokenSelector, setShowTokenSelector] = useState(false)

  const handleMax = () => {
    if (balanceIn) {
      setTypedValue(balanceIn.toExact())
    }
  }

  return (
    <>
      <TokenSelector
        isOpen={showTokenSelector}
        onDismiss={() => setShowTokenSelector(false)}
        onSelect={onChangeCurrencyIn}
        selectedCurrency={currencyIn}
        otherCurrency={currencyOut}
      />

      <InputPanelWrapper>
        <Text fontSize={12} fontWeight={500} color={theme.subText}>
          You Pay
        </Text>

        <InputRow>
          <StyledInput
            type="text"
            value={typedValue}
            onChange={(e) => setTypedValue(e.target.value)}
            placeholder="0.0"
            pattern="^[0-9]*[.,]?[0-9]*$"
            inputMode="decimal"
          />
          <TokenButton 
            hasToken={!!currencyIn} 
            onClick={() => setShowTokenSelector(true)}
          >
            {currencyIn?.symbol || 'Select Token'}
          </TokenButton>
        </InputRow>

        <BalanceRow>
          {balanceIn && (
            <>
              <Text>Balance: {balanceIn.toExact()} {currencyIn?.symbol}</Text>
              <MaxButton onClick={handleMax}>MAX</MaxButton>
            </>
          )}
        </BalanceRow>
      </InputPanelWrapper>
    </>
  )
}

export default InputCurrencyPanel
