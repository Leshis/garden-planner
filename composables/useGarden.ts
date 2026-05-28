/**
 * composables/useGarden.ts
 * Manages the user's saved garden plants in localStorage and Supabase
 */
import type { GardenPlant } from './usePerenual'

const STORAGE_KEY = 'bloom-calendar-garden'

export function useGarden() {
  const plants = useState<GardenPlant[]>('garden-plants', () => [])
  const supabase = useSupabaseClient()

  const loadGarden = () => {
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) plants.value = JSON.parse(raw)
      } catch { /* ignore */ }
    }
  }

  const saveGarden = () => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plants.value))
    }
  }

  // Focus: Adding a single plant record directly to the new Supabase UUID table
  const addPlant = async (plantPayload: Omit<GardenPlant, 'id'>) => {
    // Prevent client-side UI duplicate entries based on scientific name
    if (plants.value.some(p => p.scientific_name === plantPayload.scientific_name)) {
      alert("This plant species already exists in your local view!")
      return false
    }

    try {
      // Insert the plant into your new public.plants UUID table
      const { data, error } = await supabase
        .from('plants')
        .insert(plantPayload)
        .select() // Retrieves the newly created row containing its automatic UUID from Postgres

      if (error) throw error

      // Push the real database row (complete with its fresh UUID string) to the UI grid
      if (data && data[0]) {
        plants.value.push(data[0] as unknown as GardenPlant)
        saveGarden() // Fallback update to local storage to keep sync for now
      }
      return true
    } catch (err) {
      console.error('Database insertion failed:', err)
      alert('Could not save plant to Supabase.')
      return false
    }
  }

  // Left untouched for now - to be updated to cloud logic later
  const removePlant = (id: string) => {
    plants.value = plants.value.filter(p => p.id !== id)
    saveGarden()
  }

  // Left untouched for now - to be updated to cloud logic later
  const updateNickname = (id: string, nickname: string) => {
    const p = plants.value.find(p => p.id === id)
    if (p) {
      p.nickname = nickname;
      saveGarden()
    }
  }

  const hasPlant = (id: string) => plants.value.some(p => p.id === id)

  const monthCoverage = computed(() => {
    const coverage: Record<number, GardenPlant[]> = {}
    for (let m = 1; m <= 12; m++) coverage[m] = []
    for (const plant of plants.value) {
      if (plant.bloom_months) {
        for (const m of plant.bloom_months) {
          coverage[m].push(plant)
        }
      }
    }
    return coverage
  })

  return { plants, loadGarden, addPlant, removePlant, updateNickname, hasPlant, monthCoverage }
}
