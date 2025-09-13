"use client";

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { AbstractWalletProvider } from '@abstract-foundation/agw-react';
import { config, chain } from '@/config/wallet-config';
import { useState } from 'react';

import '@rainbow-me/rainbowkit/styles.css';

// Create a persistent query client for wagmi
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

/**
 * Wallet Provider using RainbowKit with Abstract Global Wallet and MetaMask
 * 
 * This provider wraps the app with RainbowKit configuration that supports:
 * - Abstract Global Wallet (AGW) - proper AGW integration
 * - MetaMask - for testing and broader compatibility
 * - Clean UI with RainbowKit's wallet selection modal
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  // Create a persistent query client that won't be recreated on re-renders
  const [queryClient] = useState(() => createQueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AbstractWalletProvider chain={chain}>
          <RainbowKitProvider
            initialChain={chain}
            appInfo={{
              appName: 'Dapper Duck',
            }}
          >
            {children}
          </RainbowKitProvider>
        </AbstractWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
