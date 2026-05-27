import { GoogleGenAI, Type } from '@google/genai'

export default defineEventHandler(async (event) => {
  const { plantQuery } = await readBody(event)
  if (!plantQuery) {
    throw createError({ statusCode: 400, message: 'Plant search prompt is required.' })
  }

  const config = useRuntimeConfig()
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey })

  // Strict horticultural schema design matching your visual layout rules
  const plantSchema = {
    type: Type.OBJECT,
    properties: {
      common_name: { type: Type.STRING, description: "Common name of plant, capitalized (e.g., Geum 'Mai Tai')" },
      scientific_name: { type: Type.STRING, description: "Full botanical scientific name" },
      flower_color: { type: Type.STRING, description: "Descriptive flower color name, capitalized (e.g., Apricot-Pink)" },
      hex_colours: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING }, 
        description: "1 to 3 relevant CSS hexadecimal color strings matching the flowers (e.g. ['#E2725B'])" 
      },
      flowering_season: { type: Type.STRING, description: "Text description of bloom timeframe, capitalized words (e.g., 'Late Spring To Late Summer')" },
      bloom_months: { 
        type: Type.ARRAY, 
        items: { type: Type.INTEGER }, 
        description: "Array of month numbers (1=Jan, 12=Dec) when this plant typically blooms locally" 
      },
      hardiness: { type: Type.STRING, description: "RHS Hardiness rating or thresholds, capitalized (e.g., 'H7 (Very Hardy)')" },
      watering: { type: Type.STRING, description: "Watering details, capitalized sentence" },
      propagation_guide: { type: Type.STRING, description: "Short instructions on propagation method" },
      propagation_season: { type: Type.STRING, description: "Best season context to propagate, capitalized (e.g., 'Spring')" }
    },
    required: ["common_name", "scientific_name", "flower_color", "hex_colours", "bloom_months", "flowering_season", "propagation_season"],
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide comprehensive horticultural and planning data for the plant: ${plantQuery}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: plantSchema,
        systemInstruction: "You are an expert UK horticulturalist database. Provide highly accurate local blooming months, RHS-aligned hardiness, and precise multi-stripe color matches. You strictly format text strings to use capitalized words.",
      }
    })

    return JSON.parse(response.text)
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message || 'Gemini Generation Failed' })
  }
})
