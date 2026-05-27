<template>
  <div class="search-wrap">
    <div class="search-bar">
      <span class="sparkle-icon">✨</span>
      <input
        v-model="query"
        type="text"
        class="search-input"
        placeholder="Enter any plant name (e.g. Geum Mai Tai, Himalayan Blue Poppy)..."
        @keydown.enter="generatePlantData"
        autocomplete="off"
        spellcheck="false"
      />
      <button v-if="query" class="clear-btn" @click="clearSearch" aria-label="Clear">×</button>
    </div>

    <div v-if="loading || error || previewPlant" class="preview-panel">
      <div v-if="loading" class="results-loading">
        <span class="leaf-spin">🌿</span> AI is analyzing botanical data...
      </div>
      
      <div v-else-if="error" class="results-error">
        ⚠️ {{ error }}
      </div>

      <div v-else-if="previewPlant" class="preview-card">
        <div class="preview-header">
          <div>
            <h4 class="preview-title">{{ previewPlant.common_name }}</h4>
            <p class="preview-sci">{{ previewPlant.scientific_name }}</p>
          </div>
          <div class="preview-colors">
            <div 
              v-for="color in previewPlant.hex_colours" 
              :key="color" 
              class="preview-swatch" 
              :style="{ background: color }"
            ></div>
          </div>
        </div>

        <div class="preview-meta-grid">
          <p><strong>Flower Color:</strong> {{ previewPlant.flower_color }}</p>
          <p><strong>Flowering Timeline:</strong> {{ previewPlant.flowering_season }}</p>
          <p v-if="previewPlant.hardiness"><strong>RHS Hardiness:</strong> {{ previewPlant.hardiness }}</p>
          <p v-if="previewPlant.propagation_season"><strong>Propagation Frame:</strong> {{ previewPlant.propagation_season }}</p>
        </div>

        <div class="preview-actions">
          <a 
            :href="getRhsLink(previewPlant.scientific_name)" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="verify-rhs-btn"
          >
            Verify on RHS Website 🔗
          </a>
          
          <button @click="commitPlantToGarden" class="add-garden-btn">
            + Add to My Calendar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GardenPlant } from '~/composables/usePerenual'

const { addPlant } = useGarden()

const query = ref('')
const loading = ref(false)
const error = ref('')
const previewPlant = ref<Omit<GardenPlant, 'id'> | null>(null)

async function generatePlantData() {
  if (!query.value.trim()) return
  loading.value = true
  error.value = ''
  previewPlant.value = null

  try {
    const data = await $fetch('/api/generate-plant', {
      method: 'POST',
      body: { plantQuery: query.value.trim() }
    })
    previewPlant.value = data as Omit<GardenPlant, 'id'>
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to retrieve botanical details.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function commitPlantToGarden() {
  if (!previewPlant.value) return
  
  const formattedPlant: GardenPlant = {
    ...previewPlant.value,
    id: `plant-${Date.now()}` // Unique temporal string tracker
  }

  const success = addPlant(formattedPlant)
  if (success) {
    clearSearch()
  }
}

function getRhsLink(scientificName: string | undefined): string {
  if (!scientificName) return 'https://www.rhs.org.uk/plants'
  return `https://www.rhs.org.uk/plants/search-results?query=${encodeURIComponent(scientificName.trim())}`
}

function clearSearch() {
  query.value = ''
  previewPlant.value = null
  error.value = ''
}
</script>

<style scoped>
.search-wrap { position: relative; width: 100%; max-width: 560px; margin-bottom: 1.5rem; }

.search-bar {
  display: flex;
  align-items: center;
  background: var(--cream);
  border: 1.5px solid var(--sage);
  border-radius: 40px;
  padding: 0 1.2rem;
  gap: .6rem;
}

.sparkle-icon { font-size: 1.1rem; color: var(--gold); }

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: .95rem;
  color: var(--ink);
  padding: .75rem 0;
  outline: none;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--sage);
  font-size: 1.3rem;
  cursor: pointer;
}

.preview-panel {
  margin-top: 10px;
  background: var(--cream);
  border: 1.5px solid var(--sage-lt);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 1.25rem;
}

.results-loading { color: var(--ink-soft); display: flex; align-items: center; gap: .5rem; }
.results-error { color: #c05050; }

.leaf-spin { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.preview-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.preview-title { font-family: var(--font-display); font-size: 1.2rem; color: var(--ink); text-transform: capitalize; }
.preview-sci { font-size: .85rem; color: var(--moss-lt); font-style: italic; }

.preview-colors { display: flex; gap: 4px; }
.preview-swatch { width: 20px; height: 20px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }

.preview-meta-grid { font-size: .85rem; display: grid; grid-template-columns: 1fr; gap: .5rem; margin-bottom: 1.25rem; }

.preview-actions { display: flex; flex-direction: column; gap: 8px; }

.verify-rhs-btn {
  display: block;
  text-align: center;
  text-decoration: none;
  font-size: .82rem;
  color: var(--twig);
  background: #f0e6d4;
  padding: .5rem;
  border-radius: var(--radius);
  font-weight: 500;
  transition: background .2s;
}
.verify-rhs-btn:hover { background: var(--parchment-dk); }

.add-garden-btn {
  background: var(--moss);
  color: white;
  border: none;
  padding: .6rem;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-weight: 500;
  cursor: pointer;
  font-size: .9rem;
}
.add-garden-btn:hover { background: var(--ink-soft); }

@media (min-width: 480px) {
  .preview-actions { flex-direction: row; justify-content: space-between; }
  .verify-rhs-btn, .add-garden-btn { flex: 1; text-align: center; }
}
</style>
