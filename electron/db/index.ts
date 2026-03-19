import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { seedDefaults } from './seed'

interface Database {
  songs: any[]
  blocks: any[]
  templates: any[]
  vibes: any[]
  settings: Record<string, string>
  aiGenerations: any[]
}

let db: Database = {
  songs: [],
  blocks: [],
  templates: [],
  vibes: [],
  settings: {},
  aiGenerations: []
}

let dbPath: string

export async function initDatabase() {
  const userDataPath = app.getPath('userData')
  dbPath = path.join(userDataPath, 'lyric-studio-data.json')

  // Load existing data or create new
  if (fs.existsSync(dbPath)) {
    try {
      const data = fs.readFileSync(dbPath, 'utf-8')
      db = JSON.parse(data)
    } catch (e) {
      console.error('Failed to load database, creating new one')
      db = { songs: [], blocks: [], templates: [], vibes: [], settings: {}, aiGenerations: [] }
    }
  }

  // Seed defaults if needed
  if (db.vibes.length === 0) {
    seedDefaults(db)
    saveDatabase()
  }

  return db
}

export function getDb(): Database {
  return db
}

export function saveDatabase() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
  } catch (e) {
    console.error('Failed to save database:', e)
  }
}

// Helper functions for CRUD operations
export const dbHelpers = {
  // Songs
  getAllSongs: () => db.songs,
  getSong: (id: string) => db.songs.find((s: any) => s.id === id),
  addSong: (song: any) => { db.songs.push(song); saveDatabase(); return song },
  updateSong: (id: string, data: any) => {
    const idx = db.songs.findIndex((s: any) => s.id === id)
    if (idx !== -1) { db.songs[idx] = { ...db.songs[idx], ...data }; saveDatabase() }
    return db.songs[idx]
  },
  deleteSong: (id: string) => {
    db.songs = db.songs.filter((s: any) => s.id !== id)
    db.blocks = db.blocks.filter((b: any) => b.songId !== id)
    saveDatabase()
  },

  // Blocks
  getBlocks: (songId: string) => db.blocks.filter((b: any) => b.songId === songId),
  getBlock: (id: string) => db.blocks.find((b: any) => b.id === id),
  addBlock: (block: any) => { db.blocks.push(block); saveDatabase(); return block },
  updateBlock: (id: string, data: any) => {
    const idx = db.blocks.findIndex((b: any) => b.id === id)
    if (idx !== -1) { db.blocks[idx] = { ...db.blocks[idx], ...data }; saveDatabase() }
    return db.blocks[idx]
  },
  deleteBlock: (id: string) => { db.blocks = db.blocks.filter((b: any) => b.id !== id); saveDatabase() },

  // Templates
  getAllTemplates: () => db.templates,
  getTemplate: (id: string) => db.templates.find((t: any) => t.id === id),
  addTemplate: (template: any) => { db.templates.push(template); saveDatabase(); return template },
  deleteTemplate: (id: string) => { db.templates = db.templates.filter((t: any) => t.id !== id); saveDatabase() },

  // Vibes
  getAllVibes: () => db.vibes,
  getVibe: (id: string) => db.vibes.find((v: any) => v.id === id),
  addVibe: (vibe: any) => { db.vibes.push(vibe); saveDatabase(); return vibe },
  deleteVibe: (id: string) => { db.vibes = db.vibes.filter((v: any) => v.id !== id); saveDatabase() },

  // Settings
  getSetting: (key: string) => db.settings[key],
  setSetting: (key: string, value: string) => { db.settings[key] = value; saveDatabase() },

  // AI Generations
  addGeneration: (gen: any) => { db.aiGenerations.push(gen); saveDatabase() },
}
