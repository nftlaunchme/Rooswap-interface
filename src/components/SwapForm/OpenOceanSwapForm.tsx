import { Currency, CurrencyAmount, Token } from '@kyberswap/ks-sdk-core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'
import { rgba } from 'polished'

import { NetworkSelector } from 'components/NetworkSelector'
import InputCurrencyPanel from 'components/SwapForm/InputCurrencyPanel'
import OutputCurrencyPanel from 'components/SwapForm/OutputCurrencyPanel'
import SlippageSettingGroup from 'components/SwapForm/SlippageSettingGroup'
import { SwapFormContextProvider } from 'components/SwapForm/SwapFormContext'
import { Wrapper } from 'components/swapv2/styleds'
import { TutorialIds } from 'components/Tutorial/TutorialSwap/constant'
import { useActiveWeb3React } from 'hooks'
import useTheme from 'hooks/useTheme'
import { Field } from 'state/swap/actions'
import { useAppDispatch } from 'state/hooks'
import { useSwapActionHandlers, useSwapState } from 'state/swap/hooks'
import { OPENOCEAN_PRICE_IMPACT_ERROR, OPENOCEAN_PRICE_IMPACT_WARNING } from 'constants/openocean'
import { useOpenOceanQuote, useOpenOceanSwapCallback, OpenOceanSwapCallbackState } from 'hooks/useOpenOceanSwap'
import useParsedAmount from 'components/SwapForm/hooks/useParsedAmount'
import WarningIcon from 'components/Icons/WarningIcon'
import { useWalletModalToggle } from 'state/application/hooks'
import { WrapType } from 'hooks/useWrapCallback'
import { OpenOceanDetailedRouteSummary, OpenOceanBuildRouteResult } from 'types/openocean'

import ReverseTokenSelectionButton from './ReverseTokenSelectionButton'
import SwapActionButton from './SwapActionButton'

export type OpenOceanSwapFormProps = {
  hidden: boolean
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  balanceIn: CurrencyAmount<Currency> | undefined
  balanceOut: CurrencyAmount<Currency> | undefined
  isDegenMode: boolean
  slippage: number
  transactionTimeout: number
  onChangeCurrencyIn: (c: Currency) => void
  onChangeCurrencyOut: (c: Currency) => void
  customChainId?: number
  omniView?: boolean
}

const OpenOceanSwapForm: React.FC<OpenOceanSwapFormProps> = ({
  hidden,
  currencyIn,
  currencyOut,
  balanceIn,
  balanceOut,
  isDegenMode,
  slippage,
  transactionTimeout,
  onChangeCurrencyIn,
  onChangeCurrencyOut,
  customChainId,
  omniView,
}) => {
  const { account, chainId: walletChainId } = useActiveWeb3React()
  const chainId = customChainId || walletChainId
  const [isProcessingSwap, setProcessingSwap] = useState(false)
  const { typedValue } = useSwapState()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const toggleWalletModal = useWalletModalToggle()

  const { onUserInput: updateInputAmount } = useSwapActionHandlers()
  const onUserInput = useCallback(
    (value: string) => {
      updateInputAmount(Field.INPUT, value)
    },
    [updateInputAmount],
  )

  const parsedAmount = useParsedAmount(currencyIn, typedValue)

  const { loading: quoteLoading, quote, error: quoteError } = useOpenOceanQuote(
    currencyIn,
    currencyOut,
    parsedAmount,
    slippage,
  )

  const { state: swapCallbackState, callback: swapCallback, error: swapCallbackError } = useOpenOceanSwapCallback(
    currencyIn,
    currencyOut,
    parsedAmount,
    slippage,
    null, // No recipient for now
  )

  const priceImpact = quote?.priceImpact ? parseFloat(quote.priceImpact) : 0
  const showPriceImpactWarning = priceImpact >= OPENOCEAN_PRICE_IMPACT_WARNING
  const showPriceImpactError = priceImpact >= OPENOCEAN_PRICE_IMPACT_ERROR

  const handleSwap = useCallback(async () => {
    if (!swapCallback) return
    try {
      setProcessingSwap(true)
      const txHash = await swapCallback()
      return txHash
    } catch (error) {
      console.error('Failed to swap:', error)
      throw error
    } finally {
      setProcessingSwap(false)
    }
  }, [swapCallback])

  const swapInputError = useMemo(() => {
    if (!account) return 'Connect Wallet'
    if (!currencyIn || !currencyOut) return 'Select a token'
    if (!parsedAmount || parsedAmount.equalTo(0)) return 'Enter an amount'
    if (quoteError) return quoteError
    if (showPriceImpactError) return 'Price Impact Too High'
    if (swapCallbackError) return swapCallbackError
    return undefined
  }, [account, currencyIn, currencyOut, parsedAmount, quoteError, showPriceImpactError, swapCallbackError])

  const isValid = !swapInputError && swapCallbackState === OpenOceanSwapCallbackState.VALID

  // Create a detailed route summary for context provider
  const routeSummary: OpenOceanDetailedRouteSummary | undefined = useMemo(() => {
    if (!quote || !currencyOut || !currencyIn) return undefined
    return {
      tokenIn: currencyIn.wrapped as Token,
      tokenOut: currencyOut.wrapped as Token,
      amountIn: parsedAmount?.toExact() || '0',
      amountOut: quote.amountOut,
      amountInUsd: '0',
      amountOutUsd: '0',
      priceImpact: quote.priceImpact,
      parsedAmountIn: parsedAmount || CurrencyAmount.fromRawAmount(currencyIn, '0'),
      parsedAmountOut: CurrencyAmount.fromRawAmount(currencyOut, quote.amountOut),
      routerAddress: '',
      gasUsd: '0',
      gasAmount: quote.estimatedGas,
      extraFee: {
        feeAmount: '0',
        feeAmountUsd: '0',
        chargeFeeBy: '',
        isInBps: false,
        feeReceiver: '',
      },
    }
  }, [quote, currencyIn, currencyOut, parsedAmount])

  const buildRoute = useCallback(async (): Promise<OpenOceanBuildRouteResult> => {
    if (!swapCallback) throw new Error('Swap callback not ready')
    const txHash = await swapCallback()
    return {
      data: '',
      value: '0',
      to: '',
      gasLimit: quote?.estimatedGas || '0',
    }
  }, [swapCallback, quote])

  return (
    <SwapFormContextProvider
      slippage={slippage}
      typedValue={typedValue}
      recipient={null}
      routeSummary={routeSummary}
      isStablePairSwap={false}
      isCorrelatedPair={false}
      isAdvancedMode={isDegenMode}
    >
      <Box sx={{ flexDirection: 'column', gap: '16px', display: hidden ? 'none' : 'flex' }}>
        <Wrapper id={TutorialIds.SWAP_FORM_CONTENT}>
          <Flex flexDirection="column" sx={{ gap: '0.75rem' }}>
            {omniView ? <NetworkSelector chainId={chainId} /> : null}

            <Flex flexDirection="column" sx={{ gap: '0.5rem' }}>
              <InputCurrencyPanel
                wrapType={WrapType.NOT_APPLICABLE}
                typedValue={typedValue}
                setTypedValue={onUserInput}
                currencyIn={currencyIn}
                currencyOut={currencyOut}
                balanceIn={balanceIn}
                onChangeCurrencyIn={onChangeCurrencyIn}
                customChainId={customChainId}
              />

              <ReverseTokenSelectionButton
                onClick={() => {
                  if (currencyIn && quote) {
                    onChangeCurrencyOut(currencyIn)
                    onUserInput(quote.amountOut)
                  }
                }}
              />

              <OutputCurrencyPanel
                wrapType={WrapType.NOT_APPLICABLE}
                parsedAmountIn={parsedAmount}
                parsedAmountOut={quote ? CurrencyAmount.fromRawAmount(currencyOut!, quote.amountOut) : undefined}
                currencyIn={currencyIn}
                currencyOut={currencyOut}
                amountOutUsd="0"
                onChangeCurrencyOut={onChangeCurrencyOut}
                customChainId={customChainId}
              />
            </Flex>

            <SlippageSettingGroup
              isStablePairSwap={false}
              isCorrelatedPair={false}
              isWrapOrUnwrap={false}
            />
          </Flex>
        </Wrapper>

        <Flex flexDirection="column" style={{ gap: '1.25rem' }}>
          {showPriceImpactWarning && (
            <Flex
              sx={{
                borderRadius: '1rem',
                background: rgba(theme.warning, 0.3),
                padding: '10px 12px',
                gap: '8px',
              }}
            >
              <WarningIcon color={theme.warning} size={20} />
              <Text fontSize={14} flex={1}>
                {showPriceImpactError
                  ? 'Price impact is too high. You may receive significantly less tokens.'
                  : 'Price impact is high. You may receive significantly less tokens than expected.'}
              </Text>
            </Flex>
          )}

          {quoteError && (
            <Flex
              sx={{
                borderRadius: '1rem',
                background: rgba(theme.red, 0.3),
                padding: '10px 12px',
                gap: '8px',
              }}
            >
              <WarningIcon color={theme.red} size={20} />
              <Text fontSize={14} flex={1}>
                {quoteError}
              </Text>
            </Flex>
          )}

          <SwapActionButton
            isGettingRoute={quoteLoading}
            parsedAmountFromTypedValue={parsedAmount}
            balanceIn={balanceIn}
            balanceOut={balanceOut}
            isDegenMode={isDegenMode}
            typedValue={typedValue}
            currencyIn={currencyIn}
            currencyOut={currencyOut}
            isProcessingSwap={isProcessingSwap}
            setProcessingSwap={setProcessingSwap}
            wrapType={WrapType.NOT_APPLICABLE}
            routeSummary={routeSummary}
            buildRoute={buildRoute}
            onWrap={handleSwap}
            swapInputError={swapInputError}
            customChainId={customChainId}
          />
        </Flex>
      </Box>
    </SwapFormContextProvider>
  )
}

export default OpenOceanSwapForm
