// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleGame {
    uint256 public constant GAME_FEE = 0.001 ether;
    uint256 public gameCounter;
    
    event GameStarted(address indexed player, uint256 indexed gameId, uint256 timestamp);
    event GameCompleted(address indexed player, uint256 indexed gameId, uint256 score, uint256 timestamp);
    
    function startPaidGame() external payable returns (uint256) {
        require(msg.value == GAME_FEE, "Incorrect game fee");
        
        gameCounter++;
        uint256 gameId = gameCounter;
        
        emit GameStarted(msg.sender, gameId, block.timestamp);
        
        return gameId;
    }
    
    function endPaidGame(uint256 _gameId, uint256 _score) external {
        require(_gameId > 0 && _gameId <= gameCounter, "Invalid game ID");
        
        emit GameCompleted(msg.sender, _gameId, _score, block.timestamp);
    }
    
    function getStats() external view returns (uint256 _totalGames, uint256 _contractBalance) {
        return (gameCounter, address(this).balance);
    }
    
    receive() external payable {}
}
