# DapperDuck Smart Contract

## Overview
The DapperDuck smart contract enables pay-to-play functionality with Abstract XP integration and automated revenue distribution.

## Features

### 🎮 Core Game Functions
- **startPaidGame()**: Players pay 0.001 ETH to start a game session
- **endPaidGame()**: End game with final score and Abstract XP tracking
- **Game Session Tracking**: Each game gets a unique ID and is tracked on-chain

### 💰 Revenue Distribution
- **50% to Top 15 Players**: Weekly rewards distributed based on leaderboard
- **50% to Treasury**: For development and marketing
- **Automated Distribution**: Owner can trigger weekly reward distribution

### 🏆 Abstract XP Integration
- **GameStarted Event**: Emitted when player starts paid game
- **GameCompleted Event**: Emitted with score and timestamp for Abstract to track
- **WeeklyRewardsDistributed Event**: Emitted when rewards are distributed
- **XP Calculation**: Abstract Network handles their own XP calculations from our events

### 🔒 Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Only owner can distribute rewards and withdraw treasury
- **Pausable**: Emergency pause functionality
- **Access Controls**: Players can only end their own games

## Contract Functions

### Public Functions
```solidity
function startPaidGame() external payable returns (uint256)
function endPaidGame(uint256 _gameId, uint256 _score, bool _won) external
function getCurrentLeaderboard() external view returns (LeaderboardEntry[] memory)
function getPlayerGames(address _player) external view returns (uint256[] memory)
function getGameSession(uint256 _gameId) external view returns (GameSession memory)
function isGameActive(address _player) public view returns (bool)
function getStats() external view returns (...)
```

### Owner Functions
```solidity
function distributeWeeklyRewards() external onlyOwner
function withdrawTreasury() external onlyOwner
function pause() external onlyOwner
function unpause() external onlyOwner
function emergencyWithdraw() external onlyOwner
```

## Events

### Abstract XP Events
```solidity
event GameStarted(address indexed player, uint256 indexed gameId, uint256 timestamp)
event GameCompleted(address indexed player, uint256 indexed gameId, uint256 score, uint256 timestamp)
event WeeklyRewardsDistributed(uint256 indexed week, address[] winners, uint256[] amounts)
```

### Game Events
```solidity
event GamePaid(address indexed player, uint256 amount, uint256 gameId)
event RevenueDistributed(uint256 treasuryAmount, uint256 playersAmount)
event TreasuryWithdrawn(address indexed to, uint256 amount)
event PlayerRewardClaimed(address indexed player, uint256 amount)
```

## Deployment

### Prerequisites
1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Create .env file
PRIVATE_KEY=your_private_key_here
```

### Local Development
```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to local network
npm run deploy
```

### Testnet Deployment
```bash
# Deploy to Abstract testnet
npm run deploy:testnet
```

### Mainnet Deployment
```bash
# Deploy to Abstract mainnet
npm run deploy:mainnet
```

## Contract Addresses

### Testnet
- **Contract Address**: TBD
- **Network**: Abstract Testnet
- **Chain ID**: 11124

### Mainnet
- **Contract Address**: TBD
- **Network**: Abstract Mainnet
- **Chain ID**: 11124

## Integration with Frontend

### 1. Contract ABI
The contract ABI will be generated in `artifacts/contracts/DapperDuck.sol/DapperDuck.json`

### 2. Web3 Integration
```javascript
import { useContract, useContractWrite, useContractRead } from 'wagmi'

const contractConfig = {
  address: '0x...', // Contract address
  abi: DapperDuckABI,
}

// Start paid game
const { write: startPaidGame } = useContractWrite({
  ...contractConfig,
  functionName: 'startPaidGame',
  value: parseEther('0.001'),
})

// End game
const { write: endPaidGame } = useContractWrite({
  ...contractConfig,
  functionName: 'endPaidGame',
})
```

### 3. Event Listening
```javascript
import { useContractEvent } from 'wagmi'

// Listen for game events
useContractEvent({
  ...contractConfig,
  eventName: 'GameCompleted',
  listener: (player, gameId, score, xpEarned) => {
    console.log(`Player ${player} completed game ${gameId} with score ${score}, earned ${xpEarned} XP`)
  },
})
```

## Testing

### Run Tests
```bash
npm run test
```

### Test Coverage
- ✅ Contract deployment
- ✅ Game start/end functionality
- ✅ Revenue distribution
- ✅ Access controls
- ✅ Edge cases
- ✅ Abstract XP events

## Security Considerations

1. **Reentrancy Protection**: All external functions use ReentrancyGuard
2. **Access Control**: Owner-only functions for sensitive operations
3. **Input Validation**: All inputs are validated
4. **Emergency Functions**: Pause and emergency withdraw capabilities
5. **Gas Optimization**: Contract is optimized for gas efficiency

## Next Steps

1. **Deploy to Testnet**: Test with small amounts
2. **Frontend Integration**: Connect game to contract
3. **Abstract XP Verification**: Ensure events are tracked properly
4. **Security Audit**: Consider professional audit before mainnet
5. **Mainnet Deployment**: Deploy with real ETH when ready

## Support

For questions or issues with the contract, please refer to the test files or create an issue in the repository.
