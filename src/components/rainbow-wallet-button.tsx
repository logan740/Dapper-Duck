"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { useAccount, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type ClassValue } from 'clsx';
import { useState } from 'react';

interface RainbowWalletButtonProps {
  className?: ClassValue;
}

/**
 * Enhanced Wallet Connection Button with AGW and MetaMask support
 * 
 * Provides a clean wallet connection interface with:
 * - Abstract Global Wallet (AGW) - proper AGW integration
 * - MetaMask - for testing and broader compatibility
 * - Clean UI with direct wallet selection
 * - Automatic wallet detection and connection
 */
export function RainbowWalletButton({ className }: RainbowWalletButtonProps) {
  const { isConnected, address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { login } = useLoginWithAbstract();
  const [isConnecting, setIsConnecting] = useState(false);

  // Debug wallet state
  console.log('RainbowWalletButton - Wallet state:', { isConnected, address, status });

  // If connected, show the standard ConnectButton
  if (isConnected) {
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

  // If not connected, show custom wallet selection
  return (
    <div className={cn("flex space-x-2", className)}>
      {/* Abstract AGW Button */}
      <Button
        onClick={async () => {
          setIsConnecting(true);
          try {
            await login();
          } catch (error) {
            console.error('AGW login failed:', error);
          } finally {
            setIsConnecting(false);
          }
        }}
        disabled={isConnecting}
        className="cursor-pointer group min-w-32"
      >
        <AbstractLogo className="mr-2 h-4 w-4 group-hover:animate-spin transition-transform" />
        {isConnecting ? 'Connecting...' : 'Abstract'}
      </Button>
      
      {/* MetaMask Button */}
      <Button
        onClick={async () => {
          console.log('=== MetaMask Connection Debug ===');
          console.log('Available connectors:', connectors.map(c => ({ name: c.name, id: c.id, type: c.type })));
          
          // Check if MetaMask is specifically available
          const isMetaMaskInstalled = typeof window !== 'undefined' && 
            (window as any).ethereum && 
            (window as any).ethereum.isMetaMask;
          
          console.log('MetaMask installed:', isMetaMaskInstalled);
          console.log('window.ethereum:', (window as any).ethereum);
          
          // Try ALL available connectors to see which one works
          for (const connector of connectors) {
            console.log(`Trying connector: ${connector.name} (${connector.id})`);
            try {
              await connect({ connector });
              console.log(`Successfully connected with ${connector.name}!`);
              return;
            } catch (error) {
              console.log(`Failed to connect with ${connector.name}:`, error instanceof Error ? error.message : String(error));
            }
          }
          
          // If no connector worked, try direct connection
          if (isMetaMaskInstalled) {
            try {
              console.log('All connectors failed, trying direct MetaMask connection...');
              const accounts = await (window as any).ethereum.request({ 
                method: 'eth_requestAccounts' 
              });
              console.log('Direct MetaMask connection successful:', accounts);
              alert('MetaMask connected directly but UI may not update. Please refresh the page.');
              return;
            } catch (error) {
              console.error('Direct MetaMask connection failed:', error);
            }
          }
          
          // If we get here, nothing worked
          console.error('All connection methods failed');
          alert('Unable to connect to MetaMask. Please check your browser extensions.');
        }}
        className="cursor-pointer group min-w-32"
      >
        <MetaMaskIcon className="mr-2 h-4 w-4 group-hover:animate-spin transition-transform" />
        MetaMask
      </Button>
    </div>
  );
}

// Icon components
function AbstractLogo({ className }: { className?: ClassValue }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 52 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path d="M33.7221 31.0658L43.997 41.3463L39.1759 46.17L28.901 35.8895C28.0201 35.0081 26.8589 34.5273 25.6095 34.5273C24.3602 34.5273 23.199 35.0081 22.3181 35.8895L12.0432 46.17L7.22205 41.3463L17.4969 31.0658H33.7141H33.7221Z" fill="currentColor" />
      <path d="M35.4359 28.101L49.4668 31.8591L51.2287 25.2645L37.1978 21.5065C35.9965 21.186 34.9954 20.4167 34.3708 19.335C33.7461 18.2613 33.586 17.0033 33.9063 15.8013L37.6623 1.76283L31.0713 0L27.3153 14.0385L35.4279 28.093L35.4359 28.101Z" fill="currentColor" />
      <path d="M15.7912 28.101L1.76028 31.8591L-0.00158691 25.2645L14.0293 21.5065C15.2306 21.186 16.2316 20.4167 16.8563 19.335C17.4809 18.2613 17.6411 17.0033 17.3208 15.8013L13.5648 1.76283L20.1558 0L23.9118 14.0385L15.7992 28.093L15.7912 28.101Z" fill="currentColor" />
    </svg>
  );
}

function MetaMaskIcon({ className }: { className?: ClassValue }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 318.6 318.6"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <path
        d="M274.1 35.5l99.5 73.9-18.5 55.6-81.4-11.3-40.9 38.8 70.2 19.4 7.7 81.3-49.8-26.7-49.8 26.7 7.7-81.3 70.2-19.4-40.9-38.8-81.4 11.3-18.5-55.6 99.5-73.9z"
        fill="#E2761B"
      />
      <path
        d="M274.1 35.5l-99.5 73.9 18.5 55.6 81.4-11.3 40.9 38.8-70.2 19.4-7.7 81.3 49.8-26.7 49.8 26.7-7.7-81.3-70.2-19.4 40.9-38.8 81.4 11.3 18.5-55.6-99.5-73.9z"
        fill="#E4761B"
      />
    </svg>
  );
}
