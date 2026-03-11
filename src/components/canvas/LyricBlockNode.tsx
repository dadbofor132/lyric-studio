import { memo, useState, useCallback } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Sparkles, Copy, Lock, Unlock, MoreVertical, Wand2, Trash2, Loader2 } from 'lucide-react'
import { useSongStore } from '../../stores/songStore'
import { useUIStore } from '../../stores/uiStore'
import { cn, getBlockBgClass } from '../../lib/utils'
import type { Block } from '../../types'

interface LyricBlockNodeData {
  block: Block
}

export const LyricBlockNode = memo(({ data, selected }: NodeProps) => {
  const { block } = data as LyricBlockNodeData
  const { updateBlock, deleteBlock, duplicateBlock, selectedBlockId, blocks, currentVibe } = useSongStore()
  const { isGenerating, generatingBlockId, setGenerating } = useUIStore()
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(block.content)
  const [showMenu, setShowMenu] = useState(false)

  const isThisGenerating = isGenerating && generatingBlockId === block.id
  const metadata = block.metadata ? JSON.parse(block.metadata) : {}

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    if (content !== block.content) {
      updateBlock(block.id, { content })
    }
  }, [content, block.content, block.id, updateBlock])

  const handleGenerate = useCallback(async () => {
    setGenerating(true, block.id)
    try {
      // Get context from other blocks
      const otherBlocks = blocks
        .filter(b => b.id !== block.id && b.content)
        .map(b => `[${b.label || b.type}]\n${b.content}`)
        .join('\n\n')

      const vibeData = currentVibe ? {
        name: currentVibe.name,
        keywords: JSON.parse(currentVibe.keywords),
        aiPromptPrefix: currentVibe.aiPromptPrefix
      } : undefined

      const result = await window.electronAPI.generateLyrics({
        blockType: block.type,
        context: otherBlocks || undefined,
        vibe: vibeData,
        songId: block.songId,
        blockId: block.id
      })

      setContent(result)
      await updateBlock(block.id, {
        content: result,
        metadata: JSON.stringify({ ...metadata, aiGenerated: true })
      })
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate lyrics. Check your API key in settings.')
    } finally {
      setGenerating(false)
    }
  }, [block, blocks, currentVibe, setGenerating, updateBlock, metadata])

  const handleDuplicate = useCallback(async () => {
    setShowMenu(false)
    await duplicateBlock(block.id)
  }, [block.id, duplicateBlock])

  const handleToggleLock = useCallback(async () => {
    setShowMenu(false)
    await updateBlock(block.id, { isLocked: !block.isLocked })
  }, [block.id, block.isLocked, updateBlock])

  const handleDelete = useCallback(async () => {
    setShowMenu(false)
    if (confirm('Delete this block?')) {
      await deleteBlock(block.id)
    }
  }, [block.id, deleteBlock])

  return (
    <div
      className={cn(
        'rounded-lg border-2 shadow-lg transition-all min-w-[280px]',
        getBlockBgClass(block.type),
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        block.isLocked && 'opacity-75'
      )}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-muted-foreground !border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted-foreground !border-background"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
            {block.label || block.type}
          </span>
          {metadata.aiGenerated && (
            <Sparkles className="h-3 w-3 text-purple-400" />
          )}
          {block.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
          {block.version && block.version > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded">
              v{block.version}
            </span>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 py-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[160px]">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || block.isLocked}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                <Wand2 className="h-4 w-4" />
                Generate with AI
              </button>
              <button
                onClick={handleDuplicate}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Copy className="h-4 w-4" />
                Create Variation
              </button>
              <button
                onClick={handleToggleLock}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                {block.isLocked ? (
                  <>
                    <Unlock className="h-4 w-4" />
                    Unlock
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Lock
                  </>
                )}
              </button>
              <hr className="my-1 border-border" />
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/20 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 min-h-[100px]">
        {isThisGenerating ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Generating...</span>
          </div>
        ) : isEditing && !block.isLocked ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            className="w-full min-h-[100px] resize-none border-none bg-transparent text-sm focus:outline-none"
            autoFocus
          />
        ) : (
          <div
            onClick={() => !block.isLocked && setIsEditing(true)}
            className={cn(
              'whitespace-pre-wrap text-sm min-h-[100px]',
              !block.isLocked && 'cursor-text'
            )}
          >
            {block.content || (
              <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
                <p className="italic text-center">Click to add lyrics...</p>
                {!block.isLocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGenerate()
                    }}
                    disabled={isGenerating}
                    className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Wand2 className="h-3 w-3" />
                    Generate with AI
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

LyricBlockNode.displayName = 'LyricBlockNode'
