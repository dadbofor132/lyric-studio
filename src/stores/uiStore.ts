import { create } from 'zustand'

interface UIState {
  // Modal states
  settingsOpen: boolean
  newSongOpen: boolean
  exportOpen: boolean
  templateGalleryOpen: boolean

  // Panel states
  sidebarCollapsed: boolean
  propertiesPanelCollapsed: boolean

  // AI generation state
  isGenerating: boolean
  generatingBlockId: string | null

  // Actions
  setSettingsOpen: (open: boolean) => void
  setNewSongOpen: (open: boolean) => void
  setExportOpen: (open: boolean) => void
  setTemplateGalleryOpen: (open: boolean) => void
  toggleSidebar: () => void
  togglePropertiesPanel: () => void
  setGenerating: (isGenerating: boolean, blockId?: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  settingsOpen: false,
  newSongOpen: false,
  exportOpen: false,
  templateGalleryOpen: false,
  sidebarCollapsed: false,
  propertiesPanelCollapsed: false,
  isGenerating: false,
  generatingBlockId: null,

  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setNewSongOpen: (open) => set({ newSongOpen: open }),
  setExportOpen: (open) => set({ exportOpen: open }),
  setTemplateGalleryOpen: (open) => set({ templateGalleryOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  togglePropertiesPanel: () => set((state) => ({ propertiesPanelCollapsed: !state.propertiesPanelCollapsed })),

  setGenerating: (isGenerating, blockId = null) => set({
    isGenerating,
    generatingBlockId: isGenerating ? blockId : null
  }),
}))
