import React from 'react'
import { Currency, CurrencyAmount } from '../../../types/currency'
import { DetailedRouteSummary } from '../../../types/route'
import { WrapType } from '../../../state/swap/slice'

interface Props {
  isGettingRoute: boolean
  parsedAmountFromTypedValue: CurrencyAmount<Currency> | undefined
  balanceIn: CurrencyAmount<Currency> | undefined
  balanceOut: CurrencyAmount<Currency> | undefined
  typedValue: string
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  routeSummary: DetailedRouteSummary | undefined
  isProcessingSwap: boolean
  setProcessingSwap: (processing: boolean) => void
  buildRoute: () => Promise<{ error: string }>
  swapInputError: string | undefined
  customChainId?: number
  isDegenMode: boolean
  wrapInputError: string | undefined
  wrapType: WrapType
  onWrap: (() => Promise<void>) | undefined
}

const SwapActionButton: React.FC<Props> = ({
  isGettingRoute,
  parsedAmountFromTypedValue,
  balanceIn,
  balanceOut,
  typedValue,
  currencyIn,
  currencyOut,
  routeSummary,
  isProcessingSwap,
  setProcessingSwap,
  buildRoute,
  swapInputError,
  customChainId,
  isDegenMode,
  wrapInputError,
  wrapType,
  onWrap,
}) => {
  const handleClick = async () => {
    if (isProcessingSwap) return
    setProcessingSwap(true)
    try {
      if (wrapType !== WrapType.NOT_APPLICABLE && onWrap) {
        await onWrap()
      } else {
        const { error } = await buildRoute()
        if (error) {
          console.error('Swap error:', error)
        }
      }
    } finally {
      setProcessingSwap(false)
    }
  }

  let buttonText = 'Swap'
  if (isGettingRoute) buttonText = 'Loading...'
  else if (swapInputError) buttonText = swapInputError
  else if (wrapInputError) buttonText = wrapInputError
  else if (isProcessingSwap) buttonText = 'Processing...'

  const disabled = Boolean(
    isGettingRoute ||
    swapInputError ||
    wrapInputError ||
    isProcessingSwap ||
    !parsedAmountFromTypedValue ||
    !currencyIn ||
    !currencyOut ||
    (!routeSummary && wrapType === WrapType.NOT_APPLICABLE)
  )

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: '20px',
        fontSize: '16px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {buttonText}
    </button>
  )
}

export default SwapActionButton
