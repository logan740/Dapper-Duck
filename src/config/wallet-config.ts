import { createConfig, http } from 'wagmi';
import { injected, metaMask } from 'wagmi/connectors';
import { abstractTestnet } from 'viem/chains';

/**
 * Wallet configuration with explicit MetaMask and injected wallet support
 * 
 * This configuration provides:
 * - MetaMask - explicit MetaMask connector
 * - Injected wallets - for other browser wallets
 * - Abstract testnet support
 */
export const config = createConfig({
  chains: [abstractTestnet],
  connectors: [
    metaMask(),
    injected(),
  ],
  transports: {
    [abstractTestnet.id]: http(),
  },
  ssr: false,
});

// Export chain for use in other components
export const chain = abstractTestnet;
