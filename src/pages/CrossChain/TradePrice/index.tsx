import { Trans } from '@lingui/macro'
import { useMemo } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components'

import { StyledBalanceMaxMini } from 'components/SwapForm/styleds'
import useTheme from 'hooks/useTheme'
import { RubicRoute } from 'services/rubic'

interface TradePriceProps {
  route: RubicRoute | null
  loading?: boolean
  disabled?: boolean
  refresh?: () => void
}

const StyledPriceContainer = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 999px;
  user-select: none;
  background: ${({ theme }) => theme.buttonBlack};
  font-size: 14px;
  font-weight: 500;
  border: none;
  outline: none;
  cursor: pointer;
  color: ${({ theme }) => theme.subText};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
  &:hover {
    opacity: 0.8;
  }
`

export default function TradePrice({ route, loading, disabled, refresh }: TradePriceProps) {
  const theme = useTheme()

  const price = useMemo(() => {
    if (!route?.estimate?.destinationTokenAmount) return null

    try {
      const amount = Number(route.estimate.destinationTokenAmount)
      if (isNaN(amount) || amount <= 0) return null
      return amount.toFixed(6)
    } catch (error) {
      console.error('Error formatting price:', error)
      return null
    }
  }, [route])

  if (loading) {
    return (
      <StyledPriceContainer disabled>
        <Text>
          <Trans>Fetching best price...</Trans>
        </Text>
      </StyledPriceContainer>
    )
  }

  if (!price) {
    return (
      <StyledPriceContainer disabled>
        <Text>
          <Trans>Unable to get price</Trans>
        </Text>
      </StyledPriceContainer>
    )
  }

  return (
    <StyledPriceContainer onClick={refresh} disabled={disabled}>
      <Text>{price}</Text>
      <StyledBalanceMaxMini>
        <Repeat size={14} color={theme.subText} />
      </StyledBalanceMaxMini>
    </StyledPriceContainer>
  )
}
