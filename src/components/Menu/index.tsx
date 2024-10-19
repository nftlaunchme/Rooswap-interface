import { Trans } from '@lingui/macro'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { BookOpen, ChevronDown, Info, X } from 'react-feather'
import { NavLink, useNavigate } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Text } from 'rebass'
import styled, { css } from 'styled-components'

import { ReactComponent as MenuIcon } from 'assets/svg/drop.svg'
import { ButtonEmpty } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Icon from 'components/Icons/Icon'
import LanguageSelector from 'components/LanguageSelector'
import MenuFlyout from 'components/MenuFlyout'
import { TutorialIds } from 'components/Tutorial/TutorialSwap/constant'
import { APP_PATHS } from 'constants/index'
import { getLocaleLabel } from 'constants/locales'
import { useActiveWeb3React } from 'hooks'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useTheme from 'hooks/useTheme'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import { useUserLocale } from 'state/user/hooks'
import { ExternalLink, MEDIA_WIDTHS } from 'theme'

const MenuItem = styled.li`
  flex: 1;
  padding: 0.75rem 0;
  display: flex;
  font-weight: 500;
  white-space: nowrap;
  align-items: center;
  color: ${({ theme }) => theme.subText};
  font-size: 15px;

  svg {
    margin-right: 8px;
    height: 16px;
    width: 16px;
  }

  a {
    color: ${({ theme }) => theme.subText};
    display: flex;
    align-items: center;
    :hover {
      text-decoration: none;
      color: ${({ theme }) => theme.text};
    }
  }
`

const StyledMenuButton = styled.button<{ active?: boolean }>`
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.subText};

  border-radius: 999px;

  :hover {
    cursor: pointer;
    outline: none;
    color: ${({ theme }) => theme.text};
  }
`

const StyledMenu = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

const MenuFlyoutBrowserStyle = css`
  min-width: 240px;
  right: -8px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    top: unset;
    bottom: 3.5rem;
  `};
`

const MenuFlyoutMobileStyle = css`
  overflow-y: scroll;
`

const Divider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border};
  margin-top: 10px;
  margin-bottom: 10px;
`

export default function Menu() {
  const { account } = useActiveWeb3React()
  const theme = useTheme()
  const open = useModalOpen(ApplicationModal.MENU)
  const toggle = useToggleModal(ApplicationModal.MENU)
  const [isSelectingLanguage, setIsSelectingLanguage] = useState(false)
  const userLocale = useUserLocale()
  const { mixpanelHandler } = useMixpanel()
  const navigate = useNavigate()

  const showAbout = useMedia(`(max-width: ${MEDIA_WIDTHS.upToExtraSmall}px)`)

  useEffect(() => {
    if (!open) setIsSelectingLanguage(false)
  }, [open])

  const handleMenuClickMixpanel = (name: string) => {
    mixpanelHandler(MIXPANEL_TYPE.MENU_MENU_CLICK, { menu: name })
  }

  return (
    <StyledMenu>
      <MenuFlyout
        trigger={
          <StyledMenuButton active={open} onClick={toggle} aria-label="Menu" id={TutorialIds.BUTTON_MENU_HEADER}>
            <MenuIcon width={18} height={18} />
          </StyledMenuButton>
        }
        customStyle={MenuFlyoutBrowserStyle}
        mobileCustomStyle={MenuFlyoutMobileStyle}
        isOpen={open}
        toggle={toggle}
        hasArrow
      >
        {isSelectingLanguage ? (
          <AutoColumn gap="md">
            <LanguageSelector setIsSelectingLanguage={setIsSelectingLanguage} />
          </AutoColumn>
        ) : (
          <>
            {isMobile && (
              <ButtonEmpty onClick={toggle} style={{ position: 'absolute', right: '16px', top: '16px' }}>
                <X color={theme.subText} />
              </ButtonEmpty>
            )}

            <MenuItem onClick={toggle}>
              <NavLink to={APP_PATHS.SWAP}>
                <Icon id="swap" size={16} />
                <Trans>Swap</Trans>
              </NavLink>
            </MenuItem>

            <MenuItem onClick={toggle}>
              <NavLink to={APP_PATHS.BRIDGE}>
                <Icon id="trending-soon" size={16} />
                <Trans>Bridge</Trans>
              </NavLink>
            </MenuItem>

            <MenuItem onClick={toggle}>
              <NavLink to="/rebel-kangas">
                <Icon id="star" size={16} />
                <Trans>Rebel Kangas</Trans>
              </NavLink>
            </MenuItem>

            <MenuItem onClick={toggle}>
              <NavLink to="/learn">
                <BookOpen size={16} />
                <Trans>Learn</Trans>
              </NavLink>
            </MenuItem>

            <MenuItem onClick={toggle}>
              <NavLink to="/ai">
                <Icon id="notification-2" size={16} />
                <Trans>AI</Trans>
              </NavLink>
            </MenuItem>

            <Divider />

            <MenuItem>
              <ExternalLink href="https://docs.roofinance.com" onClick={() => handleMenuClickMixpanel('Docs')}>
                <BookOpen size={16} />
                <Trans>Docs</Trans>
              </ExternalLink>
            </MenuItem>

            <MenuItem>
              <ExternalLink
                href="https://roadmap.roofinance.com"
                onClick={() => {
                  toggle()
                  handleMenuClickMixpanel('Roadmap')
                }}
              >
                <Icon id="trending-soon" size={16} />
                <Trans>Roadmap</Trans>
              </ExternalLink>
            </MenuItem>

            <MenuItem>
              <ExternalLink
                href="https://dao.roofinance.com"
                onClick={() => {
                  toggle()
                  handleMenuClickMixpanel('DAO')
                }}
              >
                <Icon id="trending-soon" size={16} />
                <Trans>DAO</Trans>
              </ExternalLink>
            </MenuItem>

            {showAbout && (
              <MenuItem>
                <NavLink to="/about">
                  <Info size={16} />
                  <Trans>About</Trans>
                </NavLink>
              </MenuItem>
            )}

            <Divider />

            <MenuItem
              onClick={() => {
                setIsSelectingLanguage(true)
              }}
            >
              <Text>
                <Trans>Language</Trans>
              </Text>
              <Text marginLeft="auto">
                {getLocaleLabel(userLocale, true)}
                <ChevronDown size={16} style={{ marginLeft: 6 }} />
              </Text>
            </MenuItem>

            <Divider />

            <Text fontSize="10px" fontWeight={300} color={theme.subText} textAlign="center">
              Roo Finance v3.0.0
            </Text>
          </>
        )}
      </MenuFlyout>
    </StyledMenu>
  )
}
