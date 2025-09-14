import { useReadContract, useWriteContract, useWatchContractEvent, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, encodeFunctionData } from 'viem';
import { SIMPLE_GAME_CONTRACT } from '@/config/contract-config';
import { useState, useEffect } from 'react';

/**
 * Custom hook for interacting with the SimpleGame contract
 */
export function useSimpleGame() {
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isTransactionConfirmed, setIsTransactionConfirmed] = useState(false);
  const [showStartGameScreen, setShowStartGameScreen] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Reset state when component mounts (in case of page refresh)
  useEffect(() => {
    console.log('useSimpleGame: Resetting state on mount');
    setCurrentGameId(null);
    setIsGameActive(false);
    setIsTransactionConfirmed(false);
    setShowStartGameScreen(false);
    setTransactionHash(null);
  }, []);

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
        console.log('Transaction sent successfully:', data);
        // Don't automatically start the game - wait for user to click "Start Game"
      },
      onError: (error) => {
        console.error('Failed to send transaction:', error);
        setIsGameActive(false);
      },
    },
  });

  // Send transaction hook for better control
  const { sendTransaction, isPending: isSendingTransaction, error: sendError } = useSendTransaction({
    mutation: {
      onSuccess: (hash) => {
        console.log('Transaction sent successfully:', hash);
        setTransactionHash(hash);
        // Don't set game active here - wait for confirmation
      },
      onError: (error) => {
        console.error('Failed to send transaction:', error);
      },
    },
  });

  // Wait for transaction receipt with multiple confirmations
  const { data: receipt, isSuccess: isTransactionSuccess } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}` | undefined,
    confirmations: 2, // Wait for 2 confirmations for more security
  });

  // Watch for transaction success
  useEffect(() => {
    if (isTransactionSuccess && receipt && transactionHash) {
      console.log('Transaction confirmed on blockchain!', receipt);
      
      // Add small delay to ensure transaction is fully confirmed
      setTimeout(() => {
        console.log('Transaction fully confirmed, showing start game screen');
        setShowStartGameScreen(true);
      }, 2000); // Wait 2 more seconds for full confirmation
    }
  }, [isTransactionSuccess, receipt, transactionHash]);

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
        setIsTransactionConfirmed(true);
        
        // Don't automatically start the game - let the user control when to start
        console.log('Game transaction confirmed! Ready to start when user is ready.');
        
        // Dispatch custom event for startGame function to listen to
        console.log('Dispatching gameStarted custom event...');
        window.dispatchEvent(new CustomEvent('gameStarted'));
        console.log('gameStarted custom event dispatched');
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
        setIsTransactionConfirmed(false);
        setCurrentGameId(null);
      });
    },
  });

  // Helper functions
  const startGame = async () => {
    if (!sendTransaction) {
      console.error('sendTransaction function not available');
      return false;
    }
    
    try {
      console.log('Starting paid game transaction...');
      
      // Show confirmation dialog first
      const userConfirmed = window.confirm(
        'Ready to start a paid game?\n\n' +
        'This will:\n' +
        '1. Open MetaMask for 0.001 ETH payment\n' +
        '2. Show "Start Game" screen after transaction confirms\n\n' +
        'Click OK to proceed, or Cancel to abort.'
      );
      
      if (!userConfirmed) {
        console.log('User cancelled game start');
        return false;
      }
      
      // Encode the function call
      const data = encodeFunctionData({
        abi: SIMPLE_GAME_CONTRACT.abi,
        functionName: 'startPaidGame',
      });
      
      // Send the transaction with reasonable gas limit
      sendTransaction({
        to: SIMPLE_GAME_CONTRACT.address,
        value: parseEther(SIMPLE_GAME_CONTRACT.gameFee),
        data: data,
        gas: 300000n, // Set reasonable gas limit (300k gas should be plenty for startPaidGame)
      });
      
      console.log('Transaction sent to MetaMask, waiting for confirmation...');
      
      // Return true immediately - the useEffect will handle showing the start screen
      return true;
      
    } catch (error) {
      console.error('Error starting game:', error);
      return false;
    }
  };

  const endGame = async (score: number) => {
    // End game function is now optional - no transaction required
    // The game is already paid for, no need for additional blockchain transaction
    console.log('Game ended with score:', score);
    setIsGameActive(false);
    setCurrentGameId(null);
    
    // Note: Contract end game functionality removed to prevent unnecessary MetaMask popups
    // The game is already paid for when started, no additional transaction needed
  };

  const startActualGame = () => {
    console.log('Starting actual game...');
    setShowStartGameScreen(false);
    setIsGameActive(true);
    if (typeof window !== 'undefined' && (window as any).startPaidGame) {
      (window as any).startPaidGame(currentGameId);
    }
  };

  return {
    // Contract data
    gameFee: gameFee ? Number(gameFee) : 0,
    gameCounter: gameCounter ? Number(gameCounter) : 0,
    contractStats: contractStats ? {
      totalGames: Number(contractStats[0]),
      totalRevenue: Number(contractStats[1]),
      treasuryBalance: Number(contractStats[2]),
      playersRewardPool: Number(contractStats[3]),
      currentWeek: Number(contractStats[4]),
      weekStartTime: Number(contractStats[5]),
    } : { 
      totalGames: 0, 
      totalRevenue: 0, 
      treasuryBalance: 0, 
      playersRewardPool: 0, 
      currentWeek: 1, 
      weekStartTime: 0 
    },
    
    // Game state
    currentGameId,
    isGameActive,
    isTransactionConfirmed,
    showStartGameScreen,
    
    // Actions
    startGame,
    endGame,
    startActualGame,
    
    // Loading states
    isStartingGame: isStartingGame || isSendingTransaction,
    isEndingGame,
    
    // Errors
    startGameError,
    endGameError,
  };
}
