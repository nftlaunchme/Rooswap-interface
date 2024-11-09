import React from 'react'
import { DetailedRouteSummary } from 'types/route'
import { SwapFormContextProvider } from './SwapFormContext'

type SwapFormWrapperProps = {
  slippage: number
  routeSummary: DetailedRouteSummary | undefined
  typedValue: string
  recipient: string | undefined | null
  isStablePairSwap: boolean
  isCorrelatedPair: boolean
  isAdvancedMode: boolean
  children: React.ReactNode
}

export const SwapFormWrapper: React.FC<SwapFormWrapperProps> = ({
  slippage,
  routeSummary,
  typedValue,
  recipient,
  isStablePairSwap,
  isCorrelatedPair,
  isAdvancedMode,
  children,
}) => {
  // Convert undefined to null for SwapFormContextProvider
  const recipientValue = recipient === undefined ? null : recipient

  return (
    <SwapFormContextProvider
      slippage={slippage}
      routeSummary={routeSummary}
      typedValue={typedValue}
      recipient={recipientValue}
      isStablePairSwap={isStablePairSwap}
      isCorrelatedPair={isCorrelatedPair}
      isAdvancedMode={isAdvancedMode}
    >
      {children}
    </SwapFormContextProvider>
  )
}
