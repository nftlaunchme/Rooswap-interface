// StarWarsCrawl.tsx
import React, { useRef, useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Keyframe Animations
const introAnimation = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const crawlAnimation = keyframes`
  0% { top: 100%; }
  100% { top: -300%; } /* Adjusted to ensure full scroll */
`;

const logoAnimation = keyframes`
  0% { transform: translateX(-50%) scale(2.5); opacity: 1; }
  100% { transform: translateX(-50%) scale(0.5); opacity: 0; }
`;

// Styled Components
const StarWarsContainer = styled.article`
  width: 100%;
  height: 100vh;
  font-family: 'News Cycle', sans-serif;
  letter-spacing: 0.15em;
  color: #ffeb3b;
  background: linear-gradient(to bottom, #000, #111);
  overflow: hidden;
  position: relative;
  margin: 0;
`;

const StartSection = styled.section<{ isVisible: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  font-size: 2em;
  width: 80%;
  max-width: 400px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  color: #ffeb3b;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;
  pointer-events: ${(props) => (props.isVisible ? 'auto' : 'none')};

  span {
    color: #4bd5ee;
  }

  @media (max-width: 768px) {
    font-size: 1.5em;
    max-width: 300px;
  }
`;

const IntroText = styled.section<{ isVisible: boolean }>`
  position: absolute;
  top: 30%;
  width: 80%;
  max-width: 500px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2em;
  font-weight: 400;
  color: #4bd5ee;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  animation: ${(props) =>
    props.isVisible ? css`${introAnimation} 2s ease-out forwards` : 'none'};
  transition: opacity 0.5s ease-out;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 1.5em;
    max-width: 400px;
  }
`;

const TitlesCrawl = styled.section<{ isVisible: boolean }>`
  position: absolute;
  bottom: ${(props) => (props.isVisible ? '-10%' : '100%')};
  width: 80%;
  max-width: 800px;
  height: 300vh;
  font-size: 2em;
  text-align: justify;
  overflow: hidden;
  transform-origin: 50% 100%;
  perspective: 500px;
  transform: rotateX(25deg);
  animation: ${(props) =>
    props.isVisible ? css`${crawlAnimation} 120s linear forwards` : 'none'}; /* Increased duration */
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: opacity 0.5s ease-in, bottom 0.5s ease-in;
  z-index: 0;
  left: 50%;
  transform: translateX(-50%) rotateX(25deg);

  @media (max-width: 768px) {
    font-size: 1.2em;
    width: 90%;
  }

  div {
    position: absolute;
    width: 100%;
  }

  h1 {
    text-align: center;
    margin-bottom: 0.5em;
  }

  p {
    margin: 1.35em 0;
    line-height: 1.6em;
    color: #ffeb3b;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
  }
`;

const LogoSection = styled.section<{ isVisible: boolean }>`
  position: absolute;
  bottom: 15%;
  width: 200px;
  left: 50%;
  transform: translateX(-50%) scale(1);
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  animation: ${(props) =>
    props.isVisible ? css`${logoAnimation} 5s ease-out forwards` : 'none'};
  transition: opacity 0.5s ease-in;

  img {
    width: 100%;
    height: auto;
  }

  @media (max-width: 768px) {
    width: 150px;
  }
`;

const StarWarsCrawl: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showCrawl, setShowCrawl] = useState(false);

  useEffect(() => {
    // Preload the audio
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, []);

  const handleStart = () => {
    setIsPlaying(true);
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
          })
          .catch((error) => {
            console.error('Audio playback failed:', error);
            // Optionally, implement a fallback UI here
          });
      }
    }
    setShowIntro(true);
    setTimeout(() => setShowIntro(false), 3000); // Intro text visible for 3 seconds
    setShowCrawl(true);

    // Optional: Hide the crawl after the animation completes
    // setTimeout(() => setShowCrawl(false), 120000); // 120 seconds
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    // Removed: setShowCrawl(false); to allow the crawl to continue
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <StarWarsContainer>
      {/* Audio Element */}
      <audio ref={audioRef} preload="auto" onEnded={handleAudioEnd}>
        <source
          src="https://s.cdpn.io/1202/Star_Wars_original_opening_crawl_1977.ogg"
          type="audio/ogg"
        />
        <source
          src="https://s.cdpn.io/1202/Star_Wars_original_opening_crawl_1977.mp3"
          type="audio/mpeg"
        />
        Your browser does not support the audio element.
      </audio>

      {/* Start Button */}
      <StartSection
        isVisible={!isPlaying}
        onClick={handleStart}
        aria-label="Start Rebel Kangas Crawl"
      >
        <p>
          Start <br />
          <span>Rebel Kangas Story</span> <br />
          2024
          <br />
          <span>Told by Joey</span>
        </p>
      </StartSection>

      {/* Introductory Text */}
      <IntroText isVisible={showIntro}>
        In a digital realm, far away...
      </IntroText>

      {/* Crawl Text */}
      <TitlesCrawl isVisible={showCrawl}>
        <div>
          <h1>The ROO Finance Saga</h1>
          <h1>Rise, Fall, and Return of the Rebel Kangas</h1>

          <p>
            Evil Ape Corp, with its army of apes, has risen to power in the Cronos blockchain.
            Promising a new era of digital assets, they instead began to dominate the ecosystem,
            stifling innovation and exploiting smaller projects.
          </p>

          <p>
            As Evil Ape's influence grew, a group of idealistic rebels emerged.
            Calling themselves the REBEL KANGAS, they rallied around their visionary leader, JOEY.
          </p>

          <p>
            The Rebel Kangas worked tirelessly, learning the intricacies of the Cronos chain
            while infusing their project with genuine community values. They created unique
            systems that allowed supporters to earn rewards and launched platforms for digital
            artists to thrive. As their influence grew, so did their ranks, with loyal TRUSTED
            KANGAROOS joining the cause.
          </p>

          <p>
          Victory seemed within reach, but a new threat lurked in the shadows. The AI FROGS,
            masquerading as allies, had infiltrated the Kangas' inner circle. Led by the devious
            DARTH RIBBIT, they executed a ruthless takeover, seizing control and turning the Kangas'
            own creations against them.
          </p>

          <p>
          Will the Rebel Kangas reclaim be great once more?
          </p>

          <p>
         
          </p>

          <p>
            
          </p>

          <p>
         
          </p>

          <p>
            
          </p>

          <p>
            
          </p>
        </div>
      </TitlesCrawl>

      {/* Logo Animation */}
      <LogoSection isVisible={isPlaying}>
        <img src="/roosvg.svg" alt="ROO Finance Logo" />
      </LogoSection>
    </StarWarsContainer>
  );
};

export default StarWarsCrawl;
