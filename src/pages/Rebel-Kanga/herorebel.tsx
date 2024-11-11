import styled, { keyframes } from 'styled-components';
import RebelKanga from '/public/roovadar.svg';
import Stormtrooper from '/public/Rootrooper.svg';
import MintedLogo from '/public/Minted.svg';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

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
`;

const pulse = keyframes`
  0% {
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.9;
    transform: scale(1);
  }
`;

const moveGradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
`;

const textReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const MainContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #0a0a0a;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  font-family: 'Space Grotesk', 'Inter', sans-serif;
  position: relative;
  padding: 100px 20px;
  animation: ${fadeIn} 2s ease-out;

  background-image: url(${RebelKanga}), url(${Stormtrooper});
  background-position: left 5% center, right 5% center;
  background-repeat: no-repeat;
  background-size: 20%, 20%;

  @media (max-width: 768px) {
    padding: 120px 20px 200px;
    background-image: none;
  }
`;

const Nebula = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: 
    radial-gradient(circle at center, rgba(126, 10, 194, 0.5) 0%, rgba(18, 18, 18, 0) 70%),
    radial-gradient(circle at 30% 50%, rgba(126, 10, 194, 0.4) 0%, rgba(126, 10, 194, 0) 60%),
    radial-gradient(circle at 70% 50%, rgba(76, 0, 144, 0.4) 0%, rgba(76, 0, 144, 0) 60%),
    radial-gradient(circle at center, rgba(50, 205, 50, 0.3) 0%, rgba(50, 205, 50, 0) 50%);
  filter: blur(40px);
  opacity: 0.9;
  animation: ${pulse} 5s infinite, ${moveGradient} 10s linear infinite;

  @media (max-width: 768px) {
    background: 
      radial-gradient(circle at center, rgba(126, 10, 194, 0.6) 0%, rgba(18, 18, 18, 0) 80%),
      radial-gradient(circle at 30% 30%, rgba(126, 10, 194, 0.5) 0%, rgba(126, 10, 194, 0) 70%),
      radial-gradient(circle at 70% 70%, rgba(76, 0, 144, 0.5) 0%, rgba(76, 0, 144, 0) 70%),
      radial-gradient(circle at center, rgba(50, 205, 50, 0.4) 0%, rgba(50, 205, 50, 0) 70%);
    opacity: 1;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
  text-align: center;
`;

const GradientText = styled.span`
  background: linear-gradient(270deg, #7B61FF, #FF9D5A, #7B61FF);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  display: inline-block;
  animation: ${gradientAnimation} 10s linear infinite;
  background-size: 600% 600%;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.02em;
`;

const Heading = styled.h1`
  font-size: 80px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 20px;
  line-height: 1.1;
  text-shadow: 0 0 2px rgba(123, 97, 255, 0.7);
  opacity: 0;
  animation: ${textReveal} 2s ease forwards;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.03em;

  @media (max-width: 768px) {
    font-size: 60px;
  }
`;

const Paragraph = styled.p`
  font-size: 22px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 30px;
  opacity: 0;
  animation: ${textReveal} 2s ease 1s forwards;
  font-family: 'Inter', sans-serif;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const BuyButton = styled.a`
  background-color: #ff0000;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
  opacity: 0;
  animation: ${textReveal} 2s ease 1.5s forwards;
  position: relative;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 0.02em;

  &:hover {
    background-color: #cc0000;
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
    transform: scale(1.05);
  }
`;

const MintedLogoStyled = styled.img`
  width: 30px;
  height: 30px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background-color: #ffffff;
  padding: 2px;
`;

const ExclusiveText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-top: 15px;
  font-family: 'Inter', sans-serif;
`;

const StatsList = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 50px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatTitle = styled.h3`
  color: #ffffff;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 0 5px rgba(126, 10, 194, 0.5);
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const StatDescription = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  margin: 5px 0 0;
  font-family: 'Inter', sans-serif;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const DarkSideHero = () => {
  return (
    <MainContainer>
      <Nebula />
      <ContentWrapper>
        <Heading>
          Join<br />
          <GradientText>The Dark Side</GradientText><br />
          of Web3
        </Heading>
        <Paragraph>
          In the depths of the blockchain, only the strongest rebels survive.<br />
          Join the dark side of Web3.
        </Paragraph>

        <BuyButton href="https://minted.network/collections/cronos/0xb494b51a76e9b95708c9fa9d1477fe5e3efaf281" target="_blank">
          Buy on Minted
          <MintedLogoStyled src={MintedLogo} alt="Minted Logo" />
        </BuyButton>

        <ExclusiveText>Buy Exclusively on Minted.network</ExclusiveText>

        <StatsList>
          <StatItem>
            <StatTitle>DAO</StatTitle>
            <StatDescription>A Dao for the Rebel's</StatDescription>
          </StatItem>
          <StatItem>
            <StatTitle>2800 NFTs Sold</StatTitle>
            <StatDescription>1234 Rebel's remain</StatDescription>
          </StatItem>
          <StatItem>
            <StatTitle>3 Projects Hate Us</StatTitle>
            <StatDescription>We're Notorious in the Web3 Space</StatDescription>
          </StatItem>
        </StatsList>
      </ContentWrapper>
    </MainContainer>
  );
};

export default DarkSideHero;
