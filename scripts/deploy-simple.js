const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DapperDuck contract...");

  // Get the contract factory
  const DapperDuck = await ethers.getContractFactory("DapperDuck");

  // Deploy the contract
  console.log("Deploying contract...");
  const dapperDuck = await DapperDuck.deploy();

  console.log("Waiting for deployment...");
  await dapperDuck.deployed();

  console.log("DapperDuck deployed to:", dapperDuck.address);
  console.log("Deployment transaction hash:", dapperDuck.deployTransaction.hash);

  // Verify deployment
  console.log("\nVerifying deployment...");
  const gameFee = await dapperDuck.GAME_FEE();
  const maxLeaderboardSize = await dapperDuck.MAX_LEADERBOARD_SIZE();
  const treasuryPercentage = await dapperDuck.TREASURY_PERCENTAGE();
  const playersPercentage = await dapperDuck.PLAYERS_PERCENTAGE();

  console.log("Game Fee:", ethers.utils.formatEther(gameFee), "ETH");
  console.log("Max Leaderboard Size:", maxLeaderboardSize.toString());
  console.log("Treasury Percentage:", treasuryPercentage.toString(), "%");
  console.log("Players Percentage:", playersPercentage.toString(), "%");

  console.log("\nDeployment successful!");
  console.log("Contract Address:", dapperDuck.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
