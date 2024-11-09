import { rgba } from 'polished'
import React from 'react'
import styled from 'styled-components'
import useTheme from 'hooks/useTheme'

const Button = styled.button`
  width: 32px;
  height: 32px;
  background: ${({ theme }) => rgba(theme.buttonGray, 0.4)};
  border: 4px solid ${({ theme }) => theme.background};
  border-radius: 50%;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -16px auto;
  z-index: 2;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => rgba(theme.buttonGray, 0.6)};
    transform: rotate(180deg);
  }

  &:active {
    transform: scale(0.9) rotate(180deg);
  }

  svg {
    color: ${({ theme }) => theme.text};
  }
`

interface Props {
  onClick: () => void
}

const ReverseTokenSelectionButton: React.FC<Props> = ({ onClick }) => {
  const theme = useTheme()
  
  return (
    <Button onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 4L12 20M12 4L8 8M12 4L16 8M12 20L8 16M12 20L16 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Button>
  )
}

export default ReverseTokenSelectionButton
