import fs from "fs/promises";
import path from "path";
import { ethers } from "ethers";

const ARTIFACTS_DIR = path.join(process.cwd(), "artifacts", "contracts");

async function readArtifact(name: string) {
  const file = path.join(ARTIFACTS_DIR, `${name}.sol`, `${name}.json`);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
}

async function deployContract(wallet: ethers.Wallet, name: string, args: any[] = []) {
  const artifact = await readArtifact(name);
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet as any);
  // ensure we use the next pending nonce
  if (!wallet.provider) throw new Error("Wallet has no provider");
  const deployerAddress = await wallet.getAddress();
  const nonce = await wallet.provider.getTransactionCount(deployerAddress, "pending");

  // Build raw deployment transaction and send it directly to avoid ambiguous `deployTransaction` shapes
  const deployTx = await factory.getDeployTransaction(...args);
  console.log(`${name} - artifact.bytecode length:`, (artifact.bytecode ?? "").length);
  console.log(`${name} - deployTx keys:`, Object.keys(deployTx));
  console.log(`${name} - deployTx.data length:`, (deployTx.data ?? "").length);
  const txRequest: any = {
    data: (deployTx as any).data,
    value: (deployTx as any).value,
    gasLimit: (deployTx as any).gasLimit,
    nonce,
  };

  console.log(`Sending deploy tx for ${name} (nonce=${nonce})...`);
  const txResponse = await wallet.sendTransaction(txRequest);
  console.log(`${name} deploy tx hash:`, txResponse.hash);

  const receipt = await wallet.provider.waitForTransaction(txResponse.hash);
  if (!receipt || !receipt.contractAddress) {
    throw new Error(`Deployment of ${name} failed or no contractAddress in receipt`);
  }
  const address = receipt.contractAddress;
  const deployed = new ethers.Contract(address, artifact.abi, wallet as any);
  return deployed as any;
}

async function main() {
  const rpc = process.env.RPC_URL ?? "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(rpc);
  const defaultPk =
    process.env.PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new ethers.Wallet(defaultPk, provider);

  console.log("Deploying with account:", await wallet.getAddress());

  const assetToken = await deployContract(wallet, "AssetToken", [await wallet.getAddress()]);
  console.log("AssetToken deployed to:", (assetToken as any).target ?? (assetToken as any).address ?? (await assetToken.getAddress?.()));

  const healthToken = await deployContract(wallet, "HealthToken", [await wallet.getAddress()]);
  
  console.log("HealthToken deployed to:", (healthToken as any).target ?? (healthToken as any).address ?? (await healthToken.getAddress?.()));

  const hospital = await deployContract(wallet, "HospitalFinancials", [
    (assetToken as any).target ?? (assetToken as any).address ?? (await assetToken.getAddress?.()),
    (healthToken as any).target ?? (healthToken as any).address ?? (await healthToken.getAddress?.()),
    await wallet.getAddress(),
    await wallet.getAddress(),
  ]);
  console.log("HospitalFinancials deployed to:", (hospital as any).target ?? (hospital as any).address ?? (await hospital.getAddress?.()));

  // Grant roles
  const assetMinterRole = await assetToken.MINTER_ROLE();
  await assetToken.grantRole(
    assetMinterRole,
    (hospital as any).target ?? (hospital as any).address ?? (await hospital.getAddress?.()),
    { nonce: await wallet.provider!.getTransactionCount(await wallet.getAddress(), "pending") }
  );
  console.log("Granted MINTER_ROLE on AssetToken");

  const healthMinterRole = await healthToken.MINTER_ROLE();
  await healthToken.grantRole(
    healthMinterRole,
    (hospital as any).target ?? (hospital as any).address ?? (await hospital.getAddress?.()),
    { nonce: await wallet.provider!.getTransactionCount(await wallet.getAddress(), "pending") }
  );
  console.log("Granted MINTER_ROLE on HealthToken");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
