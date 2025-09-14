const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Checking Abstract testnet connection and balance...");
  
  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("✅ Connected to Abstract testnet");
    console.log("📱 Deployer address:", deployer.address);
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log("💰 Balance:", balanceInEth, "ETH");
    
    if (balance === 0n) {
      console.log("❌ No ETH balance! You need testnet ETH to deploy.");
      console.log("💡 To get testnet ETH:");
      console.log("   1. Make sure you're on Abstract Testnet in MetaMask");
      console.log("   2. Check if there's a faucet available");
      console.log("   3. Or ask the Abstract team for testnet ETH");
    } else {
      console.log("✅ You have ETH! Ready to deploy.");
    }
    
  } catch (error) {
    console.log("❌ Error connecting to Abstract testnet:", error.message);
    console.log("💡 Make sure:");
    console.log("   1. Your .env file has the correct PRIVATE_KEY");
    console.log("   2. You're connected to Abstract Testnet");
    console.log("   3. The RPC URL is working");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
