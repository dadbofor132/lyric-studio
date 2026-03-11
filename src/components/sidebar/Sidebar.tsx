import { useState } from 'react'
import { useSongStore } from '../../stores/songStore'
import { useUIStore } from '../../stores/uiStore'
import { Music, FileText, ChevronRight, Trash2, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Sidebar() {
  const { songs, currentSong, selectSong, deleteSong, templates } = useSongStore()
  const { sidebarCollapsed, setNewSongOpen } = useUIStore()
  const [activeTab, setActiveTab] = useState<'songs' | 'templates'>('songs')

  if (sidebarCollapsed) {
    return (
      <aside className="w-12 border-r border-border flex flex-col items-center py-4 gap-4">
        <button
          onClick={() => setActiveTab('songs')}
          className={cn(
            'p-2 rounded-md transition-colors',
            activeTab === 'songs' ? 'bg-accent' : 'hover:bg-accent/50'
          )}
        >
          <Music className="h-5 w-5" />
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={cn(
            'p-2 rounded-md transition-colors',
            activeTab === 'templates' ? 'bg-accent' : 'hover:bg-accent/50'
          )}
        >
          <FileText className="h-5 w-5" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-64 border-r border-border flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('songs')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors',
            activeTab === 'songs'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Songs
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors',
            activeTab === 'templates'
              ? 'text-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Templates
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
        {activeTab === 'songs' ? (
          <div className="space-y-1">
            {songs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">No songs yet</p>
                <button
                  onClick={() => setNewSongOpen(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Create your first song
                </button>
              </div>
            ) : (
              songs.map(song => (
                <div
                  key={song.id}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors',
                    currentSong?.id === song.id
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  )}
                  onClick={() => selectSong(song.id)}
                >
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">{song.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Delete this song?')) {
                        deleteSong(song.id)
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {templates.map(template => (
              <TemplateItem key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => setNewSongOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          New Song
        </button>
      </div>
    </aside>
  )
}

function TemplateItem({ template }: { template: any }) {
  const { setNewSongOpen } = useUIStore()
  const structure = JSON.parse(template.structure)

  return (
    <div
      className="p-3 rounded-md border border-border hover:border-primary/50 cursor-pointer transition-colors"
      onClick={() => setNewSongOpen(true)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm">{template.name}</span>
        {template.genre && (
          <span className="text-xs px-2 py-0.5 bg-accent rounded-full">
            {template.genre}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
      <div className="flex flex-wrap gap-1">
        {structure.slice(0, 5).map((block: any, i: number) => (
          <span
            key={i}
            className="text-[10px] px-1.5 py-0.5 bg-secondary rounded"
          >
            {block.label}
          </span>
        ))}
        {structure.length > 5 && (
          <span className="text-[10px] text-muted-foreground">
            +{structure.length - 5} more
          </span>
        )}
      </div>
    </div>
  )
}
