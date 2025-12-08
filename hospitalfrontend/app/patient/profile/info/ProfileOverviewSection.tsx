'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { AccountInsight } from '../data'
import { AlertCircle, Calendar, CheckCircle, Mail, MapPin, Phone, Wallet } from 'lucide-react'
import { usePatientProfileStore } from '@/store/patientProfileStore'

interface ProfileOverviewSectionProps {
  insights: AccountInsight[]
}

export function ProfileOverviewSection({ insights }: ProfileOverviewSectionProps) {
  const patient = usePatientProfileStore(state => state.profile)
  const initials = patient.fullName
    .split(' ')
    .map(part => part.charAt(0))
    .join('')

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={patient.avatar} alt={patient.fullName} />
            <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{patient.fullName}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span>{patient.walletAddress}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                {patient.status}
              </Badge>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {patient.dateOfBirth}
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Blood Group {patient.bloodGroup}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/patient/profile/info">Edit Profile</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/patient/settings">Open Settings</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Profile completion</span>
            <span>{patient.profileCompletion}%</span>
          </div>
          <Progress value={patient.profileCompletion} className="mt-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
              <CardDescription>Keep these details current.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>{patient.location}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild>
                <Link href="/patient/profile/info">Manage Contact Info</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Account Insights</CardTitle>
              <CardDescription>Snapshot of your activity.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              {insights.map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span
                    className={`font-medium ${item.tone === 'warning' ? 'text-amber-500' : 'text-foreground'}`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild>
                <Link href="/patient/history">View Activity Log</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
