import { useState } from 'react'
import { useSongStore } from '../../stores/songStore'
import { useUIStore } from '../../stores/uiStore'
import { Wand2, Sparkles, Music, Loader2 } from 'lucide-react'
import { cn, parseJSON } from '../../lib/utils'

export function PropertiesPanel() {
  const { selectedBlockId, blocks, currentSong, currentVibe, vibes, selectVibe, updateBlock } = useSongStore()
  const { isGenerating, setGenerating } = useUIStore()
  const [instructions, setInstructions] = useState('')
  const [variationType, setVariationType] = useState<'subtle' | 'moderate' | 'experimental'>('moderate')

  const selectedBlock = selectedBlockId
    ? blocks.find(b => b.id === selectedBlockId)
    : null

  const handleGenerateVariation = async () => {
    if (!selectedBlock || !selectedBlock.content) return

    setGenerating(true, selectedBlock.id)
    try {
      const vibeData = currentVibe ? {
        name: currentVibe.name,
        keywords: parseJSON<string[]>(currentVibe.keywords, []),
        aiPromptPrefix: currentVibe.aiPromptPrefix
      } : undefined

      const result = await window.electronAPI.createVariation({
        original: selectedBlock.content,
        variationType,
        vibe: vibeData,
      })

      // Create a variation block
      const newBlock = await window.electronAPI.createBlock({
        songId: selectedBlock.songId,
        type: selectedBlock.type,
        label: `${selectedBlock.label || selectedBlock.type} (var)`,
        content: result,
        position: {
          x: selectedBlock.positionX + 350,
          y: selectedBlock.positionY
        },
        metadata: {
          aiGenerated: true,
          parentBlockId: selectedBlock.id
        }
      })

      // Refresh blocks would happen via store
    } catch (error) {
      console.error('Variation failed:', error)
      alert('Failed to create variation. Check your API key.')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateWithInstructions = async () => {
    if (!selectedBlock) return

    setGenerating(true, selectedBlock.id)
    try {
      const otherBlocks = blocks
        .filter(b => b.id !== selectedBlock.id && b.content)
        .map(b => `[${b.label || b.type}]\n${b.content}`)
        .join('\n\n')

      const vibeData = currentVibe ? {
        name: currentVibe.name,
        keywords: parseJSON<string[]>(currentVibe.keywords, []),
        aiPromptPrefix: currentVibe.aiPromptPrefix
      } : undefined

      const result = await window.electronAPI.generateLyrics({
        blockType: selectedBlock.type,
        context: otherBlocks || undefined,
        vibe: vibeData,
        instructions: instructions || undefined,
        songId: selectedBlock.songId,
        blockId: selectedBlock.id
      })

      await updateBlock(selectedBlock.id, {
        content: result,
        metadata: JSON.stringify({
          ...parseJSON(selectedBlock.metadata, {}),
          aiGenerated: true
        })
      })

      setInstructions('')
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate lyrics. Check your API key.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <aside className="w-72 border-l border-border flex flex-col bg-card/50">
      {/* Vibe Selector */}
      <div className="p-4 border-b border-border">
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Song Vibe
        </label>
        <select
          value={currentVibe?.id || ''}
          onChange={(e) => selectVibe(e.target.value || null)}
          className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">No vibe selected</option>
          {vibes.map(vibe => (
            <option key={vibe.id} value={vibe.id}>
              {vibe.name}
            </option>
          ))}
        </select>
        {currentVibe && (
          <p className="mt-2 text-xs text-muted-foreground">
            {currentVibe.description}
          </p>
        )}
      </div>

      {/* Block Properties */}
      {selectedBlock ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Music className="h-4 w-4" />
              {selectedBlock.label || selectedBlock.type}
            </h3>
            <p className="text-xs text-muted-foreground">
              Type: {selectedBlock.type} | Version: {selectedBlock.version || 1}
            </p>
          </div>

          {/* AI Generation */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Assistant
            </h4>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">
                Additional instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Make it more upbeat, focus on memories of the beach..."
                className="w-full h-20 px-2 py-1.5 bg-secondary border border-border rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              onClick={handleGenerateWithInstructions}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {selectedBlock.content ? 'Regenerate' : 'Generate'} Lyrics
            </button>
          </div>

          {/* Variation Creator */}
          {selectedBlock.content && (
            <div className="space-y-3 pt-3 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground">
                Create Variation
              </h4>

              <div className="flex gap-1">
                {(['subtle', 'moderate', 'experimental'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setVariationType(type)}
                    className={cn(
                      'flex-1 py-1.5 text-xs rounded transition-colors',
                      variationType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-accent'
                    )}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateVariation}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-2 bg-secondary text-foreground rounded-md hover:bg-accent transition-colors text-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Create Variation
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Select a block to edit its properties and use AI assistance
          </p>
        </div>
      )}
    </aside>
  )
}
