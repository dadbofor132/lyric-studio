import { useSongStore } from '../../stores/songStore'
import type { BlockType } from '../../types'

const blockTypes: { type: BlockType; label: string; color: string }[] = [
  { type: 'intro', label: 'Intro', color: 'bg-green-500' },
  { type: 'verse', label: 'Verse', color: 'bg-blue-500' },
  { type: 'pre-chorus', label: 'Pre-Chorus', color: 'bg-pink-500' },
  { type: 'chorus', label: 'Chorus', color: 'bg-purple-500' },
  { type: 'bridge', label: 'Bridge', color: 'bg-orange-500' },
  { type: 'hook', label: 'Hook', color: 'bg-red-500' },
  { type: 'outro', label: 'Outro', color: 'bg-gray-500' },
]

export function CanvasToolbar() {
  const { createBlock, blocks } = useSongStore()

  const handleAddBlock = async (type: BlockType) => {
    // Calculate position - below the lowest block
    const lowestY = blocks.length > 0
      ? Math.max(...blocks.map(b => b.positionY)) + 200
      : 100

    const label = `${type.charAt(0).toUpperCase() + type.slice(1)} ${
      blocks.filter(b => b.type === type).length + 1
    }`

    await createBlock(type, { x: 400, y: lowestY }, label)
  }

  return (
    <div className="flex items-center gap-1 bg-card/95 backdrop-blur border border-border rounded-lg p-1 shadow-lg">
      <span className="px-2 text-xs text-muted-foreground">Add:</span>
      {blockTypes.map(({ type, label, color }) => (
        <button
          key={type}
          onClick={() => handleAddBlock(type)}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-accent transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${color}`} />
          {label}
        </button>
      ))}
    </div>
  )
}
