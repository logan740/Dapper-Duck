"use client";

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AbstractWalletProvider } from '@abstract-foundation/agw-react';
import { config, chain } from '@/config/wallet-config';
import { useState } from 'react';

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
 * Wallet Provider with explicit MetaMask and injected wallet support
 * 
 * This provider wraps the app with wagmi configuration that supports:
 * - MetaMask - explicit MetaMask connector
 * - Injected wallets - for other browser wallets
 * - Abstract Global Wallet (AGW) - proper AGW integration
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  // Create a persistent query client that won't be recreated on re-renders
  const [queryClient] = useState(() => createQueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Temporarily disable AbstractWalletProvider to test MetaMask detection */}
        {/* <AbstractWalletProvider chain={chain}> */}
          {children}
        {/* </AbstractWalletProvider> */}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
