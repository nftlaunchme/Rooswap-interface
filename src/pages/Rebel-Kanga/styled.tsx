import styled from 'styled-components'
import { Text } from 'rebass'

export const NFTCard = styled.div`
  background: ${({ theme }) => theme.background};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease;
  cursor: pointer;
  font-family: 'Inter', sans-serif;

  &:hover {
    transform: translateY(-4px);
  }
`

export const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 24px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  `}
`

export const NFTImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 12px;
  aspect-ratio: 1;
  object-fit: cover;
`

export const NFTTitle = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.01em;
`

export const NFTDescription = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.subText};
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
`

export const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${({ theme }) => theme.buttonBlack};
  border-radius: 12px;
  margin-top: 24px;
`

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

export const StatValue = styled(Text)`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.01em;
`

export const StatLabel = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.subText};
  font-family: 'Inter', sans-serif;
`

export const ActionButton = styled.button<{ $active?: boolean }>`
  padding: 12px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: ${({ theme, $active }) => ($active ? theme.primary : theme.buttonBlack)};
  color: ${({ theme, $active }) => ($active ? theme.textReverse : theme.text)};
  transition: all 0.2s ease;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 0.02em;

  &:hover {
    filter: brightness(1.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`
