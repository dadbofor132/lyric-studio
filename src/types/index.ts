export type BlockType =
  | 'verse'
  | 'chorus'
  | 'bridge'
  | 'pre-chorus'
  | 'outro'
  | 'intro'
  | 'hook'
  | 'custom'

export interface Block {
  id: string
  songId: string
  type: BlockType
  label?: string
  content: string
  positionX: number
  positionY: number
  width?: number
  height?: number
  version?: number
  parentBlockId?: string
  isLocked?: boolean
  metadata?: string // JSON string
  createdAt: Date
  updatedAt: Date
}

export interface BlockMetadata {
  sunoTag?: string
  aiGenerated?: boolean
  aiModel?: string
  notes?: string
}

export interface Song {
  id: string
  title: string
  description?: string
  vibeId?: string
  templateId?: string
  canvasState?: string
  createdAt: Date
  updatedAt: Date
}

export interface Template {
  id: string
  name: string
  description?: string
  genre?: string
  structure: string // JSON string of TemplateBlock[]
  defaultVibeId?: string
  isBuiltIn?: boolean
  createdAt: Date
}

export interface TemplateBlock {
  type: BlockType
  label: string
  position: { x: number; y: number }
  sunoTag?: string
}

export interface Vibe {
  id: string
  name: string
  description?: string
  keywords: string // JSON string of string[]
  colorPalette?: string // JSON string
  sunoStyleHints?: string
  aiPromptPrefix?: string
  isBuiltIn?: boolean
  createdAt: Date
}

export interface VibeColors {
  primary: string
  secondary: string
  accent: string
}

export interface CanvasState {
  zoom: number
  panX: number
  panY: number
}

// Electron API types
export interface ElectronAPI {
  // Songs
  getSongs: () => Promise<Song[]>
  getSong: (id: string) => Promise<Song | null>
  createSong: (data: CreateSongData) => Promise<Song>
  updateSong: (id: string, data: Partial<Song>) => Promise<Song>
  deleteSong: (id: string) => Promise<{ success: boolean }>

  // Blocks
  getBlocks: (songId: string) => Promise<Block[]>
  createBlock: (data: CreateBlockData) => Promise<Block>
  updateBlock: (id: string, data: Partial<Block>) => Promise<Block>
  deleteBlock: (id: string) => Promise<{ success: boolean }>
  duplicateBlock: (id: string) => Promise<Block | null>

  // Templates
  getTemplates: () => Promise<Template[]>
  getTemplate: (id: string) => Promise<Template | null>
  createTemplate: (data: CreateTemplateData) => Promise<Template>
  deleteTemplate: (id: string) => Promise<{ success: boolean; error?: string }>

  // Vibes
  getVibes: () => Promise<Vibe[]>
  getVibe: (id: string) => Promise<Vibe | null>
  createVibe: (data: CreateVibeData) => Promise<Vibe>
  deleteVibe: (id: string) => Promise<{ success: boolean; error?: string }>

  // AI
  initializeAI: (apiKey: string) => Promise<{ success: boolean }>
  generateLyrics: (params: GenerateLyricsParams) => Promise<string>
  createVariation: (params: CreateVariationParams) => Promise<string>
  researchVibe: (params: ResearchVibeParams) => Promise<VibeResearch>

  // Settings
  getSetting: (key: string) => Promise<string | null>
  setSetting: (key: string, value: string) => Promise<{ success: boolean }>
}

export interface CreateSongData {
  title: string
  description?: string
  vibeId?: string
  templateId?: string
  blocks?: TemplateBlock[]
}

export interface CreateBlockData {
  songId: string
  type: BlockType
  label?: string
  content?: string
  position: { x: number; y: number }
  width?: number
  metadata?: BlockMetadata
}

export interface CreateTemplateData {
  name: string
  description?: string
  genre?: string
  structure: TemplateBlock[]
  defaultVibeId?: string
}

export interface CreateVibeData {
  name: string
  description?: string
  keywords: string[]
  colorPalette?: VibeColors
  sunoStyleHints?: string
  aiPromptPrefix?: string
}

export interface GenerateLyricsParams {
  blockType: BlockType
  context?: string
  vibe?: {
    name: string
    keywords: string[]
    aiPromptPrefix?: string
  }
  instructions?: string
  model?: string
  songId?: string
  blockId?: string
}

export interface CreateVariationParams {
  original: string
  variationType: 'subtle' | 'moderate' | 'experimental'
  vibe?: {
    name: string
    keywords: string[]
    aiPromptPrefix?: string
  }
  model?: string
}

export interface ResearchVibeParams {
  keywords: string[]
  genre?: string
}

export interface VibeResearch {
  description: string
  themes: string[]
  imagery: string[]
  musicalElements: string[]
  sunoStyleHints: string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
