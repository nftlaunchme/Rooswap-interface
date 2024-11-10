import { darken } from 'polished'
import React from 'react'
import styled, { css } from 'styled-components'
import { Connector, useConnect } from 'wagmi'

import { useActiveWeb3React } from 'hooks'
import { useCloseModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/types'
import { useIsAcceptedTerm } from 'state/user/hooks'
import { CONNECTION } from 'components/Web3Provider'

// Map of wallet IDs to their display names and icons
const WALLET_DETAILS: { [key: string]: { name: string; icon: string } } = {
  [CONNECTION.REOWN_ID]: { 
    name: 'Reown Wallet', 
    icon: '/swap-svgrepo-com.svg'
  },
  [CONNECTION.DEFI_WALLET_ID]: { 
    name: 'DeFi Wallet', 
    icon: '/swap-svgrepo-com.svg'
  },
  [CONNECTION.METAMASK_RDNS]: { 
    name: 'MetaMask', 
    icon: '/swap-svgrepo-com.svg'
  },
  [CONNECTION.WALLET_CONNECT_CONNECTOR_ID]: { 
    name: 'WalletConnect', 
    icon: '/swap-svgrepo-com.svg'
  }
}

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
            background-color: ${({ theme }) => darken(0.1, theme.tableHeader)};
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
  const { chainId } = useActiveWeb3React()
  const closeWalletModal = useCloseModal(ApplicationModal.WALLET)

  const {
    variables,
    isPending: isSomeOptionPending,
    connect,
  } = useConnect({
    mutation: {
      onSuccess: () => {
        closeWalletModal()
      },
      onError: (error: Error) => {
        console.log(error)
      },
    },
  })

  const isCurrentOptionPending = isSomeOptionPending && variables.connector === connector

  // Get wallet details from our map, fallback to connector's default values
  const walletDetails = WALLET_DETAILS[connector.id] || { name: connector.name, icon: connector.icon }

  const handleClick = () => {
    if (!isAcceptedTerm) return
    
    if (onClick) {
      onClick(connector)
    } else if (connector.id !== CONNECTION.WALLET_CONNECT_CONNECTOR_ID) {
      connect({ connector, chainId: chainId as any })
    }
  }

  const content = (
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

  return content
}

export default React.memo(Option)
