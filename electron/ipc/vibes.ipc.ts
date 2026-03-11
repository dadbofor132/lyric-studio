import { ipcMain } from 'electron'
import { v4 as uuid } from 'uuid'
import { dbHelpers } from '../db'

export function registerVibeHandlers() {
  ipcMain.handle('vibes:getAll', async () => {
    return dbHelpers.getAllVibes()
  })

  ipcMain.handle('vibes:get', async (_event, id: string) => {
    return dbHelpers.getVibe(id)
  })

  ipcMain.handle('vibes:create', async (_event, data: {
    name: string
    description?: string
    keywords: string[]
    colorPalette?: { primary: string; secondary: string; accent: string }
    sunoStyleHints?: string
    aiPromptPrefix?: string
  }) => {
    const vibe = {
      id: uuid(),
      name: data.name,
      description: data.description,
      keywords: JSON.stringify(data.keywords),
      colorPalette: data.colorPalette ? JSON.stringify(data.colorPalette) : null,
      sunoStyleHints: data.sunoStyleHints,
      aiPromptPrefix: data.aiPromptPrefix,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    }

    dbHelpers.addVibe(vibe)
    return vibe
  })

  ipcMain.handle('vibes:delete', async (_event, id: string) => {
    const vibe = dbHelpers.getVibe(id)
    if (vibe?.isBuiltIn) {
      return { success: false, error: 'Cannot delete built-in vibes' }
    }

    dbHelpers.deleteVibe(id)
    return { success: true }
  })
}
