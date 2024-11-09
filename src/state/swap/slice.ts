import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Field, SwapState } from './types'

export enum WrapType {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  WRAP = 'WRAP',
  UNWRAP = 'UNWRAP'
}

const initialState: SwapState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: undefined
  },
  [Field.OUTPUT]: {
    currencyId: undefined
  },
  recipient: null,
  slippage: 50, // 0.5%
  deadline: 20 * 60, // 20 minutes
  lastQuote: null
}

export const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    selectCurrency: (
      state,
      action: PayloadAction<{
        field: Field
        currencyId: string | undefined
      }>
    ) => {
      const { field, currencyId } = action.payload
      state[field].currencyId = currencyId
    },
    switchCurrencies: (state) => {
      const inputCurrencyId = state[Field.INPUT].currencyId
      state[Field.INPUT].currencyId = state[Field.OUTPUT].currencyId
      state[Field.OUTPUT].currencyId = inputCurrencyId
    },
    typeInput: (
      state,
      action: PayloadAction<{
        field: Field
        typedValue: string
      }>
    ) => {
      const { field, typedValue } = action.payload
      state.independentField = field
      state.typedValue = typedValue
    },
    setRecipient: (state, action: PayloadAction<{ recipient: string | null }>) => {
      state.recipient = action.payload.recipient
    },
    setSlippage: (state, action: PayloadAction<{ slippage: number }>) => {
      state.slippage = action.payload.slippage
    },
    setDeadline: (state, action: PayloadAction<{ deadline: number }>) => {
      state.deadline = action.payload.deadline
    },
    setLastQuote: (
      state,
      action: PayloadAction<{
        timestamp: number
        inAmount: string
        outAmount: string
        route: string[]
      } | null>
    ) => {
      state.lastQuote = action.payload
    },
    resetSwapState: (state) => {
      return {
        ...initialState,
        [Field.INPUT]: {
          currencyId: state[Field.INPUT].currencyId
        },
        [Field.OUTPUT]: {
          currencyId: state[Field.OUTPUT].currencyId
        }
      }
    }
  }
})

export const {
  selectCurrency,
  switchCurrencies,
  typeInput,
  setRecipient,
  setSlippage,
  setDeadline,
  setLastQuote,
  resetSwapState
} = swapSlice.actions

export default swapSlice.reducer
