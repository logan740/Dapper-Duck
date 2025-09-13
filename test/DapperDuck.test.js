const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DapperDuck", function () {
  let dapperDuck;
  let owner;
  let player1;
  let player2;
  let player3;

  let GAME_FEE;

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();
    
    GAME_FEE = ethers.parseEther("0.001");
    
    const DapperDuck = await ethers.getContractFactory("DapperDuck");
    dapperDuck = await DapperDuck.deploy();
    await dapperDuck.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await dapperDuck.owner()).to.equal(owner.address);
    });

    it("Should set the correct game fee", async function () {
      expect(await dapperDuck.GAME_FEE()).to.equal(GAME_FEE);
    });

    it("Should set the correct leaderboard size", async function () {
      expect(await dapperDuck.MAX_LEADERBOARD_SIZE()).to.equal(15);
    });

    it("Should set the correct percentages", async function () {
      expect(await dapperDuck.TREASURY_PERCENTAGE()).to.equal(50);
      expect(await dapperDuck.PLAYERS_PERCENTAGE()).to.equal(50);
    });
  });

  describe("Game Functions", function () {
    it("Should allow starting a paid game", async function () {
      await expect(dapperDuck.connect(player1).startPaidGame({ value: GAME_FEE }))
        .to.emit(dapperDuck, "GameStarted");

      const gameSession = await dapperDuck.getGameSession(1);
      expect(gameSession.player).to.equal(player1.address);
      expect(gameSession.isActive).to.be.true;
    });

    it("Should reject incorrect game fee", async function () {
      await expect(dapperDuck.connect(player1).startPaidGame({ value: ethers.parseEther("0.002") }))
        .to.be.revertedWith("Incorrect game fee");
    });

    it("Should allow ending a game with score", async function () {
      await dapperDuck.connect(player1).startPaidGame({ value: GAME_FEE });
      
      await expect(dapperDuck.connect(player1).endPaidGame(1, 1000, true))
        .to.emit(dapperDuck, "GameCompleted");

      const gameSession = await dapperDuck.getGameSession(1);
      expect(gameSession.score).to.equal(1000);
      expect(gameSession.completed).to.be.true;
      expect(gameSession.isActive).to.be.false;
    });

    it("Should prevent ending someone else's game", async function () {
      await dapperDuck.connect(player1).startPaidGame({ value: GAME_FEE });
      
      await expect(dapperDuck.connect(player2).endPaidGame(1, 1000, true))
        .to.be.revertedWith("Not game player");
    });
  });

  describe("Revenue Distribution", function () {
    it("Should distribute revenue correctly", async function () {
      // Start multiple games
      await dapperDuck.connect(player1).startPaidGame({ value: GAME_FEE });
      await dapperDuck.connect(player2).startPaidGame({ value: GAME_FEE });
      await dapperDuck.connect(player3).startPaidGame({ value: GAME_FEE });

      const stats = await dapperDuck.getStats();
      expect(stats._totalRevenue).to.equal(GAME_FEE * 3n);
      expect(stats._treasuryBalance).to.equal((GAME_FEE * 3n) / 2n);
      expect(stats._playersRewardPool).to.equal((GAME_FEE * 3n) / 2n);
    });

    it("Should distribute weekly rewards", async function () {
      // Start games and end them with scores
      await dapperDuck.connect(player1).startPaidGame({ value: GAME_FEE });
      await dapperDuck.connect(player1).endPaidGame(1, 1000, true);
      
      await dapperDuck.connect(player2).startPaidGame({ value: GAME_FEE });
      await dapperDuck.connect(player2).endPaidGame(2, 2000, true);
      
      await dapperDuck.connect(player3).startPaidGame({ value: GAME_FEE });
      await dapperDuck.connect(player3).endPaidGame(3, 1500, true);

      // Distribute rewards
      await expect(dapperDuck.distributeWeeklyRewards())
        .to.emit(dapperDuck, "WeeklyRewardsDistributed");

      const leaderboard = await dapperDuck.getCurrentLeaderboard();
      expect(leaderboard.length).to.equal(3);
      
      // Check that scores are sorted correctly
      expect(leaderboard[0].score).to.equal(2000); // player2
      expect(leaderboard[1].score).to.equal(1500); // player3
      expect(leaderboard[2].score).to.equal(1000); // player1
    });
  });

  describe("Access Control", function () {
    it("Should allow only owner to distribute rewards", async function () {
      await expect(dapperDuck.connect(player1).distributeWeeklyRewards())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow only owner to withdraw treasury", async function () {
      await dapperDuck.connect(player1).startPaidGame({ value: GAME_FEE });
      
      await expect(dapperDuck.connect(player1).withdrawTreasury())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to pause contract", async function () {
      await dapperDuck.pause();
      expect(await dapperDuck.paused()).to.be.true;
    });
  });

  describe("Edge Cases", function () {
    it("Should prevent starting multiple active games", async function () {
      await dapperDuck.connect(player1).startPaidGame({ value: GAME_FEE });
      
      await expect(dapperDuck.connect(player1).startPaidGame({ value: GAME_FEE }))
        .to.be.revertedWith("Player has active game");
    });

    it("Should handle zero score games", async function () {
      await dapperDuck.connect(player1).startPaidGame({ value: GAME_FEE });
      await dapperDuck.connect(player1).endPaidGame(1, 0, false);

      const leaderboard = await dapperDuck.getCurrentLeaderboard();
      expect(leaderboard.length).to.equal(0); // Zero score games don't go to leaderboard
    });
  });
});
