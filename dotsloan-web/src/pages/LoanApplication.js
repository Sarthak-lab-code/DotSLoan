import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import { useWallet } from '../context/WalletContext';
import { getSupportedAssets, createLoan } from '../services/acalaService';

function LoanApplication() {
  const navigate = useNavigate();
  const { connected, selectedAccount } = useWallet();
  
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    term: '3',
    collateral: '',
    asset: 'DOT', // Default to DOT
  });
  
  const [assets, setAssets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [txResult, setTxResult] = useState(null);

  // Initialize supported assets
  useEffect(() => {
    const init = async () => {
      try {
        setIsInitializing(true);
        
        // Get supported assets from Acala
        const supportedAssets = await getSupportedAssets();
        setAssets(supportedAssets);
      } catch (err) {
        console.error('Error initializing Acala:', err);
        setError('Failed to connect to Acala network. Please try again later.');
      } finally {
        setIsInitializing(false);
      }
    };
    
    init();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected || !selectedAccount) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Submit loan application to Acala
      const result = await createLoan(
        selectedAccount.address,
        {
          amount: parseFloat(formData.amount),
          collateral: parseFloat(formData.collateral),
          term: parseInt(formData.term),
          purpose: formData.purpose,
          asset: formData.asset
        }
      );
      
      console.log('Loan application result:', result);
      setTxResult(result);
      
      if (result.success) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to submit loan application');
      }
    } catch (err) {
      console.error('Error submitting loan application:', err);
      setError(err.message || 'Failed to submit loan application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get asset by ID
  const getAssetById = (id) => {
    return assets.find(asset => asset.id === id) || { symbol: 'Unknown', name: 'Unknown Asset' };
  };

  if (submitted) {
    return (
      <div className="loan-application">
        <div className="success-container">
          <h1>Loan Application Submitted!</h1>
          <p>Your loan application has been submitted to the Acala network.</p>
          
          {txResult && (
            <div className="tx-details">
              <h3>Transaction Details</h3>
              <p><strong>Block Hash:</strong> {txResult.blockHash}</p>
              <p><strong>Loan ID:</strong> {txResult.loanId}</p>
              <p><strong>Status:</strong> {txResult.status}</p>
            </div>
          )}
          
          <p>Application details:</p>
          <ul className="application-details">
            <li>
              <strong>Amount:</strong> {formData.amount} {getAssetById(formData.asset).symbol}
            </li>
            <li><strong>Purpose:</strong> {formData.purpose}</li>
            <li><strong>Term:</strong> {formData.term} months</li>
            <li>
              <strong>Collateral:</strong> {formData.collateral} {getAssetById(formData.asset).symbol}
            </li>
          </ul>
          <p>You can check the status of your application on the Dashboard.</p>
          <button 
            className="main-button" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="loan-application">
        <h1>Apply for a Loan</h1>
        <div className="loading-container">
          <p>Connecting to Acala network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loan-application">
      <h1>Apply for a Loan</h1>
      
      <div className="info-box">
        <h3>Real DeFi Lending</h3>
        <p>This application is connected to the Acala DeFi platform on Polkadot.</p>
        <p>You can use real assets as collateral to borrow other assets.</p>
      </div>
      
      <WalletConnect />
      
      {error && <div className="error-message">{error}</div>}
      
      {connected ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Asset</label>
            <select
              name="asset"
              value={formData.asset}
              onChange={handleChange}
              required
            >
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.symbol})
                </option>
              ))}
            </select>
            <small>The asset you want to borrow</small>
          </div>
          
          <div className="form-group">
            <label>Loan Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="1"
              step="0.1"
            />
            <small>The amount you want to borrow</small>
          </div>
          
          <div className="form-group">
            <label>Purpose</label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
            >
              <option value="">Select a purpose</option>
              <option value="business">Business</option>
              <option value="education">Education</option>
              <option value="personal">Personal</option>
              <option value="defi">DeFi Investment</option>
            </select>
            <small>The reason for your loan</small>
          </div>
          
          <div className="form-group">
            <label>Term (months)</label>
            <select
              name="term"
              value={formData.term}
              onChange={handleChange}
              required
            >
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
            <small>The duration of your loan</small>
          </div>
          
          <div className="form-group">
            <label>Collateral Amount</label>
            <input
              type="number"
              name="collateral"
              value={formData.collateral}
              onChange={handleChange}
              required
              min="1"
              step="0.1"
            />
            <small>The amount of {getAssetById(formData.asset).symbol} you'll lock as security for the loan</small>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Transaction...' : 'Submit Application'}
          </button>
          
          <div className="note">
            <p>Note: This will submit a real transaction to the blockchain. Make sure you have sufficient funds.</p>
          </div>
        </form>
      ) : (
        <div className="connect-prompt">
          <p>Please connect your wallet to apply for a loan.</p>
        </div>
      )}
    </div>
  );
}

export default LoanApplication;