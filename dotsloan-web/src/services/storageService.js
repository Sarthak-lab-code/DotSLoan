// src/services/storageService.js
// Simple storage service to persist data between sessions

// Store data in localStorage with a specified key
export const storeData = (key, data) => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  };
  
  // Retrieve data from localStorage by key
  export const retrieveData = (key) => {
    try {
      const serializedData = localStorage.getItem(key);
      if (!serializedData) return null;
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  };
  
  // Store a new loan
  export const storeLoan = (address, loanData) => {
    try {
      // Get existing loans for this user
      const userLoansKey = `loans_${address}`;
      const existingLoans = retrieveData(userLoansKey) || [];
      
      // Add the new loan
      existingLoans.push({
        ...loanData,
        created: new Date().toISOString()
      });
      
      // Save back to storage
      storeData(userLoansKey, existingLoans);
      
      return true;
    } catch (error) {
      console.error('Error storing loan:', error);
      return false;
    }
  };
  
  // Get all loans for a user
  export const getUserLoans = (address) => {
    try {
      const userLoansKey = `loans_${address}`;
      return retrieveData(userLoansKey) || [];
    } catch (error) {
      console.error('Error getting user loans:', error);
      return [];
    }
  };