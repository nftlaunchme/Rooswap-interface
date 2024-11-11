import { Trans } from '@lingui/macro'
import { Repeat } from 'react-feather'
import { Link } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Box, Flex, Text } from 'rebass'
import styled, { keyframes } from 'styled-components'

import ForTraderImage from 'assets/svg/for_trader.svg'
import Banner from 'components/Banner'
import { FooterSocialLink } from 'components/Footer/Footer'
import { BestPrice, Clock, LowestSlippage } from 'components/Icons'
import { APP_PATHS } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import useChainsConfig from 'hooks/useChainsConfig'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import useTheme from 'hooks/useTheme'
import { ExternalLink } from 'theme'

import {
  AboutPage,
  BtnPrimary,
  Footer,
  FooterContainer,
  ForTrader,
  ForTraderDivider,
  ForTraderInfo,
  ForTraderInfoShadow,
  SupportedChain,
  Wrapper,
} from '../styleds'

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const GradientText = styled.span`
  background: linear-gradient(270deg, #7B61FF, #FF9D5A, #7B61FF);
  background-size: 600% 600%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  display: inline-block;
  animation: ${gradientAnimation} 10s linear infinite;
`

const Nebula = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at center, rgba(126, 10, 194, 0.5) 0%, rgba(18, 18, 18, 0) 70%),
    radial-gradient(circle at 30% 50%, rgba(126, 10, 194, 0.4) 0%, rgba(126, 10, 194, 0) 60%),
    radial-gradient(circle at 70% 50%, rgba(76, 0, 144, 0.4) 0%, rgba(76, 0, 144, 0) 60%);
  filter: blur(40px);
  opacity: 0.5;
  z-index: -1;
`

const StyledBtnPrimary = styled(BtnPrimary)`
  background: linear-gradient(270deg, #7B61FF, #FF9D5A);
  color: white;
  border: none;
  
  &:hover {
    background: linear-gradient(270deg, #8B71FF, #FFAD6A);
    box-shadow: 0 0 15px rgba(123, 97, 255, 0.3);
  }
`

const TimelineSection = styled.div`
  margin: 60px 0;
  animation: ${fadeIn} 1s ease-out;
`

const TimelineItem = styled.div`
  margin: 24px 0;
  padding: 24px;
  background: rgba(18, 18, 18, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(123, 97, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(123, 97, 255, 0.3);
  }
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin: 40px 0;
`

const FeatureCard = styled.div`
  background: rgba(18, 18, 18, 0.6);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(123, 97, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(123, 97, 255, 0.3);
  }
`

const StyledFooter = styled(Footer)`
  background: #0a0a0a;
  border-top: 1px solid rgba(123, 97, 255, 0.1);
`

interface TimelineEntry {
  year: string
  title: string
  content: string
}

const timelineData: TimelineEntry[] = [
  { year: '2022', title: "Joey's First NFT Project", content: "Joey began experimenting with AI and launched the Kanga Degen's NFT collection. Although the project sold, he didn't make any profit and invested the proceeds into BACC Bonds as a community DAO." },
  { year: '2022', title: "Saving Cronos Tigers", content: 'Joey witnessed the "Cronos Tigers" project get rugged and stepped in to try and save it. However, the launchpad mismanaged the funds, ultimately rugging the effort. This resulted in a bit of a rebellion, taking his trusted friends from the "FudSneks" community.' },
  { year: '2022', title: "Backlash", content: 'Despite Joey providing clear evidence a scam was occurring, the community was ignorant to the deceit and scams. A FUD campaign was launched, and the treasury that the project had invested in was "nurfed" as a form of punishment towards Joey and the rebellion.' },
  { year: '2022', title: "ROO Was Born", content: 'After facing a FUD campaign full of lies and propaganda, Joey rebranded his project as "Roo Finance" with a bold new vision. Joey believed in community over finances and greed. Eager to learn, he created a rebrand, sourced an NFT artist, and crafted a bold dream and roadmap with almost no money and no experience in Web3.' },
  { year: '2023', title: "Building ROO", content: 'Roo Finance launched several pioneering features, including a refundable NFT LaunchPad, a staking system, a stakeless NFT staking system, and a stakeless NFT auto-deployer system. They were the first to create a stakeless NFT system on Cronos, developed with their own logic.' },
  { year: '2023', title: "Continued Growth", content: 'The project distributed significant amounts of tokens and CRO over a long period during a bear market and little volume for over a year.' },
  { year: '2023', title: "ROO as a DAO", content: 'ROO continued to distribute funds to holders, and all votes went through the DAO voting process. Joey funded and customized staking builds for ROO\'s needs with NFTs and tokens.' },
  { year: '2023', title: "Challenges at ROO", content: 'Acknowledging operational problems with some builds, the team discovered flaws like gas issues due to on-chain processes and limitations in changing reward rates during certain periods. Managing multiple developers and relying on third-party Web3 apps increased operational complexities.' },
  { year: '2023', title: "Joey Leaves ROO", content: 'Joey, facing stress and personal health issues, decided to step back. He handed over ROO to the AI Frogs ecosystem along with technical documentation, open channels, $3,200, and all his NFTs.' },
  { year: '2023/2024', title: "Transition to Different Lead", content: 'The AI frogs (Darth Ribbit and side kick) decided to close Roo Finance and swap the NFTs for AI Space Kangaroo NFTs. Joey was not pleased with this and was not part of the agreement. He requested the project\'s return, which was refused alongside the $3200 treasury. The AI Kangaroos have paid 350 MATIC in the year, despite a healthy treasury' },
  { year: '2024', title: "Joey Touches Grass", content: 'Joey stayed away from Web3 for 8 months, focusing on his mental well-being and learning code. He realized he could handle Web3 development himself.' },
  { year: '2024', title: "The Return of ROO", content: 'Joey announced the return of ROO with a bold new plan, intending not to mint any further NFT collections. He built an ecosystem to support existing holders and started rebuilding and acquiring a stake back into ROO.' },
  { year: '2024', title: "Building the New ROO", content: 'Joey launched the new ROO with upcoming plans and a new roadmap focused on building tokens and NFTs, making Web3 easier, and supporting others to achieve their dreams. As a DAO, Joey commits to giving back any successes to the ecosystem.' }
]

function AboutRooswap() {
  const theme = useTheme()
  const above992 = useMedia('(min-width: 992px)')
  const above500 = useMedia('(min-width: 500px)')

  const { mixpanelHandler } = useMixpanel()
  const { supportedChains } = useChainsConfig()

  return (
    <div style={{ position: 'relative', background: '#0a0a0a', width: '100%' }}>
      <Nebula />
      <AboutPage>
        <Banner margin="32px auto 0" padding="0 16px" maxWidth="1224px" />

        <Wrapper>
          <Text as="h1" fontSize={['28px', '48px']} textAlign="center" lineHeight={['32px', '60px']} fontWeight="500">
            <Trans>
              Let's build{' '}
              <GradientText>
                Web3
              </GradientText>{' '}
              together
            </Trans>
          </Text>

          <Text fontSize="18px" color="rgba(255, 255, 255, 0.7)" margin="24px 0" textAlign="center">
            ROO partners with Web3 projects to build the next big thing. Led by Joey, our DAO swaps part of our compensation for project stakes. We're also building a SWAP/Bridge and NFTLaunch.me for a fully-fledged ecosystem.
          </Text>

          <SupportedChain>
            {supportedChains.map(({ chainId: chain, icon, name }) => (
              <img src={icon} alt={name} key={chain} width="36px" height="36px" />
            ))}
          </SupportedChain>

          <ForTrader>
            <Flex flex={1} flexDirection="column" height="max-content">
              <Text fontSize={['16px', '20px']} fontWeight={500} color="#7B61FF">
                <Trans>ROO SWAP</Trans>
              </Text>
              <Text as="h2" marginTop="12px" fontSize={['28px', '36px']} fontWeight="500">
                <Trans>Swap your tokens at superior rates</Trans>
              </Text>
              <Text
                fontSize="16px"
                marginTop={['40px', '48px']}
                color="rgba(255, 255, 255, 0.7)"
                lineHeight="24px"
                textAlign="justify"
              >
                <Trans>
                  Effortlessly swap over 15,000+ assets with the best rates, highest liquidity, and lightning-fast transaction speeds—all in one click, powered by the integration of 220+ DEXs and bridges.
                </Trans>
              </Text>

              <Flex marginTop="20px" alignItems="center">
                <BestPrice />
                <Text marginLeft="12px">
                  <Trans>Superior price guaranteed</Trans>
                </Text>
              </Flex>
              <Flex marginTop="20px" alignItems="center">
                <LowestSlippage />
                <Text marginLeft="12px">
                  <Trans>Lowest possible slippage</Trans>
                </Text>
              </Flex>
              <Flex marginTop="20px" alignItems="center">
                <Clock />
                <Text marginLeft="12px">
                  <Trans>Save time & effort</Trans>
                </Text>
              </Flex>

              {above500 && (
                <StyledBtnPrimary
                  margin="48px 0"
                  width="216px"
                  as="a"
                  href="https://roo.finance/swap/cronos"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => mixpanelHandler(MIXPANEL_TYPE.ABOUT_SWAP_CLICKED)}
                >
                  <Repeat size={20} />
                  <Text fontSize="16px" marginLeft="8px">
                    <Trans>Swap Now</Trans>
                  </Text>
                </StyledBtnPrimary>
              )}
            </Flex>
            <Flex flex={1} flexDirection="column">
              <img
                width="100%"
                src={ForTraderImage}
                alt="ForTrader"
                style={{ marginTop: above992 ? '0.25rem' : '40px' }}
              />
              <Box sx={{ position: 'relative', marginTop: '20px' }}>
                <ForTraderInfoShadow />
                <ForTraderInfo style={{ background: 'rgba(18, 18, 18, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(123, 97, 255, 0.1)' }}>
                  <Flex flex={1} flexDirection="column" alignItems="center">
                    <Text fontWeight="600" fontSize="24px">
                      220+
                    </Text>
                    <Text color="rgba(255, 255, 255, 0.7)" marginTop="4px" fontSize="14px">
                      <Trans>DEXs</Trans>
                    </Text>
                  </Flex>

                  <ForTraderDivider style={{ background: 'rgba(123, 97, 255, 0.2)' }} />

                  <Flex flex={1} flexDirection="column" alignItems="center">
                    <Text fontWeight="600" fontSize="24px">
                      80+
                    </Text>
                    <Text color="rgba(255, 255, 255, 0.7)" marginTop="4px" fontSize="14px">
                      <Trans>Chains</Trans>
                    </Text>
                  </Flex>

                  <ForTraderDivider style={{ background: 'rgba(123, 97, 255, 0.2)' }} />

                  <Flex flex={1} flexDirection="column" alignItems="center">
                    <Text fontWeight="600" fontSize="24px">
                      15,000+
                    </Text>
                    <Text color="rgba(255, 255, 255, 0.7)" marginTop="4px" fontSize="14px">
                      <Trans>Assets</Trans>
                    </Text>
                  </Flex>
                </ForTraderInfo>
              </Box>
            </Flex>
          </ForTrader>

          <ForTrader>
            <Flex flex={1} flexDirection="column" height="max-content">
              <Text fontSize={['16px', '20px']} fontWeight={500} color="#7B61FF">
                <Trans>NFTLAUNCH.ME</Trans>
              </Text>
              <Text as="h2" marginTop="12px" fontSize={['28px', '36px']} fontWeight="500">
                <Trans>Your Complete NFT Solution</Trans>
              </Text>
              <Text
                fontSize="16px"
                marginTop={['40px', '48px']}
                color="rgba(255, 255, 255, 0.7)"
                lineHeight="24px"
                textAlign="justify"
              >
                <Trans>
                  We're building NFTLaunch.me to meet all your NFT needs. Deploy NFTs and ERC404s, get NFT data, aggregate across marketplaces, and more.
                </Trans>
              </Text>

              <FeatureGrid>
                <FeatureCard>
                  <Text>Deploy NFT's and ERC404's</Text>
                </FeatureCard>
                <FeatureCard>
                  <Text>Get any NFT Data</Text>
                </FeatureCard>
                <FeatureCard>
                  <Text>Aggregate NFT's across all Marketplaces</Text>
                </FeatureCard>
                <FeatureCard>
                  <Text>List and buy any NFT on our marketplace</Text>
                </FeatureCard>
              </FeatureGrid>

              {above500 && (
                <StyledBtnPrimary margin="48px 0" width="216px" as={Link} to="/nftlaunch">
                  <Text fontSize="16px" marginLeft="8px">
                    <Trans>Learn More</Trans>
                  </Text>
                </StyledBtnPrimary>
              )}
            </Flex>
          </ForTrader>

          <TimelineSection>
            <Text as="h2" fontSize="28px" fontWeight="500" textAlign="center">
              The Journey of ROO
            </Text>
            <Text fontSize="18px" color="rgba(255, 255, 255, 0.7)" textAlign="center" marginBottom="40px">
              Discover the milestones that shaped our story
            </Text>

            {timelineData.map((item, index) => (
              <TimelineItem key={index}>
                <Text fontSize="14px" color="#7B61FF" marginBottom="8px">
                  {item.year}
                </Text>
                <Text fontSize="20px" fontWeight="500" marginBottom="12px">
                  {item.title}
                </Text>
                <Text color="rgba(255, 255, 255, 0.7)">
                  {item.content}
                </Text>
              </TimelineItem>
            ))}
          </TimelineSection>
        </Wrapper>
      </AboutPage>

      <StyledFooter background="#0a0a0a">
        <FooterContainer>
          <Flex flexWrap="wrap" sx={{ gap: '12px' }} justifyContent="center">
            <ExternalLink href="https://docs.kyberswap.com" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <Trans>Docs</Trans>
            </ExternalLink>
            <ExternalLink href="https://github.com/KyberNetwork" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <Trans>Github</Trans>
            </ExternalLink>
          </Flex>
          <FooterSocialLink />
        </FooterContainer>
      </StyledFooter>
    </div>
  )
}

export default AboutRooswap
