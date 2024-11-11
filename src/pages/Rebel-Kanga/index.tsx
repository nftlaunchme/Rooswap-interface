import { useEffect } from 'react'
import useMixpanel, { MIXPANEL_TYPE } from 'hooks/useMixpanel'
import DarkSideHero from './herorebel'
import ImprovedRebelKangaComponent from './content2'
import RebelKangas from './rebelcontent'
import StarWarsCrawl from './starwars'
import ResponsiveKangaMemorial from './rip'
import RebelsSection from './cards'
import styled from 'styled-components'

const PageWrapper = styled.div`
  width: 100%;
  background: #000814;
  min-height: 100vh;
  overflow-x: hidden;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`

const SectionDivider = styled.div`
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #7B61FF, #FF9D5A);
  opacity: 0.5;
`

export default function RebelKanga() {
  const { mixpanelHandler } = useMixpanel()

  useEffect(() => {
    mixpanelHandler(MIXPANEL_TYPE.PAGE_VIEWED, {
      page: 'rebel-kanga',
    })
  }, [mixpanelHandler])

  return (
    <PageWrapper>
      <DarkSideHero />
      <SectionDivider />
      <StarWarsCrawl />
      <SectionDivider />
      <ResponsiveKangaMemorial />
      <SectionDivider />
      <RebelKangas />
      <SectionDivider />
      <RebelsSection />
      <SectionDivider />
      <ImprovedRebelKangaComponent />
    </PageWrapper>
  )
}
