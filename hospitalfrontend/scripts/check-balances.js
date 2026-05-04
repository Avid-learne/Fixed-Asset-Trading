const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const envPath = path.join(__dirname, '..', '.env.local');
const envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const backendEnvPath = path.join(__dirname, '..', '..', 'SehatVaultBackend', 'src', 'main', 'resources', 'application.properties');
const backendEnvText = fs.existsSync(backendEnvPath) ? fs.readFileSync(backendEnvPath, 'utf8') : '';

function readEnv(name, fallback = '') {
  const match = envText.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return (match ? match[1].trim() : process.env[name] || fallback).replace(/^"|"$/g, '');
}

function readBackendProp(name, fallback = '') {
  const match = backendEnvText.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return (match ? match[1].trim() : fallback).replace(/^"|"$/g, '');
}

const RPC = readEnv('NEXT_PUBLIC_RPC_URL', 'http://127.0.0.1:8545');
const patient = '0x90F79bf6EB2c4f870365E785982E1f101E93b906';
const backendHealth = readBackendProp('blockchain.contracts.health-token', '0x0165878A594ca255338adfa4d48449f69242Eb8F');
const frontendHealth = readEnv('NEXT_PUBLIC_HEALTH_TOKEN_ADDRESS', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');

(async () => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC);
    const abi = [
      { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }
    ];

    const cBackend = new ethers.Contract(backendHealth, abi, provider);
    const cFrontend = new ethers.Contract(frontendHealth, abi, provider);

    const [bBackend, bFrontend, dBackend, dFrontend] = await Promise.all([
      cBackend.balanceOf(patient),
      cFrontend.balanceOf(patient),
      cBackend.decimals(),
      cFrontend.decimals(),
    ]);

    console.log('Patient:', patient);
    console.log('RPC:', RPC);
    console.log('Backend HealthToken:', backendHealth, 'balance (raw):', bBackend.toString(), 'decimals:', dBackend);
    console.log('Frontend HealthToken:', frontendHealth, 'balance (raw):', bFrontend.toString(), 'decimals:', dFrontend);

    console.log('\nHuman-readable:');
    const format = (b, d) => {
      // ethers.formatUnits expects string or bigint
      return ethers.formatUnits(b, Number(d));
    }
    console.log('Backend HT:', format(bBackend, dBackend));
    console.log('Frontend HT:', format(bFrontend, dFrontend));
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
