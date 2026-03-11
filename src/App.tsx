import { useEffect, useState } from 'react'
import { Sidebar } from './components/sidebar/Sidebar'
import { Canvas } from './components/canvas/Canvas'
import { PropertiesPanel } from './components/properties/PropertiesPanel'
import { SettingsModal } from './components/modals/SettingsModal'
import { NewSongModal } from './components/modals/NewSongModal'
import { ExportModal } from './components/modals/ExportModal'
import { useSongStore } from './stores/songStore'
import { useUIStore } from './stores/uiStore'
import { Settings, Plus, Download } from 'lucide-react'

function App() {
  const { currentSong, loadSongs, loadTemplates, loadVibes } = useSongStore()
  const {
    settingsOpen,
    newSongOpen,
    exportOpen,
    setSettingsOpen,
    setNewSongOpen,
    setExportOpen
  } = useUIStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    async function init() {
      await loadVibes()
      await loadTemplates()
      await loadSongs()
      setInitialized(true)
    }
    init()
  }, [loadSongs, loadTemplates, loadVibes])

  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Lyric Studio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Title Bar */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-border drag-region">
        <div className="flex items-center gap-3 no-drag">
          <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Lyric Studio
          </span>
          {currentSong && (
            <span className="text-sm text-muted-foreground">
              / {currentSong.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 no-drag">
          <button
            onClick={() => setNewSongOpen(true)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            title="New Song"
          >
            <Plus className="h-4 w-4" />
          </button>
          {currentSong && (
            <button
              onClick={() => setExportOpen(true)}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title="Export to Suno"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Song List & Templates */}
        <Sidebar />

        {/* Canvas Area */}
        <main className="flex-1 relative">
          {currentSong ? (
            <Canvas />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-semibold mb-2">Welcome to Lyric Studio</h2>
                <p className="text-muted-foreground mb-6">
                  Create a new song from a template or select an existing song to get started.
                </p>
                <button
                  onClick={() => setNewSongOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Song
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel - Properties & AI */}
        {currentSong && <PropertiesPanel />}
      </div>

      {/* Modals */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NewSongModal open={newSongOpen} onClose={() => setNewSongOpen(false)} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}

export default App
