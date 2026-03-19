import { ipcMain } from 'electron'
import { v4 as uuid } from 'uuid'
import { dbHelpers } from '../db'

export function registerTemplateHandlers() {
  ipcMain.handle('templates:getAll', async () => {
    return dbHelpers.getAllTemplates()
  })

  ipcMain.handle('templates:get', async (_event: any, id: string) => {
    return dbHelpers.getTemplate(id)
  })

  ipcMain.handle('templates:create', async (_event: any, data: any) => {
    const template = {
      id: uuid(),
      name: data.name,
      description: data.description,
      genre: data.genre,
      structure: JSON.stringify(data.structure),
      defaultVibeId: data.defaultVibeId,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    }

    dbHelpers.addTemplate(template)
    return template
  })

  ipcMain.handle('templates:delete', async (_event: any, id: string) => {
    const template = dbHelpers.getTemplate(id)
    if (template?.isBuiltIn) {
      return { success: false, error: 'Cannot delete built-in templates' }
    }

    dbHelpers.deleteTemplate(id)
    return { success: true }
  })
}
