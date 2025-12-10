import hre from "hardhat";
import fs from "fs";
import path from "path";

const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  // Correct way to get balance in Hardhat v3 + Ethers v6
  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("Deploying contracts with account:", deployerAddress);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy AssetToken
  const AssetToken = await ethers.getContractFactory("AssetToken");
  const assetToken = await AssetToken.deploy(deployerAddress);
  await assetToken.waitForDeployment();
  const assetTokenAddress = assetToken.target ?? assetToken.getAddress;
  console.log("AssetToken deployed to:", assetTokenAddress);

  // Deploy HealthToken
  const HealthToken = await ethers.getContractFactory("HealthToken");
  const healthToken = await HealthToken.deploy(deployerAddress);
  await healthToken.waitForDeployment();
  const healthTokenAddress = healthToken.target ?? healthToken.getAddress;
  console.log("HealthToken deployed to:", healthTokenAddress);

  // Deploy HospitalFinancials
  const HospitalFinancials = await ethers.getContractFactory("HospitalFinancials");
  const hospital = await HospitalFinancials.deploy(
    assetTokenAddress,
    healthTokenAddress,
    deployerAddress,
    deployerAddress
  );
  await hospital.waitForDeployment();
  const hospitalAddress = hospital.target ?? hospital.getAddress;
  console.log("HospitalFinancials deployed to:", hospitalAddress);

  // Grant DEFAULT_ADMIN_ROLE on both tokens
  const DEFAULT_ADMIN_ROLE = await assetToken.DEFAULT_ADMIN_ROLE();
  await assetToken.grantRole(DEFAULT_ADMIN_ROLE, hospitalAddress);
  await healthToken.grantRole(DEFAULT_ADMIN_ROLE, hospitalAddress);
  console.log("Granted DEFAULT_ADMIN_ROLE on both tokens");

  // Write addresses to frontend .env.local
  

  console.log("Deployment complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});