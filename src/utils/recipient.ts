/**
 * Convert recipient from string | null to string | undefined
 * Used to handle type conversion between AddressInputPanel and buildRoute
 */
export const convertRecipient = (recipient: string | null | undefined): string | undefined => {
  if (!recipient) return undefined
  return recipient
}
