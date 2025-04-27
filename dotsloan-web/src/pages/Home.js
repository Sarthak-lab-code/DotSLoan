import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="landing-page">
      <h1>Welcome to Polkadot Loans</h1>
      <p>Revolutionizing blockchain-based microservices for loan applications</p>
      <button className="cta-btn">Get Started</button>

      <div className="scroll-down">↓ Scroll Down</div>

      {/* Parallax Section */}
      <div className="parallax-container">
        <div className="parallax-content">
          <h2>Experience the Future of Finance</h2>
          <p>With the power of blockchain, decentralized finance, and microservices, we provide you with a seamless loan application experience.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
