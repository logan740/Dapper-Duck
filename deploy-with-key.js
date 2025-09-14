const { ethers } = require("ethers");

async function main() {
  console.log("🚀 Deploying SimpleGame contract directly to Abstract testnet...");

  // Set the private key directly (replace with your actual private key)
  const privateKey = "0x53005a34123e218be455af9dc82742a9fe64d545e24f589adc226a9463a5f4eb";

  // Connect to Abstract testnet
  const provider = new ethers.JsonRpcProvider("https://api.testnet.abs.xyz");
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("📱 Deploying from address:", wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.log("❌ No ETH balance! You need testnet ETH to deploy.");
    return;
  }

  // Get the contract bytecode and ABI
  const contractArtifact = require("./artifacts/contracts/SimpleGame.sol/SimpleGame.json");
  
  // Create contract factory
  const factory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );

  // Deploy the contract
  console.log("🔨 Deploying SimpleGame contract...");
  const contract = await factory.deploy();
  
  console.log("⏳ Waiting for deployment...");
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ SimpleGame deployed to:", contractAddress);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const gameFee = await contract.GAME_FEE();
  const stats = await contract.getStats();

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

  return {
    contractAddress,
    gameFee: ethers.formatEther(gameFee)
  };
}

main()
  .then((result) => {
    console.log("\n🚀 SimpleGame contract is ready!");
    console.log("You can now test basic game functionality.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
