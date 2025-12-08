'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building, CheckCircle, Globe, Phone, Mail, MapPin, Plus } from 'lucide-react'

const linkedBanks = [
  {
    id: 1,
    name: 'Global Trust Bank',
    status: 'Connected',
    assets: 12,
    pending: 2,
    latency: '45ms',
    contact: '+92-21-1234-5678',
    email: 'integration@globaltrust.pk',
    website: 'www.globaltrust.pk',
    address: 'Karachi, Sindh, Pakistan',
    accountManager: 'Ahmed Hassan',
    apiVersion: '2.1.0',
    supportedAssets: ['Real Estate', 'Medical Equipment', 'Vehicles'],
    totalAssetValue: '2,450,000 PKR',
    connectionDate: '2024-06-15',
    depositedAssets: [
      { id: 'A001', type: 'Real Estate', description: 'Property at 123 Main St, Karachi', value: '1,250,000 PKR', patient: 'John Smith', status: 'Active' },
      { id: 'A002', type: 'Medical Equipment', description: 'MRI Scanner Unit', value: '450,000 PKR', patient: 'Sarah Johnson', status: 'Active' },
      { id: 'A003', type: 'Vehicles', description: 'Tesla Model S', value: '180,000 PKR', patient: 'Ahmed Hassan', status: 'Active' },
      { id: 'A004', type: 'Real Estate', description: 'Commercial Space, DHA', value: '570,000 PKR', patient: 'Fatima Khan', status: 'Pending' },
      { id: 'A005', type: 'Medical Equipment', description: 'CT Scan Machine', value: '320,000 PKR', patient: 'Hassan Ali', status: 'Active' },
      { id: 'A006', type: 'Real Estate', description: 'Apartment Complex', value: '2,100,000 PKR', patient: 'Rashid Khan', status: 'Active' },
      { id: 'A007', type: 'Vehicles', description: 'BMW X7', value: '285,000 PKR', patient: 'Dr. Muhammad', status: 'Active' },
      { id: 'A008', type: 'Medical Equipment', description: 'Ultrasound Machine', value: '195,000 PKR', patient: 'Nadia Malik', status: 'Active' },
      { id: 'A009', type: 'Real Estate', description: 'Office Building', value: '1,875,000 PKR', patient: 'Business Corp', status: 'Active' },
      { id: 'A010', type: 'Vehicles', description: 'Mercedes C-Class', value: '240,000 PKR', patient: 'Zainab Hussain', status: 'Pending' },
      { id: 'A011', type: 'Medical Equipment', description: 'Lab Equipment Set', value: '280,000 PKR', patient: 'Health Center', status: 'Active' },
      { id: 'A012', type: 'Real Estate', description: 'Retail Shop Space', value: '425,000 PKR', patient: 'Merchant Ltd', status: 'Active' },
    ]
  },
  {
    id: 2,
    name: 'City Secure Bank',
    status: 'Connected',
    assets: 8,
    pending: 0,
    latency: '32ms',
    contact: '+92-21-8765-4321',
    email: 'partnerships@citysecure.pk',
    website: 'www.citysecure.pk',
    address: 'Lahore, Punjab, Pakistan',
    accountManager: 'Fatima Khan',
    apiVersion: '2.0.5',
    supportedAssets: ['Real Estate', 'Jewelry', 'Technology'],
    totalAssetValue: '1,680,000 PKR',
    connectionDate: '2024-05-20',
    depositedAssets: [
      { id: 'A013', type: 'Real Estate', description: 'Plot in DHA Phase 5', value: '950,000 PKR', patient: 'Ali Raza', status: 'Active' },
      { id: 'A014', type: 'Jewelry', description: 'Gold and Diamond Collection', value: '380,000 PKR', patient: 'Hina Khan', status: 'Active' },
      { id: 'A015', type: 'Technology', description: 'Server Infrastructure', value: '350,000 PKR', patient: 'Tech Hospital Ltd', status: 'Active' },
      { id: 'A016', type: 'Real Estate', description: 'Residential Plot, Canal Road', value: '720,000 PKR', patient: 'Samir Ahmed', status: 'Active' },
      { id: 'A017', type: 'Jewelry', description: 'Precious Stones Collection', value: '290,000 PKR', patient: 'Amina Bibi', status: 'Active' },
      { id: 'A018', type: 'Technology', description: 'Network Equipment Suite', value: '275,000 PKR', patient: 'Digital Solutions', status: 'Active' },
      { id: 'A019', type: 'Real Estate', description: 'Industrial Space', value: '580,000 PKR', patient: 'Manufacturing Ltd', status: 'Active' },
      { id: 'A020', type: 'Jewelry', description: 'Silver Artifacts', value: '155,000 PKR', patient: 'Heritage Museum', status: 'Active' },
    ]
  },
  {
    id: 3,
    name: 'Future Finance',
    status: 'Pending Approval',
    assets: 0,
    pending: 0,
    latency: '-',
    contact: '+92-333-1234-567',
    email: 'biz@futurefinance.pk',
    website: 'www.futurefinance.pk',
    address: 'Islamabad, ICT, Pakistan',
    accountManager: 'Ali Rizvi',
    apiVersion: 'TBD',
    supportedAssets: [],
    totalAssetValue: '0 PKR',
    connectionDate: 'Pending',
    depositedAssets: []
  },
]

export default function BankIntegrationsPage() {
  const [selectedBank, setSelectedBank] = useState<typeof linkedBanks[0] | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bank Integrations</h1>
          <p className="text-muted-foreground mt-1">Manage connections with custodian banks.</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" /> Link New Bank</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {linkedBanks.map((bank) => (
          <Card key={bank.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${bank.status === 'Connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-2">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <Badge variant={bank.status === 'Connected' ? 'default' : 'outline'}>{bank.status}</Badge>
              </div>
              <CardTitle className="text-lg">{bank.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assets in Custody</span>
                  <span className="font-medium">{bank.assets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Verifications</span>
                  <span className="font-medium">{bank.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Latency</span>
                  <span className="font-medium">{bank.latency}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedBank(bank)}>View Details</Button>
                <Button variant="ghost" size="sm" className="w-full">Settings</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification Queue Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">All Systems Operational</p>
              <p className="text-sm opacity-90">Bank APIs are responding within expected timeframes.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedBank} onOpenChange={(open) => !open && setSelectedBank(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              {selectedBank?.name}
            </DialogTitle>
            <DialogDescription>
              Complete bank integration details and connection information
            </DialogDescription>
          </DialogHeader>

          {selectedBank && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="assets">Assets ({selectedBank.assets})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Connection Status</p>
                    <Badge variant={selectedBank.status === 'Connected' ? 'default' : 'outline'}>
                      {selectedBank.status}
                    </Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">API Latency</p>
                    <p className="text-lg font-semibold">{selectedBank.latency}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Assets in Custody</p>
                    <p className="text-lg font-semibold">{selectedBank.assets}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Pending Verifications</p>
                    <p className="text-lg font-semibold">{selectedBank.pending}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{selectedBank.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{selectedBank.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <p className="text-sm font-medium">{selectedBank.website}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{selectedBank.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Account Management</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Account Manager</p>
                      <p className="text-sm font-medium">{selectedBank.accountManager}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Connection Date</p>
                      <p className="text-sm font-medium">{selectedBank.connectionDate}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Technical Details</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">API Version</p>
                      <p className="text-sm font-medium">{selectedBank.apiVersion}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Supported Asset Types</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedBank.supportedAssets.length > 0 ? (
                          selectedBank.supportedAssets.map((asset) => (
                            <Badge key={asset} variant="outline">{asset}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Not yet defined</p>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Asset Value</p>
                      <p className="text-sm font-medium">{selectedBank.totalAssetValue}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assets" className="space-y-4">
                {selectedBank.depositedAssets.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground mb-4">
                      Showing {selectedBank.depositedAssets.length} of {selectedBank.assets} assets in custody
                    </div>
                    {selectedBank.depositedAssets.map((asset) => (
                      <div key={asset.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-base">{asset.description}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>ID: {asset.id}</span>
                              <span>•</span>
                              <span>Type: {asset.type}</span>
                            </div>
                          </div>
                          <Badge variant={asset.status === 'Active' ? 'default' : 'outline'}>
                            {asset.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">Patient/Entity</p>
                            <p className="text-sm font-medium">{asset.patient}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Asset Value</p>
                            <p className="text-sm font-semibold text-green-600">{asset.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">No assets deposited at this bank</p>
                )}
              </TabsContent>
            </Tabs>
          )}

          {selectedBank && (
            <div className="border-t pt-4 flex gap-2">
              <Button className="w-full">Edit Settings</Button>
              <Button variant="outline" className="w-full">Disconnect Bank</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
