"use client"

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

export default function BankHelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Help & Support</h1>
      <p className="text-muted-foreground">Guides, FAQs, and support contact information.</p>

      <div className="rounded-lg border p-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I approve an asset?</AccordionTrigger>
            <AccordionContent>
              Navigate to Asset Approvals, review details, and click Approve or Reject.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How to upload compliance documents?</AccordionTrigger>
            <AccordionContent>
              Open Compliance and click Upload Document. Accepted formats: PDF, DOCX.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Where can I view audit logs?</AccordionTrigger>
            <AccordionContent>
              Go to Audits to filter and export system activity logs.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="rounded-lg border p-4">
        <div className="font-medium">Contact Support</div>
        <p className="text-sm text-muted-foreground">Email: support@sehatvault.com • Phone: +92 21 111 SEHAT</p>
        <Button className="mt-3">Open Support Ticket</Button>
      </div>
    </div>
  )
}
