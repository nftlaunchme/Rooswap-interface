import { rgba } from 'polished'
import React from 'react'
import { RefreshCw } from 'react-feather'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { DetailedRouteSummary } from '../../types/route'
import useTheme from 'hooks/useTheme'

const SummaryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: ${({ theme }) => rgba(theme.buttonBlack, 0.4)};
  border-radius: 16px;
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.subText};
`

const WarningText = styled(Text)`
  color: ${({ theme }) => theme.warning};
  font-size: 11px;
  font-style: italic;
  margin-top: 4px;
`

const RouteBox = styled.div`
  background: ${({ theme }) => rgba(theme.primary, 0.1)};
  border-radius: 8px;
  padding: 8px;
  margin-top: 4px;
  font-size: 11px;
`

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 8px;
  margin-top: 4px;
  background: ${({ theme }) => rgba(theme.primary, 0.2)};
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  :hover:not(:disabled) {
    background: ${({ theme }) => rgba(theme.primary, 0.4)};
  }

  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

interface Props {
  routeSummary: DetailedRouteSummary | undefined
  slippage: number
  disableRefresh: boolean
  refreshCallback: () => void
}

const TradeSummary: React.FC<Props> = ({
  routeSummary,
  slippage,
  disableRefresh,
  refreshCallback,
}) => {
  const theme = useTheme()

  if (!routeSummary) return null

  // Safely format the output amount
  const formatOutputAmount = () => {
    try {
      if (!routeSummary.parsedAmountOut) return '0'
      if (typeof routeSummary.parsedAmountOut.toSignificant === 'function') {
        return routeSummary.parsedAmountOut.toSignificant(6)
      }
      // Fallback to raw value if toSignificant is not available
      return routeSummary.parsedAmountOut.raw || '0'
    } catch (e) {
      console.error('Error formatting output amount:', e)
      return '0'
    }
  }

  // Get route information
  const getRouteInfo = () => {
    try {
      if (!routeSummary.openOceanQuote.route[0]) return null
      const route = JSON.parse(routeSummary.openOceanQuote.route[0])
      return {
        dexName: route.dexName,
        hasFeeOnTransfer: route.hasFeeOnTransfer,
        feeOnTransferAmount: route.feeOnTransferAmount,
      }
    } catch (e) {
      console.error('Error parsing route info:', e)
      return null
    }
  }

  const routeInfo = getRouteInfo()

  return (
    <SummaryWrapper>
      <SummaryRow>
        <Text color={theme.subText}>Rate</Text>
        <Text color={theme.text}>
          {routeSummary.executionPrice.price} {routeSummary.executionPrice.baseSymbol}/{routeSummary.executionPrice.quoteSymbol}
        </Text>
      </SummaryRow>

      <SummaryRow>
        <Text color={theme.subText}>Price Impact</Text>
        <Text 
          color={
            parseFloat(routeSummary.priceImpact) >= 10 
              ? theme.red 
              : parseFloat(routeSummary.priceImpact) >= 5 
              ? theme.warning 
              : theme.text
          }
        >
          {routeSummary.priceImpact}%
        </Text>
      </SummaryRow>

      <SummaryRow>
        <Text color={theme.subText}>Minimum Received</Text>
        <Text color={theme.text}>
          {formatOutputAmount()} {routeSummary.parsedAmountOut?.currency?.symbol || ''}
        </Text>
      </SummaryRow>

      <SummaryRow>
        <Text color={theme.subText}>Network Fee</Text>
        <Text color={theme.text}>${parseFloat(routeSummary.gasCostUSD || '0').toFixed(2)}</Text>
      </SummaryRow>

      {routeInfo && (
        <>
          <RouteBox>
            <Text color={theme.text} mb="4px">Route: {routeInfo.dexName}</Text>
            {routeInfo.hasFeeOnTransfer && (
              <WarningText>
                This token has a transfer fee of approximately{' '}
                {((parseFloat(routeInfo.feeOnTransferAmount || '0') / parseFloat(routeSummary.parsedAmountOut?.raw || '1')) * 100).toFixed(2)}%
              </WarningText>
            )}
          </RouteBox>
        </>
      )}

      {routeSummary.extraFee && (
        <SummaryRow>
          <Text color={theme.warning}>Extra Fee</Text>
          <Text color={theme.warning}>
            {routeSummary.extraFee.isInBps 
              ? `${(parseFloat(routeSummary.extraFee.feeAmount) / 100).toFixed(2)}%`
              : routeSummary.extraFee.feeAmount
            }
          </Text>
        </SummaryRow>
      )}

      {!disableRefresh && (
        <RefreshButton onClick={refreshCallback} disabled={disableRefresh}>
          <RefreshCw size={14} />
          <Text>Refresh Rate</Text>
        </RefreshButton>
      )}
    </SummaryWrapper>
  )
}

export default TradeSummary
