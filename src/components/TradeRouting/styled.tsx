import styled, { css, keyframes } from 'styled-components'

// Colors and Theme Variables
const primaryColor = '#010725' // Button and box color
const secondaryColor = '#010725' // Same as primaryColor
const textColor = '#FFFFFF' // White text
const backgroundColor = '#0F0F0F' // Dark background
const borderColor = '#2F2F2F' // Dark border
const shadowColor = 'rgba(0, 0, 0, 0.5)' // Subtle shadow
// Removed accentColor as it's no longer needed

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`

// Styled Components
export const StyledContainer = styled.div`
  flex: 1;
  max-height: 100%;
  max-width: 100%;
  margin-left: 0;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${textColor};
  background-color: ${backgroundColor};
  scrollbar-width: thin;
  scrollbar-color: ${borderColor} transparent;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${borderColor};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`

export const Shadow = styled.div`
  position: relative;
  min-height: 0;
  overflow: hidden;
`

export const StyledPercent = styled.div`
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  z-index: 2;
  color: ${textColor};
  background: ${primaryColor};
  padding: 6px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px ${shadowColor};
  animation: ${fadeIn} 0.3s ease-in-out;
`


export const StyledPair = styled.div`
  position: relative;
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const StyledPairLine = styled.div`
  flex: auto;
  min-width: 60px;
  border-bottom: 2px dashed ${borderColor};
  height: 2px;
`

export const StyledWrapToken = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  width: max-content;
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap;
  min-height: 48px;
  border-radius: 12px;
  padding: 0 16px;
  background-color: ${secondaryColor};
  border: 1px solid ${borderColor};
  color: ${textColor};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${primaryColor};
    box-shadow: 0 0 10px ${shadowColor};
  }
`

export const StyledToken = styled.a<{ reverse?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  white-space: nowrap;
  text-decoration: none;
  color: ${textColor};
  ${({ reverse }) =>
    reverse &&
    css`
      flex-direction: row-reverse;
      justify-content: flex-start;
    `}
  padding-bottom: 12px;
  border-bottom: 2px dashed ${borderColor};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${primaryColor};
    color: ${textColor};
  }

  & > span {
    margin-left: 10px;
    margin-right: 10px;
  }
`

export const StyledRoutes = styled.div`
  margin: auto;
  width: 100%;
  position: relative;
  padding: 32px 16px 0;
`

export const StyledRoute = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
  align-items: center;

  &:before,
  &:after {
    content: '';
    display: block;
    border-left: 2px dashed ${borderColor};
    width: 100%;
    height: calc(50% + 32px);
    position: absolute;
    box-sizing: border-box;
    pointer-events: none;
  }

  &:before {
    top: -32px;
  }

  &:after {
    bottom: -16px;
  }

  &:last-child:after {
    display: none;
  }
`

export const StyledRouteLine = styled.div`
  position: absolute;
  border-bottom: 2px dashed ${borderColor};
  width: calc(100% - 100px);
  left: 60px;
`

export const StyledHops = styled.div<{ length: string | number }>`
  z-index: 1;
  display: flex;
  align-items: center;
`

export const StyledHop = styled.div`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${borderColor};
  height: fit-content;
  position: relative;
  flex: 0 0 180px;
  margin: auto;
  background-color: ${secondaryColor};
  color: ${textColor};
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 2px 6px ${shadowColor};
  animation: ${fadeIn} 0.3s ease-in-out;

  &:hover {
    border-color: ${primaryColor};
    box-shadow: 0 4px 8px ${shadowColor};
    transform: translateY(-4px);
  }
`

export const StyledExchange = styled.a`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0;
  margin-top: 8px;
  font-size: 14px;
  border-radius: 8px;
  color: ${textColor};
  line-height: 20px;
  white-space: nowrap;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: ${textColor};
    transform: translateX(4px);
  }

  &:before {
    content: '';
    position: absolute;
    left: 0;
    width: 2px;
    height: 100%;
    background: ${primaryColor};
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover:before {
    opacity: 1;
  }

  & > .img--sm {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  &:first-child {
    margin-top: 16px;
  }
`

export const StyledExchangeStatic = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0;
  margin-top: 8px;
  font-size: 14px;
  color: ${textColor};
  line-height: 20px;
  white-space: nowrap;

  & > .img--sm {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  &:first-child {
    margin-top: 16px;
  }
`

export const StyledWrap = styled.div`
  width: calc(100% - 100px);
  margin: 16px 0 16px 12px;
`

export const StyledHopChevronRight = styled.div`
  width: 0;
  height: 0;
  border-top: 14px solid transparent;
  border-bottom: 14px solid transparent;
  border-left: 14px solid ${borderColor};
`

export const StyledHopChevronWrapper = styled.div`
  min-width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`

export const ModernButton = styled.button`
  background-color: ${primaryColor};
  color: ${textColor};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px ${shadowColor};

  &:hover {
    background-color: ${primaryColor};
    border-color: ${primaryColor};
    box-shadow: 0 4px 8px ${shadowColor};
  }

  &:active {
    transform: scale(0.98);
  }
`

export const ModernInput = styled.input`
  background-color: ${backgroundColor};
  border: 1px solid ${borderColor};
  border-radius: 8px;
  color: ${textColor};
  font-size: 14px;
  padding: 10px 12px;
  width: 100%;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${primaryColor};
    box-shadow: 0 0 8px ${primaryColor};
  }

  &::placeholder {
    color: #AAAAAA;
  }
`

export const ModernSelect = styled.select`
  background-color: ${backgroundColor};
  border: 1px solid ${borderColor};
  border-radius: 8px;
  color: ${textColor};
  font-size: 14px;
  padding: 10px 12px;
  width: 100%;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${primaryColor};
    box-shadow: 0 0 8px ${primaryColor};
  }
`

export const ModernTag = styled.span`
  background-color: ${secondaryColor};
  color: ${textColor};
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
  margin-right: 6px;
  margin-bottom: 6px;
`

export const ModernProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${borderColor};
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`

export const ModernProgressFill = styled.div<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: ${primaryColor};
  border-radius: 3px;
  transition: width 0.3s ease;
`

export const ModernTooltip = styled.div`
  position: relative;
  display: inline-block;

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${primaryColor};
    color: ${textColor};
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 2px 4px ${shadowColor};
    opacity: 0;
    animation: ${fadeIn} 0.2s forwards;
  }
`

export const ModernLink = styled.a`
  color: ${textColor};
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;

  &:hover {
    color: ${primaryColor};
  }
`

export const ModernGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
`

export const ModernCard = styled.div`
  border-radius: 16px;
  padding: 20px;
  background-color: ${secondaryColor};
  border: 1px solid ${borderColor};
  box-shadow: 0 2px 6px ${shadowColor};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${primaryColor};
    box-shadow: 0 4px 8px ${shadowColor};
    transform: translateY(-4px);
  }
`

export const ModernLoader = styled.div`
  width: 36px;
  height: 36px;
  border: 3px solid ${borderColor};
  border-top: 3px solid ${primaryColor};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

export const ModernAlert = styled.div<{ type: 'success' | 'warning' | 'error' }>`
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  font-weight: 500;
  border: 1px solid;
  background-color: ${secondaryColor};
  color: ${textColor};

  ${props => {
    switch (props.type) {
      case 'success':
        return css`
          border-color: #32CD32;
          background-color: rgba(50, 205, 50, 0.1);
        `
      case 'warning':
        return css`
          border-color: #FFD700;
          background-color: rgba(255, 215, 0, 0.1);
        `
      case 'error':
        return css`
          border-color: #FF4500;
          background-color: rgba(255, 69, 0, 0.1);
        `
      default:
        return ''
    }
  }}

  &::before {
    content: '${props => (props.type === 'success' ? '✔️' : props.type === 'warning' ? '⚠️' : '❌')}';
    margin-right: 6px;
  }
`