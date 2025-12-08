'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QuickLink } from '../data'
import { LogOut } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface QuickSettingsCardProps {
  links: QuickLink[]
}

export function QuickSettingsCard({ links }: QuickSettingsCardProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Quick Settings</CardTitle>
        <CardDescription>Navigate to detailed configuration screens.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.map(item => (
          <Link
            key={item.title}
            href={item.href}
            className="group flex items-start gap-3 rounded-lg border p-3 transition hover:border-primary"
          >
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <item.icon className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="font-medium leading-none group-hover:text-primary">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </Link>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Separator />
        <Button variant="ghost" className="justify-start gap-2 text-destructive" asChild>
          <Link href="/logout">
            <LogOut className="h-4 w-4" />
            Sign out of all devices
          </Link>
        </Button>
        <Badge variant="secondary" className="w-full justify-center">
          Need help? Visit Settings
        </Badge>
      </CardFooter>
    </Card>
  )
}
