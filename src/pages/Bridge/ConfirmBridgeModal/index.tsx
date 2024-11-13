import { Trans, t } from '@lingui/macro'
import { useCallback, useMemo } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as DropdownSVG } from 'assets/svg/down.svg'
import { ButtonError, ButtonLight } from 'components/Button'
import { GreyCard } from 'components/Card'
import Column from 'components/Column'
import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import useTheme from 'hooks/useTheme'
import { RubicRoute } from 'services/rubic'
import { TransactionFlowState } from 'types/TransactionFlowState'
import { formatDurationCrossChain } from 'utils/time'
import { formatNumberWithPrecisionRange } from 'utils/numbers'

const Wrapper = styled.div`
  padding: 1rem;
  width: 100%;
`

const Section = styled(Column)`
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`

const NetworkFeeTooltip = styled(MouseoverTooltip)`
  max-width: 200px;
`

interface Props {
  route: RubicRoute | null
  swapState: TransactionFlowState
  onDismiss: () => void
  onSwap: () => void
}

export function ConfirmCrossChainModal({ route, swapState, onDismiss, onSwap }: Props) {
  const theme = useTheme()

  const { showConfirm, attemptingTxn, errorMessage } = swapState

  const renderError = useCallback(() => {
    return (
      <Flex flexDirection={'column'} style={{ gap: 16 }}>
        <Text color={theme.red} textAlign="center">
          {errorMessage}
        </Text>
        <ButtonLight onClick={onDismiss}>
          <Text>
            <Trans>Dismiss</Trans>
          </Text>
        </ButtonLight>
      </Flex>
    )
  }, [errorMessage, onDismiss, theme.red])

  const swapDetails = useMemo(() => {
    if (!route?.estimate) return null

    const {
      destinationTokenAmount,
      destinationTokenMinAmount,
      destinationUsdAmount,
      destinationUsdMinAmount,
      durationInMinutes,
      priceImpact
    } = route.estimate

    const fees = route.fees?.gasTokenFees
    const networkFee = fees ? (
      (fees.protocol?.fixedUsdAmount || 0) +
      (fees.provider?.fixedUsdAmount || 0) +
      (fees.gas?.totalUsdAmount || 0)
    ) : 0

    return {
      amount: destinationTokenAmount,
      minAmount: destinationTokenMinAmount,
      usdAmount: destinationUsdAmount,
      usdMinAmount: destinationUsdMinAmount,
      duration: durationInMinutes * 60, // convert to seconds
      priceImpact: priceImpact,
      networkFee
    }
  }, [route])

  const renderContent = useCallback(() => {
    if (!swapDetails) return null

    return (
      <>
        <Section>
          <RowBetween>
            <Text fontSize={12} color={theme.subText}>
              <Trans>Estimated Processing Time</Trans>
            </Text>
            <Text fontSize={12} color={theme.text}>
              {formatDurationCrossChain(swapDetails.duration)}
            </Text>
          </RowBetween>

          <RowBetween>
            <Text fontSize={12} color={theme.subText}>
              <Trans>Price Impact</Trans>
            </Text>
            <Text fontSize={12} color={theme.text}>
              {formatNumberWithPrecisionRange(swapDetails.priceImpact || 0, 0, 2)}%
            </Text>
          </RowBetween>

          <RowBetween>
            <NetworkFeeTooltip
              text={t`This is the estimated network fee for processing your transaction on the destination chain.`}
            >
              <Text fontSize={12} color={theme.subText}>
                <Trans>Network Fee</Trans> ↗
              </Text>
            </NetworkFeeTooltip>
            <Text fontSize={12} color={theme.text}>
              ~${formatNumberWithPrecisionRange(swapDetails.networkFee, 0, 2)}
            </Text>
          </RowBetween>
        </Section>

        <Section>
          <GreyCard padding="12px" style={{ borderRadius: '8px' }}>
            <Text fontSize={12} color={theme.subText} textAlign="center" lineHeight={1.5}>
              <Trans>
                Please note: Once you confirm this transaction, you cannot cancel it. Please make sure you have selected the
                correct network and token for your swap.
              </Trans>
            </Text>
          </GreyCard>
        </Section>

        <Flex
          sx={{
            gap: '1rem',
          }}
        >
          <ButtonLight onClick={onDismiss}>
            <Trans>Cancel</Trans>
          </ButtonLight>

          <ButtonError onClick={onSwap}>
            <Text>
              <Trans>Confirm Swap</Trans>
            </Text>
          </ButtonError>
        </Flex>
      </>
    )
  }, [swapDetails, theme, onDismiss, onSwap])

  return (
    <Modal isOpen={showConfirm} onDismiss={onDismiss} maxHeight={90} maxWidth="392px">
      <Wrapper>
        <Flex flexDirection="column" width="100%">
          <RowBetween>
            <Text fontSize={20} fontWeight={500}>
              <Trans>Confirm Cross-chain Swap</Trans>
            </Text>

            <DropdownSVG
              style={{ cursor: 'pointer' }}
              onClick={onDismiss}
              fill={theme.text}
            />
          </RowBetween>

          {errorMessage ? renderError() : renderContent()}
        </Flex>
      </Wrapper>
    </Modal>
  )
}
