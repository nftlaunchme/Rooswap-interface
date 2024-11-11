import { ChainId } from '@kyberswap/ks-sdk-core'
import { Trans } from '@lingui/macro'
import { rgba } from 'polished'
import { MouseEvent } from 'react'
import styled from 'styled-components'

import { ButtonEmpty } from 'components/Button'
import { MouseoverTooltip } from 'components/Tooltip'
import { NetworkInfo } from 'constants/networks/type'
import { useActiveWeb3React } from 'hooks'
import useTheme from 'hooks/useTheme'
import useSwitchNetwork from '../../../../../hooks/useSwitchNetwork'

const NetworkLabel = styled.div`
  flex: 1;
  padding: 0 12px;
`

const ListItem = styled(ButtonEmpty)<{ selected?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  pointer-events: auto;
  background-color: ${({ theme, selected }) => (selected ? rgba(theme.primary, 0.15) : 'transparent')};
  color: ${({ theme, selected }) => (selected ? theme.primary : theme.subText)};
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background-color: ${({ theme }) => theme.buttonBlack};
  }
`

const NetworkIcon = styled.img`
  width: 20px;
  height: 20px;
`

interface NetworkButtonProps {
  networkInfo: NetworkInfo
  activeChainIds?: ChainId[]
  isSelected?: boolean
  disabledMsg?: string
  customOnSelectNetwork?: (chainId: ChainId) => void
  customToggleModal?: () => void
  onChangedNetwork?: () => void
  isDraggable?: boolean // Added for backward compatibility
  dragConstraints?: React.RefObject<HTMLDivElement>; // New property
  onDrag?: (x: number, y: number) => void; // New property
}

export default function NetworkButton({
  networkInfo,
  activeChainIds,
  isSelected,
  disabledMsg,
  customOnSelectNetwork,
  customToggleModal,
  onChangedNetwork,
}: NetworkButtonProps) {
  const theme = useTheme()
  const { chainId: currentChainId } = useActiveWeb3React()
  const { switchNetwork } = useSwitchNetwork()

  const handleSwitchNetwork = async (event: MouseEvent) => {
    event.stopPropagation()
    if (disabledMsg) return

    if (customOnSelectNetwork) {
      customOnSelectNetwork(networkInfo.chainId)
      if (customToggleModal) customToggleModal()
      return
    }

    if (currentChainId === networkInfo.chainId) {
      if (customToggleModal) customToggleModal()
      return
    }

    const switched = await switchNetwork(networkInfo.chainId)
    if (switched && onChangedNetwork) {
      onChangedNetwork()
    }
  }

  const button = (
    <ListItem
      onClick={handleSwitchNetwork}
      selected={isSelected}
      disabled={!!disabledMsg}
      data-testid={`network-item-${networkInfo.chainId}`}
    >
      <NetworkIcon src={networkInfo.icon} alt={networkInfo.name} />
      <NetworkLabel>{networkInfo.name}</NetworkLabel>
    </ListItem>
  )

  if (disabledMsg) {
    return (
      <MouseoverTooltip text={<Trans>{disabledMsg}</Trans>} placement="top" width="300px">
        {button}
      </MouseoverTooltip>
    )
  }

  return button
}
