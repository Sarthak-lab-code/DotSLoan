import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import { useWallet } from '../context/WalletContext';
import { getUserLoans, repayLoan } from '../services/acalaService';
import './DashboardNew.css'; // Import the new CSS

function Dashboard() {
  const { connected, selectedAccount } = useWallet();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [repaying, setRepaying] = useState(false);
  const [repayAmount, setRepayAmount] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repaymentSuccess, setRepaymentSuccess] = useState(false);

  // Fetch user loans when account changes
  useEffect(() => {
    const fetchLoans = async () => {
      if (!connected || !selectedAccount) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const userLoans = await getUserLoans(selectedAccount.address);
        setLoans(userLoans);
      } catch (err) {
        console.error('Error fetching loans:', err);
        setError('Failed to fetch loan data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoans();
  }, [connected, selectedAccount, repaymentSuccess]);

  // Handle loan repayment
  const handleRepay = (loan) => {
    setSelectedLoan(loan);
    setRepayAmount('');
    setRepaying(true);
  };

  // Submit repayment
  const submitRepayment = async () => {
    if (!repayAmount || !selectedLoan) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await repayLoan(
        selectedAccount.address,
        selectedLoan.id,
        parseFloat(repayAmount)
      );
      
      if (result.success) {
        setRepaymentSuccess(true);
        setTimeout(() => setRepaymentSuccess(false), 5000);
        setRepaying(false);
      } else {
        throw new Error('Repayment failed');
      }
    } catch (err) {
      console.error('Error making repayment:', err);
      setError('Failed to process repayment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel repayment
  const cancelRepayment = () => {
    setRepaying(false);
    setSelectedLoan(null);
  };

  return (
    <div className="dashboard-container">
      {/* Background elements */}
      <div className="grid-pattern"></div>
      <div className="glowing-orb" style={{background: '#ff5c8d', width: '400px', height: '400px', top: '-100px', left: '-100px', opacity: 0.2}}></div>
      <div className="glowing-orb" style={{background: '#4a31ff', width: '500px', height: '500px', bottom: '-100px', right: '-100px', opacity: 0.2}}></div>
      
      {/* Dashboard header */}
      <div className="dashboard-header">
        <h1>Your Loan Dashboard</h1>
      </div>
      
      <div className="card-container">
        {/* Info summary card */}
        <div className="info-summary">
          <h3>Acala DeFi Lending Platform</h3>
          <p>This platform allows you to create, manage, and repay loans using various crypto assets on the Polkadot ecosystem.</p>
        </div>
        
        {/* Wallet connection area */}
        <div className="wallet-status-area">
          <WalletConnect />
        </div>
        
        {/* Error and success messages */}
        {error && (
          <div className="alert-error">
            <p>{error}</p>
          </div>
        )}
        
        {repaymentSuccess && (
          <div className="alert-success">
            <p>Repayment processed successfully!</p>
          </div>
        )}
        
        {/* Main dashboard content */}
        <div className="dashboard-content">
          {connected ? (
            <>
              {loading ? (
                <div className="no-loans">
                  <div className="loading"></div>
                  <h2>Loading your loans...</h2>
                  <p>Please wait while we fetch your loan data from the blockchain.</p>
                </div>
              ) : loans.length > 0 ? (
                <>
                  <div className="section-header">
                    <h2>Your Active Loans</h2>
                  </div>
                  
                  <div className="loans-grid">
                    {loans.map(loan => (
                      <div key={loan.id} className="loan-card-premium">
                        <div className="loan-card-header">
                          <h3>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="currentColor"/>
                            </svg>
                            Loan #{loan.id}
                          </h3>
                          <div className={`status-badge-premium ${loan.status}`}>
                            {loan.status}
                          </div>
                        </div>
                        
                        <div className="loan-card-body">
                          <div className="loan-detail">
                            <span className="detail-label">Amount</span>
                            <span className="detail-value highlight">{loan.amount} {loan.asset || 'DOT'}</span>
                          </div>
                          
                          <div className="loan-detail">
                            <span className="detail-label">Collateral</span>
                            <span className="detail-value">{loan.collateral} {loan.asset || 'DOT'}</span>
                          </div>
                          
                          <div className="loan-detail">
                            <span className="detail-label">Created</span>
                            <span className="detail-value">{new Date(loan.created).toLocaleDateString()}</span>
                          </div>
                          
                          {loan.purpose && (
                            <div className="loan-detail">
                              <span className="detail-label">Purpose</span>
                              <span className="detail-value">{loan.purpose}</span>
                            </div>
                          )}
                          
                          {loan.term && (
                            <div className="loan-detail">
                              <span className="detail-label">Term</span>
                              <span className="detail-value">{loan.term} months</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="loan-card-footer">
                          {loan.status === 'active' && (
                            <button 
                              className="btn-premium primary" 
                              onClick={() => handleRepay(loan)}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" fill="currentColor"/>
                              </svg>
                              Make Repayment
                            </button>
                          )}
                          
                          <button className="btn-premium">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z" fill="currentColor"/>
                            </svg>
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-loans">
                  <h2>No Active Loans</h2>
                  <p>You don't have any active loans at the moment. Start by applying for a loan to leverage the power of decentralized finance.</p>
                  <Link to="/apply" className="btn-apply">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" fill="currentColor"/>
                    </svg>
                    Apply for a Loan
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="connect-prompt-premium">
              <div className="connect-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 11H7V13H12V16L17 12L12 8V11Z" fill="currentColor"/>
                </svg>
              </div>
              <p>Please connect your wallet to view your loans and access the full functionality of this platform.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Repayment Modal */}
      {repaying && selectedLoan && (
        <div className="repay-modal-wrapper">
          <div className="repay-modal">
            <h2>Make a Repayment</h2>
            <div className="loan-identifier">
              <p>Loan ID: <strong>{selectedLoan.id}</strong></p>
            </div>
            
            <div className="form-group">
              <label>Repayment Amount</label>
              <input 
                type="number"
                className="form-control"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                min="0.1"
                step="0.1"
                required
              />
              <small className="form-text">
                Amount of {selectedLoan.asset || 'DOT'} to repay
              </small>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={cancelRepayment}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm"
                onClick={submitRepayment}
                disabled={!repayAmount || loading}
              >
                {loading ? <><span className="loading"></span>Processing...</> : 'Confirm Repayment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;