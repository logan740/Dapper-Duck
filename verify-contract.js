const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  console.log("Verifying DapperDuck contract deployment...");

  // Connect to Abstract testnet
  const provider = new ethers.providers.JsonRpcProvider("https://api.testnet.abs.xyz");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Contract address from deployment
  const contractAddress = "0xEeD74D37065a0E8eBD16457278e33ab455604317";
  
  // Get the contract ABI
  const contractArtifact = require("./artifacts/contracts/DapperDuck.sol/DapperDuck.json");
  
  // Create contract instance
  const contract = new ethers.Contract(contractAddress, contractArtifact.abi, wallet);

  console.log("Contract Address:", contractAddress);
  console.log("Verifying contract functions...");

  try {
    // Test contract functions
    const gameFee = await contract.GAME_FEE();
    const maxLeaderboardSize = await contract.MAX_LEADERBOARD_SIZE();
    const treasuryPercentage = await contract.TREASURY_PERCENTAGE();
    const playersPercentage = await contract.PLAYERS_PERCENTAGE();
    const stats = await contract.getStats();

    console.log("\n✅ Contract verification successful!");
    console.log("Game Fee:", ethers.utils.formatEther(gameFee), "ETH");
    console.log("Max Leaderboard Size:", maxLeaderboardSize.toString());
    console.log("Treasury Percentage:", treasuryPercentage.toString(), "%");
    console.log("Players Percentage:", playersPercentage.toString(), "%");
    console.log("\nContract Stats:");
    console.log("- Total Games:", stats[0].toString());
    console.log("- Total Revenue:", ethers.utils.formatEther(stats[1]), "ETH");
    console.log("- Treasury Balance:", ethers.utils.formatEther(stats[2]), "ETH");
    console.log("- Players Reward Pool:", ethers.utils.formatEther(stats[3]), "ETH");
    console.log("- Current Week:", stats[4].toString());
    console.log("- Week Start Time:", new Date(stats[5].toNumber() * 1000).toISOString());

    console.log("\n🎉 Contract is ready for use!");
    console.log("Contract Address:", contractAddress);
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
