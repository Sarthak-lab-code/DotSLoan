import React, { useState, useEffect } from 'react';
import { createClient } from 'polkadot-api';

function PolkadotConnect() {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    try {
      setConnecting(true);
      setError(null);
      
      // This is a placeholder for actual wallet connection
      // In a real implementation, we would connect to Polkadot.js extension
      setTimeout(() => {
        // Simulate successful connection with mock data
        setAccount({
          address: '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5',
          name: 'My Polkadot Account'
        });
        setConnected(true);
        setConnecting(false);
      }, 1500);
      
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet: ' + err.message);
      setConnecting(false);
    }
  };

  return (
    <div className="wallet-connect">
      <h2>Wallet Connection</h2>
      
      {!connected ? (
        <div>
          <p>Connect your Polkadot wallet to apply for loans and manage your account.</p>
          <button 
            className="connect-button" 
            onClick={connectWallet}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (
        <div className="account-info">
          <p className="success-message">✓ Wallet Connected</p>
          <div className="account-details">
            <p><strong>Address:</strong> {account.address.substring(0, 6)}...{account.address.substring(account.address.length - 4)}</p>
            <p><strong>Name:</strong> {account.name}</p>
          </div>
        </div>
      )}
      
      <div className="wallet-info">
        <p><small>Don't have a wallet? <a href="https://polkadot.js.org/extension/" target="_blank" rel="noopener noreferrer">Install Polkadot.js Extension</a></small></p>
      </div>
    </div>
  );
}

export default PolkadotConnect;