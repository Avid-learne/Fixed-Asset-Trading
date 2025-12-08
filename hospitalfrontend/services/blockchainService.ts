import { ethers } from 'ethers'
import { getProvider, getSigner, CONTRACTS } from '@/lib/web3'
import AssetTokenABI from './abis/AssetToken.json'
import HealthTokenABI from './abis/HealthToken.json'
import HospitalFinancialsABI from './abis/HospitalFinancials.json'

/**
 * Service for interacting with AssetToken smart contract
 */
export class AssetTokenService {
  private contract: ethers.Contract

  constructor(useSigner = false) {
    const providerOrSigner = useSigner ? null : getProvider()
    this.contract = new ethers.Contract(
      CONTRACTS.ASSET_TOKEN,
      AssetTokenABI.abi,
      providerOrSigner as any
    )
  }

  async connectSigner() {
    const signer = await getSigner()
    if (signer) {
      this.contract = this.contract.connect(signer) as ethers.Contract
    }
    return !!signer
  }

  /**
   * Get AT token balance for an address
   */
  async balanceOf(address: string): Promise<bigint> {
    return await this.contract.balanceOf(address)
  }

  /**
   * Get token name
   */
  async name(): Promise<string> {
    return await this.contract.name()
  }

  /**
   * Get token symbol
   */
  async symbol(): Promise<string> {
    return await this.contract.symbol()
  }

  /**
   * Get total supply
   */
  async totalSupply(): Promise<bigint> {
    return await this.contract.totalSupply()
  }

  /**
   * Get deposit metadata
   */
  async getDepositMetadata(depositId: number): Promise<string> {
    return await this.contract.depositMetadata(depositId)
  }

  /**
   * Transfer tokens (requires signer)
   */
  async transfer(to: string, amount: bigint): Promise<ethers.ContractTransactionResponse> {
    await this.connectSigner()
    return await this.contract.transfer(to, amount)
  }
}

/**
 * Service for interacting with HealthToken smart contract
 */
export class HealthTokenService {
  private contract: ethers.Contract

  constructor(useSigner = false) {
    const providerOrSigner = useSigner ? null : getProvider()
    this.contract = new ethers.Contract(
      CONTRACTS.HEALTH_TOKEN,
      HealthTokenABI.abi,
      providerOrSigner as any
    )
  }

  async connectSigner() {
    const signer = await getSigner()
    if (signer) {
      this.contract = this.contract.connect(signer) as ethers.Contract
    }
    return !!signer
  }

  /**
   * Get HT token balance for an address
   */
  async balanceOf(address: string): Promise<bigint> {
    return await this.contract.balanceOf(address)
  }

  /**
   * Get token name
   */
  async name(): Promise<string> {
    return await this.contract.name()
  }

  /**
   * Get token symbol
   */
  async symbol(): Promise<string> {
    return await this.contract.symbol()
  }

  /**
   * Get total supply
   */
  async totalSupply(): Promise<bigint> {
    return await this.contract.totalSupply()
  }

  /**
   * Transfer tokens (requires signer)
   */
  async transfer(to: string, amount: bigint): Promise<ethers.ContractTransactionResponse> {
    await this.connectSigner()
    return await this.contract.transfer(to, amount)
  }
}

/**
 * Service for interacting with HospitalFinancials smart contract
 */
export class HospitalFinancialsService {
  private contract: ethers.Contract

  constructor(useSigner = false) {
    const providerOrSigner = useSigner ? null : getProvider()
    this.contract = new ethers.Contract(
      CONTRACTS.HOSPITAL_FINANCIALS,
      HospitalFinancialsABI.abi,
      providerOrSigner as any
    )
  }

  async connectSigner() {
    const signer = await getSigner()
    if (signer) {
      this.contract = this.contract.connect(signer) as ethers.Contract
    }
    return !!signer
  }

  /**
   * Mint Asset Tokens (requires BANK_ROLE)
   */
  async mintAssetToken(
    patient: string,
    depositId: number,
    amountAT: bigint,
    metadata: string
  ): Promise<ethers.ContractTransactionResponse> {
    await this.connectSigner()
    return await this.contract.mintAssetToken(patient, depositId, amountAT, metadata)
  }

  /**
   * Record a trade (requires FINANCE_ROLE)
   */
  async recordTrade(
    investedAT: bigint,
    profit: bigint
  ): Promise<ethers.ContractTransactionResponse> {
    await this.connectSigner()
    return await this.contract.recordTrade(investedAT, profit)
  }

  /**
   * Distribute profit as HT tokens (requires FINANCE_ROLE)
   */
  async distributeProfit(
    tradeId: number,
    recipients: string[],
    amountsHT: bigint[]
  ): Promise<ethers.ContractTransactionResponse> {
    await this.connectSigner()
    return await this.contract.distributeProfit(tradeId, recipients, amountsHT)
  }

  /**
   * Redeem Health Tokens for services (requires FINANCE_ROLE)
   */
  async redeemHealthToken(
    patient: string,
    amountHT: bigint,
    serviceType: string
  ): Promise<ethers.ContractTransactionResponse> {
    await this.connectSigner()
    return await this.contract.redeemHealthToken(patient, amountHT, serviceType)
  }

  /**
   * Check if deposit was processed
   */
  async isDepositProcessed(depositId: number): Promise<boolean> {
    return await this.contract.depositProcessed(depositId)
  }

  /**
   * Get deposit owner
   */
  async getDepositOwner(depositId: number): Promise<string> {
    return await this.contract.depositOwner(depositId)
  }

  /**
   * Get deposit amount in AT
   */
  async getDepositAmount(depositId: number): Promise<bigint> {
    return await this.contract.depositAmountAT(depositId)
  }

  /**
   * Get trade details
   */
  async getTrade(tradeId: number): Promise<{
    investedAT: bigint
    profit: bigint
    timestamp: bigint
  }> {
    const trade = await this.contract.trades(tradeId)
    return {
      investedAT: trade.investedAT,
      profit: trade.profit,
      timestamp: trade.timestamp,
    }
  }

  /**
   * Get next trade ID
   */
  async getNextTradeId(): Promise<bigint> {
    return await this.contract.nextTradeId()
  }

  /**
   * Listen for AssetTokenMinted events
   */
  onAssetTokenMinted(
    callback: (patient: string, depositId: bigint, amountAT: bigint, metadata: string) => void
  ) {
    this.contract.on('AssetTokenMinted', callback)
  }

  /**
   * Listen for TradeRecorded events
   */
  onTradeRecorded(callback: (tradeId: bigint, investedAT: bigint, profit: bigint) => void) {
    this.contract.on('TradeRecorded', callback)
  }

  /**
   * Listen for ProfitDistributed events
   */
  onProfitDistributed(callback: (tradeId: bigint, totalDistributed: bigint) => void) {
    this.contract.on('ProfitDistributed', callback)
  }

  /**
   * Listen for HealthTokenRedeemed events
   */
  onHealthTokenRedeemed(
    callback: (patient: string, amountHT: bigint, serviceType: string) => void
  ) {
    this.contract.on('HealthTokenRedeemed', callback)
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners()
  }
}

// Export singleton instances for easy use
export const assetTokenService = new AssetTokenService()
export const healthTokenService = new HealthTokenService()
export const hospitalFinancialsService = new HospitalFinancialsService()
