const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  console.log("Deploying DapperDuck contract manually...");

  // Connect to Abstract testnet
  const provider = new ethers.providers.JsonRpcProvider("https://api.testnet.abs.xyz");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying from address:", wallet.address);

  // Get the contract bytecode and ABI
  const contractArtifact = require("./artifacts/contracts/DapperDuck.sol/DapperDuck.json");
  
  // Create contract factory
  const factory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );

  // Deploy the contract
  console.log("Deploying contract...");
  const contract = await factory.deploy();
  
  console.log("Waiting for deployment...");
  await contract.deployed();

  console.log("DapperDuck deployed to:", contract.address);
  console.log("Deployment transaction hash:", contract.deployTransaction.hash);

  // Verify deployment
  console.log("\nVerifying deployment...");
  const gameFee = await contract.GAME_FEE();
  const maxLeaderboardSize = await contract.MAX_LEADERBOARD_SIZE();
  const treasuryPercentage = await contract.TREASURY_PERCENTAGE();
  const playersPercentage = await contract.PLAYERS_PERCENTAGE();

  console.log("Game Fee:", ethers.utils.formatEther(gameFee), "ETH");
  console.log("Max Leaderboard Size:", maxLeaderboardSize.toString());
  console.log("Treasury Percentage:", treasuryPercentage.toString(), "%");
  console.log("Players Percentage:", playersPercentage.toString(), "%");

  console.log("\nDeployment successful!");
  console.log("Contract Address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
