// src/services/parallelFinanceService.js

// Get user's active loans
export const getUserLoans = async (address) => {
    console.log('Getting user loans for address:', address);
    
    // Return simulated loans after a short delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'LOAN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            amount: 100,
            collateral: 150,
            status: 'pending',
            created: new Date().toLocaleDateString()
          }
        ]);
      }, 1000);
    });
  };
  
  // Get supported currencies/assets
  export const getSupportedAssets = async () => {
    // Return standard assets after a short delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '0', symbol: 'DOT', name: 'Polkadot', decimals: 10 },
          { id: '1', symbol: 'PARA', name: 'Parallel', decimals: 12 },
          { id: '2', symbol: 'USDT', name: 'Tether USD', decimals: 6 }
        ]);
      }, 500);
    });
  };
  
  // Create loan application
  export const createLoanApplication = async (address, loanData) => {
    console.log('Creating simulated loan application...');
    console.log('Loan data:', loanData);
    
    // Simulate a transaction with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          blockHash: '0x' + Array.from({length: 64}, () => 
            Math.floor(Math.random() * 16).toString(16)).join(''),
          loanId: 'LOAN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          status: 'pending',
          simulated: true
        });
      }, 2000);
    });
  };