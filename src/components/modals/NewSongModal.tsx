import { useState } from 'react'
import { X, Music, FileText } from 'lucide-react'
import { useSongStore } from '../../stores/songStore'
import { cn } from '../../lib/utils'

interface NewSongModalProps {
  open: boolean
  onClose: () => void
}

export function NewSongModal({ open, onClose }: NewSongModalProps) {
  const { templates, vibes, createSong } = useSongStore()
  const [title, setTitle] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) return

    setCreating(true)
    try {
      await createSong(
        title.trim(),
        selectedTemplate || undefined,
        selectedVibe || undefined
      )
      setTitle('')
      setSelectedTemplate(null)
      setSelectedVibe(null)
      onClose()
    } catch (error) {
      console.error('Failed to create song:', error)
      alert('Failed to create song')
    } finally {
      setCreating(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Music className="h-5 w-5" />
            New Song
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Song Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter song title..."
              className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Choose Template (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map(template => {
                const structure = JSON.parse(template.structure)
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(
                      selectedTemplate === template.id ? null : template.id
                    )}
                    className={cn(
                      'p-3 text-left border rounded-lg transition-colors',
                      selectedTemplate === template.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{template.name}</span>
                      {template.genre && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded">
                          {template.genre}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {structure.slice(0, 4).map((block: any, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] px-1 py-0.5 bg-accent rounded"
                        >
                          {block.type}
                        </span>
                      ))}
                      {structure.length > 4 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{structure.length - 4}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Vibe Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Choose Vibe (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {vibes.map(vibe => {
                const colors = vibe.colorPalette
                  ? JSON.parse(vibe.colorPalette)
                  : null
                return (
                  <button
                    key={vibe.id}
                    onClick={() => setSelectedVibe(
                      selectedVibe === vibe.id ? null : vibe.id
                    )}
                    className={cn(
                      'p-3 text-left border rounded-lg transition-colors',
                      selectedVibe === vibe.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {colors && (
                        <div className="flex gap-0.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors.primary }}
                          />
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors.secondary }}
                          />
                        </div>
                      )}
                      <span className="font-medium text-sm">{vibe.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {vibe.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || creating}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Song'}
          </button>
        </div>
      </div>
    </div>
  )
}
