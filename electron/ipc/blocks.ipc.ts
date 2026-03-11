import { ipcMain } from 'electron'
import { v4 as uuid } from 'uuid'
import { dbHelpers } from '../db'

export function registerBlockHandlers() {
  ipcMain.handle('blocks:getAll', async (_event, songId: string) => {
    return dbHelpers.getBlocks(songId)
  })

  ipcMain.handle('blocks:create', async (_event, data: {
    songId: string
    type: string
    label?: string
    content?: string
    position: { x: number; y: number }
    width?: number
    metadata?: any
  }) => {
    const now = new Date().toISOString()
    const block = {
      id: uuid(),
      songId: data.songId,
      type: data.type,
      label: data.label,
      content: data.content || '',
      positionX: data.position.x,
      positionY: data.position.y,
      width: data.width || 300,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      version: 1,
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    }

    dbHelpers.addBlock(block)
    dbHelpers.updateSong(data.songId, { updatedAt: now })

    return block
  })

  ipcMain.handle('blocks:update', async (_event, id: string, data: any) => {
    const now = new Date().toISOString()
    const block = dbHelpers.updateBlock(id, { ...data, updatedAt: now })

    if (block) {
      dbHelpers.updateSong(block.songId, { updatedAt: now })
    }

    return block
  })

  ipcMain.handle('blocks:delete', async (_event, id: string) => {
    const block = dbHelpers.getBlock(id)
    dbHelpers.deleteBlock(id)

    if (block) {
      dbHelpers.updateSong(block.songId, { updatedAt: new Date().toISOString() })
    }

    return { success: true }
  })

  ipcMain.handle('blocks:duplicate', async (_event, id: string) => {
    const original = dbHelpers.getBlock(id)
    if (!original) return null

    const now = new Date().toISOString()
    const allBlocks = dbHelpers.getBlocks(original.songId)
    const existingVersions = allBlocks.filter(b => b.parentBlockId === id)
    const version = existingVersions.length + 2

    const newBlock = {
      id: uuid(),
      songId: original.songId,
      type: original.type,
      label: `${original.label || original.type} v${version}`,
      content: original.content,
      positionX: original.positionX + 350,
      positionY: original.positionY,
      width: original.width,
      version: version,
      parentBlockId: original.parentBlockId || id,
      metadata: original.metadata,
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    }

    dbHelpers.addBlock(newBlock)
    return newBlock
  })
}
