import { useMemo } from 'react'

export function useSwapFormRecipient(recipient: string | null, isDegenMode: boolean) {
  const recipientForContext = recipient
  const recipientForBuildRoute = useMemo(() => {
    if (!isDegenMode || !recipient) return ''
    return recipient
  }, [isDegenMode, recipient])

  return {
    recipientForContext,
    recipientForBuildRoute,
  }
}
