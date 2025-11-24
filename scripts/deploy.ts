import { createRequire } from "module";
const require = createRequire(import.meta.url);
const hre = require("hardhat");

async function deploy() {
  const { ethers } = hre;
  // Get the deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", await deployer.getAddress());

  // Deploy AssetToken
  const AssetToken = await ethers.getContractFactory("AssetToken");
  const assetToken = await AssetToken.deploy(await deployer.getAddress());
  await assetToken.waitForDeployment();
  const assetTokenAddress = await assetToken.getAddress();
  console.log("AssetToken deployed to:", assetTokenAddress);

  // Deploy HealthToken
  const HealthToken = await ethers.getContractFactory("HealthToken");
  const healthToken = await HealthToken.deploy(await deployer.getAddress());
  await healthToken.waitForDeployment();
  const healthTokenAddress = await healthToken.getAddress();
  console.log("HealthToken deployed to:", healthTokenAddress);

  // Deploy HospitalFinancials
  const HospitalFinancials = await ethers.getContractFactory("HospitalFinancials");
  const hospitalFinancials = await HospitalFinancials.deploy(
    assetTokenAddress,
    healthTokenAddress,
    await deployer.getAddress(),
    await deployer.getAddress() // hospitalWallet
  );
  await hospitalFinancials.waitForDeployment();
  const hospitalFinancialsAddress = await hospitalFinancials.getAddress();
  console.log("HospitalFinancials deployed to:", hospitalFinancialsAddress);

  // Grant roles
  const assetMinterRole = await assetToken.MINTER_ROLE();
  await assetToken.grantRole(assetMinterRole, hospitalFinancialsAddress);
  console.log("Granted MINTER_ROLE on AssetToken");

  const healthMinterRole = await healthToken.MINTER_ROLE();
  await healthToken.grantRole(healthMinterRole, hospitalFinancialsAddress);
  console.log("Granted MINTER_ROLE on HealthToken");

  return { assetToken, healthToken, hospitalFinancials };
}

async function main() {
  console.log("Starting deployment...");
  await deploy();
  console.log("\nDeployment complete! ✅");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });