import React from 'react'

interface Props {
  priceImpact?: string
  showLimitOrderLink?: boolean
}

const PriceImpactNote: React.FC<Props> = ({ priceImpact, showLimitOrderLink }) => {
  if (!priceImpact) return null

  const priceImpactNumber = parseFloat(priceImpact)
  const isHighImpact = priceImpactNumber > 15
  const isMediumImpact = priceImpactNumber > 5 && priceImpactNumber <= 15

  return (
    <div>
      {isHighImpact && (
        <div>
          Price Impact Warning: High impact ({priceImpact}%)
          {showLimitOrderLink && (
            <div>
              Consider using a limit order to get better pricing
            </div>
          )}
        </div>
      )}
      {isMediumImpact && (
        <div>
          Price Impact Note: Medium impact ({priceImpact}%)
        </div>
      )}
    </div>
  )
}

export default PriceImpactNote
