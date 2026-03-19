import { v4 as uuid } from 'uuid'

export function seedDefaults(db: any) {
  const now = new Date().toISOString()

  // Summer Nostalgic Vibe
  const summerNostalgicId = uuid()
  db.vibes.push({
    id: summerNostalgicId,
    name: 'Summer Nostalgic',
    description: 'Warm, hazy memories of summer days gone by. Golden hour light, carefree youth, bittersweet longing.',
    keywords: JSON.stringify(['nostalgic', 'summer', 'warm', 'golden', 'memories', 'carefree', 'bittersweet', 'hazy', 'youth', 'longing']),
    colorPalette: JSON.stringify({ primary: '#F59E0B', secondary: '#FCD34D', accent: '#92400E' }),
    sunoStyleHints: 'indie folk, dreamy, acoustic guitar, warm vocals, lo-fi production, summer vibes, nostalgic, golden hour',
    aiPromptPrefix: 'Write lyrics evoking warm summer memories, golden light, carefree moments, and gentle nostalgia. Use sensory imagery: warm breezes, fading sunlight, cicadas, barefoot walks, old photographs.',
    isBuiltIn: true,
    createdAt: now,
  })

  // Additional vibes
  const vibeData = [
    {
      name: 'Midnight Melancholy',
      description: 'Late night introspection, city lights, quiet solitude.',
      keywords: ['melancholy', 'night', 'introspective', 'urban', 'lonely', 'reflective'],
      colorPalette: { primary: '#1E3A8A', secondary: '#3B82F6', accent: '#93C5FD' },
      sunoStyleHints: 'slow tempo, piano, ambient, city pop, late night, emotional, atmospheric',
      aiPromptPrefix: 'Write lyrics about late night thoughts, city lights reflecting on wet streets, the beauty in solitude.',
    },
    {
      name: 'Euphoric Energy',
      description: 'Uncontainable joy, celebration, peak moments of life.',
      keywords: ['euphoric', 'energetic', 'joyful', 'celebration', 'alive', 'powerful'],
      colorPalette: { primary: '#DC2626', secondary: '#F97316', accent: '#FCD34D' },
      sunoStyleHints: 'upbeat, electronic, dance, powerful vocals, anthemic, festival energy',
      aiPromptPrefix: 'Write lyrics about pure joy, dancing without care, feeling alive and unstoppable.',
    },
    {
      name: 'Gentle Heartbreak',
      description: 'Tender sadness, letting go, healing slowly.',
      keywords: ['heartbreak', 'tender', 'sad', 'healing', 'soft', 'vulnerable'],
      colorPalette: { primary: '#6B7280', secondary: '#9CA3AF', accent: '#E5E7EB' },
      sunoStyleHints: 'acoustic, soft vocals, minimal production, emotional ballad, intimate',
      aiPromptPrefix: 'Write lyrics about the quiet ache of letting go, finding peace in sadness, gentle healing.',
    },
    {
      name: 'Dreamy Ethereal',
      description: 'Floating, otherworldly, soft and surreal.',
      keywords: ['dreamy', 'ethereal', 'floating', 'surreal', 'soft', 'mystical'],
      colorPalette: { primary: '#8B5CF6', secondary: '#C4B5FD', accent: '#F5F3FF' },
      sunoStyleHints: 'ethereal, reverb, synth pads, ambient, dream pop, shoegaze influences',
      aiPromptPrefix: 'Write lyrics that feel like floating through clouds, surreal imagery, dreamlike and abstract.',
    },
  ]

  for (const vibe of vibeData) {
    db.vibes.push({
      id: uuid(),
      name: vibe.name,
      description: vibe.description,
      keywords: JSON.stringify(vibe.keywords),
      colorPalette: JSON.stringify(vibe.colorPalette),
      sunoStyleHints: vibe.sunoStyleHints,
      aiPromptPrefix: vibe.aiPromptPrefix,
      isBuiltIn: true,
      createdAt: now,
    })
  }

  // Templates
  const templateData = [
    {
      name: 'Classic Pop',
      description: 'Verse-Chorus-Verse-Chorus-Bridge-Chorus structure',
      genre: 'pop',
      structure: [
        { type: 'intro', label: 'Intro', position: { x: 400, y: 0 }, sunoTag: '[Intro]' },
        { type: 'verse', label: 'Verse 1', position: { x: 400, y: 180 }, sunoTag: '[Verse]' },
        { type: 'chorus', label: 'Chorus', position: { x: 400, y: 360 }, sunoTag: '[Chorus]' },
        { type: 'verse', label: 'Verse 2', position: { x: 400, y: 540 }, sunoTag: '[Verse 2]' },
        { type: 'chorus', label: 'Chorus', position: { x: 400, y: 720 }, sunoTag: '[Chorus]' },
        { type: 'bridge', label: 'Bridge', position: { x: 400, y: 900 }, sunoTag: '[Bridge]' },
        { type: 'chorus', label: 'Final Chorus', position: { x: 400, y: 1080 }, sunoTag: '[Chorus]' },
        { type: 'outro', label: 'Outro', position: { x: 400, y: 1260 }, sunoTag: '[Outro]' },
      ],
    },
    {
      name: 'Summer Anthem',
      description: 'Big hooks, memorable chorus, feel-good energy',
      genre: 'pop',
      defaultVibeId: summerNostalgicId,
      structure: [
        { type: 'hook', label: 'Opening Hook', position: { x: 400, y: 0 }, sunoTag: '[Hook]' },
        { type: 'verse', label: 'Verse 1', position: { x: 400, y: 180 }, sunoTag: '[Verse]' },
        { type: 'pre-chorus', label: 'Pre-Chorus', position: { x: 400, y: 360 }, sunoTag: '[Pre-Chorus]' },
        { type: 'chorus', label: 'Chorus', position: { x: 400, y: 540 }, sunoTag: '[Chorus]' },
        { type: 'verse', label: 'Verse 2', position: { x: 400, y: 720 }, sunoTag: '[Verse 2]' },
        { type: 'pre-chorus', label: 'Pre-Chorus', position: { x: 400, y: 900 }, sunoTag: '[Pre-Chorus]' },
        { type: 'chorus', label: 'Chorus', position: { x: 400, y: 1080 }, sunoTag: '[Chorus]' },
        { type: 'bridge', label: 'Bridge', position: { x: 400, y: 1260 }, sunoTag: '[Bridge]' },
        { type: 'chorus', label: 'Final Chorus', position: { x: 400, y: 1440 }, sunoTag: '[Chorus]' },
      ],
    },
    {
      name: 'Folk Storyteller',
      description: 'Extended verses with simple chorus, narrative focus',
      genre: 'folk',
      structure: [
        { type: 'intro', label: 'Intro', position: { x: 400, y: 0 }, sunoTag: '[Intro]' },
        { type: 'verse', label: 'Verse 1', position: { x: 400, y: 180 }, sunoTag: '[Verse]' },
        { type: 'verse', label: 'Verse 2', position: { x: 400, y: 360 }, sunoTag: '[Verse 2]' },
        { type: 'chorus', label: 'Chorus', position: { x: 400, y: 540 }, sunoTag: '[Chorus]' },
        { type: 'verse', label: 'Verse 3', position: { x: 400, y: 720 }, sunoTag: '[Verse 3]' },
        { type: 'chorus', label: 'Final Chorus', position: { x: 400, y: 900 }, sunoTag: '[Chorus]' },
      ],
    },
    {
      name: 'Minimal Ballad',
      description: 'Simple structure, emotional depth',
      genre: 'ballad',
      structure: [
        { type: 'verse', label: 'Verse 1', position: { x: 400, y: 0 }, sunoTag: '[Verse]' },
        { type: 'verse', label: 'Verse 2', position: { x: 400, y: 180 }, sunoTag: '[Verse 2]' },
        { type: 'chorus', label: 'Chorus', position: { x: 400, y: 360 }, sunoTag: '[Chorus]' },
        { type: 'verse', label: 'Verse 3', position: { x: 400, y: 540 }, sunoTag: '[Verse 3]' },
        { type: 'chorus', label: 'Chorus', position: { x: 400, y: 720 }, sunoTag: '[Chorus]' },
        { type: 'outro', label: 'Outro', position: { x: 400, y: 900 }, sunoTag: '[Outro]' },
      ],
    },
  ]

  for (const template of templateData) {
    db.templates.push({
      id: uuid(),
      name: template.name,
      description: template.description,
      genre: template.genre,
      structure: JSON.stringify(template.structure),
      defaultVibeId: (template as any).defaultVibeId,
      isBuiltIn: true,
      createdAt: now,
    })
  }

  console.log('Database seeded with default templates and vibes')
}
