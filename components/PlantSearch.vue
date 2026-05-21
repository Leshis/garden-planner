<template>
  <div class="search-wrap">
    <div class="search-bar">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        v-model="query"
        type="text"
        class="search-input"
        placeholder="Search plants - rose, lavender, tulip..."
        @input="onInput"
        @keydown.enter="doSearch"
        autocomplete="off"
        spellcheck="false"
      />
      <button v-if="query" class="clear-btn" @click="clearSearch" aria-label="Clear">×</button>
    </div>

    <Transition name="drop">
      <div v-if="results.length || loading || error" class="results-panel">
        <div v-if="loading" class="results-loading">
          <span class="leaf-spin">🌿</span> Searching…
        </div>
        <div v-else-if="error" class="results-error">{{ error }}</div>
        <ul v-else class="results-list">
          <li
            v-for=\"plant in results\"
            :key=\"plant.id\"
            class=\"result-item\"
            :class=\"{ 'is-added': hasPlant(plant.id) }\"
            @click=\"selectPlant(plant)\"
          >
            <img
              v-if="plant.default_image?.thumbnail"
              :src="plant.default_image.thumbnail"
              :alt="plant.common_name"
              class="result-thumb"
            />
            <div v-else class="result-thumb result-thumb--placeholder">🌸</div>
            <div class="result-info">
              <span class="result-name">{{ plant.common_name }}</span>
              <span class="result-sci">{{ plant.scientific_name?.[0] }}</span>
            </div>
            <span v-if="hasPlant(plant.id)" class="result-badge">In garden</span>
            <span v-else class="result-add">+ Add</span>
          </li>
        </ul>
        <div v-if="!loading && results.length > 0 && hasMore" class="results-more">
          <button class="more-btn" @click="loadMore" :disabled="loadingMore">
            {{ loadingMore ? '…' : 'Load more' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { searchPlants, fetchPlantDetail, toGardenPlant, type PerenualSearchResult } from '~/composables/usePerenual'

const config = useRuntimeConfig()
const apiKey = config.public.perenualKey as string

const { addPlant, hasPlant } = useGarden()

const query = ref('')
const results = ref<PerenualSearchResult[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const page = ref(1)
const hasMore = ref(false)

let debounceTimer: ReturnType<typeof setTimeout>

function onInput() {
  clearTimeout(debounceTimer)
  error.value = ''
  if (query.value.length < 2) { results.value = []; return }
  debounceTimer = setTimeout(doSearch, 420)
}

async function doSearch() {
  if (!query.value.trim()) return
  loading.value = true
  error.value = ''
  page.value = 1
  try {
    const res = await searchPlants(query.value, apiKey, 1)
    results.value = res.data ?? []
    hasMore.value = res.current_page < res.last_page
  } catch (e: any) {
    error.value = 'Could not reach plant database. Check your API key in .env'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  loadingMore.value = true
  try {
    page.value++
    const res = await searchPlants(query.value, apiKey, page.value)
    results.value.push(...(res.data ?? []))
    hasMore.value = res.current_page < res.last_page
  } finally {
    loadingMore.value = false
  }
}

async function selectPlant(plant: PerenualSearchResult) {
  if (hasPlant(plant.id)) return
  try {
    const detail = await fetchPlantDetail(plant.id, apiKey)
    const gardenPlant = toGardenPlant(detail)
    const added = addPlant(gardenPlant)
    if (added) {
      // brief flash
      clearSearch()
    }
  } catch (e) {
    console.error('Failed to fetch plant detail', e)
  }
}

function clearSearch() {
  query.value = ''
  results.value = []
  error.value = ''
}
</script>

<style scoped>
.search-wrap { position: relative; width: 100%; max-width: 560px; }

.search-bar {
  display: flex;
  align-items: center;
  background: var(--cream);
  border: 1.5px solid var(--sage);
  border-radius: 40px;
  padding: 0 1.2rem;
  gap: .6rem;
  transition: border-color .2s, box-shadow .2s;
}
.search-bar:focus-within {
  border-color: var(--moss);
  box-shadow: 0 0 0 3px rgba(74,103,65,.12);
}

.search-icon { width: 18px; height: 18px; color: var(--sage); flex-shrink: 0; }

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
.search-input::placeholder { color: var(--sage); }

.clear-btn {
  background: none;
  border: none;
  color: var(--sage);
  font-size: 1.3rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color .15s;
}
.clear-btn:hover { color: var(--ink); }

/* ── Results panel ── */
.results-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0; right: 0;
  background: var(--cream);
  border: 1.5px solid var(--sage-lt);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 100;
  max-height: 420px;
  overflow-y: auto;
}

.results-loading, .results-error {
  padding: 1.2rem 1.4rem;
  font-size: .9rem;
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  gap: .5rem;
}
.results-error { color: #c05050; }

.leaf-spin { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.results-list { list-style: none; }

.result-item {
  display: flex;
  align-items: center;
  gap: .9rem;
  padding: .65rem 1.2rem;
  cursor: pointer;
  transition: background .15s;
  border-bottom: 1px solid var(--parchment-dk);
}
.result-item:last-child { border-bottom: none; }
.result-item:hover { background: var(--parchment-dk); }
.result-item.is-added { opacity: .6; cursor: default; }

.result-thumb {
  width: 44px; height: 44px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
  background: var(--sage-lt);
}
.result-thumb--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.result-info { flex: 1; min-width: 0; }
.result-name {
  display: block;
  font-size: .9rem;
  font-weight: 500;
  color: var(--ink);
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-sci {
  display: block;
  font-size: .78rem;
  color: var(--moss-lt);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-add {
  font-size: .78rem;
  font-weight: 500;
  color: var(--moss);
  background: var(--sage-lt);
  padding: .2rem .65rem;
  border-radius: 20px;
  flex-shrink: 0;
  transition: background .15s;
}
.result-item:hover .result-add { background: var(--sage); color: white; }

.result-badge {
  font-size: .75rem;
  color: var(--twig);
  background: #f0e6d4;
  padding: .2rem .65rem;
  border-radius: 20px;
  flex-shrink: 0;
}

.results-more {
  padding: .8rem;
  text-align: center;
  border-top: 1px solid var(--parchment-dk);
}
.more-btn {
  background: none;
  border: 1px solid var(--sage);
  border-radius: 20px;
  padding: .35rem 1.2rem;
  font-family: var(--font-body);
  font-size: .82rem;
  color: var(--moss);
  cursor: pointer;
  transition: background .15s;
}
.more-btn:hover:not(:disabled) { background: var(--sage-lt); }
.more-btn:disabled { opacity: .5; cursor: default; }

/* ── Transition ── */
.drop-enter-active, .drop-leave-active { transition: opacity .18s, transform .18s; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
