import { ChainId } from '@kyberswap/ks-sdk-core'
import { Trans, t } from '@lingui/macro'
import { useCallback, useMemo, useState } from 'react'
import { Flex, Text } from 'rebass'
import { useSaveCrossChainTxsMutation } from 'services/crossChain'
import styled from 'styled-components'

import { ReactComponent as ArrowUp } from 'assets/svg/arrow_up.svg'
import { ButtonLight } from 'components/Button'
import CurrencyInputPanelBridge from 'components/CurrencyInputPanel/CurrencyInputPanelBridge'
import { RowBetween } from 'components/Row'
import SlippageWarningNote from 'components/SlippageWarningNote'
import PriceImpactNote from 'components/SwapForm/PriceImpactNote'
import SlippageSetting from 'components/SwapForm/SlippageSetting'
import SwapButtonWithPriceImpact from 'components/SwapForm/SwapActionButton/SwapButtonWithPriceImpact'
import useCheckStablePairSwap from 'components/SwapForm/hooks/useCheckStablePairSwap'
import { formatDurationCrossChain } from 'components/swapv2/AdvancedSwapDetails'
import { AdvancedSwapDetailsDropdownCrossChain } from 'components/swapv2/AdvancedSwapDetailsDropdown'
import { INPUT_DEBOUNCE_TIME, TRANSACTION_STATE_DEFAULT } from 'constants/index'
import { NETWORKS_INFO } from 'constants/networks'
import { getRubicChainName } from 'constants/rubic'
import { useActiveWeb3React, useWeb3React } from 'hooks'
import { captureExceptionCrossChain } from 'hooks/bridge/useBridgeCallback'
import useDebounce from 'hooks/useDebounce'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useTheme from 'hooks/useTheme'
import { useChangeNetwork } from 'hooks/web3/useChangeNetwork'
import { ConfirmCrossChainModal } from 'pages/Bridge/ConfirmBridgeModal'
import ErrorWarningPanel from 'pages/Bridge/ErrorWarning'
import TradeTypeSelection from 'pages/CrossChain/SwapForm/TradeTypeSelection'
import TradePrice from 'pages/CrossChain/TradePrice'
import useGetRubicRoute from 'pages/CrossChain/useGetRubicRoute'
import useValidateInput, { useIsTokensSupport } from 'pages/CrossChain/useValidateInput'
import { RubicService } from 'services/rubic'
import { useWalletModalToggle } from 'state/application/hooks'
import { useCrossChainHandlers, useCrossChainState } from 'state/crossChain/hooks'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { tryParseAmount, useCheckCorrelatedPair } from 'state/swap/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TRANSACTION_TYPE } from 'state/transactions/type'
import { useCrossChainSetting, useDegenModeManager } from 'state/user/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { ExternalLink } from 'theme'
import { TransactionFlowState } from 'types/TransactionFlowState'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { uint256ToFraction } from 'utils/numbers'
import { checkPriceImpact } from 'utils/prices'
import { getTokenAddress } from 'utils/tokenInfo'

const SwapFormWrapper = styled.div`
  width: 100%;
  padding: 1rem;
  background: ${({ theme }) => theme.background};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
`

const ArrowWrapper = styled.div`
  padding: 4px 6px;
  border-radius: 12px;
  height: 32px;
  width: 32px;
  position: relative;
  margin: -14px auto;
  background: ${({ theme }) => theme.buttonBlack};
  border: 4px solid ${({ theme }) => theme.background};
  z-index: 2;
`

const PoweredByWrapper = styled(RowBetween)`
  padding: 8px 0;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin-top: 8px;
`

export default function SwapForm() {
  const { account, chainId } = useActiveWeb3React()
  const { library } = useWeb3React()
  const { changeNetwork } = useChangeNetwork()
  const [isDegenMode] = useDegenModeManager()

  const [
    {
      listTokenIn,
      listChainOut,
      listTokenOut,
      chains,
      currencyIn,
      currencyOut,
      loadingToken,
      chainIdOut,
      inputAmount,
    },
  ] = useCrossChainState()

  const {
    setting: { slippageTolerance },
  } = useCrossChainSetting()
  
  const isPairSupport = useIsTokensSupport()
  const debouncedInput = useDebounce(inputAmount, INPUT_DEBOUNCE_TIME)

  const routeParams = useMemo(() => {
    if (!currencyIn || !currencyOut || !chainIdOut || !Number(debouncedInput) || !isPairSupport) return
    const parseAmount = tryParseAmount(debouncedInput, currencyIn)
    if (!parseAmount) return

    try {
      const fromChain = getRubicChainName(chainId as ChainId)
      const toChain = getRubicChainName(chainIdOut as ChainId)

      return {
        fromAddress: account || undefined,
        fromChain,
        toChain,
        fromToken: currencyIn,
        toToken: currencyOut,
        fromAmount: parseAmount?.quotient.toString() ?? '',
        slippage: slippageTolerance / 100,
      }
    } catch (error) {
      console.error('Chain not supported by Rubic:', error)
      return undefined
    }
  }, [
    currencyIn,
    currencyOut,
    account,
    debouncedInput,
    chainId,
    chainIdOut,
    slippageTolerance,
    isPairSupport,
  ])

  const {
    route,
    getRoute: refreshRoute,
    error: errorGetRoute,
    loading: gettingRoute,
    requestId,
    formatRoute,
  } = useGetRubicRoute(routeParams)

  const { outputAmount, amountUsdIn, amountUsdOut, exchangeRate, priceImpact, duration, totalFeeUsd } = formatRoute
  const { selectCurrencyIn, selectCurrencyOut, selectDestChain, setInputAmount } = useCrossChainHandlers()

  const toggleWalletModal = useWalletModalToggle()
  const theme = useTheme()

  // modal and loading
  const [swapState, setSwapState] = useState<TransactionFlowState>(TRANSACTION_STATE_DEFAULT)

  const inputError = useValidateInput({ inputAmount: debouncedInput, route, errorGetRoute })

  const handleTypeInput = useCallback(
    (value: string) => {
      if (currencyIn) setInputAmount(value)
    },
    [currencyIn, setInputAmount],
  )

  const { mixpanelHandler } = useMixpanel()
  const onTracking = useCallback(
    (type: MIXPANEL_TYPE) => {
      mixpanelHandler(type, {
        input_token: currencyIn?.symbol,
        output_token: currencyOut?.symbol,
        estimated_gas: totalFeeUsd,
        slippage: slippageTolerance,
        price_impact: priceImpact,
        trade_qty: inputAmount,
        advance_mode: isDegenMode ? 'on' : 'off',
        processing_time_est: duration ? formatDurationCrossChain(duration) : 'none',
        source_chain: NETWORKS_INFO[chainId].name,
        destination_chain: chainIdOut && NETWORKS_INFO[chainIdOut].name,
      })
    },
    [
      currencyIn,
      currencyOut,
      duration,
      inputAmount,
      priceImpact,
      mixpanelHandler,
      slippageTolerance,
      totalFeeUsd,
      isDegenMode,
      chainId,
      chainIdOut,
    ],
  )

  const showPreview = () => {
    setSwapState(state => ({ ...state, showConfirm: true, errorMessage: '', txHash: '' }))
    onTracking(MIXPANEL_TYPE.CROSS_CHAIN_SWAP_INIT)
  }

  const hidePreview = useCallback(() => {
    setSwapState(state => ({ ...state, showConfirm: false }))
  }, [])

  const addTransaction = useTransactionAdder()
  const [saveTxsToDb] = useSaveCrossChainTxsMutation()

  const handleSwap = useCallback(async () => {
    if (!library || !route || !inputAmount || !outputAmount || !currencyIn || !currencyOut || !account || !chainId || !chainIdOut) return

    try {
      setSwapState(state => ({ ...state, attemptingTxn: true }))
      onTracking(MIXPANEL_TYPE.CROSS_CHAIN_SWAP_CONFIRMED)

      const fromChain = getRubicChainName(chainId as ChainId)
      const toChain = getRubicChainName(chainIdOut as ChainId)

      const swapParams = {
        srcTokenAddress: getTokenAddress(currencyIn),
        srcTokenAmount: inputAmount,
        srcTokenBlockchain: fromChain,
        dstTokenAddress: getTokenAddress(currencyOut),
        dstTokenBlockchain: toChain,
        fromAddress: account,
        id: requestId
      }

      const swapData = await RubicService.getSwapTransaction(swapParams)
      
      const tx = await library.getSigner().sendTransaction({
        to: swapData.transaction.to,
        data: swapData.transaction.data,
        value: swapData.transaction.value,
      })

      onTracking(MIXPANEL_TYPE.CROSS_CHAIN_TXS_SUBMITTED)
      setInputAmount('')
      setSwapState(state => ({ ...state, attemptingTxn: false, txHash: tx.hash }))

      const tokenAmountOut = getFullDisplayBalance(outputAmount, currencyOut.decimals, 6)
      const tokenAddressIn = getTokenAddress(currencyIn)
      const tokenAddressOut = getTokenAddress(currencyOut)

      addTransaction({
        type: TRANSACTION_TYPE.CROSS_CHAIN_SWAP,
        hash: tx.hash,
        extraInfo: {
          tokenSymbolIn: currencyIn?.symbol ?? '',
          tokenSymbolOut: currencyOut?.symbol ?? '',
          tokenAmountIn: inputAmount,
          tokenAmountOut,
          tokenAddressIn,
          tokenAddressOut,
          tokenLogoURLIn: (currencyIn as WrappedTokenInfo).logoURI,
          tokenLogoURLOut: (currencyOut as WrappedTokenInfo).logoURI,
          chainIdIn: chainId,
          chainIdOut,
          rate: exchangeRate,
        },
      })

      const payload = {
        walletAddress: account,
        srcChainId: chainId + '',
        dstChainId: chainIdOut + '',
        srcTxHash: tx.hash,
        srcTokenAddress: tokenAddressIn,
        dstTokenAddress: tokenAddressOut,
        srcAmount: inputAmount,
        dstAmount: tokenAmountOut,
      }

      saveTxsToDb(payload)
        .unwrap()
        .catch(e => {
          captureExceptionCrossChain(payload, e, 'CrossChain')
        })

    } catch (error: any) {
      console.error('Swap error:', error)
      setSwapState(state => ({ 
        ...state, 
        attemptingTxn: false, 
        errorMessage: error?.message || 'An error occurred while processing your swap' 
      }))
    }
  }, [
    route,
    library,
    chainId,
    chainIdOut,
    currencyIn,
    currencyOut,
    inputAmount,
    outputAmount,
    exchangeRate,
    setInputAmount,
    saveTxsToDb,
    account,
    onTracking,
    requestId,
    addTransaction,
  ])

  const maxAmountInput = useCurrencyBalance(currencyIn)?.toExact()
  const handleMaxInput = useCallback(() => {
    maxAmountInput && setInputAmount(maxAmountInput)
  }, [maxAmountInput, setInputAmount])

  const onCurrencySelect = useCallback(
    (currencyIn: WrappedTokenInfo) => {
      selectCurrencyIn(currencyIn)
    },
    [selectCurrencyIn],
  )
  const onCurrencySelectDest = useCallback(
    (currencyOut: WrappedTokenInfo) => {
      selectCurrencyOut(currencyOut)
    },
    [selectCurrencyOut],
  )
  const onSelectDestNetwork = useCallback(
    (chainId: ChainId) => {
      selectDestChain(chainId)
    },
    [selectDestChain],
  )

  const disableBtnSwap =
    !!inputError || [debouncedInput, currencyIn, currencyOut, chainIdOut].some(e => !e) || gettingRoute

  const priceImpactResult = checkPriceImpact(priceImpact)
  const isStablePairSwap = useCheckStablePairSwap(currencyIn, currencyOut)
  const isCorrelatedPair = useCheckCorrelatedPair()

  return (
    <>
      <SwapFormWrapper>
        <CurrencyInputPanelBridge
          tooltipNotSupportChain={t`Rubic doesn't support this chain`}
          isCrossChain
          loadingToken={loadingToken}
          tokens={listTokenIn}
          currency={currencyIn as WrappedTokenInfo}
          chainIds={chains}
          selectedChainId={chainId}
          onSelectNetwork={changeNetwork}
          value={inputAmount}
          onUserInput={handleTypeInput}
          onMax={handleMaxInput}
          onCurrencySelect={onCurrencySelect}
          id="swap-currency-input"
          dataTestId="swap-currency-input"
          usdValue={amountUsdIn ?? ''}
        />

        <Flex justifyContent="space-between" alignItems={'center'} marginY="1rem" position="relative">
          <TradePrice route={route} refresh={refreshRoute} disabled={swapState.showConfirm} loading={gettingRoute} />
          <ArrowWrapper>
            <ArrowUp fill={theme.subText} width={14} height={14} />
          </ArrowWrapper>
        </Flex>

        <CurrencyInputPanelBridge
          tooltipNotSupportChain={t`Rubic doesn't support this chain`}
          isCrossChain
          isOutput
          loadingToken={loadingToken}
          tokens={listTokenOut}
          currency={currencyOut as WrappedTokenInfo}
          chainIds={listChainOut}
          onSelectNetwork={onSelectDestNetwork}
          selectedChainId={chainIdOut}
          value={
            currencyOut && outputAmount
              ? uint256ToFraction(outputAmount, currencyOut?.decimals).toSignificant(currencyOut?.decimals)
              : ''
          }
          onCurrencySelect={onCurrencySelectDest}
          id="swap-currency-output"
          dataTestId="swap-currency-output"
          usdValue={amountUsdOut ?? ''}
        />

        <Flex flexDirection="column" gap="12px" marginTop="1rem">
          <SlippageSetting
            isCorrelatedPair={isCorrelatedPair}
            isStablePairSwap={isStablePairSwap}
          />

          <TradeTypeSelection />

          <SlippageWarningNote
            rawSlippage={slippageTolerance}
            isStablePairSwap={isStablePairSwap}
            isCorrelatedPair={isCorrelatedPair}
          />

          {!!priceImpact && <PriceImpactNote priceImpact={Number(priceImpact)} isDegenMode={isDegenMode} />}

          {inputError?.state && !inputError?.insufficientFund && (
            <ErrorWarningPanel title={inputError?.tip} type={inputError?.state} desc={inputError?.desc} />
          )}

          {account ? (
            <SwapButtonWithPriceImpact
              onClick={showPreview}
              disabled={disableBtnSwap}
              showLoading={gettingRoute}
              priceImpact={priceImpact}
              isProcessingSwap={swapState.attemptingTxn}
              isApproved={true}
              route={route}
              minimal={false}
              showNoteGetRoute={priceImpactResult.isHigh || priceImpactResult.isVeryHigh || priceImpactResult.isInvalid}
              disabledText={(inputError?.insufficientFund ? inputError?.tip : '') || t`Swap`}
              showTooltipPriceImpact={false}
            />
          ) : (
            <ButtonLight onClick={toggleWalletModal}>
              <Trans>Connect</Trans>
            </ButtonLight>
          )}

          <AdvancedSwapDetailsDropdownCrossChain route={route} />

          <PoweredByWrapper>
            <Flex
              alignItems={'center'}
              color={theme.subText}
              fontSize={12}
              fontWeight={500}
              opacity={0.5}
              sx={{ gap: '4px' }}
            >
              Powered by
              <ExternalLink href="https://rubic.exchange/" style={{ width: 'fit-content' }}>
                <Text color={theme.primary}>Rubic</Text>
              </ExternalLink>
            </Flex>
            <Text color={theme.primary} style={{ cursor: 'pointer', fontSize: 12, fontWeight: '500' }}>
              <ExternalLink href="https://docs.kyberswap.com/kyberswap-solutions/kyberswap-interface/user-guides/swap-between-different-tokens-across-chains">
                <Trans>Guide</Trans>
              </ExternalLink>
            </Text>
          </PoweredByWrapper>
        </Flex>
      </SwapFormWrapper>

      <ConfirmCrossChainModal route={route} swapState={swapState} onDismiss={hidePreview} onSwap={handleSwap} />
    </>
  )
}
