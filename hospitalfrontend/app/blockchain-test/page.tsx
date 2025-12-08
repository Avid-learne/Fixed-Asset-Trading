'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { connectWallet, formatAddress, formatTokenAmount } from '@/lib/web3'
import { assetTokenService, healthTokenService, hospitalFinancialsService } from '@/services/blockchainService'
import { Wallet, RefreshCw, Activity } from 'lucide-react'

export default function BlockchainTestPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [atBalance, setAtBalance] = useState<string>('0')
  const [htBalance, setHtBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const [contractInfo, setContractInfo] = useState<{
    atName: string
    atSymbol: string
    htName: string
    htSymbol: string
  } | null>(null)

  const handleConnect = async () => {
    setLoading(true)
    try {
      const wallet = await connectWallet()
      if (wallet) {
        setWalletAddress(wallet.address)
        await loadBalances(wallet.address)
        await loadContractInfo()
      }
    } catch (error) {
      console.error('Connection error:', error)
      alert('Failed to connect wallet. Make sure MetaMask is installed and Hardhat node is running!')
    } finally {
      setLoading(false)
    }
  }

  const loadBalances = async (address: string) => {
    try {
      const at = await assetTokenService.balanceOf(address)
      const ht = await healthTokenService.balanceOf(address)
      
      setAtBalance(formatTokenAmount(at))
      setHtBalance(formatTokenAmount(ht))
    } catch (error) {
      console.error('Error loading balances:', error)
    }
  }

  const loadContractInfo = async () => {
    try {
      const [atName, atSymbol, htName, htSymbol] = await Promise.all([
        assetTokenService.name(),
        assetTokenService.symbol(),
        healthTokenService.name(),
        healthTokenService.symbol(),
      ])

      setContractInfo({ atName, atSymbol, htName, htSymbol })
    } catch (error) {
      console.error('Error loading contract info:', error)
    }
  }

  const refreshBalances = async () => {
    if (walletAddress) {
      setLoading(true)
      await loadBalances(walletAddress)
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🔗 Blockchain Integration Test</h1>
        <p className="text-gray-600">
          Test connection to your local Hardhat blockchain and smart contracts
        </p>
      </div>

      {!walletAddress ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connect Your Wallet
            </CardTitle>
            <CardDescription>
              Connect MetaMask to interact with your smart contracts on the local Hardhat network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2">Before connecting:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Make sure Hardhat node is running (Terminal 1)</li>
                <li>MetaMask is installed and unlocked</li>
                <li>Switch MetaMask to Hardhat Local network (Chain ID: 31337)</li>
                <li>Import a test account with the provided private key</li>
              </ul>
            </div>
            <Button onClick={handleConnect} disabled={loading} size="lg" className="w-full">
              {loading ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Wallet Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-600" />
                Wallet Connected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Full Address</p>
                  <p className="font-mono text-sm break-all">{walletAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Short Address</p>
                  <p className="font-mono font-bold">{formatAddress(walletAddress)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Balances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Token Balances
                </span>
                <Button 
                  onClick={refreshBalances} 
                  disabled={loading} 
                  variant="outline" 
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-800">Asset Tokens</p>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      {contractInfo?.atSymbol || 'AT'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{atBalance}</p>
                  <p className="text-xs text-blue-700 mt-1">{contractInfo?.atName || 'Loading...'}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-green-800">Health Tokens</p>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      {contractInfo?.htSymbol || 'HT'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{htBalance}</p>
                  <p className="text-xs text-green-700 mt-1">{contractInfo?.htName || 'Loading...'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Smart Contract Addresses</CardTitle>
              <CardDescription>Currently deployed contracts on Hardhat Local network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-semibold">AssetToken:</span>
                  <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_ASSET_TOKEN_ADDRESS}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-semibold">HealthToken:</span>
                  <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_HEALTH_TOKEN_ADDRESS}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-semibold">HospitalFinancials:</span>
                  <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_HOSPITAL_FINANCIALS_ADDRESS}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1 animate-pulse"></div>
                <div>
                  <p className="font-semibold text-green-900">✅ Successfully Connected!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your frontend is now connected to the local blockchain. You can integrate these
                    services into your hospital management pages.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
