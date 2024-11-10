import { rgba } from 'polished'
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const AmountButton = styled.button`
  padding: 4px 8px;
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

  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const InputCurrencyPanel: React.FC<InputCurrencyPanelProps> = ({
  typedValue,
  setTypedValue,
  currencyIn,
  currencyOut,
  onChangeCurrencyIn,
  customChainId,
}) => {
  const theme = useTheme()
  const { account } = useActiveWeb3React()
  const [showTokenSelector, setShowTokenSelector] = useState(false)
  const [balance, setBalance] = useState<string>()

  // Fetch balance directly from OpenOcean API
  useEffect(() => {
    if (!account || !currencyIn) return

    const fetchBalance = async () => {
      try {
        const tokenAddress = currencyIn.isNative ? 
          '0x0000000000000000000000000000000000000000' : 
          currencyIn.wrapped.address

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
  }, [account, currencyIn])

  const formattedBalance = useMemo(() => {
    if (!balance || !currencyIn) return undefined
    return CurrencyAmount.fromRaw(currencyIn, balance)
  }, [balance, currencyIn])

  const handleMax = useCallback(() => {
    if (formattedBalance) {
      setTypedValue(formattedBalance.toSignificant(6))
    }
  }, [formattedBalance, setTypedValue])

  const handleHalf = useCallback(() => {
    if (formattedBalance) {
      const half = parseFloat(formattedBalance.toExact()) / 2
      setTypedValue(half.toString())
    }
  }, [formattedBalance, setTypedValue])

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
            onChange={(e) => {
              const value = e.target.value
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setTypedValue(value)
              }
            }}
            placeholder="0.0"
            pattern="^[0-9]*[.,]?[0-9]*$"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            minLength={1}
            maxLength={79}
            spellCheck="false"
          />
          <TokenButton 
            hasToken={!!currencyIn} 
            onClick={() => setShowTokenSelector(true)}
          >
            {currencyIn?.symbol || 'Select Token'}
          </TokenButton>
        </InputRow>

        <BalanceRow>
          <BalanceText>
            <BalanceLabel>Balance:</BalanceLabel>
            {formattedBalance ? (
              <BalanceAmount>
                {formattedBalance.toSignificant(6)} {currencyIn?.symbol}
              </BalanceAmount>
            ) : (
              <BalanceAmount>-</BalanceAmount>
            )}
          </BalanceText>
          
          {formattedBalance && parseFloat(formattedBalance.toExact()) > 0 && (
            <ButtonGroup>
              <AmountButton onClick={handleHalf}>HALF</AmountButton>
              <AmountButton onClick={handleMax}>MAX</AmountButton>
            </ButtonGroup>
          )}
        </BalanceRow>
      </InputPanelWrapper>
    </>
  )
}

export default InputCurrencyPanel
