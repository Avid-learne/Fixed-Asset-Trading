import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy AssetToken
  console.log("\n📝 Deploying AssetToken...");
  const AssetToken = await hre.ethers.getContractFactory("AssetToken");
  const assetToken = await AssetToken.deploy(deployer.address);
  await assetToken.waitForDeployment();
  const assetTokenAddress = await assetToken.getAddress();
  console.log("✅ AssetToken deployed to:", assetTokenAddress);

  // Deploy HealthToken
  console.log("\n📝 Deploying HealthToken...");
  const HealthToken = await hre.ethers.getContractFactory("HealthToken");
  const healthToken = await HealthToken.deploy(deployer.address);
  await healthToken.waitForDeployment();
  const healthTokenAddress = await healthToken.getAddress();
  console.log("✅ HealthToken deployed to:", healthTokenAddress);

  // Deploy HospitalFinancials
  console.log("\n📝 Deploying HospitalFinancials...");
  const HospitalFinancials = await hre.ethers.getContractFactory("HospitalFinancials");
  const hospital = await HospitalFinancials.deploy(
    assetTokenAddress,
    healthTokenAddress,
    deployer.address,
    deployer.address
  );
  await hospital.waitForDeployment();
  const hospitalAddress = await hospital.getAddress();
  console.log("✅ HospitalFinancials deployed to:", hospitalAddress);

  // Grant minter roles
  console.log("\n🔐 Granting MINTER_ROLE permissions...");
  const minterRole = await assetToken.MINTER_ROLE();
  
  await assetToken.grantRole(minterRole, hospitalAddress);
  console.log("✅ Granted MINTER_ROLE on AssetToken to HospitalFinancials");
  
  await healthToken.grantRole(minterRole, hospitalAddress);
  console.log("✅ Granted MINTER_ROLE on HealthToken to HospitalFinancials");

  // Deploy Counter (optional test contract)
  console.log("\n📝 Deploying Counter...");
  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  console.log("✅ Counter deployed to:", await counter.getAddress());

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n📋 Deployment Summary:");
  console.log("=======================");
  console.log("AssetToken:         ", assetTokenAddress);
  console.log("HealthToken:        ", healthTokenAddress);
  console.log("HospitalFinancials: ", hospitalAddress);
  console.log("Counter:            ", await counter.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
