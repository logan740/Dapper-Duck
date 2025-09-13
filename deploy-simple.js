const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  console.log("Deploying DapperDuck contract with optimized gas...");

  // Connect to Abstract testnet
  const provider = new ethers.providers.JsonRpcProvider("https://api.testnet.abs.xyz");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying from address:", wallet.address);
  
  // Check balance
  const balance = await wallet.getBalance();
  console.log("Wallet balance:", ethers.utils.formatEther(balance), "ETH");

  // Get the contract bytecode and ABI
  const contractArtifact = require("./artifacts/contracts/DapperDuck.sol/DapperDuck.json");
  
  // Create contract factory with gas limit
  const factory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );

  // Deploy with explicit gas limit
  console.log("Deploying contract with gas limit...");
  const contract = await factory.deploy({
    gasLimit: 2000000 // 2M gas limit
  });
  
  console.log("Waiting for deployment...");
  await contract.deployed();

  console.log("DapperDuck deployed to:", contract.address);
  console.log("Deployment transaction hash:", contract.deployTransaction.hash);
  console.log("Gas used:", contract.deployTransaction.gasLimit.toString());

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
