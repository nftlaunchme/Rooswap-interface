import { Currency as KyberCurrency } from '@kyberswap/ks-sdk-core'
import React, { useCallback } from 'react'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { OutputCurrencyPanelProps } from './types'
import { convertToKyberCurrency, convertFromKyberCurrency } from '../../utils/currencyConverter'

const OutputCurrencyPanel: React.FC<OutputCurrencyPanelProps> = ({
  parsedAmountOut,
  currencyIn,
  currencyOut,
  amountOutUsd,
  onChangeCurrencyOut,
  customChainId,
}) => {
  const handleCurrencySelect = useCallback((currency: KyberCurrency) => {
    onChangeCurrencyOut(convertFromKyberCurrency(currency)!)
  }, [onChangeCurrencyOut])

  return (
    <CurrencyInputPanel
      value={parsedAmountOut ? parsedAmountOut.toSignificant(6) : '0'}
      onCurrencySelect={handleCurrencySelect}
      currency={convertToKyberCurrency(currencyOut)}
      otherCurrency={convertToKyberCurrency(currencyIn)}
      id="swap-currency-output"
      showCommonBases={true}
      customChainId={customChainId}
      estimatedUsd={amountOutUsd}
      disabledInput
      onMax={null}
      onHalf={null}
    />
  )
}

export default OutputCurrencyPanel
