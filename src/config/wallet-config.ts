import { createConfig, http } from 'wagmi';
import { abstractTestnet } from 'viem/chains';
import { injected, metaMask } from '@wagmi/connectors';

/**
 * Wallet configuration supporting both Abstract Global Wallet and MetaMask
 * 
 * This configuration allows users to choose between:
 * - Abstract Global Wallet (AGW) - for mainnet and Abstract-specific features
 * - MetaMask - for testing and broader compatibility
 */
export const wagmiConfig = createConfig({
  chains: [abstractTestnet],
  connectors: [
    // MetaMask connector for testing and broader compatibility
    metaMask({
      dappMetadata: {
        name: 'Dapper Duck',
        url: 'https://dapper-duck.vercel.app',
        iconUrl: 'https://dapper-duck.vercel.app/favicon.ico',
      },
    }),
    // AGW-specific connector
    injected({
      target: 'agw',
    }),
    // General injected connector for other wallets
    injected(),
  ],
  transports: {
    [abstractTestnet.id]: http(),
  },
});

// Export chain for use in other components
export const chain = abstractTestnet;
