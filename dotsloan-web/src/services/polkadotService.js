import { ApiPromise, WsProvider } from '@polkadot/api';

// Define network endpoints
export const ENDPOINTS = {
  polkadot: 'wss://rpc.polkadot.io',
  kusama: 'wss://kusama-rpc.polkadot.io',
  rococo: 'wss://rococo-rpc.polkadot.io',
  westend: 'wss://westend-rpc.polkadot.io',
};

let api = null;
let currentNetwork = 'westend'; // Default to testnet

// Initialize blockchain connection
export const initBlockchain = async (network = 'westend') => {
  try {
    if (api) {
      // If already connected to the same network, return existing connection
      if (currentNetwork === network) {
        return api;
      }
      
      // If connected to a different network, disconnect first
      await api.disconnect();
      api = null;
    }
    
    // Update current network
    currentNetwork = network;
    
    // Create a WebSocket provider with the specified endpoint
    const endpoint = ENDPOINTS[network];
    if (!endpoint) {
      throw new Error(`Unknown network: ${network}`);
    }
    
    console.log(`Connecting to ${network} at ${endpoint}...`);
    const provider = new WsProvider(endpoint);
    
    // Create API instance
    api = await ApiPromise.create({ provider });
    
    // Get chain information
    const [chain, nodeName, nodeVersion] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version()
    ]);
    
    console.log(`Connected to ${chain} using ${nodeName} v${nodeVersion}`);
    
    return api;
  } catch (error) {
    console.error('Error initializing blockchain connection:', error);
    throw error;
  }
};

// Get account balance
export const getAccountBalance = async (address) => {
  try {
    if (!api) {
      await initBlockchain();
    }
    
    // Query account info including balances
    const { data: accountData } = await api.query.system.account(address);
    
    // Get free balance
    const free = accountData.free.toString();
    const reserved = accountData.reserved.toString();
    const total = accountData.free.add(accountData.reserved).toString();
    
    // Format balance (Polkadot has 10 decimal places)
    const formattedFree = formatBalance(free);
    const formattedReserved = formatBalance(reserved);
    const formattedTotal = formatBalance(total);
    
    return {
      free: {
        raw: free,
        formatted: formattedFree
      },
      reserved: {
        raw: reserved,
        formatted: formattedReserved
      },
      total: {
        raw: total,
        formatted: formattedTotal
      }
    };
  } catch (error) {
    console.error('Error getting account balance:', error);
    return {
      free: { raw: '0', formatted: '0.0000' },
      reserved: { raw: '0', formatted: '0.0000' },
      total: { raw: '0', formatted: '0.0000' }
    };
  }
};

// Helper to format balance
export const formatBalance = (balance, decimals = 10) => {
  if (!balance) return '0';
  
  // Convert to string if it's not
  const balanceStr = balance.toString();
  
  // If balance is less than 10^decimals, format with decimals
  if (balanceStr.length <= decimals) {
    const paddedBalance = balanceStr.padStart(decimals, '0');
    return `0.${paddedBalance}`;
  }
  
  // Insert decimal point
  const integerPart = balanceStr.slice(0, balanceStr.length - decimals);
  const fractionalPart = balanceStr.slice(balanceStr.length - decimals);
  
  // Round to 4 decimal places for display
  const roundedFractional = fractionalPart.slice(0, 4).padEnd(4, '0');
  
  return `${integerPart}.${roundedFractional}`;
};

// Get network info
export const getNetworkInfo = async () => {
  try {
    if (!api) {
      await initBlockchain();
    }
    
    const chain = await api.rpc.system.chain();
    const properties = await api.rpc.system.properties();
    
    return {
      name: chain.toString(),
      tokenSymbol: properties.tokenSymbol.toString() || 'DOT',
      tokenDecimals: properties.tokenDecimals.toJSON()[0] || 10,
      currentNetwork
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return {
      name: 'Unknown',
      tokenSymbol: 'DOT',
      tokenDecimals: 10,
      currentNetwork
    };
  }
};

// Sign and send transaction using polkadot.js extension
export const signAndSendTransaction = async (extrinsic, address) => {
  try {
    if (!api) {
      await initBlockchain();
    }
    
    // Get the injected extension
    const injectedExtension = await window.injectedWeb3['polkadot-js'].enable('Polkadot Loan App');
    
    return new Promise((resolve, reject) => {
      extrinsic.signAndSend(address, { signer: injectedExtension.signer }, ({ status, events, dispatchError }) => {
        if (dispatchError) {
          let errorMessage;
          
          if (dispatchError.isModule) {
            // For module errors, we have the section and method
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            errorMessage = `${decoded.section}.${decoded.method}: ${decoded.docs}`;
          } else {
            // Other errors
            errorMessage = dispatchError.toString();
          }
          
          reject(new Error(errorMessage));
        } else if (status.isInBlock || status.isFinalized) {
          // Find success or failure event
          const eventData = events.find(({ event }) => 
            api.events.system.ExtrinsicSuccess.is(event) ||
            api.events.system.ExtrinsicFailed.is(event)
          );
          
          if (!eventData || api.events.system.ExtrinsicSuccess.is(eventData.event)) {
            // Success
            const blockHash = status.isFinalized ? status.asFinalized : status.asInBlock;
            resolve({
              success: true,
              blockHash: blockHash.toString(),
              status: status.type
            });
          } else {
            // Failure
            reject(new Error('Transaction failed'));
          }
        }
      }).catch(reject);
    });
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw error;
  }
};