import { ipcMain } from 'electron'
import { v4 as uuid } from 'uuid'
import { dbHelpers } from '../db'

export function registerSongHandlers() {
  ipcMain.handle('songs:getAll', async () => {
    return dbHelpers.getAllSongs()
  })

  ipcMain.handle('songs:get', async (_event: any, id: string) => {
    return dbHelpers.getSong(id)
  })

  ipcMain.handle('songs:create', async (_event: any, data: any) => {
    const now = new Date().toISOString()
    const songId = uuid()

    const song = {
      id: songId,
      title: data.title,
      description: data.description,
      vibeId: data.vibeId,
      templateId: data.templateId,
      createdAt: now,
      updatedAt: now,
    }

    dbHelpers.addSong(song)

    if (data.blocks && data.blocks.length > 0) {
      for (const block of data.blocks) {
        dbHelpers.addBlock({
          id: uuid(),
          songId: songId,
          type: block.type,
          label: block.label,
          content: block.content || '',
          positionX: block.position.x,
          positionY: block.position.y,
          width: block.width || 300,
          metadata: block.sunoTag ? JSON.stringify({ sunoTag: block.sunoTag }) : null,
          createdAt: now,
          updatedAt: now,
        })
      }
    }

    return song
  })

  ipcMain.handle('songs:update', async (_event: any, id: string, data: any) => {
    return dbHelpers.updateSong(id, { ...data, updatedAt: new Date().toISOString() })
  })

  ipcMain.handle('songs:delete', async (_event: any, id: string) => {
    dbHelpers.deleteSong(id)
    return { success: true }
  })
}
