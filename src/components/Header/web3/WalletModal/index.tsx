import { Trans } from '@lingui/macro'
import dayjs from 'dayjs'
import { rgba } from 'polished'
import { useEffect, useState } from 'react'
import { ChevronLeft } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useConnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'

import { ReactComponent as Close } from 'assets/images/x.svg'
import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import WalletPopup from 'components/WalletPopup'
import { TERM_FILES_PATH } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useTheme from 'hooks/useTheme'
import { ApplicationModal } from 'state/application/actions'
import {
  useCloseModal,
  useModalOpen,
  useOpenModal,
  useOpenNetworkModal,
  useWalletModalToggle,
} from 'state/application/hooks'
import { useIsAcceptedTerm } from 'state/user/hooks'
import { ExternalLink } from 'theme'
import { CONNECTION } from 'components/Web3Provider'

import Option from './Option'
import { useOrderedConnections } from './useConnections'

const CloseIcon = styled.div`
  height: 24px;
  align-self: flex-end;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  &:hover {
    opacity: 0.6;
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`

const ContentWrapper = styled.div`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

export const TermAndCondition = styled.div`
  padding: 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  background-color: ${({ theme }) => rgba(theme.buttonBlack, 0.35)};
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary : 'inherit')};
  accent-color: ${({ theme }) => theme.primary};
  border-radius: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  :hover {
    background-color: ${({ theme }) => rgba(theme.buttonBlack, 0.5)};
  }
`

const UpperSection = styled.div`
  position: relative;
  padding: 24px;
  position: relative;
`

const gap = '1rem'
const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: ${gap};
  margin-top: 16px;
  padding-bottom: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr 1fr;
  `}

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: 1fr;
  `}
`

const HoverText = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 20px;
  :hover {
    cursor: pointer;
  }
`

export default function WalletModal() {
  const { isWrongNetwork, account } = useActiveWeb3React()
  const { open: openAppKit } = useAppKit()

  const theme = useTheme()

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()
  const closeWalletModal = useCloseModal(ApplicationModal.WALLET)
  const openWalletModal = useOpenModal(ApplicationModal.WALLET)
  const openNetworkModal = useOpenNetworkModal()

  const { connect, isPending: isSomeOptionPending, isIdle, isError, reset } = useConnect()
  const onDismiss = () => {
    reset()
    closeWalletModal()
  }

  const [isAcceptedTerm, setIsAcceptedTerm] = useIsAcceptedTerm()
  const [isChecked, setIsChecked] = useState(!!isAcceptedTerm)

  const { mixpanelHandler } = useMixpanel()

  useEffect(() => {
    if (isWrongNetwork) {
      openNetworkModal()
    }
  }, [isWrongNetwork, openNetworkModal])

  const connectors = useOrderedConnections()

  const [isPinnedPopupWallet, setPinnedPopupWallet] = useState(false)

  const handleTermsCheck = () => {
    const newValue = !isChecked
    setIsChecked(newValue)
    if (!isAcceptedTerm && newValue) {
      mixpanelHandler(MIXPANEL_TYPE.WALLET_CONNECT_ACCEPT_TERM_CLICK)
    }
    setIsAcceptedTerm(newValue)
  }

  const handleWalletClick = async (connector: any) => {
    if (!isAcceptedTerm) return

    try {
      if (connector.id === CONNECTION.WALLET_CONNECT_CONNECTOR_ID) {
        closeWalletModal()
        openAppKit()
      } else {
        await connect({ connector })
        closeWalletModal()
      }
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  function getModalContent() {
    return (
      <UpperSection>
        <RowBetween marginBottom="26px" gap="20px">
          {(isSomeOptionPending || isError) && (
            <HoverText
              onClick={() => {
                reset()
              }}
              style={{ marginRight: '1rem', flex: 1 }}
            >
              <ChevronLeft color={theme.primary} />
            </HoverText>
          )}
          <HoverText>
            {!isSomeOptionPending ? <Trans>Connect your Wallet</Trans> : <Trans>Connecting Wallet</Trans>}
          </HoverText>
          <CloseIcon
            onClick={() => {
              reset()
              toggleWalletModal()
            }}
          >
            <Close />
          </CloseIcon>
        </RowBetween>
        {isIdle && (
          <TermAndCondition onClick={handleTermsCheck}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleTermsCheck}
              data-testid="accept-term"
              style={{ marginRight: '12px', height: '14px', width: '14px', minWidth: '14px', cursor: 'pointer' }}
            />
            <Text color={theme.subText}>
              <Trans>Accept </Trans>{' '}
              <ExternalLink href={TERM_FILES_PATH.KYBERSWAP_TERMS} onClick={e => e.stopPropagation()}>
                <Trans>KyberSwap&lsquo;s Terms of Use</Trans>
              </ExternalLink>{' '}
              <Trans>and</Trans>{' '}
              <ExternalLink href={TERM_FILES_PATH.PRIVACY_POLICY} onClick={e => e.stopPropagation()}>
                <Trans>Privacy Policy</Trans>
              </ExternalLink>
              {'. '}
              <Text fontSize={10} as="span">
                <Trans>Last updated: {dayjs(TERM_FILES_PATH.VERSION).format('DD MMM YYYY')}</Trans>
              </Text>
            </Text>
          </TermAndCondition>
        )}
        <ContentWrapper>
          <OptionGrid>
            {connectors.map((c, index) => (
              <Option connector={c} key={`${c.uid}-${index}`} onClick={() => handleWalletClick(c)} />
            ))}
          </OptionGrid>
        </ContentWrapper>
      </UpperSection>
    )
  }

  if (account) {
    return (
      <WalletPopup
        isPinned={isPinnedPopupWallet}
        setPinned={setPinnedPopupWallet}
        isModalOpen={walletModalOpen}
        onDismissModal={onDismiss}
        onOpenModal={openWalletModal}
      />
    )
  }

  return (
    <Modal
      isOpen={walletModalOpen}
      onDismiss={onDismiss}
      minHeight={false}
      maxHeight={90}
      maxWidth={600}
      bypassScrollLock={true}
      bypassFocusLock={true}
    >
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
