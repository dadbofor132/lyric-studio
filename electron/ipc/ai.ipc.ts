import { ipcMain } from 'electron'
import { v4 as uuid } from 'uuid'
import { dbHelpers } from '../db'

let openRouterApiKey: string | null = null

export function registerAIHandlers() {
  ipcMain.handle('ai:initialize', async (_event: any, apiKey: string) => {
    openRouterApiKey = apiKey
    dbHelpers.setSetting('openrouter_api_key', apiKey)
    return { success: true }
  })

  ipcMain.handle('ai:generate', async (_event: any, params: any) => {
    if (!openRouterApiKey) {
      const saved = dbHelpers.getSetting('openrouter_api_key')
      if (saved) {
        openRouterApiKey = saved
      } else {
        throw new Error('OpenRouter API key not configured')
      }
    }

    const model = params.model || 'anthropic/claude-sonnet-4'

    const systemPrompt = buildSystemPrompt(params.vibe)
    const userPrompt = buildGenerationPrompt(params.blockType, params.context, params.instructions)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lyric-studio.app',
        'X-Title': 'Lyric Studio'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      })
    })

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content || ''

    dbHelpers.addGeneration({
      id: uuid(),
      songId: params.songId,
      blockId: params.blockId,
      prompt: JSON.stringify(params),
      model,
      result,
      createdAt: new Date().toISOString(),
    })

    return result
  })

  ipcMain.handle('ai:variation', async (_event: any, params: any) => {
    if (!openRouterApiKey) {
      const saved = dbHelpers.getSetting('openrouter_api_key')
      if (saved) {
        openRouterApiKey = saved
      } else {
        throw new Error('OpenRouter API key not configured')
      }
    }

    const model = params.model || 'anthropic/claude-sonnet-4'

    const intensityMap: Record<string, string> = {
      subtle: 'Make small changes to word choice and phrasing while preserving the core meaning and structure.',
      moderate: 'Rewrite with different imagery and metaphors while keeping the overall theme and emotional tone.',
      experimental: 'Completely reimagine these lyrics with fresh perspective, unexpected imagery, and new stylistic approach.',
    }

    const systemPrompt = `You are a creative songwriter specializing in lyric variations. ${params.vibe?.aiPromptPrefix || ''}`
    const userPrompt = `Create a variation of these lyrics:\n\n"${params.original}"\n\n${intensityMap[params.variationType]}\n\nReturn only the new lyrics, no explanations.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lyric-studio.app',
        'X-Title': 'Lyric Studio'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: params.variationType === 'experimental' ? 1.0 : 0.7,
        max_tokens: 500,
      })
    })

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  })

  ipcMain.handle('ai:research-vibe', async (_event: any, params: any) => {
    if (!openRouterApiKey) {
      const saved = dbHelpers.getSetting('openrouter_api_key')
      if (saved) {
        openRouterApiKey = saved
      } else {
        throw new Error('OpenRouter API key not configured')
      }
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lyric-studio.app',
        'X-Title': 'Lyric Studio'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'system',
            content: 'You are a music theorist and lyricist helping to define a musical vibe/mood. Return your response as valid JSON.'
          },
          {
            role: 'user',
            content: `Research and describe a musical vibe based on these keywords: ${params.keywords.join(', ')}
${params.genre ? `Genre context: ${params.genre}` : ''}

Return a JSON object with:
{
  "description": "A rich 2-3 sentence description of this vibe",
  "themes": ["array of 5-7 common lyrical themes"],
  "imagery": ["array of 5-7 imagery and metaphors that fit"],
  "musicalElements": ["array of 4-5 musical elements like tempo, instruments, production style"],
  "sunoStyleHints": "A comma-separated string of style hints for Suno AI"
}

Return only valid JSON, no markdown or explanations.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      })
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || '{}'

    try {
      return JSON.parse(content)
    } catch {
      return {
        description: content,
        themes: [],
        imagery: [],
        musicalElements: [],
        sunoStyleHints: params.keywords.join(', ')
      }
    }
  })
}

function buildSystemPrompt(vibe?: any): string {
  let prompt = `You are a talented songwriter specializing in creating evocative, memorable lyrics.
Write lyrics that are:
- Emotionally resonant and authentic
- Rich with imagery and sensory details
- Rhythmically suitable for singing (consider syllable counts and natural flow)
- Neither too literal nor too abstract
- Return only the lyrics themselves, no explanations or labels`

  if (vibe) {
    prompt += `\n\nVibe/Mood: ${vibe.name}
Keywords: ${vibe.keywords.join(', ')}
${vibe.aiPromptPrefix || ''}`
  }

  return prompt
}

function buildGenerationPrompt(blockType: string, context?: string, instructions?: string): string {
  const blockGuidance: Record<string, string> = {
    verse: 'Write a verse (4-8 lines) that tells a story or describes a scene. Each line should flow naturally into the next.',
    chorus: 'Write a memorable, emotionally powerful chorus (4-6 lines) with a strong hook that listeners will want to sing along to.',
    bridge: 'Write a bridge (4-6 lines) that offers a new perspective or emotional shift from the rest of the song.',
    'pre-chorus': 'Write a pre-chorus (2-4 lines) that builds tension and anticipation leading into the chorus.',
    intro: 'Write an intro (2-4 lines) that sets the scene and draws listeners in immediately.',
    outro: 'Write an outro (2-4 lines) that provides emotional closure or leaves a lasting impression.',
    hook: 'Write a catchy hook (1-2 lines) - a phrase that will stick in the listener\'s mind.',
    custom: 'Write lyrics as specified below.',
  }

  let prompt = blockGuidance[blockType] || blockGuidance.custom

  if (context) {
    prompt += `\n\nHere are other parts of the song for context and coherence:\n${context}`
  }

  if (instructions) {
    prompt += `\n\nAdditional instructions: ${instructions}`
  }

  return prompt
}
