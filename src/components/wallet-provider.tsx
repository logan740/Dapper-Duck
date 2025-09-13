"use client";

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { AbstractWalletProvider } from '@abstract-foundation/agw-react';
import { config, chain } from '@/config/wallet-config';

import '@rainbow-me/rainbowkit/styles.css';

// Create a query client for wagmi
const queryClient = new QueryClient();

/**
 * Wallet Provider using RainbowKit with Abstract Global Wallet and MetaMask
 * 
 * This provider wraps the app with RainbowKit configuration that supports:
 * - Abstract Global Wallet (AGW) - proper AGW integration
 * - MetaMask - for testing and broader compatibility
 * - Clean UI with RainbowKit's wallet selection modal
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AbstractWalletProvider chain={chain}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </AbstractWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
