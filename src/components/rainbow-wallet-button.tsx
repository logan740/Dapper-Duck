"use client";

// Removed ConnectButton import - using custom connected state display
// Temporarily removed Abstract imports for MetaMask-only testing
// import { useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
// import { Button } from '@/components/ui/button';
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
  const { disconnect } = useDisconnect();
  // Temporarily removed Abstract login for MetaMask-only testing
  // const { login } = useLoginWithAbstract();
  const [isConnecting, setIsConnecting] = useState(false);

  // Function to connect to MetaMask
  const connectToMetaMask = () => {
    console.log('Available connectors:', connectors.map(c => ({ name: c.name, id: c.id })));
    
    // Debug: Log each connector individually
    connectors.forEach((connector, index) => {
      console.log(`Connector ${index}:`, {
        name: connector.name,
        id: connector.id,
        type: connector.type
      });
    });
    
    // Find MetaMask connector first - try multiple approaches
    let metaMaskConnector = connectors.find(connector => 
      connector.name.toLowerCase().includes('metamask') ||
      connector.id.toLowerCase().includes('metamask')
    );
    
    // If not found by name/id, try injected connector
    if (!metaMaskConnector) {
      metaMaskConnector = connectors.find(connector => 
        connector.name.toLowerCase().includes('injected') && 
        !connector.name.toLowerCase().includes('abstract') &&
        !connector.name.toLowerCase().includes('privy') &&
        !connector.name.toLowerCase().includes('magic')
      );
    }
    
    // If still not found, try any connector that's not Abstract/Privy/Magic
    if (!metaMaskConnector) {
      metaMaskConnector = connectors.find(connector => 
        !connector.name.toLowerCase().includes('abstract') &&
        !connector.name.toLowerCase().includes('privy') &&
        !connector.name.toLowerCase().includes('magic')
      );
    }
    
    console.log('Found MetaMask connector:', metaMaskConnector?.name, metaMaskConnector?.id);
    
    if (metaMaskConnector) {
      console.log('Connecting through wagmi...');
      setIsConnecting(true);
      try {
        connect({ connector: metaMaskConnector });
        console.log('Successfully connected through wagmi!');
        alert('MetaMask connected and UI updated!');
      } catch (error: any) {
        console.error('Wagmi connection failed:', error);
        alert('MetaMask connection failed: ' + error.message);
      } finally {
        setIsConnecting(false);
      }
    } else {
      console.log('No MetaMask connector found');
      alert('MetaMask connector not found. Please ensure MetaMask is installed.');
    }
  };

  // Debug wallet state
  console.log('RainbowWalletButton - Wallet state:', { isConnected, address, status });
  console.log('🔥 COMPONENT RENDERED 🔥');
  console.log('🔥 COMPONENT RENDERED 🔥');
  console.log('🔥 COMPONENT RENDERED 🔥');

  // If connected, show custom connected state
  if (isConnected) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Connected
          </span>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown'}
        </div>
        <button
          onClick={() => {
            console.log('Disconnecting wallet...');
            disconnect();
          }}
          className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // If not connected, show custom wallet selection
  return (
    <div className={cn("flex space-x-2", className)}>
      {/* Temporarily remove Abstract button to focus on MetaMask for contract testing */}
      {/* <Button
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
      </Button> */}
      
      {/* MetaMask Button */}
      <button
        onClick={() => {
          console.log('🔥 META MASK BUTTON CLICKED 🔥');
          
          // First disconnect any existing connection to force fresh connection
          if (isConnected) {
            console.log('Disconnecting existing wallet first...');
            disconnect();
            // Wait a moment for disconnect to complete
            setTimeout(() => {
              connectToMetaMask();
            }, 500);
          } else {
            connectToMetaMask();
          }
        }}
        onMouseDown={() => {
          console.log('🖱️ META MASK BUTTON MOUSE DOWN 🖱️');
        }}
        onMouseUp={() => {
          console.log('🖱️ META MASK BUTTON MOUSE UP 🖱️');
        }}
        onTouchStart={() => {
          console.log('👆 META MASK BUTTON TOUCH START 👆');
        }}
        onTouchEnd={() => {
          console.log('👆 META MASK BUTTON TOUCH END 👆');
        }}
        style={{
          backgroundColor: 'red',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        🔥 META MASK 🔥
      </button>
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
