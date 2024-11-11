import styled from 'styled-components';

// Example data to represent connected wallet users (rebels)
const rebels = [
  { name: 'Rebel Alpha', image: '/rebel-alpha.jpg', power: '600', status: 'Active' },
  { name: 'Rebel Beta', image: '/rebel-beta.jpg', power: '550', status: 'Active' },
  { name: 'Rebel Gamma', image: '/rebel-gamma.jpg', power: '620', status: 'Inactive' },
];

// Card container to hold individual rebel cards
const CardContainer = styled.div`
  perspective: 1000px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px; /* Reduced gap for smaller screens */
  margin-top: 50px;
  padding: 0 20px;

  @media (max-width: 768px) {
    gap: 15px;
    padding: 0 10px;
  }
`;

// Individual card with front and back
const RebelCard = styled.div`
  width: 250px;
  height: 350px;
  transform: skewY(-10deg); /* Tilt the cards like /// */
  transform-style: preserve-3d;
  transition: transform 0.6s;
  cursor: pointer;

  &:hover {
    transform: rotateY(180deg) skewY(-10deg); /* Flip on hover */
  }

  @media (max-width: 768px) {
    width: 180px;
    height: 250px;
  }

  @media (max-width: 480px) {
    width: 150px;
    height: 200px;
  }
`;

// Card front and back face styling
const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Orbitron', sans-serif;
  color: #ffffff;
  text-align: center;
  padding: 20px;
  background-color: #1a1a1a;

  @media (max-width: 480px) {
    padding: 10px;
  }
`;

// Front of the card
const CardFront = styled(CardFace)`
  background: linear-gradient(45deg, #7b61ff, #ff9d5a);
`;

// Back of the card
const CardBack = styled(CardFace)`
  background-color: #333;
  transform: rotateY(180deg);
`;

// Card content such as name, status, etc.
const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const RebelName = styled.h3`
  font-size: 24px;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const RebelPower = styled.p`
  font-size: 18px;
  color: #ff9d5a;
  margin: 5px 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const RebelStatus = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

// Section title
const SectionTitle = styled.h2`
  font-size: 48px;
  font-family: 'Orbitron', sans-serif;
  color: #ffffff;
  text-align: center;
  margin-top: 30px;

  @media (max-width: 768px) {
    font-size: 32px;
  }

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const RebelsSection = () => {
  return (
    <div className="rebels-section">
      <SectionTitle>Meet the Rebels</SectionTitle>
      <CardContainer>
        {rebels.map((rebel, index) => (
          <RebelCard key={index}>
            {/* Front Side */}
            <CardFront>
              <img
                src={rebel.image}
                alt={rebel.name}
                style={{ maxWidth: '100%', height: '100%', objectFit: 'cover' }}
              />
            </CardFront>

            {/* Back Side */}
            <CardBack>
              <CardContent>
                <RebelName>{rebel.name}</RebelName>
                <RebelPower>Power: {rebel.power}</RebelPower>
                <RebelStatus>Status: {rebel.status}</RebelStatus>
              </CardContent>
            </CardBack>
          </RebelCard>
        ))}
      </CardContainer>

      <style>{`
        .rebels-section {
          background-color: #000;
          padding: 50px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default RebelsSection;
