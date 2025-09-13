"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';
import { type ClassValue } from 'clsx';

interface RainbowWalletButtonProps {
  className?: ClassValue;
}

/**
 * RainbowKit Wallet Connection Button
 * 
 * Provides a clean wallet connection interface with:
 * - Abstract Global Wallet (AGW) - proper AGW integration
 * - MetaMask - for testing and broader compatibility
 * - Clean UI with RainbowKit's wallet selection modal
 * - Automatic wallet detection and connection
 */
export function RainbowWalletButton({ className }: RainbowWalletButtonProps) {
  return (
    <div className={cn(className)}>
      <ConnectButton 
        showBalance={true}
        chainStatus="icon"
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
      />
    </div>
  );
}
