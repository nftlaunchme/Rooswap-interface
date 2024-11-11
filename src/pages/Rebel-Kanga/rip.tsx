import { useSpring, animated } from 'react-spring';
import styled from 'styled-components';

export default function ResponsiveKangaMemorial() {
  const spotlightAnimation = useSpring({
    from: { opacity: 0.2 },
    to: { opacity: 0.6 },
    config: { duration: 3000 },
    loop: { reverse: true },
  });

  return (
    <BannerContainer>
      <ContentWrapper>
        <ImageContainer>
          <AnimatedSpotlight style={spotlightAnimation} />
          <KangaImage
            src="/RooV2.svg" // Replace with actual SVG path
            alt="Dead Kanga"
          />
        </ImageContainer>
        <TextContainer>
          <Title>
            In Memory of <br /> 1,569 Rebel Kangas
          </Title>
          <Text>
            We remember the brave souls who fought valiantly for our cause, only to meet a tragic fate. Their courage and sacrifice will forever be etched in our hearts.
          </Text>
          <Subtext>
            78 Rebels defected, their memory lingers in the shadows...
          </Subtext>
        </TextContainer>
      </ContentWrapper>
    </BannerContainer>
  );
}

const BannerContainer = styled.div`
  width: 100%;
  min-height: 60vh;
  background-color: #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1000px;
  width: 100%;
  text-align: center;

  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 0;
    margin-right: 40px;
  }
`;

const AnimatedSpotlight = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
`;

const KangaImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: grayscale(100%);
`;

const TextContainer = styled.div`
  width: 100%;
  max-width: 600px;
`;

const Title = styled.h1`
  color: #e0e0e0;
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    font-size: 36px;
  }
`;

const Text = styled.p`
  color: #cccccc;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const Subtext = styled.p`
  color: #999999;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  font-style: italic;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;
