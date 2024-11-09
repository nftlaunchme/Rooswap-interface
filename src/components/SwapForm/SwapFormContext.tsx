import { createContext, useContext, ReactNode } from 'react'
import { DetailedRouteSummary } from 'types/route'
import { CurrencyAmount, Currency } from 'types/currency'

type SwapFormContextProps = {
  slippage: number
  routeSummary: DetailedRouteSummary | undefined
  typedValue: string
  recipient: string | null
  isStablePairSwap: boolean
  isCorrelatedPair: boolean
  isAdvancedMode: boolean
}

type SwapFormContextProviderProps = SwapFormContextProps & {
  children: ReactNode
}

const SwapFormContext = createContext<SwapFormContextProps | undefined>(undefined)

const SwapFormContextProvider = ({ children, ...props }: SwapFormContextProviderProps) => {
  const contextValue: SwapFormContextProps = props
  return <SwapFormContext.Provider value={contextValue}>{children}</SwapFormContext.Provider>
}

const useSwapFormContext = (): SwapFormContextProps => {
  const context = useContext(SwapFormContext)
  if (!context) {
    throw new Error('hook is used outside of SwapFormContext')
  }

  return context
}

export type { SwapFormContextProps }
export { SwapFormContextProvider, useSwapFormContext }
