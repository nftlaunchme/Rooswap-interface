import { Currency, CurrencyAmount } from '../../types/currency'
import { DetailedRouteSummary } from '../../types/route'
import { WrapType } from '../../state/swap/types'

export interface SwapFormProps {
  hidden?: boolean
  currencyIn?: Currency
  currencyOut?: Currency
  balanceIn?: CurrencyAmount<Currency>
  balanceOut?: CurrencyAmount<Currency>
  onChangeCurrencyIn: (currency: Currency) => void
  onChangeCurrencyOut: (currency: Currency) => void
  customChainId?: number
  omniView?: boolean
  onOpenGasToken?: () => void
}

export interface InputCurrencyPanelProps {
  typedValue: string
  setTypedValue: (value: string) => void
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  balanceIn: CurrencyAmount<Currency> | undefined
  onChangeCurrencyIn: (currency: Currency) => void
  customChainId?: number
}

export interface OutputCurrencyPanelProps {
  parsedAmountIn: CurrencyAmount<Currency> | undefined
  parsedAmountOut: CurrencyAmount<Currency> | undefined
  currencyIn: Currency | undefined
  currencyOut: Currency | undefined
  amountOutUsd: string | undefined
  onChangeCurrencyOut: (currency: Currency) => void
  customChainId?: number
}

export interface SwapActionButtonProps {
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

export interface TradeSummaryProps {
  routeSummary: DetailedRouteSummary | undefined
  slippage: number
  disableRefresh: boolean
  refreshCallback: () => void
}

export interface SlippageSettingGroupProps {
  isWrapOrUnwrap: boolean
  isStablePairSwap: boolean
  isCorrelatedPair: boolean
  onOpenGasToken?: () => void
}

export interface SwapFormContextProps {
  slippage: number
  routeSummary: DetailedRouteSummary | undefined
  typedValue: string
  recipient: string | null
  isStablePairSwap: boolean
  isCorrelatedPair: boolean
  isAdvancedMode: boolean
}

export interface DetailedRouteSummaryExtended extends DetailedRouteSummary {
  parsedAmountOut: CurrencyAmount<Currency>
  amountOutUsd?: string
}
