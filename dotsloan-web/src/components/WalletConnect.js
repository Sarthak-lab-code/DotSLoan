import React, { useEffect } from 'react';
import { useWallet } from '../context/WalletContext';

function WalletConnect() {
  const { 
    accounts, 
    selectedAccount, 
    accountBalance,
    connected, 
    loading, 
    error, 
    extensionInstalled,
    networkInfo,
    connectWallet,
    selectAccount,
    fetchAccountBalance
  } = useWallet();

  // Fetch balance when account changes
  useEffect(() => {
    if (connected && selectedAccount) {
      fetchAccountBalance(selectedAccount.address);
    }
  }, [connected, selectedAccount, fetchAccountBalance]);

  const handleAccountChange = (e) => {
    selectAccount(e.target.value);
  };

  // Helper function to safely display account name
  const getAccountName = (account) => {
    if (!account) return 'Unknown Account';
    
    // Check for different possible structures
    if (account.meta && account.meta.name) return account.meta.name;
    if (account.name) return account.name;
    
    return 'Unnamed Account';
  };

  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return '';
    if (address.length < 15) return address;
    return `${address.substring(0, 10)}...${address.substring(address.length - 10)}`;
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
          <div className="network-info">
            <span>Network: {networkInfo.name}</span>
          </div>
          
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
                    {getAccountName(acc)} ({formatAddress(acc.address)})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="account-details">
              <p><strong>Name:</strong> {getAccountName(selectedAccount)}</p>
              <p><strong>Address:</strong> {formatAddress(selectedAccount?.address)}</p>
            </div>
          )}
          
          <div className="balance-container">
            {loading ? (
              <p><strong>Balance:</strong> Loading...</p>
            ) : accountBalance ? (
              <>
                <p><strong>Available:</strong> {accountBalance.free.formatted} {networkInfo.tokenSymbol}</p>
                <p><strong>Reserved:</strong> {accountBalance.reserved.formatted} {networkInfo.tokenSymbol}</p>
                <p><strong>Total:</strong> {accountBalance.total.formatted} {networkInfo.tokenSymbol}</p>
              </>
            ) : (
              <p><strong>Balance:</strong> 0 {networkInfo.tokenSymbol}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletConnect;
