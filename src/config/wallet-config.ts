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
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [abstractTestnet],
  ssr: false,
});

// Export chain for use in other components
export const chain = abstractTestnet;
