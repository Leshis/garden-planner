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
          
          <div class="preview-colors-row">
            <div 
              v-for="color in previewPlant.hex_colours" 
              :key="color" 
              class="preview-circle-swatch" 
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

        <div class="color-selector-block">
          <label class="block-label">🌸 Select flower variants for your garden (Tap to toggle):</label>
          <div class="interactive-swatches">
            <button 
              v-for="color in previewPlant.hex_colours" 
              :key="color" 
              class="selectable-swatch"
              :class="{ 'is-selected': selectedColours.includes(color) }"
              :style="{ background: color }"
              @click="toggleColourSelection(color)"
              type="button"
              :title="`Toggle ${color}`"
            >
              <span v-if="selectedColours.includes(color)" class="check-mark">✓</span>
            </button>
          </div>
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

          <button 
            @click="commitPlantToGarden" 
            class="add-garden-btn"
            :disabled="selectedColours.length === 0"
          >
            {{ selectedColours.length === 0 ? 'Select a colour variant' : '+ Add to My Calendar' }}
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

// Selection tracker array mapping
const selectedColours = ref<string[]>([])

async function generatePlantData() {
  if (!query.value.trim()) return
  loading.value = true
  error.value = ''
  previewPlant.value = null
  selectedColours.value = []

  try {
    const data = await $fetch('/api/generate-plant', {
      method: 'POST',
      body: { plantQuery: query.value.trim() }
    })
    previewPlant.value = data as Omit<GardenPlant, 'id'>
    
    if (previewPlant.value.hex_colours) {
      selectedColours.value = [...previewPlant.value.hex_colours]
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to retrieve botanical details.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function toggleColourSelection(color: string) {
  if (selectedColours.value.includes(color)) {
    if (selectedColours.value.length > 1) {
      selectedColours.value = selectedColours.value.filter(c => c !== color)
    }
  } else {
    selectedColours.value.push(color)
  }
}

function commitPlantToGarden() {
  if (!previewPlant.value || selectedColours.value.length === 0) return
  
  const formattedPlant: GardenPlant = {
    ...previewPlant.value,
    hex_colours: [...selectedColours.value],
    id: `plant-${Date.now()}` 
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
  selectedColours.value = []
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

/* Single row layout constraints */
.preview-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  margin-bottom: 1rem; 
  gap: 1rem;
}
.preview-title { font-family: var(--font-display); font-size: 1.2rem; color: var(--ink); text-transform: capitalize; }
.preview-sci { font-size: .85rem; color: var(--moss-lt); font-style: italic; }

.preview-colors-row { 
  display: flex; 
  gap: 6px; 
  align-items: center;
  flex-shrink: 0;
  margin-top: 4px;
}

.preview-circle-swatch { 
  width: 16px; 
  height: 16px; 
  border-radius: 50%; 
  border: 1px solid rgba(0, 0, 0, 0.18);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}

.preview-meta-grid { font-size: .85rem; display: grid; grid-template-columns: 1fr; gap: .5rem; margin-bottom: 1rem; }

/* Interactive Selection Block styles */
.color-selector-block {
  background: #ffffff;
  border: 1px solid var(--parchment-dk);
  border-radius: var(--radius);
  padding: 0.85rem;
  margin-bottom: 1.25rem;
}
.block-label { font-size: 0.82rem; font-weight: 600; color: var(--ink); display: block; margin-bottom: 0.6rem; }
.interactive-swatches { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

.selectable-swatch {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.15s, opacity 0.15s;
  border: 1px solid rgba(0, 0, 0, 0.22);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05);
}
.selectable-swatch:hover { transform: scale(1.08); }
.selectable-swatch:not(.is-selected) { opacity: 0.35; border-style: dashed; }

.check-mark {
  font-size: 0.9rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

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
.add-garden-btn:disabled { background: var(--sage-lt); color: var(--ink-soft); cursor: not-allowed; }

@media (min-width: 480px) {
  .preview-actions { flex-direction: row; justify-content: space-between; }
  .verify-rhs-btn, .add-garden-btn { flex: 1; text-align: center; }
}
</style>
