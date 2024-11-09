import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../state/hooks'
import { setRecipient } from '../state/swap/slice'

export default function useRecipientHandler() {
  const dispatch = useAppDispatch()
  const recipient = useAppSelector(state => state.swap.recipient)

  const onChangeRecipient = useCallback((value: string | null) => {
    dispatch(setRecipient({ recipient: value }))
  }, [dispatch])

  const onClearRecipient = useCallback(() => {
    dispatch(setRecipient({ recipient: null }))
  }, [dispatch])

  return {
    recipient,
    onChangeRecipient,
    onClearRecipient,
  }
}
