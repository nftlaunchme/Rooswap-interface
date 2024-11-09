import { Currency, CurrencyAmount } from '../../types/currency'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}

export enum WrapType {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  WRAP = 'WRAP',
  UNWRAP = 'UNWRAP'
}

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
  readonly recipient: string | null
  readonly slippage: number // in basis points (1 = 0.01%)
  readonly deadline: number // in seconds
  readonly lastQuote: {
    timestamp: number
    inAmount: string
    outAmount: string
    route: string[]
  } | null
}

export interface SwapQuoteParams {
  chainId: number
  fromToken: Currency
  toToken: Currency
  amount: string
  slippage: number
  userAddress: string | null
  recipient: string | null
}

export interface SwapRoute {
  path: string[]
  pairs: string[]
  routerAddress: string
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  executionPrice: string
  priceImpact: string
  gasCost: string
}

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
