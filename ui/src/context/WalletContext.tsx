'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
   walletAddress: string;
   setWalletAddress: (address: string) => void;
   isConnected: boolean;
}

const WalletContext = createContext<WalletContextType>({
   walletAddress: '',
   setWalletAddress: () => { },
   isConnected: false,
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
   const [walletAddress, setWalletAddress] = useState('');

   const value = {
      walletAddress,
      setWalletAddress,
      isConnected: !!walletAddress,
   };

   return (
      <WalletContext.Provider value={value}>
         {children}
      </WalletContext.Provider>
   );
} 