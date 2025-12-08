import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('📝 Deploying contracts with account:', deployer);

  // Deploy AssetToken
  console.log('\n📝 Deploying AssetToken...');
  const assetToken = await deploy('AssetToken', {
    from: deployer,
    args: [deployer],
    log: true,
    waitConfirmations: 1,
  });
  console.log('✅ AssetToken deployed to:', assetToken.address);

  // Deploy HealthToken
  console.log('\n📝 Deploying HealthToken...');
  const healthToken = await deploy('HealthToken', {
    from: deployer,
    args: [deployer],
    log: true,
    waitConfirmations: 1,
  });
  console.log('✅ HealthToken deployed to:', healthToken.address);

  // Deploy HospitalFinancials
  console.log('\n📝 Deploying HospitalFinancials...');
  const hospitalFinancials = await deploy('HospitalFinancials', {
    from: deployer,
    args: [assetToken.address, healthToken.address, deployer, deployer],
    log: true,
    waitConfirmations: 1,
  });
  console.log('✅ HospitalFinancials deployed to:', hospitalFinancials.address);

  // Grant MINTER_ROLE to HospitalFinancials
  console.log('\n🔐 Granting MINTER_ROLE permissions...');
  
  const AssetTokenContract = await ethers.getContractAt('AssetToken', assetToken.address);
  const HealthTokenContract = await ethers.getContractAt('HealthToken', healthToken.address);
  
  const MINTER_ROLE = await AssetTokenContract.MINTER_ROLE();
  
  const tx1 = await AssetTokenContract.grantRole(MINTER_ROLE, hospitalFinancials.address);
  await tx1.wait();
  console.log('✅ Granted MINTER_ROLE on AssetToken to HospitalFinancials');
  
  const tx2 = await HealthTokenContract.grantRole(MINTER_ROLE, hospitalFinancials.address);
  await tx2.wait();
  console.log('✅ Granted MINTER_ROLE on HealthToken to HospitalFinancials');

  // Deploy Counter (optional)
  console.log('\n📝 Deploying Counter...');
  const counter = await deploy('Counter', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log('✅ Counter deployed to:', counter.address);

  console.log('\n🎉 All contracts deployed and configured successfully!');
  console.log('\n📍 Contract Addresses:');
  console.log('AssetToken:', assetToken.address);
  console.log('HealthToken:', healthToken.address);
  console.log('HospitalFinancials:', hospitalFinancials.address);
  console.log('Counter:', counter.address);
  
  console.log('\n💾 Deployment data saved to: deployments/localhost/');
};

export default func;
func.tags = ['all'];
