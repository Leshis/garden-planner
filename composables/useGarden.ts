/**
 * composables/useGarden.ts
 * Manages the user's saved garden plants in localStorage
 */
import type { GardenPlant } from './usePerenual'

const STORAGE_KEY = 'bloom-calendar-garden'

export function useGarden() {
  const plants = useState<GardenPlant[]>('garden-plants', () => [])

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

  const addPlant = (plant: GardenPlant) => {
    if (plants.value.some(p => p.id === plant.id)) return false
    plants.value.push(plant)
    saveGarden()
    return true
  }

  // Changed parameter types from number to string
  const removePlant = (id: string) => {
    plants.value = plants.value.filter(p => p.id !== id)
    saveGarden()
  }

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
      for (const m of plant.bloom_months) {
        coverage[m].push(plant)
      }
    }
    return coverage
  })

  return { plants, loadGarden, addPlant, removePlant, updateNickname, hasPlant, monthCoverage }
}
