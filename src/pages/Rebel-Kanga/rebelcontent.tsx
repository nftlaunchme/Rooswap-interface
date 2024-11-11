import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import MintedLogo from '/public/Minted.svg';

const MintedButton = styled.a`
  background-color: #ff0000;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  padding: 15px 30px;
  border: none;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: 0.02em;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4);
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

const RebelKangas: React.FC = () => {
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const featureThreshold = 100;
      setIsFeatured(scrollPosition > featureThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

    .section-container {
      background-color: #000000;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 50px 20px;
      width: 100%;
      position: relative;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }

    .featured-highlight {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 0;
      background: linear-gradient(to right, #7B61FF, #FF9D5A);
      transition: height 0.3s ease-in-out;
      z-index: 1;
    }

    .featured-highlight.active {
      height: 10px;
    }

    .content-wrapper {
      max-width: 1000px;
      text-align: left;
      padding: 20px;
      color: #ffffff;
      z-index: 5;
      width: 100%;
      box-sizing: border-box;
    }

    .main-header {
      font-size: 54px;
      font-weight: 700;
      margin-bottom: 40px;
      line-height: 1.1;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: -0.03em;
    }

    .gradient-text {
      background: linear-gradient(90deg, #7B61FF, #FF9D5A);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      display: inline-block;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: -0.02em;
    }

    .text-columns {
      display: flex;
      gap: 40px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .body-text {
      font-size: 18px;
      font-weight: 400;
      line-height: 1.6;
      flex: 1;
      font-family: 'Inter', sans-serif;
    }

    .highlight-text {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 40px;
      color: #FF9D5A;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: -0.01em;
    }

    .visual-elements {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      pointer-events: none;
    }

    .purple-mist {
      position: absolute;
      top: 0;
      left: 0;
      width: 60%;
      height: 100%;
      background: radial-gradient(circle, rgba(123, 97, 255, 0.6), transparent 70%);
      opacity: 1;
      filter: blur(120px);
      z-index: 4;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
    }

    .circle1 {
      width: 300px;
      height: 300px;
      background: #7B61FF;
      top: -100px;
      left: -100px;
      z-index: 3;
    }

    .circle2 {
      width: 200px;
      height: 200px;
      background: #FF9D5A;
      bottom: -50px;
      right: -50px;
      z-index: 3;
    }

    .square {
      position: absolute;
      width: 100px;
      height: 100px;
      background: #7B61FF;
      opacity: 0.1;
      transform: rotate(45deg);
      top: 50%;
      right: 10%;
      z-index: 3;
    }

    @media (max-width: 768px) {
      .main-header {
        font-size: 36px;
      }

      .text-columns {
        flex-direction: column;
        gap: 20px;
      }

      .body-text {
        font-size: 16px;
      }

      .highlight-text {
        font-size: 20px;
      }

      .purple-mist {
        width: 100%;
        height: 60%;
        filter: blur(100px);
      }

      .circle1, .circle2 {
        width: 150px;
        height: 150px;
      }

      .square {
        width: 50px;
        height: 50px;
      }
    }
  `;

  return (
    <div className="section-container">
      <div className={`featured-highlight ${isFeatured ? 'active' : ''}`}></div>
      <div className="content-wrapper">
        <motion.h1
          className="main-header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="gradient-text">The Rebel Kangas</span> are back, more{' '}
          <span className="gradient-text">defiant</span> than ever.
        </motion.h1>
        <div className="text-columns">
          <motion.p
            className="body-text"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            From failed rescues to rebellious rises, our journey has been one of relentless defiance and innovation in the face of FUD and setbacks.
          </motion.p>
          <motion.p
            className="body-text"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Now, with new utilities, wrapped assets, and a bridge across the Web3 universe, the dark side is back in the game.
          </motion.p>
        </div>
        <motion.p
          className="highlight-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Welcome to the future of liquid NFTs – join the rebellion or get left behind.
        </motion.p>

        <MintedButton href="https://minted.network/collections/cronos/0xb494b51a76e9b95708c9fa9d1477fe5e3efaf281" target="_blank">
          Join the Rebellion
          <MintedLogoStyled src={MintedLogo} alt="Minted Logo" />
        </MintedButton>
      </div>
      <div className="visual-elements">
        <div className="purple-mist"></div>
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
        <div className="square"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: styles }} />
    </div>
  );
};

export default RebelKangas;
