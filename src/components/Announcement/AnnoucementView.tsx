// @ts-nocheck 
import { Trans } from '@lingui/macro'
import { RefObject, useEffect, useState } from 'react'
import { Info, X } from 'react-feather'
import { useMedia } from 'react-use'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { Flex, Text } from 'rebass'
import styled, { DefaultTheme } from 'styled-components'

import Column from 'components/Column'
import NotificationIcon from 'components/Icons/NotificationIcon'
import { RowBetween } from 'components/Row'
import useTheme from 'hooks/useTheme'
import { MEDIA_WIDTHS } from 'theme'

const Wrapper = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 80vh;
  padding: 24px;
  background-color: #010725;
  border-radius: 20px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  overflow: visible; /* Changed to visible to allow content overflow */

  ${({ theme }: { theme: DefaultTheme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    min-width: 320px;
  `};

  ${({ theme }: { theme: DefaultTheme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    height: 100vh;
    border-radius: 0;
    padding: 20px;
  `};
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const TabItem = styled.div<{ active: boolean }>`
  flex: 1;
  background-color: ${({ active }) => (active ? '#FFFFFF' : 'transparent')};
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: ${({ active }) => (active ? '#010725' : '#FFFFFF')};
  transition: all 0.3s ease-in-out;

  &:hover {
    background-color: ${({ active }) => (active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)')};
  }
`

const Title = styled.div`
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #FFFFFF;
`

const TabWrapper = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
`

const ListAnnouncement = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 16px;
  padding: 4px;

  .scrollbar {
    &::-webkit-scrollbar {
      display: block;
      width: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
  }
  
  ${({ theme }: { theme: DefaultTheme }) => theme.mediaWidth.upToSmall`
    border-radius: 0;
  `};
` 

const AnnouncementItem = styled.div`
  padding: 16px;
  background-color: #FFFFFF;
  color: #010725;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`

const AnnouncementTitle = styled(Text)`
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 8px;
`

const AnnouncementDescription = styled(Text)`
  font-size: 14px;
  color: #4A5568;
`

export enum Tab {
  INBOX,
}

type Props = {
  toggleNotificationCenter: () => void
  isMyInboxTab: boolean
  onSetTab: (tab: Tab) => void  
  showDetailAnnouncement: (index: number) => void
  scrollRef: RefObject<HTMLDivElement>
}

export default function AnnouncementView({
  toggleNotificationCenter,
  isMyInboxTab,  
  onSetTab,
  showDetailAnnouncement,
  scrollRef,
}: Props) {
  const theme = useTheme()
  const isMobile = useMedia(`(max-width: ${MEDIA_WIDTHS.upToMedium}px)`)

  const announcements = [
    {
      id: 1,
      templateBody: {
        name: 'Introducing Limit Orders',
        description: 'We are thrilled to announce the launch of Limit Orders on our DEX!',
      },  
      isRead: false,
    },
    {
      id: 2,
      templateBody: {
        name: 'Roo is back!',
        description: 'We have added support for several new tokens on our exchange.',  
      },
      isRead: true,
    },
  ]

  const onReadAnnouncement = (index: number) => {
    console.log(`Notification clicked: ${announcements[index].templateBody.name}`)
    toggleNotificationCenter()
  }

  const tabComponent = (
    <TabWrapper>
      <TabItem active={isMyInboxTab} onClick={() => onSetTab(Tab.INBOX)}>
        <Trans>My Inbox</Trans>
      </TabItem>
    </TabWrapper>
  )

  return (
    <Wrapper>
      <Container>
        <RowBetween>
          <Title>
            <NotificationIcon size={24} color="#FFFFFF" />
            <Trans>Notifications</Trans>  
          </Title>
          {isMobile && <X color="#FFFFFF" size={24} onClick={toggleNotificationCenter} cursor="pointer" />}
        </RowBetween>

        {tabComponent}
      </Container>

      {announcements.length ? (
        <ListAnnouncement className="scrollbar">
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                outerRef={scrollRef}
                height={height}
                width={width}
                itemCount={announcements.length}
                itemSize={140}
                itemData={announcements}
              >
                {({ index, style, data }) => {
                  const item = data[index]
                  return (
                    <div style={{ ...style, paddingBottom: '16px' }}>
                      <AnnouncementItem key={item.id} onClick={() => onReadAnnouncement(index)}>
                        <AnnouncementTitle>{item.templateBody.name}</AnnouncementTitle>
                        <AnnouncementDescription>{item.templateBody.description}</AnnouncementDescription>
                      </AnnouncementItem>
                    </div>
                  )
                }}
              </FixedSizeList>  
            )}
          </AutoSizer>
        </ListAnnouncement>
      ) : (
        <Column style={{ alignItems: 'center', margin: '64px 0' }} gap="16px">
          <Info color="#FFFFFF" size={36} />  
          <Text color="#FFFFFF" textAlign="center" fontSize="18px">
            <Trans>No notifications found</Trans>
          </Text>  
        </Column>
      )}
    </Wrapper>
  )
}
