import { Trans } from '@lingui/macro'
import { rgba } from 'polished'
import { useCallback, useState } from 'react'
import { Repeat } from 'react-feather'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { AutoColumn } from 'components/Column'
import CopyHelper from 'components/Copy'
import Divider from 'components/Divider'
import InfoHelper from 'components/InfoHelper'
import { RowBetween, RowFixed } from 'components/Row'
import { useSwapFormContext } from 'components/SwapForm/SwapFormContext'
import ValueWithLoadingSkeleton from 'components/SwapForm/SwapModal/SwapDetails/ValueWithLoadingSkeleton'
import { MouseoverTooltip, TextDashed } from 'components/Tooltip'
import { useActiveWeb3React } from 'hooks'
import useENS from 'hooks/useENS'
import useTheme from 'hooks/useTheme'
import { Currency, CurrencyAmount, Price } from 'types/currency'
import { formattedNum, shortenAddress } from 'utils'

const StyledBalanceMaxMini = styled.button`
  height: 22px;
  width: 22px;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  padding: 0.2rem;
  font-size: 0.875rem;
  font-weight: 400;
  margin-left: 0.4rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text2};
  display: flex;
  justify-content: center;
  align-items: center;
  float: right;

  :hover {
    background-color: ${({ theme }) => theme.buttonBlack};
  }
  :focus {
    background-color: ${({ theme }) => theme.buttonBlack};
    outline: none;
  }
`

interface ExecutionPriceProps {
  executionPrice?: Price<Currency, Currency>
  showInverted?: boolean
}

function ExecutionPrice({ executionPrice, showInverted }: ExecutionPriceProps) {
  if (!executionPrice) {
    return null
  }

  const inputSymbol = executionPrice.baseToken.symbol
  const outputSymbol = executionPrice.quoteToken.symbol

  const formattedPrice = showInverted ? executionPrice.invert().toSignificant(6) : executionPrice.toSignificant(6)
  const value = showInverted
    ? `1 ${outputSymbol} = ${formattedPrice} ${inputSymbol}`
    : `1 ${inputSymbol} = ${formattedPrice} ${outputSymbol}`

  return (
    <Text fontWeight={500} style={{ whiteSpace: 'nowrap', minWidth: 'max-content' }}>
      {value}
    </Text>
  )
}

export type Props = {
  isLoading: boolean
  buildData: any
  minimumAmountOut: CurrencyAmount<Currency> | undefined
  gasUsd?: string
  executionPrice?: Price<Currency, Currency>
  priceImpact?: string
}

export default function SwapDetails({
  isLoading,
  gasUsd,
  minimumAmountOut,
  executionPrice,
  priceImpact,
  buildData,
}: Props) {
  const { chainId, account } = useActiveWeb3React()
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useTheme()
  const { slippage, routeSummary } = useSwapFormContext()

  const currencyIn = routeSummary?.parsedAmountIn?.currency
  const currencyOut = routeSummary?.parsedAmountOut?.currency

  const minimumAmountOutStr =
    minimumAmountOut && currencyOut ? (
      <Flex style={{ color: theme.text, fontWeight: 500, whiteSpace: 'nowrap' }}>
        <Text style={{ width: '-webkit-fill-available' }}>
          {formattedNum(minimumAmountOut.toSignificant(10), false, 10)}
        </Text>
        <Text style={{ minWidth: 'auto' }}>&nbsp;{currencyOut.symbol}</Text>
      </Flex>
    ) : (
      ''
    )

  const { recipient: recipientAddressOrName } = useSwapFormContext()
  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null || recipientAddressOrName === '' ? account : recipientAddress

  return (
    <AutoColumn
      gap="0.5rem"
      style={{ padding: '12px 16px', border: `1px solid ${theme.border}`, borderRadius: '16px' }}
    >
      <RowBetween align="center" height="20px" style={{ gap: '16px' }}>
        <Text fontWeight={400} fontSize={12} color={theme.subText} minWidth="max-content">
          <Trans>Current Price</Trans>
        </Text>

        <ValueWithLoadingSkeleton
          skeletonStyle={{
            width: '160px',
            height: '19px',
          }}
          isShowingSkeleton={isLoading}
          content={
            executionPrice ? (
              <Flex
                fontWeight={500}
                fontSize={12}
                color={theme.text}
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'right',
                }}
              >
                <ExecutionPrice executionPrice={executionPrice} showInverted={showInverted} />
                <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
                  <Repeat size={14} color={theme.text} />
                </StyledBalanceMaxMini>
              </Flex>
            ) : (
              <Text fontSize={12}>--</Text>
            )
          }
        />
      </RowBetween>

      <RowBetween align="center" height="20px" style={{ gap: '16px' }}>
        <RowFixed style={{ minWidth: 'max-content' }}>
          <TextDashed fontSize={12} fontWeight={400} color={theme.subText} minWidth="max-content">
            <MouseoverTooltip
              width="200px"
              text={<Trans>You will receive at least this amount or your transaction will revert.</Trans>}
              placement="right"
            >
              <Trans>Minimum Received</Trans>
            </MouseoverTooltip>
          </TextDashed>
        </RowFixed>

        <ValueWithLoadingSkeleton
          skeletonStyle={{
            width: '108px',
            height: '19px',
          }}
          isShowingSkeleton={isLoading}
          content={
            <Text fontSize={12} fontWeight={500}>
              {minimumAmountOutStr || '--'}
            </Text>
          }
        />
      </RowBetween>

      <RowBetween height="20px" style={{ gap: '16px' }}>
        <RowFixed>
          <TextDashed fontSize={12} fontWeight={400} color={theme.subText}>
            <MouseoverTooltip
              text={<Trans>Estimated change in price due to the size of your transaction.</Trans>}
              placement="right"
            >
              <Trans>Price Impact</Trans>
            </MouseoverTooltip>
          </TextDashed>
        </RowFixed>

        <ValueWithLoadingSkeleton
          skeletonStyle={{
            width: '64px',
            height: '19px',
          }}
          isShowingSkeleton={isLoading}
          content={
            <Text
              fontSize={12}
              color={Number(priceImpact) >= 10 ? theme.red : Number(priceImpact) >= 5 ? theme.warning : theme.text}
            >
              {priceImpact ? `${priceImpact}%` : '--'}
            </Text>
          }
        />
      </RowBetween>

      <RowBetween height="20px" style={{ gap: '16px' }}>
        <RowFixed>
          <TextDashed fontSize={12} fontWeight={400} color={theme.subText}>
            <MouseoverTooltip text={<Trans>Estimated network fee for your transaction.</Trans>} placement="right">
              <Trans>Est. Gas Fee</Trans>
            </MouseoverTooltip>
          </TextDashed>
        </RowFixed>

        <ValueWithLoadingSkeleton
          skeletonStyle={{
            width: '64px',
            height: '19px',
          }}
          isShowingSkeleton={isLoading}
          content={
            <Text color={theme.text} fontSize={12}>
              {gasUsd ? formattedNum(gasUsd, true) : '--'}
            </Text>
          }
        />
      </RowBetween>

      <RowBetween height="20px" style={{ gap: '16px' }}>
        <RowFixed>
          <TextDashed fontSize={12} fontWeight={400} color={theme.subText}>
            <MouseoverTooltip
              text={
                <Text>
                  <Trans>
                    During your swap if the price changes by more than this %, your transaction will revert.
                  </Trans>
                </Text>
              }
              placement="right"
            >
              <Trans>Max Slippage</Trans>
            </MouseoverTooltip>
          </TextDashed>
        </RowFixed>

        <Text fontSize={12} color={slippage > 5 ? theme.warning : undefined}>
          {slippage ? `${(slippage / 100).toFixed(2)}%` : '--'}
        </Text>
      </RowBetween>

      <Divider />

      {recipient && (
        <RowBetween>
          <Text fontSize={12} color={theme.subText}>
            <Trans>Recipient</Trans>
          </Text>
          <Text fontSize={12} fontWeight="501">
            {shortenAddress(chainId, recipient)}
          </Text>
        </RowBetween>
      )}

      <RowBetween>
        <TextDashed fontSize={12} color={theme.subText}>
          <MouseoverTooltip
            text={
              <Trans>
                The contract address that will be executing the swap. You can verify the contract in the block
                explorer.
              </Trans>
            }
          >
            <Trans>Router Address</Trans>
          </MouseoverTooltip>
        </TextDashed>
        {buildData?.routerAddress && (
          <Flex alignItems="center">
            <Text fontSize={12}>{shortenAddress(chainId, buildData.routerAddress)}</Text>
            <CopyHelper toCopy={buildData.routerAddress} size="12px" />
          </Flex>
        )}
      </RowBetween>
    </AutoColumn>
  )
}
