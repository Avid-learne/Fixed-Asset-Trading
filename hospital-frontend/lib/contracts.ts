"use client";

import AssetTokenArtifact from "../../artifacts/contracts/AssetToken.sol/AssetToken.json";
import HealthTokenArtifact from "../../artifacts/contracts/HealthToken.sol/HealthToken.json";
import HospitalArtifact from "../../artifacts/contracts/HospitalFinancials.sol/HospitalFinancials.json";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";

type AnyProvider = BrowserProvider | null | undefined;

export function getContractFromArtifact(artifact: any, address: string, signerOrProvider: AnyProvider | JsonRpcSigner) {
  if (!address) throw new Error("Contract address required");
  return new Contract(address, artifact.abi, signerOrProvider as any);
}

export function getAssetToken(address: string, signerOrProvider: AnyProvider | JsonRpcSigner) {
  return getContractFromArtifact(AssetTokenArtifact, address, signerOrProvider);
}

export function getHealthToken(address: string, signerOrProvider: AnyProvider | JsonRpcSigner) {
  return getContractFromArtifact(HealthTokenArtifact, address, signerOrProvider);
}

export function getHospitalContract(address: string, signerOrProvider: AnyProvider | JsonRpcSigner) {
  return getContractFromArtifact(HospitalArtifact, address, signerOrProvider);
}
