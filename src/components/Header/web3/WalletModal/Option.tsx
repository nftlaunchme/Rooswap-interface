import React from 'react'
import styled, { css } from 'styled-components'
import { Connector } from 'wagmi'
import { useConnect } from 'wagmi'
import { useIsAcceptedTerm } from 'state/user/hooks'
import { CONNECTION } from 'components/Web3Provider'

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;

  & > img,
  span {
    height: 20px;
    width: 20px;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

const HeaderText = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  color: ${({ theme }) => theme.subText};
  font-weight: 500;
`

const OptionCardClickable = styled.div<{
  connected: boolean
  installLink?: string
  isDisabled?: boolean
  overridden?: boolean
}>`
  height: 36px;
  width: 100%;
  border-radius: 18px;
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  background-color: ${({ theme }) => theme.tableHeader};
  overflow: hidden;
  white-space: nowrap;
  font-size: 14px;

  cursor: ${({ isDisabled, installLink, overridden }) =>
    !isDisabled && !installLink && !overridden ? 'pointer' : 'not-allowed'};

  ${({ isDisabled, connected, theme }) =>
    !isDisabled && connected
      ? `
      background-color: ${theme.primary};
      & ${HeaderText} {
        color: ${theme.darkText} !important;
      }
    `
      : ''}

  &:hover {
    text-decoration: none;
    ${({ installLink, isDisabled, overridden }) =>
      installLink || isDisabled || overridden
        ? ''
        : css`
            background-color: ${({ theme }) => theme.buttonBlack};
            color: ${({ theme }) => theme.text} !important;
          `}
  }

  ${({ isDisabled, installLink, overridden, theme }) =>
    isDisabled || installLink || overridden
      ? `
      filter: grayscale(100%);
      & ${HeaderText} {
        color: ${theme.border};
      }
    `
      : ''}
`

const OptionCardLeft = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  justify-content: center;
  height: 100%;
`

interface OptionProps {
  connector: Connector
  onClick?: (connector: Connector) => void
}

const Option = ({ connector, onClick }: OptionProps) => {
  const [isAcceptedTerm] = useIsAcceptedTerm()
  const { isPending, variables } = useConnect()

  const isCurrentOptionPending = isPending && variables?.connector?.id === connector.id

  // Map of wallet IDs to their display names and icons
  const WALLET_DETAILS: { [key: string]: { name: string; icon: string } } = {
    [CONNECTION.REOWN_ID]: { 
      name: 'Reown Wallet', 
      icon: '/images/wallets/reown.svg'
    },
    [CONNECTION.DEFI_WALLET_ID]: { 
      name: 'DeFi Wallet', 
      icon: '/images/wallets/defi.svg'
    },
    [CONNECTION.METAMASK_RDNS]: { 
      name: 'MetaMask', 
      icon: '/images/wallets/metamask.png'
    },
    [CONNECTION.WALLET_CONNECT_CONNECTOR_ID]: { 
      name: 'WalletConnect', 
      icon: '/images/wallets/walletconnect.svg'
    }
  }

  // Get wallet details from our map, fallback to connector's default values
  const walletDetails = WALLET_DETAILS[connector.id] || { name: connector.name, icon: connector.icon }

  const handleClick = () => {
    if (!isAcceptedTerm) return
    if (onClick) onClick(connector)
  }

  return (
    <OptionCardClickable
      role="button"
      id={`connect-${walletDetails.name}`}
      onClick={handleClick}
      connected={isCurrentOptionPending}
      isDisabled={!isAcceptedTerm}
    >
      <IconWrapper>
        <img src={walletDetails.icon} alt={`${walletDetails.name} icon`} />
      </IconWrapper>
      <OptionCardLeft>
        <HeaderText>{walletDetails.name}</HeaderText>
      </OptionCardLeft>
    </OptionCardClickable>
  )
}

export default React.memo(Option)
