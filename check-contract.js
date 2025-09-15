const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking what contract is deployed at the address...");
  
  // Use the private key directly
  const PRIVATE_KEY = "0x53005a34123e218be455af9dc82742a9fe64d545e24f589adc226a9463a5f4eb";
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  
  // Connect to the network
  const provider = new ethers.JsonRpcProvider("https://api.testnet.abs.xyz");
  const connectedWallet = wallet.connect(provider);
  
  const CONTRACT_ADDRESS = "0x764fEC2E554fD3a85e7d4f0D0CC78C74259580Da";
  
  console.log("📍 Contract Address:", CONTRACT_ADDRESS);
  console.log("📝 Checking from wallet:", wallet.address);
  
  // Check contract balance
  const balance = await provider.getBalance(CONTRACT_ADDRESS);
  console.log("💰 Contract Balance:", ethers.formatEther(balance), "ETH");
  
  // Try to get the contract factory and check what functions are available
  try {
    const DapperDuck = await ethers.getContractFactory("DapperDuck");
    const contract = DapperDuck.attach(CONTRACT_ADDRESS).connect(connectedWallet);
    
    console.log("\n🔍 Testing contract functions...");
    
    // Try to call GAME_FEE
    try {
      const gameFee = await contract.GAME_FEE();
      console.log("✅ GAME_FEE:", ethers.formatEther(gameFee), "ETH");
    } catch (error) {
      console.log("❌ GAME_FEE not available:", error.message);
    }
    
    // Try to call gameCounter
    try {
      const gameCounter = await contract.gameCounter();
      console.log("✅ gameCounter:", gameCounter.toString());
    } catch (error) {
      console.log("❌ gameCounter not available:", error.message);
    }
    
    // Try to call treasuryBalance
    try {
      const treasuryBalance = await contract.treasuryBalance();
      console.log("✅ treasuryBalance:", ethers.formatEther(treasuryBalance), "ETH");
    } catch (error) {
      console.log("❌ treasuryBalance not available:", error.message);
    }
    
    // Try to call getStats
    try {
      const stats = await contract.getStats();
      console.log("✅ getStats available, results:", stats);
    } catch (error) {
      console.log("❌ getStats not available:", error.message);
    }
    
    // Check if withdrawTreasury function exists
    try {
      const iface = contract.interface;
      const hasWithdrawTreasury = iface.hasFunction("withdrawTreasury");
      console.log("✅ withdrawTreasury function exists:", hasWithdrawTreasury);
    } catch (error) {
      console.log("❌ Could not check withdrawTreasury function:", error.message);
    }
    
  } catch (error) {
    console.log("❌ Error connecting to contract:", error.message);
  }
}

main()
  .then(() => {
    console.log("\n✅ Contract check completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Contract check failed:", error);
    process.exit(1);
  });
