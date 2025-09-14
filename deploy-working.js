const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying DapperDuck contract to Abstract testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from address:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.log("❌ No ETH balance! You need testnet ETH to deploy.");
    console.log("Please get some Abstract testnet ETH from a faucet.");
    return;
  }

  // Get the contract factory
  console.log("Getting contract factory...");
  const DapperDuck = await ethers.getContractFactory("DapperDuck");

  // Deploy the contract
  console.log("Deploying contract...");
  const dapperDuck = await DapperDuck.deploy();

  console.log("Waiting for deployment...");
  await dapperDuck.waitForDeployment();

  const contractAddress = await dapperDuck.getAddress();
  console.log("✅ DapperDuck deployed to:", contractAddress);

  // Get deployment transaction
  const deploymentTx = dapperDuck.deploymentTransaction();
  if (deploymentTx) {
    console.log("Deployment transaction hash:", deploymentTx.hash);
  }

  // Verify deployment by calling some functions
  console.log("\n🔍 Verifying deployment...");
  try {
    const gameFee = await dapperDuck.GAME_FEE();
    const maxLeaderboardSize = await dapperDuck.MAX_LEADERBOARD_SIZE();
    const treasuryPercentage = await dapperDuck.TREASURY_PERCENTAGE();
    const playersPercentage = await dapperDuck.PLAYERS_PERCENTAGE();
    const owner = await dapperDuck.owner();

    console.log("✅ Contract verification successful!");
    console.log("Game Fee:", ethers.formatEther(gameFee), "ETH");
    console.log("Max Leaderboard Size:", maxLeaderboardSize.toString());
    console.log("Treasury Percentage:", treasuryPercentage.toString(), "%");
    console.log("Players Percentage:", playersPercentage.toString(), "%");
    console.log("Owner:", owner);

    // Save deployment info
    const deploymentInfo = {
      contractAddress: contractAddress,
      deploymentTx: deploymentTx?.hash || "N/A",
      network: "abstract",
      timestamp: new Date().toISOString(),
      gameFee: ethers.formatEther(gameFee),
      maxLeaderboardSize: maxLeaderboardSize.toString(),
      treasuryPercentage: treasuryPercentage.toString(),
      playersPercentage: playersPercentage.toString(),
      owner: owner
    };

    console.log("\n🎉 Deployment successful!");
    console.log("📋 Deployment Summary:");
    console.log("Contract Address:", deploymentInfo.contractAddress);
    console.log("Network: Abstract Testnet");
    console.log("Chain ID: 11124");
    console.log("Timestamp:", deploymentInfo.timestamp);

    return deploymentInfo;

  } catch (error) {
    console.log("❌ Contract verification failed:", error.message);
    return null;
  }
}

main()
  .then((result) => {
    if (result) {
      console.log("\n🚀 Contract is ready for use!");
      console.log("You can now integrate this contract address with your frontend.");
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
