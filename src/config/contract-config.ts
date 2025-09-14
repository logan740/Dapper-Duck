// Contract configuration for DapperDuck Full Contract
export const SIMPLE_GAME_CONTRACT = {
  // Deployed contract address on Abstract Testnet (Full DapperDuck Contract with Withdrawal Functions)
  address: '0x764fEC2E554fD3a85e7d4f0D0CC78C74259580Da' as const,
  
  // Contract ABI (Application Binary Interface) - DapperDuck Full Contract
  abi: [
    {
      "inputs": [],
      "name": "GAME_FEE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "gameCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "_totalGames",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_totalRevenue",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_treasuryBalance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_playersRewardPool",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_currentWeek",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_weekStartTime",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "startPaidGame",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_gameId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_score",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "_won",
          "type": "bool"
        }
      ],
      "name": "endPaidGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "receive",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "GameStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "gameId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "score",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "GameCompleted",
      "type": "event"
    }
  ] as const,
  
  // Game fee in ETH (0.001 ETH)
  gameFee: '0.001',
  
  // Network information
  network: {
    name: 'Abstract Testnet',
    chainId: 11124,
    explorer: 'https://sepolia.abscan.org/'
  }
} as const;

// Export types for TypeScript
export type SimpleGameContract = typeof SIMPLE_GAME_CONTRACT;
