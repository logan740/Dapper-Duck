"use client";

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/config/wallet-config';

// Create a query client for wagmi
const queryClient = new QueryClient();

/**
 * Wallet Provider supporting both Abstract Global Wallet and MetaMask
 * 
 * This provider wraps the app with wagmi configuration that supports:
 * - MetaMask for testing and broader compatibility
 * - Abstract Global Wallet for mainnet and Abstract-specific features
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
