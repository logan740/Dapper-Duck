import { createPublicClient, createWalletClient, http } from "viem";
import { eip712WalletActions, publicActionsL2 } from "viem/zksync";
import { chain } from "./chain";

/**
 * Viem client configuration for Abstract blockchain
 * Includes ZK Stack extensions for enhanced functionality
 * Learn more: https://viem.sh/zksync/
 */

// Public client for read operations
export const publicClient = createPublicClient({
  chain,
  transport: http(),
}).extend(publicActionsL2());

// Wallet client for write operations
export const walletClient = createWalletClient({
  chain,
  transport: http(),
}).extend(eip712WalletActions());
