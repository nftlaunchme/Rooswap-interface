import { Trans, t } from '@lingui/macro'
import React from 'react'
import { useMedia } from 'react-use'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import Discord from 'components/Icons/Discord'
import TwitterIcon from 'components/Icons/TwitterIcon'
import InfoHelper from 'components/InfoHelper'
import { ExternalLink, ExternalLinkNoLineHeight } from 'theme'

const colors = {
  background: '#010725',
  text: '#ffffff',
  subText: '#7F7F7F',
  primary: '#0328EE',
}

const FooterWrapper = styled.div`
  background: ${colors.background};
  width: 100%;
  padding: 24px 0;
`

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
  }
`

const InfoWrapper = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: ${colors.subText};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }
`

const Separator = styled.div`
  width: 1px;
  background: ${colors.subText};
  @media (max-width: 768px) {
    display: none;
  }
`

const Item = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.subText};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`

const CopyrightText = styled(Text)`
  color: ${colors.text};
  font-size: 14px;
  margin-top: 16px;
`

const SocialLinks = styled(Flex)`
  gap: 24px;
`

export const FooterSocialLink = () => {
  return (
    <SocialLinks>
      <ExternalLinkNoLineHeight href="https://twitter.com/RooFinance">
        <TwitterIcon color={colors.text} width={20} height={20} />
      </ExternalLinkNoLineHeight>
      <ExternalLinkNoLineHeight href="https://discord.gg/AMQB6ZWKfa">
        <Discord width={20} height={20} color={colors.text} />
      </ExternalLinkNoLineHeight>
    </SocialLinks>
  )
}

function Footer() {
  const above768 = useMedia('(min-width: 768px)')

  return (
    <FooterWrapper>
      <FooterContent>
        <InfoWrapper>
          <Item>
            <Text marginRight="6px" color={colors.text}>
              <Trans>Powered By</Trans>
            </Text>
            <ExternalLink href="https://Roo.Finance" style={{ display: 'flex' }}>
              <Text color={colors.text}>Roo</Text>
            </ExternalLink>
          </Item>
          <Separator />
          <Item>
            <Text marginRight="6px" display="flex" color={colors.text}>
              <Trans>Audited By</Trans>
              {!above768 && <InfoHelper size={14} text={t`Covers frontend only`} placement="top" />}
            </Text>
            <ExternalLink href="https://clubcro.com" style={{ display: 'flex' }}>
              <Text color={colors.text}>TrollCoin</Text>
            </ExternalLink>
            {above768 && <InfoHelper size={14} text={t`Covers frontend only`} placement="top" />}
          </Item>
        </InfoWrapper>
        <Flex flexDirection="column" alignItems="flex-end">
          <FooterSocialLink />
          <CopyrightText>Roo Finance 2024 All Rights Reserved</CopyrightText>
        </Flex>
      </FooterContent>
    </FooterWrapper>
  )
}

export default Footer