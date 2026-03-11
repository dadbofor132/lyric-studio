import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDatabase } from './db'
import { registerSongHandlers } from './ipc/songs.ipc'
import { registerBlockHandlers } from './ipc/blocks.ipc'
import { registerTemplateHandlers } from './ipc/templates.ipc'
import { registerVibeHandlers } from './ipc/vibes.ipc'
import { registerAIHandlers } from './ipc/ai.ipc'
import { registerSettingsHandlers } from './ipc/settings.ipc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

let mainWindow: BrowserWindow | null = null

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    backgroundColor: '#1a1a2e',
  })

  // Initialize database
  await initDatabase()

  // Register IPC handlers
  registerSongHandlers()
  registerBlockHandlers()
  registerTemplateHandlers()
  registerVibeHandlers()
  registerAIHandlers()
  registerSettingsHandlers()

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
