'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'
import { useState } from 'react'

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  documentUrl: string | null
  documentName?: string
}

export function DocumentViewer({ isOpen, onClose, documentUrl, documentName = 'Document' }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)

  if (!documentUrl) return null

  const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:8000'
  const normalizedUrl = documentUrl.trim()
  const previewSource = /^https?:\/\//i.test(normalizedUrl) || normalizedUrl.startsWith('data:')
    ? normalizedUrl
    : `${backendOrigin}/${normalizedUrl.replace(/^\/+/, '')}`

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(normalizedUrl)
  const isPdf = /\.pdf$/i.test(normalizedUrl)

  const handleDownload = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(previewSource)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = documentName || 'document'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download document:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <DialogTitle>{documentName}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-slate-50 flex items-center justify-center">
          {isImage && !previewFailed ? (
            <img
              src={previewSource}
              alt={documentName}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `${backendOrigin}/${normalizedUrl.replace(/^\/+/, '')}`
                setPreviewFailed(true)
              }}
            />
          ) : isPdf && !previewFailed ? (
            <iframe
              src={previewSource}
              className="w-full h-full border-0"
              title={documentName}
              onError={() => setPreviewFailed(true)}
            />
          ) : (
            <div className="text-center text-slate-600">
              <p className="mb-4">
                {previewFailed
                  ? 'Preview unavailable for this record. The system only has a filename, not a retrievable file URL.'
                  : 'Cannot display this document type'}
              </p>
              <p className="mb-4 text-xs text-slate-500 break-all">{normalizedUrl}</p>
              <Button size="sm" onClick={handleDownload} disabled={isLoading}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
