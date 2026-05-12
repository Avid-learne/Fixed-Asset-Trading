'use client'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useState, useEffect } from 'react'

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  documentUrl: string | null
  documentName?: string
}

export function DocumentViewer({ isOpen, onClose, documentUrl, documentName = 'Document' }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [tryMode, setTryMode] = useState<'image' | 'iframe'>('image')
  const hasDocument = Boolean(documentUrl)

  // Reset preview index whenever a new document URL is provided
  useEffect(() => {
    setPreviewIndex(0)
    setPreviewFailed(false)
    setTryMode('image')
  }, [documentUrl])

  const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || 'http://localhost:8000'
  const normalizedUrl = documentUrl?.trim() ?? ''
  // Build a list of candidate preview URLs. This helps when the record only stores
  // a filename (e.g. "cnic front.png") — try several likely backend paths and
  // URL-encode the filename so spaces and special chars don't break requests.
  const isAbsoluteOrData = /^https?:\/\//i.test(normalizedUrl) || normalizedUrl.startsWith('data:')
  const cleanPath = normalizedUrl.replace(/^\/+/, '')
  const encoded = encodeURI(cleanPath)

  // If the stored value already looks like our preview API (e.g. "/api/storage/preview/kyc?path=..."),
  // or if it's a short category token like "kyc?path=..." produced by older records,
  // build an explicit preview API URL and prefer that as the first candidate.
  const looksLikePreviewApi = /^\/?api\/storage\/preview\//i.test(normalizedUrl)
  const categoryMatch = normalizedUrl.match(/^(kyc|asset)\?path=(.+)$/i)
  // Detect UUID-prefixed filenames (e.g. "daabe0c6-552f-42f1-9415-f4bed6aee075-Nimil-Picture.jpg")
  // and convert them to proper preview API URLs for Supabase storage
  const uuidPrefixedMatch = normalizedUrl.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-.+)$/i)

  const candidateSources: string[] = isAbsoluteOrData
    ? [normalizedUrl]
    : looksLikePreviewApi
    ? [`${backendOrigin}/${cleanPath}`]
    : categoryMatch
    ? [
        // Build a well-formed preview API URL: /api/storage/preview/{category}?path={encodedObjectPath}
        `${backendOrigin}/api/storage/preview/${categoryMatch[1]}?path=${encodeURIComponent(categoryMatch[2])}`,
        `${backendOrigin}/${encodeURI(cleanPath)}`,
        `${backendOrigin}/uploads/${encodeURI(cleanPath)}`,
        `${backendOrigin}/files/${encodeURI(cleanPath)}`,
      ]
    : uuidPrefixedMatch
    ? [
        // UUID-prefixed file detected; assume it's in KYC storage and build preview API URL
        `${backendOrigin}/api/storage/preview/kyc?path=${encodeURIComponent(uuidPrefixedMatch[1])}`,
        `${backendOrigin}/${encoded}`,
        `${backendOrigin}/uploads/${encoded}`,
        `${backendOrigin}/files/${encoded}`,
      ]
    : [
        `${backendOrigin}/${encoded}`,
        `${backendOrigin}/uploads/${encoded}`,
        `${backendOrigin}/files/${encoded}`,
      ]
  const previewSource = candidateSources[previewIndex] || candidateSources[0]

  // Detect MIME from data: URLs first (covers uploads where we don't have a path with extension),
  // then fall back to the URL/filename extension (handles legacy URL records and data URLs that
  // carry the original filename in the #filename= fragment).
  const dataUrlMime = normalizedUrl.startsWith('data:')
    ? normalizedUrl.slice(5).split(/[;,]/)[0].toLowerCase()
    : ''
  const isImage = dataUrlMime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)(\?|#|$)/i.test(normalizedUrl)
  const isPdf = dataUrlMime === 'application/pdf' || /\.pdf(\?|#|$)/i.test(normalizedUrl)

  // If the stored value doesn't include an extension (e.g. "kyc?path=..."), we don't know the mime;
  // try rendering as an image first, then fall back to iframe (PDF or other types).
  const tryAsImageFirst = !isPdf

  // Debug logging
  console.log('[DocumentViewer] Viewing document:', documentName)
  console.log('[DocumentViewer] Raw URL:', documentUrl)
  console.log('[DocumentViewer] Normalized URL:', normalizedUrl)
  console.log('[DocumentViewer] UUID prefix match:', uuidPrefixedMatch ? uuidPrefixedMatch[1] : 'no match')
  console.log('[DocumentViewer] Candidate sources:', candidateSources)
  console.log('[DocumentViewer] Current preview source (index', previewIndex + '):', previewSource)
  console.log('[DocumentViewer] IsImage:', isImage, 'IsPdf:', isPdf, 'TryAsImageFirst:', tryAsImageFirst)

  if (!hasDocument) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <div className="p-6 border-b">
          <DialogTitle>{documentName}</DialogTitle>
          <DialogDescription className="sr-only">
            Document preview viewer
          </DialogDescription>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-slate-50 flex items-center justify-center">
          {(!previewFailed && (isImage || tryAsImageFirst)) ? (
            <img
              src={previewSource}
              alt={documentName}
              className="max-w-full max-h-full object-contain"
              onLoad={() => {
                console.log('[DocumentViewer] Image loaded successfully:', previewSource)
              }}
              onError={(event) => {
                console.warn('[DocumentViewer] Image load failed for:', previewSource)
                console.warn('[DocumentViewer] Error event:', event)
                // If we tried as image first, switch to iframe for the same candidate once
                setTryMode((mode) => {
                  if (mode === 'image') {
                    console.log('[DocumentViewer] Switching to iframe mode for same source')
                    setTryMode('iframe')
                    return 'iframe'
                  }
                  return mode
                })

                // If already tried iframe (or switching didn't help), advance to next candidate
                setTimeout(() => {
                  setPreviewIndex((idx) => {
                    if (idx + 1 < candidateSources.length) {
                      console.log('[DocumentViewer] Advancing to next candidate source:', idx + 1)
                      return idx + 1
                    }
                    console.error('[DocumentViewer] All preview sources failed')
                    setPreviewFailed(true)
                    return idx
                  })
                }, 50)
              }}
            />
          ) : (!previewFailed && (isPdf || tryMode === 'iframe')) ? (
            <iframe
              src={previewSource}
              className="w-full h-full border-0"
              title={documentName}
              onError={() => {
                console.warn('[DocumentViewer] Iframe load failed for:', previewSource)
                setPreviewIndex((idx) => {
                  if (idx + 1 < candidateSources.length) {
                    console.log('[DocumentViewer] Advancing to next candidate source:', idx + 1)
                    return idx + 1
                  }
                  console.error('[DocumentViewer] All preview sources failed')
                  setPreviewFailed(true)
                  return idx
                })
              }}
            />
          ) : (
            <div className="text-center text-slate-600">
              <p className="mb-4">
                {previewFailed
                  ? 'Preview unavailable for this record. The system only has a filename, not a retrievable file URL.'
                  : 'Cannot display this document type'}
              </p>
              <p className="mb-4 text-xs text-slate-500 break-all">{(() => {
                try {
                  // If the stored value contains a path query (kyc?path=...), show only the filename
                  const m = normalizedUrl.match(/(?:[?&]path=)([^&]+)/i)
                  if (m && m[1]) {
                    const decoded = decodeURIComponent(m[1])
                    return decoded.split('/').pop() || decoded
                  }
                } catch {}
                // fallback: show the raw value (trimmed)
                return normalizedUrl
              })()}</p>
              <div className="space-y-2">
                <a
                    href={previewSource}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Open / download
                </a>
                {candidateSources.length > 1 && (
                  <p className="text-xs text-muted-foreground">Tried: {candidateSources.join(' — ')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
