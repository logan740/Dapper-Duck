// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title DapperDuck
 * @dev Pay-to-play game contract with Abstract XP integration and revenue distribution
 */
contract DapperDuck is ReentrancyGuard, Ownable, Pausable {
    
    // ============ CONSTANTS ============
    uint256 public constant GAME_FEE = 0.001 ether; // 0.001 ETH per game
    uint256 public constant MAX_LEADERBOARD_SIZE = 15; // Top 15 players
    uint256 public constant TREASURY_PERCENTAGE = 50; // 50% to treasury
    uint256 public constant PLAYERS_PERCENTAGE = 50; // 50% to top players
    
    // ============ STRUCTS ============
    struct GameSession {
        address player;
        uint256 startTime;
        uint256 gameId;
        bool isActive;
        uint256 score;
        bool completed;
    }
    
    struct LeaderboardEntry {
        address player;
        uint256 score;
        uint256 timestamp;
        bool claimed;
    }
    
    // ============ STATE VARIABLES ============
    uint256 public gameCounter;
    uint256 public totalRevenue;
    uint256 public treasuryBalance;
    uint256 public playersRewardPool;
    
    // Weekly tracking
    uint256 public currentWeek;
    uint256 public weekStartTime;
    uint256 public constant WEEK_DURATION = 7 days;
    
    // Mappings
    mapping(uint256 => GameSession) public gameSessions;
    mapping(address => uint256[]) public playerGames;
    mapping(uint256 => LeaderboardEntry[]) public weeklyLeaderboards;
    mapping(address => uint256) public playerTotalGames;
    mapping(address => uint256) public playerTotalSpent;
    
    // ============ EVENTS ============
    // Abstract XP Events
    event GameStarted(address indexed player, uint256 indexed gameId, uint256 timestamp);
    event GameCompleted(address indexed player, uint256 indexed gameId, uint256 score, uint256 timestamp);
    event WeeklyRewardsDistributed(uint256 indexed week, address[] winners, uint256[] amounts);
    event TreasuryWithdrawn(address indexed to, uint256 amount);
    event PlayerRewardClaimed(address indexed player, uint256 amount);
    
    // Game Events
    event GamePaid(address indexed player, uint256 amount, uint256 gameId);
    event RevenueDistributed(uint256 treasuryAmount, uint256 playersAmount);
    
    // ============ CONSTRUCTOR ============
    constructor() {
        currentWeek = 1;
        weekStartTime = block.timestamp;
    }
    
    // ============ MODIFIERS ============
    modifier validGameId(uint256 _gameId) {
        require(_gameId > 0 && _gameId <= gameCounter, "Invalid game ID");
        _;
    }
    
    modifier onlyActiveGame(uint256 _gameId) {
        require(gameSessions[_gameId].isActive, "Game not active");
        _;
    }
    
    modifier onlyGamePlayer(uint256 _gameId) {
        require(gameSessions[_gameId].player == msg.sender, "Not game player");
        _;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Start a paid game session
     * @return gameId The unique game session ID
     */
    function startPaidGame() external payable whenNotPaused nonReentrant returns (uint256) {
        require(msg.value == GAME_FEE, "Incorrect game fee");
        require(!isGameActive(msg.sender), "Player has active game");
        
        // Update week if necessary
        _updateWeek();
        
        // Create new game session
        gameCounter++;
        uint256 gameId = gameCounter;
        
        gameSessions[gameId] = GameSession({
            player: msg.sender,
            startTime: block.timestamp,
            gameId: gameId,
            isActive: true,
            score: 0,
            completed: false
        });
        
        // Update player data
        playerGames[msg.sender].push(gameId);
        playerTotalGames[msg.sender]++;
        playerTotalSpent[msg.sender] += msg.value;
        
        // Update revenue tracking
        totalRevenue += msg.value;
        playersRewardPool += (msg.value * PLAYERS_PERCENTAGE) / 100;
        treasuryBalance += (msg.value * TREASURY_PERCENTAGE) / 100;
        
        // Emit events
        emit GamePaid(msg.sender, msg.value, gameId);
        emit GameStarted(msg.sender, gameId, block.timestamp);
        
        return gameId;
    }
    
    /**
     * @dev End a game session with final score
     * @param _gameId The game session ID
     * @param _score The final score achieved
     */
    function endPaidGame(uint256 _gameId, uint256 _score, bool /* _won */) 
        external 
        validGameId(_gameId) 
        onlyActiveGame(_gameId) 
        onlyGamePlayer(_gameId) 
        nonReentrant 
    {
        GameSession storage session = gameSessions[_gameId];
        
        // Update game session
        session.isActive = false;
        session.score = _score;
        session.completed = true;
        
        // Add to current week's leaderboard if score > 0
        if (_score > 0) {
            weeklyLeaderboards[currentWeek].push(LeaderboardEntry({
                player: msg.sender,
                score: _score,
                timestamp: block.timestamp,
                claimed: false
            }));
        }
        
        // Emit Abstract XP event - Abstract Network will calculate XP from the event data
        emit GameCompleted(msg.sender, _gameId, _score, block.timestamp);
    }
    
    /**
     * @dev Distribute weekly rewards to top 15 players
     */
    function distributeWeeklyRewards() external onlyOwner nonReentrant {
        require(playersRewardPool > 0, "No rewards to distribute");
        require(weeklyLeaderboards[currentWeek].length > 0, "No games this week");
        
        // Sort leaderboard by score (descending)
        LeaderboardEntry[] storage leaderboard = weeklyLeaderboards[currentWeek];
        _sortLeaderboard(leaderboard);
        
        // Calculate rewards
        uint256 totalReward = playersRewardPool;
        uint256 numWinners = leaderboard.length > MAX_LEADERBOARD_SIZE ? 
            MAX_LEADERBOARD_SIZE : leaderboard.length;
        
        address[] memory winners = new address[](numWinners);
        uint256[] memory amounts = new uint256[](numWinners);
        
        // Distribute rewards (linear distribution)
        for (uint256 i = 0; i < numWinners; i++) {
            uint256 rank = i + 1;
            uint256 reward = (totalReward * (MAX_LEADERBOARD_SIZE - rank + 1)) / 
                ((MAX_LEADERBOARD_SIZE * (MAX_LEADERBOARD_SIZE + 1)) / 2);
            
            winners[i] = leaderboard[i].player;
            amounts[i] = reward;
            
            // Mark as claimed
            leaderboard[i].claimed = true;
            
            // Transfer reward
            payable(leaderboard[i].player).transfer(reward);
            
            emit PlayerRewardClaimed(leaderboard[i].player, reward);
        }
        
        // Reset reward pool
        playersRewardPool = 0;
        
        // Emit events
        emit WeeklyRewardsDistributed(currentWeek, winners, amounts);
        emit RevenueDistributed(treasuryBalance, totalReward);
    }
    
    /**
     * @dev Withdraw treasury funds (for development/marketing)
     */
    function withdrawTreasury() external onlyOwner nonReentrant {
        require(treasuryBalance > 0, "No treasury funds");
        
        uint256 amount = treasuryBalance;
        treasuryBalance = 0;
        
        payable(owner()).transfer(amount);
        
        emit TreasuryWithdrawn(owner(), amount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get current week's leaderboard
     */
    function getCurrentLeaderboard() external view returns (LeaderboardEntry[] memory) {
        return weeklyLeaderboards[currentWeek];
    }
    
    /**
     * @dev Get player's game history
     */
    function getPlayerGames(address _player) external view returns (uint256[] memory) {
        return playerGames[_player];
    }
    
    /**
     * @dev Get game session details
     */
    function getGameSession(uint256 _gameId) external view returns (GameSession memory) {
        return gameSessions[_gameId];
    }
    
    /**
     * @dev Check if player has active game
     */
    function isGameActive(address _player) public view returns (bool) {
        uint256[] memory games = playerGames[_player];
        for (uint256 i = 0; i < games.length; i++) {
            if (gameSessions[games[i]].isActive) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 _totalGames,
        uint256 _totalRevenue,
        uint256 _treasuryBalance,
        uint256 _playersRewardPool,
        uint256 _currentWeek,
        uint256 _weekStartTime
    ) {
        return (
            gameCounter,
            totalRevenue,
            treasuryBalance,
            playersRewardPool,
            currentWeek,
            weekStartTime
        );
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Update current week if necessary
     */
    function _updateWeek() internal {
        if (block.timestamp >= weekStartTime + WEEK_DURATION) {
            currentWeek++;
            weekStartTime = block.timestamp;
        }
    }
    
    /**
     * @dev Sort leaderboard by score (descending)
     */
    function _sortLeaderboard(LeaderboardEntry[] storage _leaderboard) internal {
        for (uint256 i = 0; i < _leaderboard.length; i++) {
            for (uint256 j = i + 1; j < _leaderboard.length; j++) {
                if (_leaderboard[i].score < _leaderboard[j].score) {
                    LeaderboardEntry memory temp = _leaderboard[i];
                    _leaderboard[i] = _leaderboard[j];
                    _leaderboard[j] = temp;
                }
            }
        }
    }
    
    // ============ EMERGENCY FUNCTIONS ============
    
    /**
     * @dev Pause contract in case of emergency
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only if paused)
     */
    function emergencyWithdraw() external onlyOwner {
        require(paused(), "Contract not paused");
        payable(owner()).transfer(address(this).balance);
    }
    
    // ============ RECEIVE FUNCTION ============
    
    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {
        // ETH sent directly to contract goes to treasury
        treasuryBalance += msg.value;
    }
}
