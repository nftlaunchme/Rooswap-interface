// @ts-nocheck 
import React from 'react'
import styled, { keyframes } from 'styled-components'

import LoadingLogo from 'assets/svg/roosvg.svg'

const spinAnimation = keyframes`
  0% { transform: rotate(0deg) }
  100% { transform: rotate(360deg) }
`

const pulseAnimation = keyframes`
  0% { transform: scale(1) }
  50% { transform: scale(1.05) }
  100% { transform: scale(1) }
`

const Wrapper = styled.div<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: inline-block;
  overflow: hidden;
  background: transparent;
`

const Inner = styled.div<{ size: number }>`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateZ(0) scale(1);
  backface-visibility: hidden;
  transform-origin: 0 0;
`

const SpinningRing = styled.div<{ size: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #0328ee;
  border-radius: 50%;
  animation: ${spinAnimation} 1s linear infinite;
`

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70%;
  height: 70%;
  animation: ${pulseAnimation} 2s infinite ease-in-out;
`

function AnimateLoader({ size = 163 }: { size?: number }) {
  return (
    <Wrapper size={size}>
      <Inner size={size}>
        <SpinningRing size={size} />
        <LogoWrapper>
          <img src={LoadingLogo} alt="Roo.Finance Loading" style={{ width: '100%', height: 'auto' }} />
        </LogoWrapper>
      </Inner>
    </Wrapper>
  )
}

export default AnimateLoader
