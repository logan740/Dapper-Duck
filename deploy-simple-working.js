const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying DapperDuck contract to Abstract testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📱 Deploying from address:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  // Get the contract factory
  console.log("📦 Getting contract factory...");
  const DapperDuck = await ethers.getContractFactory("DapperDuck");

  // Deploy the contract
  console.log("🔨 Deploying contract...");
  const dapperDuck = await DapperDuck.deploy();

  console.log("⏳ Waiting for deployment...");
  await dapperDuck.waitForDeployment();

  const contractAddress = await dapperDuck.getAddress();
  console.log("✅ DapperDuck deployed to:", contractAddress);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const gameFee = await dapperDuck.GAME_FEE();
  const maxLeaderboardSize = await dapperDuck.MAX_LEADERBOARD_SIZE();
  const treasuryPercentage = await dapperDuck.TREASURY_PERCENTAGE();
  const playersPercentage = await dapperDuck.PLAYERS_PERCENTAGE();
  const owner = await dapperDuck.owner();

  console.log("✅ Contract verification successful!");
  console.log("🎮 Game Fee:", ethers.formatEther(gameFee), "ETH");
  console.log("🏆 Max Leaderboard Size:", maxLeaderboardSize.toString());
  console.log("💰 Treasury Percentage:", treasuryPercentage.toString(), "%");
  console.log("🎯 Players Percentage:", playersPercentage.toString(), "%");
  console.log("👤 Owner:", owner);

  console.log("\n🎉 Deployment successful!");
  console.log("📋 Contract Details:");
  console.log("   Address:", contractAddress);
  console.log("   Network: Abstract Testnet");
  console.log("   Chain ID: 11124");
  console.log("   Explorer: https://sepolia.abscan.org/");

  return {
    contractAddress,
    gameFee: ethers.formatEther(gameFee),
    maxLeaderboardSize: maxLeaderboardSize.toString(),
    treasuryPercentage: treasuryPercentage.toString(),
    playersPercentage: playersPercentage.toString(),
    owner
  };
}

main()
  .then((result) => {
    console.log("\n🚀 Contract is ready for integration!");
    console.log("You can now use this contract address in your frontend.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
