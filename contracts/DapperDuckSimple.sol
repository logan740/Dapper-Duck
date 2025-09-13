// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DapperDuckSimple
 * @dev Simplified pay-to-play game contract with Abstract XP integration
 */
contract DapperDuckSimple is Ownable {
    
    // ============ CONSTANTS ============
    uint256 public constant GAME_FEE = 0.001 ether; // 0.001 ETH per game
    
    // ============ STATE VARIABLES ============
    uint256 public gameCounter;
    uint256 public totalRevenue;
    
    // ============ EVENTS ============
    // Abstract XP Events
    event GameStarted(address indexed player, uint256 indexed gameId, uint256 timestamp);
    event GameCompleted(address indexed player, uint256 indexed gameId, uint256 score, uint256 timestamp);
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Start a paid game session
     * @return gameId The unique game session ID
     */
    function startPaidGame() external payable returns (uint256) {
        require(msg.value == GAME_FEE, "Incorrect game fee");
        
        gameCounter++;
        uint256 gameId = gameCounter;
        totalRevenue += msg.value;
        
        // Emit Abstract XP event
        emit GameStarted(msg.sender, gameId, block.timestamp);
        
        return gameId;
    }
    
    /**
     * @dev End a game session with final score
     * @param _gameId The game session ID
     * @param _score The final score achieved
     */
    function endPaidGame(uint256 _gameId, uint256 _score) external {
        require(_gameId > 0 && _gameId <= gameCounter, "Invalid game ID");
        
        // Emit Abstract XP event - Abstract Network will calculate XP from the event data
        emit GameCompleted(msg.sender, _gameId, _score, block.timestamp);
    }
    
    /**
     * @dev Withdraw contract funds (for development/marketing)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 _totalGames,
        uint256 _totalRevenue,
        uint256 _contractBalance
    ) {
        return (
            gameCounter,
            totalRevenue,
            address(this).balance
        );
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {
        totalRevenue += msg.value;
    }
}
