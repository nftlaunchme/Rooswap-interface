import { rgba } from 'polished'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as RoutingIcon } from 'assets/svg/routing-icon.svg'
import AddressInputPanel from 'components/AddressInputPanel'
import FeeControlGroup from 'components/FeeControlGroup'
import WarningIcon from 'components/Icons/WarningIcon'
import { NetworkSelector } from 'components/NetworkSelector'
import InputCurrencyPanel from './InputCurrencyPanel'
import OutputCurrencyPanel from './OutputCurrencyPanel'
import PriceImpactNote from './PriceImpactNote'
import SlippageSettingGroup from './SlippageSettingGroup'
import { SwapFormContextProvider } from './SwapFormContext'
import useCheckStablePairSwap from './hooks/useCheckStablePairSwap'
import useGetInputError from './hooks/useGetInputError'
import { TutorialIds } from 'components/Tutorial/TutorialSwap/constant'
import { TOKEN_API_URL } from 'constants/env'
import { useActiveWeb3React } from 'hooks'
import useTheme from 'hooks/useTheme'
import { Field } from 'state/swap/types'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setRecipient, typeInput, WrapType } from 'state/swap/slice'
import { useOpenOceanSwapForm } from 'hooks/useOpenOceanSwapForm'
import { Currency, CurrencyAmount } from 'types/currency'
import { adaptAnyCurrency, adaptAnyToCurrencyAmount, stringToCurrencyAmount } from 'utils/currency'
import useParsedAmount from 'hooks/useParsedAmount'
import { SwapFormProps } from './types'
import ReverseTokenSelectionButton from './ReverseTokenSelectionButton'
import SwapActionButton from './SwapActionButton'
import TradeSummary from './TradeSummary'

const SwapFormWrapper = styled(Box)`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.background};
  border-radius: 24px;
  padding: 20px;
  position: relative;
  color: ${({ theme }) => theme.text};
`

const SwapFormInner = styled(Flex)`
  flex-direction: column;
  gap: 16px;
`

const SwapFormContent = styled(Flex)`
  flex-direction: column;
  gap: 12px;
`

const SwapFormHeader = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => rgba(theme.border, 0.1)};
`

const SwapFormTitle = styled(Text)`
  font-size: 20px;
  font-weight: 500;
`

const SwapForm: React.FC<SwapFormProps> = props => {
  const { chainId: walletChainId } = useActiveWeb3React()
  const chainId = props.customChainId || walletChainId
  const dispatch = useAppDispatch()

  const {
    hidden,
    currencyIn,
    currencyOut,
    balanceIn,
    balanceOut,
    onChangeCurrencyIn,
    onChangeCurrencyOut,
    customChainId,
    omniView,
    onOpenGasToken,
  } = props

  const [isProcessingSwap, setProcessingSwap] = useState(false)
  const swapState = useAppSelector(state => state.swap)
  const { typedValue } = swapState
  const recipient = swapState.recipient
  const slippage = (swapState as any).slippage || 50 // Default to 0.5%

  const onUserInput = useCallback(
    (value: string) => {
      dispatch(typeInput({ field: Field.INPUT, typedValue: value }))
    },
    [dispatch],
  )

  const adaptedCurrencyIn = useMemo(() => adaptAnyCurrency(currencyIn), [currencyIn])
  const adaptedCurrencyOut = useMemo(() => adaptAnyCurrency(currencyOut), [currencyOut])
  const adaptedBalanceIn = useMemo(() => balanceIn && adaptAnyToCurrencyAmount(balanceIn), [balanceIn])
  const adaptedBalanceOut = useMemo(() => balanceOut && adaptAnyToCurrencyAmount(balanceOut), [balanceOut])

  const parsedAmount = useParsedAmount(adaptedCurrencyIn, typedValue)
  const isStablePairSwap = useCheckStablePairSwap(adaptedCurrencyIn, adaptedCurrencyOut)
  const isCorrelatedPair = false // Removed KyberSwap correlation check
  const isWrapOrUnwrap = false // No wrapping in OpenOcean implementation

  // OpenOcean integration
  const {
    isLoading: openOceanLoading,
    routeSummary: openOceanRouteSummary,
    buildRoute: openOceanBuildRoute,
    error: openOceanError,
  } = useOpenOceanSwapForm(adaptedCurrencyIn, adaptedCurrencyOut, parsedAmount, slippage)

  const swapInputError = useGetInputError({
    currencyIn: adaptedCurrencyIn,
    currencyOut: adaptedCurrencyOut,
    typedValue,
    recipient: recipient,
    balanceIn: adaptedBalanceIn,
    parsedAmountFromTypedValue: parsedAmount,
  })

  const theme = useTheme()

  const [honeypot, setHoneypot] = useState<{ isHoneypot: boolean; isFOT: boolean; tax: number } | null>(null)

  useEffect(() => {
    if (!adaptedCurrencyOut) return
    fetch(
      `${TOKEN_API_URL}/v1/public/tokens/honeypot-fot-info?address=${adaptedCurrencyOut.getAddress().toLowerCase()}&chainId=${chainId}`,
    )
      .then(res => res.json())
      .then(res => {
        setHoneypot(res.data)
      })
  }, [adaptedCurrencyOut, chainId])

  const handleRecipientChange = useCallback((value: string | null) => {
    dispatch(setRecipient({ recipient: value }))
  }, [dispatch])

  const handleChangeCurrencyIn = useCallback((c: any) => {
    const adapted = adaptAnyCurrency(c)
    if (adapted) onChangeCurrencyIn(adapted)
  }, [onChangeCurrencyIn])

  const handleChangeCurrencyOut = useCallback((c: any) => {
    const adapted = adaptAnyCurrency(c)
    if (adapted) onChangeCurrencyOut(adapted)
  }, [onChangeCurrencyOut])

  const refreshCallback = useCallback(() => {
    // OpenOcean refreshes automatically via the useEffect in useOpenOceanQuote
  }, [])

  const finalSwapInputError = useMemo(() => {
    return (swapInputError || openOceanError || undefined) as string | undefined
  }, [swapInputError, openOceanError])

  const handleReverseTokens = useCallback(() => {
    if (adaptedCurrencyIn && openOceanRouteSummary?.parsedAmountOut) {
      handleChangeCurrencyOut(adaptedCurrencyIn)
      // Convert the CurrencyAmount to a string for the input
      const value = openOceanRouteSummary.parsedAmountOut.toSignificant(6)
      dispatch(typeInput({ field: Field.INPUT, typedValue: value }))
    }
  }, [adaptedCurrencyIn, handleChangeCurrencyOut, openOceanRouteSummary, dispatch])

  if (hidden) return null

  return (
    <SwapFormWrapper>
      <SwapFormInner>
        <SwapFormHeader>
          <SwapFormTitle>Swap</SwapFormTitle>
          {omniView && <NetworkSelector chainId={chainId} />}
        </SwapFormHeader>

        <SwapFormContent>
          <InputCurrencyPanel
            typedValue={typedValue}
            setTypedValue={onUserInput}
            currencyIn={adaptedCurrencyIn}
            currencyOut={adaptedCurrencyOut}
            balanceIn={adaptedBalanceIn}
            onChangeCurrencyIn={handleChangeCurrencyIn}
            customChainId={customChainId}
          />

          <ReverseTokenSelectionButton onClick={handleReverseTokens} />

          <OutputCurrencyPanel
            parsedAmountIn={parsedAmount}
            parsedAmountOut={openOceanRouteSummary?.parsedAmountOut}
            currencyIn={adaptedCurrencyIn}
            currencyOut={adaptedCurrencyOut}
            amountOutUsd={openOceanRouteSummary?.amountOutUsd}
            onChangeCurrencyOut={handleChangeCurrencyOut}
            customChainId={customChainId}
          />

          <AddressInputPanel id="recipient" value={recipient} onChange={handleRecipientChange} />
          
          <SlippageSettingGroup
            isWrapOrUnwrap={isWrapOrUnwrap}
            isStablePairSwap={isStablePairSwap}
            isCorrelatedPair={isCorrelatedPair}
            onOpenGasToken={onOpenGasToken}
          />

          <FeeControlGroup />

          <TradeSummary
            routeSummary={openOceanRouteSummary}
            slippage={slippage}
            disableRefresh={!parsedAmount || parsedAmount.equalTo('0') || isProcessingSwap}
            refreshCallback={refreshCallback}
          />

          {(honeypot?.isFOT || honeypot?.isHoneypot) && (
            <Flex
              sx={{
                borderRadius: '16px',
                background: rgba(theme.warning, 0.1),
                padding: '12px',
                gap: '8px',
              }}
            >
              <WarningIcon color={theme.warning} size={20} />
              <Text fontSize={14} flex={1}>
                {honeypot.isHoneypot
                  ? `Our simulation detects that ${adaptedCurrencyOut?.symbol} token can not be sold immediately or has an extremely high sell fee after being bought, please check further before buying!`
                  : `Our simulation detects that ${adaptedCurrencyOut?.symbol} has ${
                      honeypot.tax * 100
                    }% fee on transfer, please check further before buying.`}
              </Text>
            </Flex>
          )}

          <PriceImpactNote priceImpact={openOceanRouteSummary?.priceImpact} showLimitOrderLink />

          <SwapActionButton
            isGettingRoute={openOceanLoading}
            parsedAmountFromTypedValue={parsedAmount}
            balanceIn={adaptedBalanceIn}
            balanceOut={adaptedBalanceOut}
            typedValue={typedValue}
            currencyIn={adaptedCurrencyIn}
            currencyOut={adaptedCurrencyOut}
            routeSummary={openOceanRouteSummary}
            isProcessingSwap={isProcessingSwap}
            setProcessingSwap={setProcessingSwap}
            buildRoute={openOceanBuildRoute}
            swapInputError={finalSwapInputError}
            customChainId={customChainId}
            isDegenMode={false}
            wrapInputError={undefined}
            wrapType={WrapType.NOT_APPLICABLE}
            onWrap={undefined}
          />
        </SwapFormContent>
      </SwapFormInner>
    </SwapFormWrapper>
  )
}

export default SwapForm
