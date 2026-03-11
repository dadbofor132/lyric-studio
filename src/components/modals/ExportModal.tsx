import { useState, useMemo } from 'react'
import { X, Copy, ExternalLink, Check } from 'lucide-react'
import { useSongStore } from '../../stores/songStore'
import { cn, parseJSON } from '../../lib/utils'

interface ExportModalProps {
  open: boolean
  onClose: () => void
}

type Fidelity = 'faithful' | 'balanced' | 'experimental'

const sunoBlockTags: Record<string, string> = {
  intro: '[Intro]',
  verse: '[Verse]',
  'pre-chorus': '[Pre-Chorus]',
  chorus: '[Chorus]',
  bridge: '[Bridge]',
  hook: '[Hook]',
  outro: '[Outro]',
  custom: '',
}

export function ExportModal({ open, onClose }: ExportModalProps) {
  const { currentSong, blocks, currentVibe } = useSongStore()
  const [fidelity, setFidelity] = useState<Fidelity>('balanced')
  const [copiedLyrics, setCopiedLyrics] = useState(false)
  const [copiedStyle, setCopiedStyle] = useState(false)

  const sunoExport = useMemo(() => {
    if (!currentSong) return { lyrics: '', stylePrompt: '' }

    // Sort blocks by Y position
    const sortedBlocks = [...blocks].sort((a, b) => a.positionY - b.positionY)

    // Generate lyrics with Suno tags
    const lyricsLines: string[] = []
    for (const block of sortedBlocks) {
      if (!block.content?.trim()) continue

      const metadata = parseJSON<{ sunoTag?: string }>(block.metadata, {})
      const tag = metadata.sunoTag || sunoBlockTags[block.type] || ''

      if (tag) {
        lyricsLines.push('')
        lyricsLines.push(tag)
      }
      lyricsLines.push(block.content)
    }

    // Generate style prompt
    const styleComponents: string[] = []

    if (currentVibe) {
      if (currentVibe.sunoStyleHints) {
        styleComponents.push(currentVibe.sunoStyleHints)
      }
      const keywords = parseJSON<string[]>(currentVibe.keywords, [])
      if (keywords.length > 0) {
        const count = fidelity === 'experimental' ? 2 : keywords.length
        styleComponents.push(keywords.slice(0, count).join(', '))
      }
    }

    switch (fidelity) {
      case 'faithful':
        styleComponents.push('authentic', 'traditional arrangement')
        break
      case 'balanced':
        styleComponents.push('modern production')
        break
      case 'experimental':
        styleComponents.push('experimental', 'unexpected elements', 'genre-blending')
        break
    }

    return {
      lyrics: lyricsLines.join('\n').trim(),
      stylePrompt: styleComponents.join(', ')
    }
  }, [currentSong, blocks, currentVibe, fidelity])

  const copyToClipboard = async (text: string, type: 'lyrics' | 'style') => {
    await navigator.clipboard.writeText(text)
    if (type === 'lyrics') {
      setCopiedLyrics(true)
      setTimeout(() => setCopiedLyrics(false), 2000)
    } else {
      setCopiedStyle(true)
      setTimeout(() => setCopiedStyle(false), 2000)
    }
  }

  if (!open || !currentSong) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold">Export to Suno</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Fidelity Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Creative Freedom</label>
            <div className="flex gap-2">
              {(['faithful', 'balanced', 'experimental'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFidelity(f)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-md text-sm transition-colors',
                    fidelity === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-accent'
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {fidelity === 'faithful' && 'Close to your vision - Suno will follow style hints closely'}
              {fidelity === 'balanced' && 'Room for interpretation - Suno adds its own flair'}
              {fidelity === 'experimental' && 'Let Suno surprise you - unexpected genre twists'}
            </p>
          </div>

          {/* Style Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Style Prompt</label>
              <button
                onClick={() => copyToClipboard(sunoExport.stylePrompt, 'style')}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {copiedStyle ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedStyle ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-3 bg-secondary rounded-md">
              <p className="text-sm">{sunoExport.stylePrompt || 'No style hints available'}</p>
            </div>
          </div>

          {/* Lyrics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Lyrics (with Suno tags)</label>
              <button
                onClick={() => copyToClipboard(sunoExport.lyrics, 'lyrics')}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {copiedLyrics ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedLyrics ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 bg-secondary rounded-md text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
              {sunoExport.lyrics || 'No lyrics to export'}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Copy the style and lyrics, then paste into Suno
          </p>
          <button
            onClick={() => window.open('https://suno.ai', '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Open Suno
          </button>
        </div>
      </div>
    </div>
  )
}
