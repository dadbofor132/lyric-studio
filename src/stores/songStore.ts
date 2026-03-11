import { create } from 'zustand'
import type { Song, Block, Template, Vibe, BlockType, TemplateBlock } from '../types'

interface SongState {
  songs: Song[]
  currentSong: Song | null
  blocks: Block[]
  templates: Template[]
  vibes: Vibe[]
  currentVibe: Vibe | null
  selectedBlockId: string | null

  // Song actions
  loadSongs: () => Promise<void>
  selectSong: (id: string) => Promise<void>
  createSong: (title: string, templateId?: string, vibeId?: string) => Promise<Song>
  updateSong: (id: string, data: Partial<Song>) => Promise<void>
  deleteSong: (id: string) => Promise<void>

  // Block actions
  loadBlocks: (songId: string) => Promise<void>
  createBlock: (type: BlockType, position: { x: number; y: number }, label?: string) => Promise<Block>
  updateBlock: (id: string, data: Partial<Block>) => Promise<void>
  deleteBlock: (id: string) => Promise<void>
  duplicateBlock: (id: string) => Promise<Block | null>
  selectBlock: (id: string | null) => void

  // Template actions
  loadTemplates: () => Promise<void>
  getTemplateStructure: (templateId: string) => TemplateBlock[]

  // Vibe actions
  loadVibes: () => Promise<void>
  selectVibe: (vibeId: string | null) => void
  getVibeData: (vibeId: string) => Vibe | null
}

export const useSongStore = create<SongState>((set, get) => ({
  songs: [],
  currentSong: null,
  blocks: [],
  templates: [],
  vibes: [],
  currentVibe: null,
  selectedBlockId: null,

  // Song actions
  loadSongs: async () => {
    const songs = await window.electronAPI.getSongs()
    set({ songs })
  },

  selectSong: async (id: string) => {
    const song = await window.electronAPI.getSong(id)
    if (song) {
      set({ currentSong: song, selectedBlockId: null })
      await get().loadBlocks(id)

      // Load vibe if set
      if (song.vibeId) {
        const vibe = get().vibes.find(v => v.id === song.vibeId)
        set({ currentVibe: vibe || null })
      } else {
        set({ currentVibe: null })
      }
    }
  },

  createSong: async (title: string, templateId?: string, vibeId?: string) => {
    let templateBlocks: TemplateBlock[] = []

    if (templateId) {
      const template = get().templates.find(t => t.id === templateId)
      if (template) {
        templateBlocks = JSON.parse(template.structure)
        // Use template's default vibe if no vibe specified
        if (!vibeId && template.defaultVibeId) {
          vibeId = template.defaultVibeId
        }
      }
    }

    const song = await window.electronAPI.createSong({
      title,
      templateId,
      vibeId,
      blocks: templateBlocks
    })

    set(state => ({ songs: [...state.songs, song] }))
    await get().selectSong(song.id)
    return song
  },

  updateSong: async (id: string, data: Partial<Song>) => {
    const song = await window.electronAPI.updateSong(id, data)
    set(state => ({
      songs: state.songs.map(s => s.id === id ? song : s),
      currentSong: state.currentSong?.id === id ? song : state.currentSong
    }))

    // Update vibe if changed
    if (data.vibeId !== undefined) {
      const vibe = get().vibes.find(v => v.id === data.vibeId)
      set({ currentVibe: vibe || null })
    }
  },

  deleteSong: async (id: string) => {
    await window.electronAPI.deleteSong(id)
    set(state => ({
      songs: state.songs.filter(s => s.id !== id),
      currentSong: state.currentSong?.id === id ? null : state.currentSong,
      blocks: state.currentSong?.id === id ? [] : state.blocks
    }))
  },

  // Block actions
  loadBlocks: async (songId: string) => {
    const blocks = await window.electronAPI.getBlocks(songId)
    set({ blocks })
  },

  createBlock: async (type: BlockType, position: { x: number; y: number }, label?: string) => {
    const { currentSong } = get()
    if (!currentSong) throw new Error('No song selected')

    const block = await window.electronAPI.createBlock({
      songId: currentSong.id,
      type,
      label: label || type.charAt(0).toUpperCase() + type.slice(1),
      position,
    })

    set(state => ({ blocks: [...state.blocks, block] }))
    return block
  },

  updateBlock: async (id: string, data: Partial<Block>) => {
    const block = await window.electronAPI.updateBlock(id, data)
    set(state => ({
      blocks: state.blocks.map(b => b.id === id ? block : b)
    }))
  },

  deleteBlock: async (id: string) => {
    await window.electronAPI.deleteBlock(id)
    set(state => ({
      blocks: state.blocks.filter(b => b.id !== id),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
    }))
  },

  duplicateBlock: async (id: string) => {
    const newBlock = await window.electronAPI.duplicateBlock(id)
    if (newBlock) {
      set(state => ({ blocks: [...state.blocks, newBlock] }))
    }
    return newBlock
  },

  selectBlock: (id: string | null) => {
    set({ selectedBlockId: id })
  },

  // Template actions
  loadTemplates: async () => {
    const templates = await window.electronAPI.getTemplates()
    set({ templates })
  },

  getTemplateStructure: (templateId: string) => {
    const template = get().templates.find(t => t.id === templateId)
    if (!template) return []
    return JSON.parse(template.structure) as TemplateBlock[]
  },

  // Vibe actions
  loadVibes: async () => {
    const vibes = await window.electronAPI.getVibes()
    set({ vibes })
  },

  selectVibe: (vibeId: string | null) => {
    const { currentSong, vibes } = get()
    const vibe = vibeId ? vibes.find(v => v.id === vibeId) : null
    set({ currentVibe: vibe || null })

    // Update song's vibe
    if (currentSong) {
      get().updateSong(currentSong.id, { vibeId: vibeId || undefined })
    }
  },

  getVibeData: (vibeId: string) => {
    return get().vibes.find(v => v.id === vibeId) || null
  }
}))
