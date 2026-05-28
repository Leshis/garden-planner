<template>
  <div v-if="plants.length > 0" class="companion-box">
    <div class="companion-header">
      <h3>✨ AI Companion Finder</h3>
      <p>Find plants that perfectly match your current collection's conditions and color profile.</p>
    </div>

    <div class="companion-actions">
      <div class="select-wrap">
        <label for="count-select">Suggest:</label>
        <select id="count-select" v-model="recommendCount">
          <option :value="3">3 Plants</option>
          <option :value="5">5 Plants</option>
          <option :value="7">7 Plants</option>
        </select>
      </div>

      <button 
        class="suggest-btn" 
        :disabled="loading" 
        @click="getRecommendations"
      >
        {{ loading ? 'Consulting the Oracle...' : 'Generate Matches' }}
      </button>
    </div>

    <div v-if="error" class="error-banner">⚠️ {{ error }}</div>

    <div v-if="suggestions.length > 0" class="suggestions-grid">
      <div 
        v-for="(sug, index) in suggestions" 
        :key="index" 
        class="sug-card"
      >
        <div class="sug-meta">
          <h4>{{ sug.common_name }}</h4>
          <span class="sug-sci">{{ sug.scientific_name }}</span>
          <p class="sug-reason">{{ sug.reason }}</p>
        </div>
        
        <div class="sug-footer">
          <div class="sug-swatch" :style="{ background: getPreviewGradient(sug.hex_colours) }"></div>
          <button class="add-sug-btn" @click="addSuggestedPlant(sug)">+ Add to Garden</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Tie into your existing useGarden composable
const { plants, addPlant } = useGarden()

const recommendCount = ref(3)
const loading = ref(false)
const error = ref('')
const suggestions = ref<any[]>([])

async function getRecommendations() {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch('/api/recommend', {
      method: 'POST',
      body: {
        existingPlants: plants.value,
        count: recommendCount.value
      }
    })
    suggestions.value = data as any[]
  } catch (err: any) {
    error.value = err.statusMessage || "Couldn't generate recommendations right now."
  } finally {
    loading.value = false
  }
}

function addSuggestedPlant(sug: any) {
  // Map standard fields into your main collection format
  addPlant({
    common_name: sug.common_name,
    scientific_name: sug.scientific_name,
    flower_color: sug.flower_color,
    hex_colours: sug.hex_colours,
    bloom_months: sug.bloom_months,
    nickname: ''
  })
  // Remove from suggestion list once chosen
  suggestions.value = suggestions.value.filter(p => p.scientific_name !== sug.scientific_name)
}

function getPreviewGradient(colours: string[]): string {
  if (!colours || !colours.length) return 'var(--sage)'
  if (colours.length === 1) return colours[0]
  const pct = 100 / colours.length
  const stops = colours.map((c, i) => `${c} ${i * pct}%, ${c} ${(i + 1) * pct}%`).join(', ')
  return `linear-gradient(to right, ${stops})`
}
</script>

<style scoped>
.companion-box {
  background: var(--parchment-lt, #faf7f2);
  border: 1px dashed var(--parchment-dk, #e6dfd3);
  border-radius: 12px;
  padding: 1.25rem;
  margin: 1.5rem 0;
}

.companion-header h3 {
  font-family: var(--font-display, serif);
  color: var(--ink, #2d3728);
  margin: 0 0 0.25rem 0;
  font-size: 1.15rem;
}
.companion-header p {
  font-size: 0.82rem;
  color: var(--moss-lt, #6b7c65);
  margin: 0 0 1rem 0;
}

.companion-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.select-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  color: var(--ink);
}

.select-wrap select {
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--parchment-dk);
  background: #fff;
  font-size: 0.88rem;
}

.suggest-btn {
  background: var(--moss, #4a5d45);
  color: #fff;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}
.suggest-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.error-banner {
  background: #fff0f0;
  color: #b04141;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.82rem;
  margin-top: 1rem;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1.25rem;
}

@media (min-width: 768px) {
  .suggestions-grid { grid-template-columns: repeat(3, 1fr); }
}

.sug-card {
  background: #fff;
  border: 1px solid var(--parchment-dk);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.sug-meta h4 {
  margin: 0 0 0.15rem 0;
  font-size: 0.95rem;
  color: var(--ink);
}
.sug-sci {
  font-size: 0.75rem;
  font-style: italic;
  color: var(--moss-lt);
  display: block;
  margin-bottom: 0.5rem;
}
.sug-reason {
  font-size: 0.8rem;
  color: #555;
  line-height: 1.4;
  margin: 0 0 1rem 0;
}

.sug-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f5f5f5;
}

.sug-swatch {
  width: 40px;
  height: 12px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.1);
}

.add-sug-btn {
  background: none;
  border: none;
  color: var(--moss);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem;
}
.add-sug-btn:hover { text-decoration: underline; }
</style>
