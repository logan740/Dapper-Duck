// This script will be run in hardhat console
// Run with: npx hardhat console --network abstract
// Then copy and paste these commands

console.log("🚀 Starting deployment in hardhat console...");

// Get the deployer account
const [deployer] = await ethers.getSigners();
console.log("📱 Deploying from address:", deployer.address);

// Check balance
const balance = await deployer.provider.getBalance(deployer.address);
console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

// Get the contract factory
console.log("📦 Getting SimpleGame contract factory...");
const SimpleGame = await ethers.getContractFactory("SimpleGame");

// Deploy the contract
console.log("🔨 Deploying SimpleGame contract...");
const simpleGame = await SimpleGame.deploy();

console.log("⏳ Waiting for deployment...");
await simpleGame.waitForDeployment();

const contractAddress = await simpleGame.getAddress();
console.log("✅ SimpleGame deployed to:", contractAddress);

// Verify deployment
console.log("\n🔍 Verifying deployment...");
const gameFee = await simpleGame.GAME_FEE();
const stats = await simpleGame.getStats();

console.log("✅ Contract verification successful!");
console.log("🎮 Game Fee:", ethers.formatEther(gameFee), "ETH");
console.log("📊 Total Games:", stats[0].toString());
console.log("💰 Contract Balance:", ethers.formatEther(stats[1]), "ETH");

console.log("\n🎉 SimpleGame deployment successful!");
console.log("📋 Contract Details:");
console.log("   Address:", contractAddress);
console.log("   Network: Abstract Testnet");
console.log("   Chain ID: 11124");
console.log("   Explorer: https://sepolia.abscan.org/");

console.log("\n🚀 SimpleGame contract is ready!");
console.log("You can now test basic game functionality.");
