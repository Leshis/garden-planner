import { GoogleGenAI } from '@google/genai'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { existingPlants, count } = body

  if (!existingPlants || !existingPlants.length) {
    throw createError({ statusCode: 400, statusMessage: 'No current plants to base recommendations on.' })
  }

  const aiKey = process.env.GEMINI_API_KEY
  if (!aiKey) throw createError({ statusCode: 500, statusMessage: 'Missing API Key configuration.' })

  const ai = new GoogleGenAI({ apiKey: aiKey })

  // Extract names to make the payload sent to Gemini minimal and clear
  const plantNames = existingPlants.map((p: any) => `${p.common_name} (${p.scientific_name})`).join(', ')

  const prompt = `
    You are an expert botanical designer. I have these plants in my garden: ${plantNames}.
    Suggest exactly ${count || 3} companion plants that complement these aesthetically (color harmony, structure) and thrive in the same soil/climate conditions.
    
    Return ONLY a valid JSON array matching this exact shape. Do not include markdown wraps or prose:
    [
      {
        "common_name": "string",
        "scientific_name": "string",
        "flower_color": "string",
        "hex_colours": ["#hex1", "#hex2"],
        "bloom_months": [5, 6, 7],
        "reason": "Brief 1-sentence explanation of why it pairs perfectly"
      }
    ]
  `

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const cleanText = response.text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleanText)
  } catch (err: any) {
    console.error('Recommendation API error:', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to generate recommendations.' })
  }
})
