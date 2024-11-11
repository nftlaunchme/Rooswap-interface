import { useCallback, useMemo, useState } from 'react'
import { Box, Flex, Text } from 'rebass'
import { rgba } from 'polished'
import { CurrencyAmount as KyberCurrencyAmount } from '@kyberswap/ks-sdk-core'

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
import { useOpenOceanQuote, useOpenOceanSwapCallback } from 'hooks/useOpenOceanSwap'
import useParsedAmount from 'components/SwapForm/hooks/useParsedAmount'
import WarningIcon from 'components/Icons/WarningIcon'
import { useWalletModalToggle } from 'state/application/hooks'
import { WrapType } from 'state/swap/types'
import { OpenOceanDetailedRouteSummary, OpenOceanBuildRouteResult, OpenOceanSwapCallbackState } from 'types/openocean'
import { convertFromKyberCurrency, convertToKyberCurrency, ExtendedCurrencyAmount, convertFromKyberCurrencyAmount } from 'utils/currencyConverter'
import { Currency, CurrencyAmount } from 'types/currency'
import { ChargeFeeBy } from 'types/route'

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
  const parsedAmountExtended = parsedAmount ? ExtendedCurrencyAmount.fromRaw(currencyIn!, parsedAmount.quotient.toString()) : undefined

  const kyberCurrencyIn = convertToKyberCurrency(currencyIn)
  const kyberCurrencyOut = convertToKyberCurrency(currencyOut)
  const kyberParsedAmount = parsedAmountExtended && kyberCurrencyIn 
    ? KyberCurrencyAmount.fromRawAmount(kyberCurrencyIn, parsedAmountExtended.quotient.toString()) 
    : undefined

  const { loading: quoteLoading, quote, error: quoteError } = useOpenOceanQuote(
    currencyIn,
    currencyOut,
    parsedAmountExtended,
    slippage,
  )

  const { swap: swapCallback, error: swapCallbackError } = useOpenOceanSwapCallback(
    currencyIn,
    currencyOut,
    parsedAmountExtended,
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
      await swapCallback()
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

  const isValid = !swapInputError

  // Create a detailed route summary for context provider
  const routeSummary: OpenOceanDetailedRouteSummary | undefined = useMemo(() => {
    if (!quote || !currencyOut || !currencyIn) return undefined

    const inputAmount = parsedAmountExtended || ExtendedCurrencyAmount.fromRaw(currencyIn, '0')
    const outputAmount = ExtendedCurrencyAmount.fromRaw(currencyOut, quote.amountOut)
    
    return {
      parsedAmountIn: inputAmount,
      parsedAmountOut: outputAmount,
      priceImpact: quote.priceImpact,
      executionPrice: quote.price,
      gasUsd: quote.gasUsd,
      gasCostUSD: quote.gasUsd,
      amountInUsd: quote.amountInUsd,
      amountOutUsd: quote.amountOutUsd,
      route: quote.route,
      routerAddress: quote.routerAddress,
      openOceanQuote: quote,
      extraFee: {
        chargeFeeBy: ChargeFeeBy.CURRENCY_IN,
        feeAmount: '0',
        feeAmountUsd: '0',
        isInBps: false
      },
      inputAmount,
      outputAmount
    }
  }, [quote, currencyIn, currencyOut, parsedAmountExtended])

  const buildRoute = useCallback(async (): Promise<OpenOceanBuildRouteResult> => {
    if (!swapCallback || !quote) throw new Error('Swap callback not ready')
    return {
      amountIn: parsedAmount?.toExact() || '0',
      amountInUsd: quote.amountInUsd,
      amountOut: quote.amountOut,
      amountOutUsd: quote.amountOutUsd,
      priceImpact: quote.priceImpact,
      executionPrice: quote.price,
      gas: quote.estimatedGas,
      gasUsd: quote.gasUsd,
      extraFee: {
        chargeFeeBy: ChargeFeeBy.CURRENCY_IN,
        feeAmount: '0',
        feeAmountUsd: '0',
        isInBps: false
      },
      route: quote.route,
      routerAddress: quote.routerAddress,
      error: swapCallbackError || '',
      data: '',
      value: '0',
      to: quote.routerAddress
    }
  }, [swapCallback, quote, parsedAmount, swapCallbackError])

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
                parsedAmountIn={parsedAmountExtended}
                parsedAmountOut={quote ? ExtendedCurrencyAmount.fromRaw(currencyOut!, quote.amountOut) : undefined}
                currencyIn={currencyIn}
                currencyOut={currencyOut}
                balanceOut={balanceOut}
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
            parsedAmountFromTypedValue={parsedAmountExtended}
            balanceIn={balanceIn}
            balanceOut={balanceOut}
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
            wrapInputError={undefined}
            customChainId={customChainId}
            isDegenMode={isDegenMode}
          />
        </Flex>
      </Box>
    </SwapFormContextProvider>
  )
}

export default OpenOceanSwapForm
