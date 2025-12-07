// Short overview: Unified Wallet page with tabs for AT and HT wallets
// - Displays both Asset Tokens and Health Tokens in separate tabs
// - Relation: imports ATWalletCard and HTWalletCard components
'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ATWalletCard from '@/components/patient/ATWalletCard'
import HTWalletCard from '@/components/patient/HTWalletCard'
import { Coins, Heart } from 'lucide-react'

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Wallet</h1>
        <p className="text-muted-foreground">Manage your Asset Tokens and Health Tokens in one place</p>
      </div>

      <Tabs defaultValue="at" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="at" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Asset Tokens (AT)
          </TabsTrigger>
          <TabsTrigger value="ht" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Health Tokens (HT)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="at" className="space-y-4 mt-6">
          <ATWalletCard
            balance={1050}
            assetBreakdown={[
              { asset: 'gold', tokens: 500 },
              { asset: 'silver', tokens: 300 },
              { asset: 'property', tokens: 250 },
            ]}
          />
        </TabsContent>

        <TabsContent value="ht" className="space-y-4 mt-6">
          <HTWalletCard
            balance={850}
            totalRedeemed={450}
            upcomingBenefits={3}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
