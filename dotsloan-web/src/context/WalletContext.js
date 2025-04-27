import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { initBlockchain, getAccountBalance, getNetworkInfo } from '../services/polkadotService';

// Create a context for wallet data
const WalletContext = createContext(null);

// Create a provider component
export function WalletProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({
    name: 'Unknown',
    tokenSymbol: 'DOT',
    tokenDecimals: 10,
    currentNetwork: 'westend'
  });

  // Check if extension is installed on component mount
  useEffect(() => {
    const checkExtension = () => {
      const injectedWeb3 = window?.injectedWeb3 || {};
      setExtensionInstalled(!!injectedWeb3['polkadot-js']);
    };
    
    checkExtension();
    
    // Initialize blockchain connection
    initBlockchain().then(async () => {
      try {
        const info = await getNetworkInfo();
        setNetworkInfo(info);
        console.log('Network info:', info);
      } catch (err) {
        console.error('Error getting network info:', err);
      }
    });
  }, []);

  // Function to fetch account balance
  const fetchAccountBalance = useCallback(async (address) => {
    if (!address) return;
    
    try {
      console.log('Fetching balance for address:', address);
      setLoading(true);
      const balance = await getAccountBalance(address);
      console.log('Account balance:', balance);
      setAccountBalance(balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
      // Don't set error state here to avoid overriding connection errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to connect to Polkadot.js Extension
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
      const userAccounts = await injected.accounts.get();
      console.log('User accounts:', userAccounts);
      
      if (userAccounts.length === 0) {
        throw new Error('No accounts found in the Polkadot.js extension.');
      }
      
      setAccounts(userAccounts);
      setSelectedAccount(userAccounts[0]);
      setConnected(true);
      
      // Fetch balance for the selected account
      await fetchAccountBalance(userAccounts[0].address);
      
    } catch (err) {
      console.error('Error connecting to Polkadot.js extension:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to change selected account
  const selectAccount = useCallback((address) => {
    const account = accounts.find(acc => acc.address === address);
    if (account) {
      setSelectedAccount(account);
      fetchAccountBalance(account.address);
    }
  }, [accounts, fetchAccountBalance]);

  // Context value
  const value = {
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
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use the wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}