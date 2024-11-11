import { useRef, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { FaRocket, FaChartLine, FaHandsHelping, FaGift } from 'react-icons/fa';

// Import Inter font from Google Fonts
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    background: #000; /* Dark background to complement the space theme */
    overflow-x: hidden; /* Prevent horizontal scroll */
  }
`;

// Main container with space-themed background
const MainContainer = styled(motion.div)`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  padding: 40px 20px;
  background: linear-gradient(135deg, #000814, #001d3d); /* Darker space-inspired gradient */

  @media (max-width: 768px) {
    padding: 20px 10px;
  }
`;

// Background canvas for particle animation
const BackgroundCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

// Content wrapper with two-column layout
const ContentWrapper = styled(motion.div)`
  display: flex;
  max-width: 1200px;
  width: 100%;
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.7);
  z-index: 1;
  position: relative;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    max-width: 90%;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 100%;
  }
`;

// Text column
const TextColumn = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(5px);
  position: relative;

  @media (max-width: 1024px) {
    padding: 30px;
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

// Image column for SVG
const ImageColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center vertically */
  align-items: flex-end; /* Align SVG to the right */
  overflow: hidden;
  padding: 20px; /* Padding for spacing */
  position: relative;

  @media (max-width: 768px) {
    order: -1;
    height: 200px;
    width: 100%;
    align-items: center; /* Center horizontally on mobile */
    padding: 10px;
  }
`;

// SVG container with hover effect
const SVGContainer = styled(motion.div)`
  width: 100%;
  max-width: 400px; /* Limit maximum width of SVG */
  height: auto;
  display: flex;
  justify-content: flex-end; /* Align SVG to the right */
  align-items: center; /* Center vertically */
  transition: transform 0.3s ease;

  object {
    width: 100%;
    height: auto;
  }

  @media (max-width: 768px) {
    max-width: 300px;
    justify-content: center; /* Center SVG on mobile */
  }

  &:hover {
    transform: scale(1.02);
  }
`;

// Title with gradient text
const Title = styled(motion.h1)`
  font-size: 54px;
  font-weight: 700;
  margin-bottom: 20px;
  color: rgb(255, 255, 255);
  line-height: 1.2;

  @media (max-width: 1024px) {
    font-size: 48px;
  }

  @media (max-width: 768px) {
    font-size: 36px;
    line-height: 1.3;
  }

  .gradient-text {
    background: linear-gradient(90deg, #7B61FF, #FF9D5A);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    display: inline-block;
    font-weight: 700;
  }
`;

// Paragraph styling
const Paragraph = styled(motion.p)`
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 15px;
  color: rgb(255, 255, 255);

  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 1.5;
  }
`;

// Utilities Title with gradient text
const UtilitiesTitle = styled(motion.h2)`
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin: 50px 0 40px; /* Add more space to ensure visibility */
  z-index: 2; /* Make sure it's above other elements */

  /* Gradient effect for text */
  background: linear-gradient(90deg, #7B61FF, #FF9D5A);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;

  @media (max-width: 768px) {
    font-size: 36px;
    margin: 40px 0 30px;
  }
`;

// Utilities Section to hold the utility cards
const UtilitiesSection = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  z-index: 2; /* Ensure it is above other elements */
  margin-bottom: 40px;
  padding: 0 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    gap: 15px;
    padding: 0 10px;
  }
`;

// Individual Utility Box with hover and focus effects
const UtilityBox = styled(motion.div)`
  background: rgba(26, 0, 36, 0.8); /* Semi-transparent background */
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  color: rgb(255, 255, 255);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 220px; /* Consistent width */

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 24px rgba(255, 157, 90, 0.5);
  }

  @media (max-width: 768px) {
    padding: 20px;
    min-width: 45%; /* Adjust width for smaller screens */
  }

  .icon {
    font-size: 32px;
    margin-bottom: 15px;
    color: #FF9D5A; /* Complementary orange color */
  }

  .title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
    color: rgb(255, 255, 255);
  }

  .description {
    font-size: 14px;
    font-weight: 400;
    color: rgb(255, 255, 255);
    line-height: 1.6;
  }

  &:focus {
    outline: 2px solid #FF9D5A;
    outline-offset: 4px;
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 12px 24px rgba(255, 157, 90, 0.5);
  }
`;

// Additional text below Utilities
const AdditionalText = styled(motion.p)`
  font-size: 16px;
  line-height: 1.5;
  margin-top: 20px;
  color: rgb(255, 255, 255);
  text-align: center;
  max-width: 800px;
  z-index: 2; /* Ensure it is above other elements */

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 1.4;
  }
`;

// Animation Variants
const utilitiesVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

const utilityBoxVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

// Main Component
const ImprovedRebelKangaComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles: any[] = [];
    const particleCount = 150; 

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5, 
        r: Math.floor(Math.random() * 255),
        g: Math.floor(Math.random() * 255),
        b: Math.floor(Math.random() * 255),
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        twinkle: Math.random() * 0.05 + 0.05, 
        opacity: Math.random() * 0.5 + 0.5,
        direction: Math.random() < 0.5 ? -1 : 1,
      });
    }

    const drawParticles = () => {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#000814');
      gradient.addColorStop(0.5, '#001d3d');
      gradient.addColorStop(1, '#000814');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.opacity})`;
        ctx.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        particle.opacity += particle.twinkle * particle.direction;
        if (particle.opacity <= 0.2 || particle.opacity >= 0.8) {
          particle.direction *= -1;
        }
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <MainContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <BackgroundCanvas ref={canvasRef} />
        <ContentWrapper
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <TextColumn>
            <Title
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Introducing the <span className="gradient-text">Rebel Kanga's</span>
            </Title>
            <Paragraph
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              The Rebel Kanga's are the heart of our rebellion, embodying the spirit of defiance and innovation. The Rebels are back under old management, ready to build a thriving community and ecosystem.
            </Paragraph>
          </TextColumn>
          <ImageColumn>
            <SVGContainer
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <object type="image/svg+xml" data="/storm1.svg" aria-label="Rebel Kanga Illustration">
                Your browser does not support SVG.
              </object>
            </SVGContainer>
          </ImageColumn>
        </ContentWrapper>

        {/* Add the Utilities title with gradient effect */}
        <UtilitiesTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Utilities
        </UtilitiesTitle>

        {/* Utilities Section arranged in a single horizontal line */}
        <UtilitiesSection
          variants={utilitiesVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Utility Boxes arranged horizontally */}
          <UtilityBox
            variants={utilityBoxVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            tabIndex={0}
          >
            <FaRocket className="icon" />
            <div className="title">ERC404's</div>
            <div className="description">Liquid NFTs with ecosystem profits going back to Rebels.</div>
          </UtilityBox>
          <UtilityBox
            variants={utilityBoxVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            tabIndex={0}
          >
            <FaChartLine className="icon" />
            <div className="title">Ecosystem Profits</div>
            <div className="description">Share in the profits generated by our expanding ecosystem.</div>
          </UtilityBox>
          <UtilityBox
            variants={utilityBoxVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            tabIndex={0}
          >
            <FaHandsHelping className="icon" />
            <div className="title">DAO</div>
            <div className="description">Participate in governance decisions through our DAO.</div>
          </UtilityBox>
          <UtilityBox
            variants={utilityBoxVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            tabIndex={0}
          >
            <FaGift className="icon" />
            <div className="title">Airdrops</div>
            <div className="description">Receive exclusive airdrops as a loyal member.</div>
          </UtilityBox>
        </UtilitiesSection>

        {/* Add the additional small text below Utilities */}
        <AdditionalText
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          
Whispers in the shadows speak of their return—silent, unseen, yet their purpose runs deep. The Rebels rise not for treasure, but for those who can read between the lines.
        </AdditionalText>
      </MainContainer>
    </>
  );
};

export default ImprovedRebelKangaComponent;