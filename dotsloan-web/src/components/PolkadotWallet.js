import React, { useState, useEffect } from 'react';

function PolkadotWallet() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  useEffect(() => {
    // Check if the extension is installed
    const checkExtension = () => {
      const injectedWindow = window;
      setExtensionInstalled(!!injectedWindow.injectedWeb3?.['polkadot-js']);
    };
    
    checkExtension();
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if extension is installed
      if (!window.injectedWeb3?.['polkadot-js']) {
        throw new Error('Polkadot.js extension not found. Please install it first.');
      }
      
      // Request access to the extension
      const extension = window.injectedWeb3['polkadot-js'];
      const injected = await extension.enable('Polkadot Loan App');
      
      // Get accounts
      const accounts = await injected.accounts.get();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found in the Polkadot.js extension.');
      }
      
      setAccounts(accounts);
      setSelectedAccount(accounts[0]);
      setConnected(true);
      
    } catch (err) {
      console.error('Error connecting to Polkadot.js extension:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (e) => {
    const address = e.target.value;
    const account = accounts.find(acc => acc.address === address);
    setSelectedAccount(account);
  };

  return (
    <div className="wallet-connect">
      <h2>Connect Your Wallet</h2>
      
      {!connected ? (
        <div>
          <p>Connect your Polkadot wallet to use this application.</p>
          
          {!extensionInstalled ? (
            <div className="extension-warning">
              <p>Polkadot.js extension not detected. Please install it to continue.</p>
              <a 
                href="https://polkadot.js.org/extension/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="install-button"
              >
                Install Polkadot.js Extension
              </a>
            </div>
          ) : (
            <button 
              className="connect-button" 
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
          
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (
        <div className="account-info">
          <p className="success-message">✓ Wallet Connected</p>
          
          {accounts.length > 1 ? (
            <div className="account-select-container">
              <label>Select Account:</label>
              <select 
                className="account-select" 
                value={selectedAccount?.address || ''}
                onChange={handleAccountChange}
              >
                {accounts.map(acc => (
                  <option key={acc.address} value={acc.address}>
                    {acc.meta.name} ({acc.address.substring(0, 6)}...{acc.address.substring(acc.address.length - 4)})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="account-details">
              <p><strong>Name:</strong> {selectedAccount?.meta.name}</p>
              <p><strong>Address:</strong> {selectedAccount?.address.substring(0, 10)}...{selectedAccount?.address.substring(selectedAccount.address.length - 10)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PolkadotWallet;