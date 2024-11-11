import { Trans } from '@lingui/macro'
import { NFTCard as StyledNFTCard, NFTImage, NFTTitle, NFTDescription } from '../styled'

interface NFTCardProps {
  id: string
  image: string
  name: string
  description: string
  onClick?: () => void
}

export default function NFTCard({ id, image, name, description, onClick }: NFTCardProps) {
  return (
    <StyledNFTCard onClick={onClick}>
      <NFTImage src={image} alt={name} />
      <NFTTitle>
        <Trans>#{id} {name}</Trans>
      </NFTTitle>
      <NFTDescription>{description}</NFTDescription>
    </StyledNFTCard>
  )
}
