import React from 'react'
import { FileBadge2 } from 'lucide-react'
import type { FractionalizationRequestView } from '@/services/fractionalizationService'

/**
 * Printable NOC certificate UI rendered from a FractionalizationRequestView's
 * NOC fields (number, insurer label, issue/expiry dates, beneficiaries).
 *
 * The backend writes these fields when the hospital admin clicks "Approve & Issue NOC".
 * Same component is used on the admin post-approval modal AND on the patient's
 * "View NOC" button — so what the patient sees is exactly what was issued.
 */
export function NocCertificate({ request }: { request: FractionalizationRequestView }) {
  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—')
  return (
    <div className="rounded-lg border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-6">
      <div className="text-center mb-4">
        <FileBadge2 className="h-10 w-10 mx-auto text-emerald-600" />
        <h2 className="text-lg font-bold tracking-wide text-emerald-900 mt-2">
          NO OBJECTION CERTIFICATE
        </h2>
        <p className="text-xs text-emerald-700">HT Fractionalization Authorization</p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b border-emerald-200 pb-2">
          <span className="text-slate-600">NOC Number</span>
          <span className="font-mono font-semibold text-slate-900">{request.nocNumber || '—'}</span>
        </div>
        <div className="flex justify-between border-b border-emerald-200 pb-2">
          <span className="text-slate-600">Issuing Authority</span>
          <span className="font-medium text-slate-900">{request.insurerName || '—'}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 border-b border-emerald-200 pb-2">
          <div>
            <p className="text-slate-600">Issue Date</p>
            <p className="font-medium">{fmtDate(request.nocIssuedAt)}</p>
          </div>
          <div>
            <p className="text-slate-600">Expiry Date</p>
            <p className="font-medium">{fmtDate(request.nocExpiresAt)}</p>
          </div>
        </div>
        <div className="flex justify-between border-b border-emerald-200 pb-2">
          <span className="text-slate-600">Source Pool</span>
          <span className="font-medium">{request.source}</span>
        </div>
        <div className="flex justify-between border-b border-emerald-200 pb-2">
          <span className="text-slate-600">Total HT Authorised</span>
          <span className="font-semibold text-emerald-700">{request.fractionalizeHtAmount} HT</span>
        </div>
        <div>
          <p className="text-slate-600 mb-1">Authorised Beneficiaries</p>
          <div className="rounded-md bg-white border border-emerald-200 divide-y divide-emerald-100">
            {request.beneficiaries.map((b) => (
              <div key={b.beneficiaryUserId} className="px-3 py-2 flex justify-between items-center text-xs">
                <span className="font-mono text-slate-700">{b.beneficiaryUserId.slice(0, 16)}...</span>
                <span className="font-medium text-emerald-700">
                  {b.fractionPercent}% · {b.allocatedHt} HT
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-[10px] text-emerald-700 italic text-center">
        This certificate authorises the listed beneficiaries to redeem the indicated HT amounts
        from the primary patient&apos;s {request.source.toLowerCase()} pool until the expiry date above.
      </p>
    </div>
  )
}
