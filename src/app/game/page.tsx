"use client";

import Script from "next/script";
import { useEffect } from "react";
import { RainbowWalletButton } from "@/components/rainbow-wallet-button";
import { useSimpleGame } from "@/hooks/useSimpleGame";
import { StartGameScreen } from "@/components/start-game-screen";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function GamePage() {
  const { address } = useAccount();
  const { startGame, endGame, startActualGame, showStartGameScreen } = useSimpleGame();

  // Ensure full-viewport sizing for canvas and mobile optimization
  useEffect(() => {
    // Set full viewport height for mobile
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.userSelect = "none";
    
    // Prevent mobile browser UI from interfering, but allow button clicks
    const preventDefault = (e: Event) => {
      // Don't prevent default for button clicks or interactive elements
      const target = e.target as HTMLElement;
      if (target && (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]')
      )) {
        return; // Allow button clicks
      }
      e.preventDefault();
    };
    
    // Add touch event listeners to prevent default behaviors
    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('touchend', preventDefault, { passive: false });
    
    return () => {
      window.removeEventListener('resize', setViewportHeight);
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('touchend', preventDefault);
    };
  }, []);

  // Set up getProfileData function for the game
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.getProfileData = () => {
        const profileKey = address ? `dapperDuck_profile_${address}` : 'dapperDuck_profile_anonymous';
        try {
          const profileData = localStorage.getItem(profileKey);
          if (profileData) {
            const data = JSON.parse(profileData);
            console.log('Game page getProfileData returning:', data);
            return data;
          }
        } catch (error) {
          console.error('Error getting profile data in game page:', error);
        }
        return {
          name: '',
          picture: '',
          socials: { x: '', discord: '' }
        };
      };
      console.log('Game page: getProfileData function set up for address:', address);
    }
  }, [address]);

  // Set up contract integration functions for the game
  useEffect(() => {
    if (typeof window !== 'undefined' && startGame && endGame) {
      // Set the contract functions for the game to use
      (window as any).startPaidGameFromReact = async () => {
        try {
          console.log('React: Starting paid game contract...');
          const result = await startGame();
          console.log('React: Contract transaction result:', result);
          
          // Wait a moment for the transaction to be processed
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return true;
        } catch (error) {
          console.error('React: Error starting paid game:', error);
          return false;
        }
      };

      (window as any).endPaidGameFromReact = async (gameId: number, score: number) => {
        try {
          console.log('React: Ending paid game contract...', gameId, score);
          await endGame(score);
          return true;
        } catch (error) {
          console.error('React: Error ending paid game:', error);
          return false;
        }
      };

      console.log('Game page: Contract integration functions set up');
    }
  }, [startGame, endGame]);

  return (
    <div className="relative w-screen h-screen overflow-hidden touch-none select-none" style={{ height: '100vh' }}>
      {/* Game Canvas */}
      <canvas 
        id="game" 
        className="absolute inset-0 w-full h-full touch-none select-none" 
        style={{ 
          touchAction: 'none', 
          userSelect: 'none'
        }}
      />

      {/* Score HUD - Always visible during gameplay */}
      <div id="hud" className="absolute top-4 left-4 z-40">
        <div
          id="score"
          className="rounded-xl bg-white/85 px-3 py-2 shadow font-bold backdrop-blur-sm"
        >
          Score: <span id="scoreVal">0</span>
        </div>
      </div>

      {/* Power-up Indicator */}
      <div id="powerup-indicator" className="hidden absolute top-16 left-4 z-40">
        <div className="rounded-xl bg-white/85 px-3 py-2 shadow backdrop-blur-sm border-l-4 border-orange-500">
          <div id="powerup-text" className="text-sm font-bold text-gray-800">⚡ Power-up</div>
          <div id="powerup-timer" className="text-xs text-gray-600">10s</div>
        </div>
      </div>


      {/* Main Menu */}
      <div id="menu">
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="pointer-events-auto rounded-2xl bg-white/90 p-6 shadow-xl w-[min(560px,92vw)] backdrop-blur-sm">
            <h1 className="text-3xl font-extrabold mb-1">Dapper Duck</h1>
            <p className="mb-5 text-neutral-700">Collect Meme Snacks • Dodge FUD Bags</p>
            <div className="space-y-3">
              <button
                id="freeGameBtn"
                className="w-full rounded-xl bg-green-500 hover:bg-green-600 px-4 py-3 text-white font-bold shadow transition-colors"
              >
                🆓 Free Game
              </button>
                     <button
                       id="paidGameBtn"
                       className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 px-4 py-3 text-white font-bold shadow transition-colors"
                     >
                       💎 Pay 0.001 ETH to Play
                     </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <div id="gameOver" className="hidden">
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="pointer-events-auto rounded-2xl bg-white/90 p-6 shadow-xl text-center w-[min(420px,92vw)] backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-2">Game Over</h2>
            <p id="reason" className="mb-2">You fell!</p>
            <div id="finalScore" className="mb-4 text-lg font-bold text-orange-600">
              Final Score: <span id="finalScoreVal">0</span>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                id="retryBtn"
                className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-white font-bold shadow transition-colors"
              >
                Retry
              </button>
              <Link
                href="/"
                className="rounded-xl bg-neutral-200 hover:bg-neutral-300 px-4 py-2 font-bold shadow transition-colors text-gray-800"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="absolute top-4 right-4 z-50">
        <RainbowWalletButton />
      </div>

      {/* Start Game Screen */}
      {showStartGameScreen && (
        <StartGameScreen
          onStartGame={startActualGame}
          onCancel={() => {
            // Reset the state when user cancels
            window.location.reload();
          }}
        />
      )}

      {/* Load Game Script */}
      <Script src="/game.js" strategy="afterInteractive" />
    </div>
  );
}
/ /   F o r c e   d e p l o y m e n t   t r i g g e r  
 