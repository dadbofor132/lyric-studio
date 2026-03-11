import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Songs
  getSongs: () => ipcRenderer.invoke('songs:getAll'),
  getSong: (id: string) => ipcRenderer.invoke('songs:get', id),
  createSong: (data: any) => ipcRenderer.invoke('songs:create', data),
  updateSong: (id: string, data: any) => ipcRenderer.invoke('songs:update', id, data),
  deleteSong: (id: string) => ipcRenderer.invoke('songs:delete', id),

  // Blocks
  getBlocks: (songId: string) => ipcRenderer.invoke('blocks:getAll', songId),
  createBlock: (data: any) => ipcRenderer.invoke('blocks:create', data),
  updateBlock: (id: string, data: any) => ipcRenderer.invoke('blocks:update', id, data),
  deleteBlock: (id: string) => ipcRenderer.invoke('blocks:delete', id),
  duplicateBlock: (id: string) => ipcRenderer.invoke('blocks:duplicate', id),

  // Templates
  getTemplates: () => ipcRenderer.invoke('templates:getAll'),
  getTemplate: (id: string) => ipcRenderer.invoke('templates:get', id),
  createTemplate: (data: any) => ipcRenderer.invoke('templates:create', data),
  deleteTemplate: (id: string) => ipcRenderer.invoke('templates:delete', id),

  // Vibes
  getVibes: () => ipcRenderer.invoke('vibes:getAll'),
  getVibe: (id: string) => ipcRenderer.invoke('vibes:get', id),
  createVibe: (data: any) => ipcRenderer.invoke('vibes:create', data),
  deleteVibe: (id: string) => ipcRenderer.invoke('vibes:delete', id),

  // AI
  initializeAI: (apiKey: string) => ipcRenderer.invoke('ai:initialize', apiKey),
  generateLyrics: (params: any) => ipcRenderer.invoke('ai:generate', params),
  createVariation: (params: any) => ipcRenderer.invoke('ai:variation', params),
  researchVibe: (params: any) => ipcRenderer.invoke('ai:research-vibe', params),

  // Settings
  getSetting: (key: string) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
})
