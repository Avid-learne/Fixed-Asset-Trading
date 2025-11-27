// hospital-frontend/lib/web3/provider.ts

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Check if MetaMask is installed
 */
export function hasMetaMask(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Request account access
 */
export async function requestAccount(): Promise<string[]> {
  if (!hasMetaMask()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts;
  } catch (error) {
    console.error('Error requesting accounts:', error);
    throw error;
  }
}

/**
 * Get current account
 */
export async function getCurrentAccount(): Promise<string | null> {
  if (!hasMetaMask()) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
}

/**
 * Switch to the correct network
 */
export async function switchNetwork(chainId: string): Promise<void> {
  if (!hasMetaMask()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      throw new Error('Please add this network to MetaMask');
    }
    throw error;
  }
}

/**
 * Listen for account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): void {
  if (hasMetaMask()) {
    window.ethereum.on('accountsChanged', callback);
  }
}

/**
 * Listen for chain changes
 */
export function onChainChanged(callback: (chainId: string) => void): void {
  if (hasMetaMask()) {
    window.ethereum.on('chainChanged', callback);
  }
}