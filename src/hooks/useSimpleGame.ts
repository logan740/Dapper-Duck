import { useContract, useContractWrite, useContractRead, useContractEvent } from 'wagmi';
import { parseEther } from 'viem';
import { SIMPLE_GAME_CONTRACT } from '@/config/contract-config';
import { useState } from 'react';

/**
 * Custom hook for interacting with the SimpleGame contract
 */
export function useSimpleGame() {
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);

  // Contract instance
  const contract = useContract({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
  });

  // Contract reads
  const { data: gameFee } = useContractRead({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    functionName: 'GAME_FEE',
  });

  const { data: gameCounter } = useContractRead({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    functionName: 'gameCounter',
  });

  const { data: contractStats } = useContractRead({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    functionName: 'getStats',
  });

  // Contract writes
  const { write: startPaidGame, isLoading: isStartingGame, error: startGameError } = useContractWrite({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    functionName: 'startPaidGame',
    value: parseEther(SIMPLE_GAME_CONTRACT.gameFee),
    onSuccess: (data) => {
      console.log('Game started successfully:', data);
      setIsGameActive(true);
    },
    onError: (error) => {
      console.error('Failed to start game:', error);
      setIsGameActive(false);
    },
  });

  const { write: endPaidGame, isLoading: isEndingGame, error: endGameError } = useContractWrite({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    functionName: 'endPaidGame',
    onSuccess: (data) => {
      console.log('Game ended successfully:', data);
      setIsGameActive(false);
      setCurrentGameId(null);
    },
    onError: (error) => {
      console.error('Failed to end game:', error);
    },
  });

  // Event listeners
  useContractEvent({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    eventName: 'GameStarted',
    listener: (player, gameId, timestamp) => {
      console.log(`Game started: Player ${player}, Game ID ${gameId}, Time ${timestamp}`);
      setCurrentGameId(Number(gameId));
      setIsGameActive(true);
    },
  });

  useContractEvent({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    eventName: 'GameCompleted',
    listener: (player, gameId, score, timestamp) => {
      console.log(`Game completed: Player ${player}, Game ID ${gameId}, Score ${score}, Time ${timestamp}`);
      setIsGameActive(false);
      setCurrentGameId(null);
    },
  });

  // Helper functions
  const startGame = async () => {
    if (!startPaidGame) {
      console.error('startPaidGame function not available');
      return;
    }
    
    try {
      await startPaidGame();
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const endGame = async (score: number) => {
    if (!endPaidGame || !currentGameId) {
      console.error('endPaidGame function not available or no active game');
      return;
    }
    
    try {
      await endPaidGame({
        args: [BigInt(currentGameId), BigInt(score)],
      });
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  return {
    // Contract data
    gameFee: gameFee ? Number(gameFee) : 0,
    gameCounter: gameCounter ? Number(gameCounter) : 0,
    contractStats: contractStats ? {
      totalGames: Number(contractStats[0]),
      contractBalance: Number(contractStats[1]),
    } : { totalGames: 0, contractBalance: 0 },
    
    // Game state
    currentGameId,
    isGameActive,
    
    // Actions
    startGame,
    endGame,
    
    // Loading states
    isStartingGame,
    isEndingGame,
    
    // Errors
    startGameError,
    endGameError,
    
    // Contract instance
    contract,
  };
}
