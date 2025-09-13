const { ethers, network } = require("hardhat");

async function main() {
  console.log("Deploying DapperDuck contract...");
  console.log("Network:", network.name);

  // Get the contract factory
  const DapperDuck = await ethers.getContractFactory("DapperDuck");

  // Deploy the contract
  const dapperDuck = await DapperDuck.deploy();

  // Wait for deployment to complete
  await dapperDuck.waitForDeployment();

  console.log("DapperDuck deployed to:", await dapperDuck.getAddress());
  console.log("Deployment transaction hash:", dapperDuck.deploymentTransaction().hash);

  // Verify deployment
  console.log("\nVerifying deployment...");
  const gameFee = await dapperDuck.GAME_FEE();
  const maxLeaderboardSize = await dapperDuck.MAX_LEADERBOARD_SIZE();
  const treasuryPercentage = await dapperDuck.TREASURY_PERCENTAGE();
  const playersPercentage = await dapperDuck.PLAYERS_PERCENTAGE();

  console.log("Game Fee:", ethers.formatEther(gameFee), "ETH");
  console.log("Max Leaderboard Size:", maxLeaderboardSize.toString());
  console.log("Treasury Percentage:", treasuryPercentage.toString(), "%");
  console.log("Players Percentage:", playersPercentage.toString(), "%");

  // Save deployment info
  const deploymentInfo = {
    contractAddress: await dapperDuck.getAddress(),
    deploymentTx: dapperDuck.deploymentTransaction().hash,
    network: network.name,
    timestamp: new Date().toISOString(),
    gameFee: ethers.formatEther(gameFee),
    maxLeaderboardSize: maxLeaderboardSize.toString(),
    treasuryPercentage: treasuryPercentage.toString(),
    playersPercentage: playersPercentage.toString()
  };

  console.log("\nDeployment successful!");
  console.log("Contract Address:", deploymentInfo.contractAddress);
  console.log("Network:", deploymentInfo.network);
  console.log("Timestamp:", deploymentInfo.timestamp);

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
