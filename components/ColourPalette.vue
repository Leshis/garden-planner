<template>
  <div class="palette-wrap">
    <h3 class="palette-title">Colour palette by month</h3>
    <div class="palette-grid">
      <div v-for="(month, mi) in MONTHS" :key="month" class="month-col">
        <div class="month-swatches">
          <template v-if="monthCoverage[mi+1].length > 0">
            <div
              v-for="hex in uniqueHexes(mi+1)"
              :key="hex"
              class="palette-swatch"
              :style="{ background: hex }"
            ></div>
          </template>
          <div v-else class="palette-empty"></div>
        </div>
        <span class="month-label">{{ month.slice(0,1) }}</span>
        <span
          class="month-count"
          :class="{ 'has-blooms': monthCoverage[mi+1].length > 0 }"
        >{{ monthCoverage[mi+1].length }}</span>
      </div>
    </div>

    <div v-if="gaps.length > 0 && plants.length > 0" class="gaps-alert">
      <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
      </svg>
      <span>No blooms in: <strong>{{ gaps.join(', ') }}</strong></span>
    </div>
    <div v-else-if="plants.length > 0" class="gaps-success">
      <svg viewBox="0 0 20 20" fill="currentColor" class="alert-icon">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
      </svg>
      <span>Year-round coverage achieved! 🎉</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { plants, monthCoverage } = useGarden()

const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December']

function uniqueHexes(month: number): string[] {
  const all = monthCoverage.value[month].flatMap(p => p.hex_colours)
  return [...new Set(all)]
}

const gaps = computed(() =>
  MONTHS.filter((_, i) => monthCoverage.value[i+1].length === 0)
)
</script>

<style scoped>
.palette-wrap {
  background: var(--cream);
  border: 1px solid var(--parchment-dk);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
}

.palette-title {
  font-family: var(--font-display);
  font-size: .95rem;
  color: var(--ink-soft);
  margin-bottom: 1rem;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 4px;
  margin-bottom: .8rem;
}

.month-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.month-swatches {
  width: 100%;
  min-height: 48px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.palette-swatch {
  flex: 1;
  min-height: 8px;
  border-radius: 2px;
  border: 1px solid rgba(0,0,0,.07);
}

.palette-empty {
  flex: 1;
  min-height: 48px;
  background: var(--parchment-dk);
  border-radius: 2px;
  opacity: .4;
}

.month-label {
  font-size: .62rem;
  color: var(--sage);
  font-weight: 500;
  text-transform: uppercase;
}

.month-count {
  font-size: .62rem;
  color: var(--sage-lt);
}
.month-count.has-blooms {
  color: var(--moss);
  font-weight: 600;
}

/* Alerts */
.gaps-alert, .gaps-success {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .8rem;
  padding: .6rem .9rem;
  border-radius: var(--radius);
  margin-top: .5rem;
}

.gaps-alert {
  background: #fef3e2;
  color: #8a5c1e;
  border: 1px solid #f5d9a8;
}

.gaps-success {
  background: #edf5eb;
  color: var(--moss);
  border: 1px solid var(--sage-lt);
}

.alert-icon {
  width: 16px; height: 16px;
  flex-shrink: 0;
}
</style>
