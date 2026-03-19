import { ipcMain } from 'electron'
import { dbHelpers } from '../db'

export function registerSettingsHandlers() {
  ipcMain.handle('settings:get', async (_event: any, key: string) => {
    return dbHelpers.getSetting(key) || null
  })

  ipcMain.handle('settings:set', async (_event: any, key: string, value: string) => {
    dbHelpers.setSetting(key, value)
    return { success: true }
  })
}
