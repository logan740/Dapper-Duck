"use client";

import { useAccount } from 'wagmi';
import { useSimpleGame } from '@/hooks/useSimpleGame';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SIMPLE_GAME_CONTRACT } from '@/config/contract-config';

interface PayToPlayButtonProps {
  className?: string;
  onGameStarted?: (gameId: number) => void;
  onGameEnded?: (score: number) => void;
}

/**
 * Pay to Play button component that handles contract interactions
 */
export function PayToPlayButton({ 
  className, 
  onGameStarted, 
  onGameEnded 
}: PayToPlayButtonProps) {
  const { isConnected, address } = useAccount();
  const { 
    gameFee, 
    isGameActive, 
    currentGameId,
    startGame, 
    endGame,
    isStartingGame, 
    isEndingGame,
    startGameError,
    endGameError 
  } = useSimpleGame();

  const [gameScore, setGameScore] = useState<number>(0);

  // Handle starting a paid game
  const handleStartGame = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await startGame();
      if (onGameStarted && currentGameId) {
        onGameStarted(currentGameId);
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  // Handle ending a paid game (for testing)
  const handleEndGame = async () => {
    if (!isGameActive || !currentGameId) {
      alert('No active game to end');
      return;
    }

    try {
      await endGame(gameScore);
      if (onGameEnded) {
        onGameEnded(gameScore);
      }
    } catch (error) {
      console.error('Failed to end game:', error);
    }
  };

  // Show error messages
  if (startGameError) {
    console.error('Start game error:', startGameError);
  }

  if (endGameError) {
    console.error('End game error:', endGameError);
  }

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Game Status */}
      <div className="text-center">
        {isGameActive ? (
          <div className="text-green-600 font-semibold">
            🎮 Game Active - ID: {currentGameId}
          </div>
        ) : (
          <div className="text-gray-600">
            Ready to play
          </div>
        )}
      </div>

      {/* Pay to Play Button */}
      {!isGameActive ? (
        <Button
          onClick={handleStartGame}
          disabled={!isConnected || isStartingGame}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
        >
          {isStartingGame ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Starting Game...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>🎮</span>
              <span>Pay to Play</span>
              <span className="text-sm opacity-90">({gameFee ? (gameFee / 1e18).toFixed(3) : '0.001'} ETH)</span>
            </div>
          )}
        </Button>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <div className="text-sm text-gray-600">
            Game in progress...
          </div>
          
          {/* Test score input and end game button */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={gameScore}
              onChange={(e) => setGameScore(Number(e.target.value))}
              placeholder="Enter score"
              className="px-3 py-2 border rounded-lg text-center w-24"
              min="0"
            />
            <Button
              onClick={handleEndGame}
              disabled={isEndingGame}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
            >
              {isEndingGame ? 'Ending...' : 'End Game'}
            </Button>
          </div>
        </div>
      )}

      {/* Wallet Connection Status */}
      {!isConnected && (
        <div className="text-sm text-red-600 text-center">
          ⚠️ Please connect your wallet to play
        </div>
      )}

      {/* Contract Info */}
      <div className="text-xs text-gray-500 text-center max-w-sm">
        <div>Contract: {SIMPLE_GAME_CONTRACT.address.slice(0, 6)}...{SIMPLE_GAME_CONTRACT.address.slice(-4)}</div>
        <div>Network: Abstract Testnet</div>
      </div>
    </div>
  );
}
