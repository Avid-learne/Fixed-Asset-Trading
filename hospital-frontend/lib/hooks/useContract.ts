// hospital-frontend/lib/hooks/useContract.ts
"use client";

import { useState, useEffect } from 'react';
import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { useWeb3 } from '@/lib/useWeb3';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '@/lib/web3/contracts';

export function useContract(contractName: keyof typeof CONTRACT_ADDRESSES) {
  const { provider, signer, address } = useWeb3();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!provider || !CONTRACT_ADDRESSES[contractName]) return;

      try {
        const contractAddress = CONTRACT_ADDRESSES[contractName];
        const contractABI = CONTRACT_ABIS[contractName];
        
        if (signer) {
          // Use signer for write operations
          const contractWithSigner = new Contract(contractAddress, contractABI, signer);
          setContract(contractWithSigner);
        } else {
          // Use provider for read-only operations
          const contractReadOnly = new Contract(contractAddress, contractABI, provider);
          setContract(contractReadOnly);
        }
      } catch (error) {
        console.error(`Error initializing ${contractName} contract:`, error);
      }
    };

    initContract();
  }, [provider, signer, contractName, address]);

  return contract;
}