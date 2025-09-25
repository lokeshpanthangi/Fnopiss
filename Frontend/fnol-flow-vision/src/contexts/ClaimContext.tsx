import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClaimProcessingResult } from '@/services/api';

interface ClaimContextType {
  claimResults: Map<string, ClaimProcessingResult>;
  setClaimResult: (claimId: string, result: ClaimProcessingResult) => void;
  getClaimResult: (claimId: string) => ClaimProcessingResult | null;
  clearClaimResult: (claimId: string) => void;
}

const ClaimContext = createContext<ClaimContextType | undefined>(undefined);

const STORAGE_KEY = 'fnol_claim_results';

// Helper functions for localStorage
const loadFromStorage = (): Map<string, ClaimProcessingResult> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    }
  } catch (error) {
    console.error('Failed to load claims from localStorage:', error);
  }
  return new Map();
};

const saveToStorage = (claimResults: Map<string, ClaimProcessingResult>) => {
  try {
    const obj = Object.fromEntries(claimResults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (error) {
    console.error('Failed to save claims to localStorage:', error);
  }
};

export function ClaimProvider({ children }: { children: ReactNode }) {
  const [claimResults, setClaimResults] = useState<Map<string, ClaimProcessingResult>>(() => loadFromStorage());

  // Listen for localStorage changes to keep context in sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        console.log('Storage changed, reloading context...');
        setClaimResults(loadFromStorage());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setClaimResult = (claimId: string, result: ClaimProcessingResult) => {
    console.log('Setting claim result in context:', claimId, result);
    setClaimResults(prev => {
      const newMap = new Map(prev).set(claimId, result);
      saveToStorage(newMap);
      console.log('Updated context map size:', newMap.size);
      return newMap;
    });
  };

  const getClaimResult = (claimId: string): ClaimProcessingResult | null => {
    console.log('Getting claim result from context:', claimId);
    console.log('Current map size:', claimResults.size);
    console.log('Available claim IDs:', Array.from(claimResults.keys()));
    
    const result = claimResults.get(claimId) || null;
    console.log('Context lookup result:', result ? 'Found' : 'Not found');
    
    // If not found in memory, try to reload from localStorage and update the map
    if (!result) {
      console.log('Not found in memory, checking localStorage directly...');
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed[claimId]) {
            console.log('Found in localStorage, updating context...');
            const claimData = parsed[claimId];
            // Update the context with the found data
            setClaimResults(prev => {
              const newMap = new Map(prev).set(claimId, claimData);
              return newMap;
            });
            return claimData;
          }
        }
      } catch (error) {
        console.error('Error during localStorage fallback:', error);
      }
    }
    
    return result;
  };

  const clearClaimResult = (claimId: string) => {
    setClaimResults(prev => {
      const newMap = new Map(prev);
      newMap.delete(claimId);
      saveToStorage(newMap);
      return newMap;
    });
  };

  return (
    <ClaimContext.Provider value={{
      claimResults,
      setClaimResult,
      getClaimResult,
      clearClaimResult
    }}>
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaim() {
  const context = useContext(ClaimContext);
  if (context === undefined) {
    throw new Error('useClaim must be used within a ClaimProvider');
  }
  return context;
}