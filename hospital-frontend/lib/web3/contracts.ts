// hospital-frontend/lib/web3/contracts.ts
export const CONTRACT_ADDRESSES = {
  AssetToken: process.env.NEXT_PUBLIC_ASSET_TOKEN_ADDRESS || "0x...",
  HealthToken: process.env.NEXT_PUBLIC_HEALTH_TOKEN_ADDRESS || "0x...", 
  HospitalFinancials: process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || "0x..."
};

export const CONTRACT_ABIS = {
  // You'll need to add your actual contract ABIs here
  AssetToken: require('../../artifacts/contracts/AssetToken.sol/AssetToken.json').abi,
  HealthToken: require('../../artifacts/contracts/HealthToken.sol/HealthToken.json').abi,
  HospitalFinancials: require('../../artifacts/contracts/HospitalFinancials.sol/HospitalFinancials.json').abi
};