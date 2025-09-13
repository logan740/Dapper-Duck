const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  console.log("Deploying SimpleGame contract...");

  // Connect to Abstract testnet
  const provider = new ethers.providers.JsonRpcProvider("https://api.testnet.abs.xyz");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying from address:", wallet.address);
  
  // Check balance
  const balance = await wallet.getBalance();
  console.log("Wallet balance:", ethers.utils.formatEther(balance), "ETH");

  // Get the contract bytecode and ABI
  const contractArtifact = require("./artifacts/contracts/SimpleGame.sol/SimpleGame.json");
  
  // Create contract factory
  const factory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );

  // Deploy with gas limit
  console.log("Deploying contract...");
  const contract = await factory.deploy({
    gasLimit: 500000 // 500K gas limit
  });
  
  console.log("Waiting for deployment...");
  await contract.deployed();

  console.log("SimpleGame deployed to:", contract.address);
  console.log("Deployment transaction hash:", contract.deployTransaction.hash);
  console.log("Gas used:", contract.deployTransaction.gasLimit.toString());

  // Verify deployment
  console.log("\nVerifying deployment...");
  const gameFee = await contract.GAME_FEE();
  const stats = await contract.getStats();

  console.log("Game Fee:", ethers.utils.formatEther(gameFee), "ETH");
  console.log("Total Games:", stats[0].toString());
  console.log("Contract Balance:", ethers.utils.formatEther(stats[1]), "ETH");

  console.log("\nDeployment successful!");
  console.log("Contract Address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
