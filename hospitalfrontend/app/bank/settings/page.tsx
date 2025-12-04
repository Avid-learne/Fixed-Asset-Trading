"use client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export default function BankSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-muted-foreground">Configure bank officer preferences and platform settings.</p>

      <Tabs defaultValue="general" className="rounded-lg border p-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input placeholder="Bank Officer" />
            </div>
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input placeholder="Bank Name" />
            </div>
          </div>
          <Button>Save General Settings</Button>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 pt-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium">Two-Factor Authentication</div>
              <div className="text-sm text-muted-foreground">Require OTP at login</div>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium">Session Timeout</div>
              <div className="text-sm text-muted-foreground">Auto sign-out after inactivity</div>
            </div>
            <Switch />
          </div>
          <Button>Save Security Settings</Button>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 pt-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium">Email Alerts</div>
              <div className="text-sm text-muted-foreground">Receive updates on approvals and audits</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium">System Notifications</div>
              <div className="text-sm text-muted-foreground">In-app alerts for compliance changes</div>
            </div>
            <Switch defaultChecked />
          </div>
          <Button>Save Notification Settings</Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
