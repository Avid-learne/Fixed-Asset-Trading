'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Gift, Users, CheckCircle, History, AlertCircle, ArrowRight, Download } from 'lucide-react'

const patientAllocations = [
  { id: 'PAT-001', name: 'John Smith', atHolding: 5000, percentage: 12.5, htAmount: 875 },
  { id: 'PAT-002', name: 'Sarah Johnson', atHolding: 3200, percentage: 8.0, htAmount: 560 },
  { id: 'PAT-003', name: 'Michael Brown', atHolding: 4500, percentage: 11.25, htAmount: 787.5 },
  { id: 'PAT-004', name: 'Emily Davis', atHolding: 2800, percentage: 7.0, htAmount: 490 },
  { id: 'PAT-005', name: 'David Wilson', atHolding: 6200, percentage: 15.5, htAmount: 1085 },
]

export default function ProfitAllocationPage() {
  const [profit, setProfit] = useState(50000)
  const [patientShare, setPatientShare] = useState(70)
  const [hospitalShare, setHospitalShare] = useState(30)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [allocating, setAllocating] = useState(false)

  const handleSliderChange = (value: number[]) => {
    setPatientShare(value[0])
    setHospitalShare(100 - value[0])
  }

  const patientAmount = (profit * patientShare) / 100
  const hospitalAmount = (profit * hospitalShare) / 100
  const htConversionRate = 10 // PKR 1,000 = 1 HT
  const totalHT = patientAmount / htConversionRate

  const totalATHolding = patientAllocations.reduce((sum, p) => sum + p.atHolding, 0)
  const updatedAllocations = patientAllocations.map(patient => ({
    ...patient,
    percentage: (patient.atHolding / totalATHolding) * 100,
    htAmount: ((patient.atHolding / totalATHolding) * totalHT)
  }))

  const handleDistribute = () => {
    setAllocating(true)
    setTimeout(() => {
      setAllocating(false)
      setShowConfirmation(false)
      // Success toast would appear here
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profit Allocation</h1>
        <p className="text-muted-foreground mt-1">Distribute trading profits to patients as Health Tokens (HT).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Allocation Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                <div>
                    <p className="text-sm text-green-800 font-medium">Total Profit Available</p>
                    <p className="text-3xl font-bold text-green-700">${profit.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">From last trading cycle</p>
                </div>
                <Button variant="outline" size="sm">Refresh</Button>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                    <span>Patients ({patientShare}%)</span>
                    <span>Hospital ({hospitalShare}%)</span>
                </div>
                <Slider 
                    value={[patientShare]}
                    max={100} 
                    step={1} 
                    onValueChange={handleSliderChange}
                    className="py-4"
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-primary rounded-lg text-center bg-primary/5">
                        <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">To Patients</p>
                        <p className="text-2xl font-bold">${patientAmount.toLocaleString()}</p>
                        <p className="text-xs text-green-600 font-medium mt-1">≈ {totalHT.toFixed(0)} HT</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                        <Gift className="w-6 h-6 mx-auto mb-2 text-secondary" />
                        <p className="text-sm text-muted-foreground">To Hospital</p>
                        <p className="text-2xl font-bold">${hospitalAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">Hospital Revenue</p>
                    </div>
                </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-900">Distribution Formula</p>
                <p className="text-xs text-emerald-700 mt-1">
                  HT is distributed proportionally based on each patient's AT holdings. 
                  Conversion rate: ${htConversionRate} = 1 HT
                </p>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={() => setShowConfirmation(true)}>
              Review Distribution Details
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {[1,2,3,4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border-b last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <History className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Distribution #{100+i}</p>
                                <p className="text-xs text-muted-foreground">Nov {10+i}, 2024</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-green-600">+PKR 4.25M</p>
                            <p className="text-xs text-muted-foreground">2,975 HT</p>
                        </div>
                    </div>
                ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export History
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient-Wise Distribution Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">AT Holdings</TableHead>
                <TableHead className="text-right">Share %</TableHead>
                <TableHead className="text-right">HT Amount</TableHead>
                <TableHead className="text-right">USD Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {updatedAllocations.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-mono text-xs">{patient.id}</TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell className="text-right">{patient.atHolding.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{patient.percentage.toFixed(2)}%</TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {patient.htAmount.toFixed(2)} HT
                  </TableCell>
                  <TableCell className="text-right">
                    ${(patient.htAmount * htConversionRate).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">{totalATHolding.toLocaleString()}</TableCell>
                <TableCell className="text-right">100%</TableCell>
                <TableCell className="text-right text-green-600">{totalHT.toFixed(2)} HT</TableCell>
                <TableCell className="text-right">${patientAmount.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Profit Distribution</DialogTitle>
            <DialogDescription>
              Please review the distribution details before confirming.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold">${profit.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold">{updatedAllocations.length}</p>
              </div>
            </div>

            <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-green-900">Patient Allocation</p>
                <Badge variant="default">{patientShare}%</Badge>
              </div>
              <p className="text-3xl font-bold text-green-700">${patientAmount.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">Converting to {totalHT.toFixed(2)} HT</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Hospital Revenue</p>
                <Badge variant="outline">{hospitalShare}%</Badge>
              </div>
              <p className="text-2xl font-bold">${hospitalAmount.toLocaleString()}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Important Notice</p>
                <p className="text-xs text-yellow-700 mt-1">
                  This action cannot be undone. HT will be immediately distributed to patient wallets 
                  and blockchain transactions will be initiated.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={allocating}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleDistribute}
              disabled={allocating}
            >
              {allocating ? (
                <>Processing...</>
              ) : (
                <>
                  Confirm & Distribute
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
