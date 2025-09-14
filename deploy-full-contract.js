const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying DapperDuck Full Contract...");
  
  // Get the contract factory
  const DapperDuck = await ethers.getContractFactory("DapperDuck");
  
  // Deploy the contract
  console.log("📝 Deploying contract...");
  const dapperDuck = await DapperDuck.deploy();
  
  // Wait for deployment
  await dapperDuck.waitForDeployment();
  
  const contractAddress = await dapperDuck.getAddress();
  
  console.log("✅ DapperDuck Full Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Network: Abstract Testnet");
  console.log("💰 Features:");
  console.log("   - 50% to Treasury");
  console.log("   - 50% to Top 15 Players (Weekly)");
  console.log("   - Leaderboard System");
  console.log("   - Revenue Distribution");
  console.log("   - Abstract XP Integration");
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const stats = await dapperDuck.getStats();
  console.log("📊 Initial Stats:");
  console.log("   - Total Games:", stats[0].toString());
  console.log("   - Total Revenue:", ethers.formatEther(stats[1]), "ETH");
  console.log("   - Treasury Balance:", ethers.formatEther(stats[2]), "ETH");
  console.log("   - Players Reward Pool:", ethers.formatEther(stats[3]), "ETH");
  console.log("   - Current Week:", stats[4].toString());
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Update frontend to use new contract address");
  console.log("2. Test the full treasury distribution system");
  console.log("3. Set up treasury withdrawal wallet");
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("📍 New Contract Address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
