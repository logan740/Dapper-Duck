import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { abstractTestnet } from 'viem/chains';

/**
 * Wallet configuration using RainbowKit with Abstract Global Wallet and MetaMask
 * 
 * This configuration provides:
 * - Abstract Global Wallet (AGW) - proper AGW integration via RainbowKit
 * - MetaMask - for testing and broader compatibility
 * - Clean UI with RainbowKit's wallet selection modal
 */
export const config = getDefaultConfig({
  appName: 'Dapper Duck',
  projectId: 'dapper-duck-app', // Simple project ID to avoid WalletConnect issues
  chains: [abstractTestnet],
  ssr: false,
});

// Export chain for use in other components
export const chain = abstractTestnet;
