import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🚀 Starting deployment with persistent storage...\n');

  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH\n');

  // Deploy AssetToken
  console.log('📝 Deploying AssetToken...');
  const AssetToken = await ethers.getContractFactory('AssetToken');
  const assetToken = await AssetToken.deploy(deployer.address);
  await assetToken.waitForDeployment();
  const assetTokenAddress = await assetToken.getAddress();
  console.log('✅ AssetToken deployed to:', assetTokenAddress);

  // Deploy HealthToken
  console.log('\n📝 Deploying HealthToken...');
  const HealthToken = await ethers.getContractFactory('HealthToken');
  const healthToken = await HealthToken.deploy(deployer.address);
  await healthToken.waitForDeployment();
  const healthTokenAddress = await healthToken.getAddress();
  console.log('✅ HealthToken deployed to:', healthTokenAddress);

  // Deploy HospitalFinancials
  console.log('\n📝 Deploying HospitalFinancials...');
  const HospitalFinancials = await ethers.getContractFactory('HospitalFinancials');
  const hospitalFinancials = await HospitalFinancials.deploy(
    assetTokenAddress,
    healthTokenAddress,
    deployer.address,
    deployer.address
  );
  await hospitalFinancials.waitForDeployment();
  const hospitalFinancialsAddress = await hospitalFinancials.getAddress();
  console.log('✅ HospitalFinancials deployed to:', hospitalFinancialsAddress);

  // Grant MINTER_ROLE
  console.log('\n🔐 Granting MINTER_ROLE permissions...');
  const MINTER_ROLE = await assetToken.MINTER_ROLE();

  const tx1 = await assetToken.grantRole(MINTER_ROLE, hospitalFinancialsAddress);
  await tx1.wait();
  console.log('✅ Granted MINTER_ROLE on AssetToken to HospitalFinancials');

  const tx2 = await healthToken.grantRole(MINTER_ROLE, hospitalFinancialsAddress);
  await tx2.wait();
  console.log('✅ Granted MINTER_ROLE on HealthToken to HospitalFinancials');

  // Deploy Counter
  console.log('\n📝 Deploying Counter...');
  const Counter = await ethers.getContractFactory('Counter');
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  const counterAddress = await counter.getAddress();
  console.log('✅ Counter deployed to:', counterAddress);

  // Save deployment addresses to file
  const deploymentData = {
    network: 'localhost',
    chainId: 31337,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      AssetToken: assetTokenAddress,
      HealthToken: healthTokenAddress,
      HospitalFinancials: hospitalFinancialsAddress,
      Counter: counterAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, '../deployments');
  const localhostDir = path.join(deploymentsDir, 'localhost');
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  if (!fs.existsSync(localhostDir)) {
    fs.mkdirSync(localhostDir);
  }

  const deploymentFile = path.join(localhostDir, 'deployment.json');
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));

  console.log('\n💾 Deployment data saved to:', deploymentFile);
  
  console.log('\n🎉 All contracts deployed successfully!');
  console.log('\n📍 Contract Addresses:');
  console.log('AssetToken:', assetTokenAddress);
  console.log('HealthToken:', healthTokenAddress);
  console.log('HospitalFinancials:', hospitalFinancialsAddress);
  console.log('Counter:', counterAddress);
  
  console.log('\n📝 Update your frontend .env.local with these addresses:');
  console.log(`NEXT_PUBLIC_ASSET_TOKEN_ADDRESS=${assetTokenAddress}`);
  console.log(`NEXT_PUBLIC_HEALTH_TOKEN_ADDRESS=${healthTokenAddress}`);
  console.log(`NEXT_PUBLIC_HOSPITAL_FINANCIALS_ADDRESS=${hospitalFinancialsAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
