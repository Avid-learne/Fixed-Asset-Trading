"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner, Provider } from "ethers";

type Web3ContextValue = {
  address: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const Web3Context = createContext<Web3ContextValue | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  useEffect(() => {
    // restore from localStorage if present
    const stored = window.localStorage.getItem("connectedAddress");
    if (stored) setAddress(stored);
  }, []);

  async function connect() {
    if (typeof window === "undefined") return;
    if (!(window as any).ethereum) {
      alert("No injected wallet found (MetaMask). Install a web3 wallet and retry.");
      return;
    }

    const browserProvider = new BrowserProvider((window as any).ethereum as any);
    setProvider(browserProvider);

    // request accounts
    try {
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    } catch (err) {
      console.error("User rejected connection", err);
      return;
    }

    const s = await browserProvider.getSigner();
    setSigner(s as JsonRpcSigner);

    try {
      const addr = await s.getAddress();
      setAddress(addr);
      window.localStorage.setItem("connectedAddress", addr);
    } catch (err) {
      console.error(err);
    }

    try {
      const network = await browserProvider.getNetwork();
      setChainId(network.chain?.id ?? null);
    } catch (e) {
      setChainId(null);
    }

    // listen for account / chain changes
    (window as any).ethereum.on?.("accountsChanged", (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        window.localStorage.setItem("connectedAddress", accounts[0]);
      }
    });

    (window as any).ethereum.on?.("chainChanged", async () => {
      const net = await browserProvider.getNetwork();
      setChainId(net.chain?.id ?? null);
    });
  }

  function disconnect() {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    window.localStorage.removeItem("connectedAddress");
  }

  return (
    <Web3Context.Provider value={{ address, provider, signer, chainId, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used inside Web3Provider");
  return ctx;
}
