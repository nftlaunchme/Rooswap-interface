import { Currency as KyberCurrency } from '@kyberswap/ks-sdk-core'
import React, { useCallback } from 'react'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { InputCurrencyPanelProps } from './types'
import { convertToKyberCurrency, convertFromKyberCurrency } from '../../utils/currencyConverter'

const InputCurrencyPanel: React.FC<InputCurrencyPanelProps> = ({
  typedValue,
  setTypedValue,
  currencyIn,
  currencyOut,
  balanceIn,
  onChangeCurrencyIn,
  customChainId,
}) => {
  const handleCurrencySelect = useCallback((currency: KyberCurrency) => {
    onChangeCurrencyIn(convertFromKyberCurrency(currency)!)
  }, [onChangeCurrencyIn])

  return (
    <CurrencyInputPanel
      value={typedValue}
      onUserInput={setTypedValue}
      onCurrencySelect={handleCurrencySelect}
      currency={convertToKyberCurrency(currencyIn)}
      otherCurrency={convertToKyberCurrency(currencyOut)}
      id="swap-currency-input"
      showCommonBases={true}
      customChainId={customChainId}
      customBalanceText={balanceIn?.toSignificant(10)}
      onMax={() => {
        if (balanceIn) {
          setTypedValue(balanceIn.toExact())
        }
      }}
      onHalf={() => {
        if (balanceIn) {
          const half = parseFloat(balanceIn.toExact()) / 2
          setTypedValue(half.toString())
        }
      }}
    />
  )
}

export default InputCurrencyPanel
