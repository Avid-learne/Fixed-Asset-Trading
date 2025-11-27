// hospital-frontend/lib/web3/utils.ts

/**
 * Convert hex to decimal
 */
export function hexToDecimal(hex: string): number {
  return parseInt(hex, 16);
}

/**
 * Convert decimal to hex
 */
export function decimalToHex(decimal: number): string {
  return '0x' + decimal.toString(16);
}

/**
 * Convert Wei to Ether
 */
export function weiToEther(wei: string | number): string {
  const value = typeof wei === 'string' ? BigInt(wei) : BigInt(wei);
  return (Number(value) / 1e18).toFixed(4);
}

/**
 * Convert Ether to Wei
 */
export function etherToWei(ether: string | number): string {
  const value = typeof ether === 'string' ? parseFloat(ether) : ether;
  return (value * 1e18).toString();
}

/**
 * Shorten transaction hash
 */
export function shortenHash(hash: string, chars: number = 6): string {
  if (!hash) return '';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Check if string is valid hex
 */
export function isHex(value: string): boolean {
  return /^0x[0-9a-fA-F]*$/.test(value);
}

/**
 * Get explorer URL for address
 */
export function getExplorerAddressUrl(address: string, network: string = 'localhost'): string {
  const explorers: Record<string, string> = {
    mainnet: `https://etherscan.io/address/${address}`,
    sepolia: `https://sepolia.etherscan.io/address/${address}`,
    localhost: `#`, // No explorer for local network
  };
  return explorers[network] || '#';
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerTxUrl(txHash: string, network: string = 'localhost'): string {
  const explorers: Record<string, string> = {
    mainnet: `https://etherscan.io/tx/${txHash}`,
    sepolia: `https://sepolia.etherscan.io/tx/${txHash}`,
    localhost: `#`, // No explorer for local network
  };
  return explorers[network] || '#';
}