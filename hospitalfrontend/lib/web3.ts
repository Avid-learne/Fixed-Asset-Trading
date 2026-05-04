import { ethers } from 'ethers'

// Contract addresses from environment
export const CONTRACTS = {
  ASSET_TOKEN: process.env.NEXT_PUBLIC_ASSET_TOKEN_ADDRESS!,
  HEALTH_TOKEN: process.env.NEXT_PUBLIC_HEALTH_TOKEN_ADDRESS!,
  HOSPITAL_FINANCIALS: process.env.NEXT_PUBLIC_HOSPITAL_FINANCIALS_ADDRESS!,
} as const

// RPC URL for local Hardhat node
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 31337, // Hardhat's default chain ID
  name: 'Localhost',
  rpcUrl: RPC_URL,
}

type WalletConnectState = {
  promise: Promise<{ address: string; signer: ethers.Signer } | null> | null
}

declare global {
  interface Window {
    __sehatvaultWalletConnectState?: WalletConnectState
  }
}

let connectWalletInFlight = false

function getWalletConnectState(): WalletConnectState {
  if (typeof window === 'undefined') {
    return { promise: null }
  }

  if (!window.__sehatvaultWalletConnectState) {
    window.__sehatvaultWalletConnectState = { promise: null }
  }

  return window.__sehatvaultWalletConnectState
}

/**
 * Get a JSON-RPC provider connected to the local Hardhat node
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL)
}

/**
 * Get a signer from MetaMask or other Web3 wallet
 * Requires user to have MetaMask installed and connected
 */
export async function getSigner(): Promise<ethers.Signer | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.warn('MetaMask not detected. Please install MetaMask.')
    return null
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[]
    if (!accounts || accounts.length === 0) {
      return null
    }

    const signer = await provider.getSigner(accounts[0])
    
    return signer
  } catch (error) {
    if ((error as any)?.code === -32002) {
      console.warn('MetaMask request already pending. Please finish the existing prompt and try again.')
    } else {
      console.error('Error getting signer:', error)
    }
    return null
  }
}

/**
 * Connect to MetaMask and switch to Hardhat local network
 */
export async function connectWallet(): Promise<{
  address: string
  signer: ethers.Signer
} | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    alert('Please install MetaMask to use blockchain features!')
    return null
  }

  const walletState = getWalletConnectState()
  if (walletState.promise) {
    return walletState.promise
  }

  if (connectWalletInFlight) {
    return null
  }

  connectWalletInFlight = true
  walletState.promise = (async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[]
      let activeAccounts = accounts

      if (!activeAccounts || activeAccounts.length === 0) {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        activeAccounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[]
      }

      if (!activeAccounts || activeAccounts.length === 0) {
        return null
      }

      // Try to switch to Hardhat network after the account is authorized.
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }], // 31337 in hex
        })
      } catch (switchError: any) {
        // Network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: 'Hardhat Local',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [RPC_URL],
              },
            ],
          })
        } else {
          throw switchError
        }
      }

      const signer = await provider.getSigner(activeAccounts[0])
      const address = await signer.getAddress()

      return { address, signer }
    } catch (error) {
      if ((error as any)?.code === -32002) {
        console.warn('MetaMask request already pending. Please finish the existing prompt and try again.')
      } else {
        console.error('Error connecting wallet:', error)
      }
      return null
    }
  })()

  try {
    return await walletState.promise
  } finally {
    connectWalletInFlight = false
    walletState.promise = null
  }
}

/**
 * Get the current connected wallet address
 */
export async function getConnectedAddress(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[]
    if (!accounts || accounts.length === 0) {
      return null
    }
    const signer = await provider.getSigner(accounts[0])
    return await signer.getAddress()
  } catch {
    return null
  }
}

/**
 * Format a blockchain address for display (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

/**
 * Format token amount from Wei to Ether
 */
export function formatTokenAmount(amount: bigint | string): string {
  return ethers.formatEther(amount)
}

/**
 * Parse token amount from Ether to Wei
 */
export function parseTokenAmount(amount: string): bigint {
  return ethers.parseEther(amount)
}

/**
 * Check if user has MetaMask installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}

/**
 * Listen for account changes in MetaMask
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): void {
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', callback)
  }
}

/**
 * Listen for network changes in MetaMask
 */
export function onChainChanged(callback: (chainId: string) => void): void {
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('chainChanged', callback)
  }
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
