import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { parseEther } from 'viem';
import { SIMPLE_GAME_CONTRACT } from '@/config/contract-config';
import { useState } from 'react';

/**
 * Custom hook for interacting with the SimpleGame contract
 */
export function useSimpleGame() {
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);

  // Contract reads
  const { data: gameFee } = useReadContract({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    functionName: 'GAME_FEE',
  });

  const { data: gameCounter } = useReadContract({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    functionName: 'gameCounter',
  });

  const { data: contractStats } = useReadContract({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    functionName: 'getStats',
  });

  // Contract writes
  const { writeContract: writeContract, isPending: isStartingGame, error: startGameError } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        console.log('Game started successfully:', data);
        setIsGameActive(true);
      },
      onError: (error) => {
        console.error('Failed to start game:', error);
        setIsGameActive(false);
      },
    },
  });

  const { writeContract: endWriteContract, isPending: isEndingGame, error: endGameError } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        console.log('Game ended successfully:', data);
        setIsGameActive(false);
        setCurrentGameId(null);
      },
      onError: (error) => {
        console.error('Failed to end game:', error);
      },
    },
  });

  // Event listeners
  useWatchContractEvent({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    eventName: 'GameStarted',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { player, gameId, timestamp } = log.args;
        console.log(`Game started: Player ${player}, Game ID ${gameId}, Time ${timestamp}`);
        setCurrentGameId(Number(gameId));
        setIsGameActive(true);
      });
    },
  });

  useWatchContractEvent({
    address: SIMPLE_GAME_CONTRACT.address,
    abi: SIMPLE_GAME_CONTRACT.abi,
    eventName: 'GameCompleted',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { player, gameId, score, timestamp } = log.args;
        console.log(`Game completed: Player ${player}, Game ID ${gameId}, Score ${score}, Time ${timestamp}`);
        setIsGameActive(false);
        setCurrentGameId(null);
      });
    },
  });

  // Helper functions
  const startGame = async () => {
    if (!writeContract) {
      console.error('writeContract function not available');
      return;
    }
    
    try {
      await writeContract({
        address: SIMPLE_GAME_CONTRACT.address,
        abi: SIMPLE_GAME_CONTRACT.abi,
        functionName: 'startPaidGame',
        value: parseEther(SIMPLE_GAME_CONTRACT.gameFee),
      });
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const endGame = async (score: number) => {
    if (!endWriteContract || !currentGameId) {
      console.error('endWriteContract function not available or no active game');
      return;
    }
    
    try {
      await endWriteContract({
        address: SIMPLE_GAME_CONTRACT.address,
        abi: SIMPLE_GAME_CONTRACT.abi,
        functionName: 'endPaidGame',
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
  };
}
