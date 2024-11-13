import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMedia } from 'react-use'
import styled from 'styled-components'

import Announcement from 'components/Announcement'
import SelectNetwork from 'components/Header/web3/SelectNetwork'
import SelectWallet from 'components/Header/web3/SelectWallet'
import Menu from 'components/Menu'
import { APP_PATHS } from 'constants/index'
import { Z_INDEXS } from 'constants/styles'
import { useActiveWeb3React } from 'hooks'
import { MEDIA_WIDTHS } from 'theme'

const colors = {
  background: '#010725',
  text: '#ffffff',
  subText: '#7F7F7F',
  primary: '#0328EE',
  border: 'rgba(255, 255, 255, 0.1)',
}

const HeaderFrame = styled.header`
  width: 100%;
  height: 80px;
  position: sticky;
  top: 0;
  background: ${colors.background};
  border-bottom: 1px solid ${colors.border};
  z-index: ${Z_INDEXS.HEADER};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0 16px;
  `};
`

const HeaderControls = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
`

const HeaderElement = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`

const HeaderLinks = styled.div`
  display: flex;
  gap: 24px;
  margin-left: 48px;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: none;
  `};
`

const IconImage = styled.img`
  width: 163px;
  height: 53px;
  object-fit: contain;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 120px;
    height: 39px;
  `};
`

const StyledNavLink = styled(Link)`
  color: ${colors.text};
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${colors.primary};
  }
`

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${colors.text};
  font-size: 24px;
  cursor: pointer;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: block;
  `};
`

const MobileMenu = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  flex-direction: column;
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${colors.background};
  padding: 16px;
  z-index: ${Z_INDEXS.MODAL};
`

const MobileMenuItem = styled(StyledNavLink)`
  padding: 12px 0;
  font-size: 18px;
`

const MobileHeaderControls = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: ${colors.background};
  border-top: 1px solid ${colors.border};
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 16px;
  z-index: ${Z_INDEXS.MODAL};
`

export default function Header() {
  const { networkInfo } = useActiveWeb3React()
  const { pathname } = useLocation()
  const isPartnerSwap = pathname.startsWith(APP_PATHS.PARTNER_SWAP)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const upToLarge = useMedia(`(max-width: ${MEDIA_WIDTHS.upToLarge}px)`)

  const navLinks = [
    { to: `${APP_PATHS.SWAP}/${networkInfo.route}`, label: 'Swap' },
    { to: APP_PATHS.BRIDGE, label: 'Bridge' },
    { to: APP_PATHS.CROSS_CHAIN, label: 'Cross Chain' },
    { to: '/rebel-kanga', label: "Rebel Kanga's" },
    { to: '/learn', label: 'Learn' },
    { to: '/ai', label: 'AI' },
  ]

  return (
    <>
      <HeaderFrame>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to={`${APP_PATHS.SWAP}/${networkInfo.route}`}>
            <IconImage src="/roosvg.svg" alt="Roo Finance logo" />
          </Link>
          {!isPartnerSwap && !upToLarge && (
            <HeaderLinks>
              {navLinks.map(link => (
                <StyledNavLink key={link.to} to={link.to}>
                  {link.label}
                </StyledNavLink>
              ))}
            </HeaderLinks>
          )}
        </div>

        <HeaderControls>
          {!upToLarge && (
            <>
              <HeaderElement>
                <SelectNetwork />
                <SelectWallet />
              </HeaderElement>
              <HeaderElement>
                <Announcement />
                <Menu />
              </HeaderElement>
            </>
          )}
          {upToLarge && <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>☰</MobileMenuButton>}
        </HeaderControls>
      </HeaderFrame>

      {upToLarge && (
        <>
          <MobileMenu isOpen={isMobileMenuOpen}>
            {navLinks.map(link => (
              <MobileMenuItem key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)}>
                {link.label}
              </MobileMenuItem>
            ))}
          </MobileMenu>
          <MobileHeaderControls>
            <SelectNetwork />
            <SelectWallet />
            <Announcement />
            <Menu />
          </MobileHeaderControls>
        </>
      )}
    </>
  )
}
