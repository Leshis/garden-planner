<template>
  <div class="calendar-wrap">
    <div class="cal-grid">
      <div class="cal-label-col"></div>
      <div
        v-for="(month, i) in MONTHS"
        :key="month"
        class="cal-month-head"
        :class="{ 'is-current': i + 1 === currentMonth }"
      >
        <span class="month-abbr">{{ month.slice(0,3) }}</span>
        <span class="month-full">{{ month }}</span>
      </div>
    </div>

    <div v-if="plants.length === 0" class="empty-state">
      <div class="empty-icon">🌱</div>
      <p>Add plants above to see your bloom calendar</p>
    </div>

    <TransitionGroup name="row" tag="div">
      <div
        v-for="plant in plants"
        :key="plant.id"
        class="cal-grid plant-row"
      >
        <div class="cal-label-col plant-label">
          <img
            v-if="plant.image"
            :src="plant.image"
            :alt="plant.common_name"
            class="plant-thumb"
          />
          <div v-else class="plant-thumb plant-thumb--empty">🌸</div>
          <div class="plant-meta">
            <span class="plant-name" :title="plant.common_name">
              {{ plant.nickname || plant.common_name }}
            </span>
            <span class="plant-sci">{{ plant.scientific_name }}</span>
          </div>
          <button class="remove-btn" @click="removePlant(plant.id)" title="Remove">×</button>
        </div>

        <div
          v-for="(_, mi) in MONTHS"
          :key="mi"
          class="cal-cell"
          :class="{ 'is-current-col': mi + 1 === currentMonth }"
        >
          <div
            v-if="plant.bloom_months.includes(mi + 1)"
            class="bloom-bar"
            :style="[bloomBarStyle(plant, mi), { background: getBarBackground(plant.hex_colours) }]"
            :title="plant.common_name + ' blooms - ' + (plant.flower_color ?? 'unknown colour')"
          ></div>
          <div v-else class="no-bloom"></div>
        </div>
      </div>
    </TransitionGroup>

    <div v-if="plants.length > 0" class="cal-grid coverage-row">
      <div class="cal-label-col coverage-label">
        <span>Coverage</span>
      </div>
      <div
        v-for="(month, mi) in MONTHS"
        :key="month"
        class="cal-cell coverage-cell"
        :title="`${monthCoverage[mi+1].length} plant(s) blooming in ${month}`"
      >
        <div
          class="coverage-bar"
          :style="coverageStyle(mi + 1)"
        ></div>
        <span class="coverage-count">{{ monthCoverage[mi+1].length }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GardenPlant } from '~/composables/usePerenual'

const { plants, removePlant, monthCoverage } = useGarden()

const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December']

const currentMonth = new Date().getMonth() + 1

// Helper to determine the single bar color look dynamically
function getBarBackground(colours: string[]): string {
  if (!colours || colours.length === 0) return 'var(--sage)'
  
  // If the plant has multiple color variants selected, we blend them into ONE single bar layout
  if (colours.length > 1) {
    const stopPercentage = 100 / colours.length
    const gradientStops = colours.map((color, index) => {
      return `${color} ${index * stopPercentage}%, ${color} ${(index + 1) * stopPercentage}%`
    }).join(', ')
    return `linear-gradient(to right, ${gradientStops})`
  }
  
  // Default fallback for single color variant selections
  return colours[0]
}

function bloomBarStyle(plant: GardenPlant, monthIndex: number) {
  const month = monthIndex + 1
  const blooms = plant.bloom_months
  const isFirst = !blooms.includes(month - 1)
  const isLast  = !blooms.includes(month + 1)
  return {
    borderRadius: [
      isFirst ? '6px' : '0',
      isLast  ? '6px' : '0',
      isLast  ? '6px' : '0',
      isFirst ? '6px' : '0',
    ].join(' '),
    marginLeft:  isFirst ? '4px' : '0',
    marginRight: isLast  ? '4px' : '0',
  }
}

function coverageStyle(month: number) {
  const count = monthCoverage.value[month].length
  const max   = Math.max(...Object.values(monthCoverage.value).map(arr => arr.length), 1)
  const pct   = count / max

  const r = Math.round(74  + (194 - 74)  * (1 - pct))
  const g = Math.round(103 + (212 - 103) * (1 - pct))
  const b = Math.round(65  + (188 - 65)  * (1 - pct))
  return {
    height: `${Math.max(pct * 100, count > 0 ? 15 : 0)}%`,
    background: count > 0 ? `rgb(${r},${g},${b})` : 'transparent',
  }
}
</script>

<style scoped>
/* ==========================================================================
   1. MOBILE PRIMITIVE STYLES (Default / Base Layout)
   ========================================================================== */

.calendar-wrap {
  padding: 1rem 0;
}

.plant-row {
  border: 1px solid var(--parchment-dk);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plant-label {
  display: flex;
  align-items: center;
  gap: .75rem;
  width: 100%;
}

.plant-thumb {
  width: 44px; 
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--sage-lt);
}
.plant-thumb--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.plant-meta {
  flex: 1;
  min-width: 0;
}
.plant-name {
  display: block;
  font-size: .95rem;
  font-weight: 600;
  color: var(--ink);
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.plant-sci {
  display: block;
  font-size: .75rem;
  color: var(--moss-lt);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--sage);
  font-size: 1.5rem;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
  padding: .2rem .5rem;
  transition: color .15s;
}
.remove-btn:hover { color: #c05050; }

.plant-row .cal-cell {
  display: inline-flex;
  height: auto;
  position: relative;
}

.plant-row .no-bloom {
  display: none;
}

/* Single clean tag bar layout adjustments */
.bloom-bar {
  display: flex;
  width: 100%;
  height: 20px;
  border-radius: 12px !important; 
  margin: 0 !important;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.bloom-bar:hover { filter: brightness(1.08); cursor: default; }

.cal-month-head,
.coverage-row {
  display: none;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--sage);
}
.empty-icon {
  font-size: 2.5rem;
  margin-bottom: .6rem;
  display: block;
}
.empty-state p {
  font-size: .95rem;
  font-style: italic;
}

.row-enter-active { transition: all .35s cubic-bezier(.25,.8,.25,1); }
.row-leave-active { transition: all .2s ease; }
.row-enter-from { opacity: 0; transform: translateX(-12px); }
.row-leave-to   { opacity: 0; transform: translateX(12px); }


/* ==========================================================================
   2. DESKTOP BREAKPOINT (Enforces Timeline Grid)
   ========================================================================== */

@media (min-width: 870px) {
  .calendar-wrap {
    overflow-x: auto;
    padding-bottom: .5rem;
  }

  .cal-grid {
    display: grid;
    grid-template-columns: 190px repeat(12, minmax(56px, 1fr));
    min-width: 870px;
    align-items: center;
  }

  .plant-row {
    border: none;
    border-top: 1px solid var(--parchment-dk);
    border-radius: 0;
    padding: .35rem 0;
    margin-bottom: 0;
    background: transparent;
    display: grid; 
    gap: 0;
  }

  .plant-label {
    padding-right: 1rem;
    width: auto;
  }

  .plant-thumb {
    width: 36px;
    height: 36px;
    border-radius: 6px;
  }

  .plant-name { font-size: .82rem; font-weight: 500; }
  .plant-sci { font-size: .7rem; }
  .remove-btn { font-size: 1.2rem; padding: 0 .2rem; }

  .cal-month-head {
    display: block;
    text-align: center;
    padding: .4rem .1rem .7rem;
    font-size: .72rem;
    font-weight: 500;
    color: var(--moss-lt);
    letter-spacing: .04em;
    text-transform: uppercase;
    position: relative;
  }
  .cal-month-head.is-current {
    color: var(--moss);
    font-weight: 600;
  }
  .cal-month-head.is-current::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%; transform: translateX(-50%);
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--gold);
  }

  .month-full { display: none; }
  .month-abbr { display: inline; }

  .plant-row .cal-cell {
    display: block;
    height: 40px;
  }
  .cal-cell.is-current-col {
    background: rgba(197,149,74,.06);
  }

  .plant-row .no-bloom {
    display: block;
    height: 100%;
  }

  /* Desktop-specific layout bar optimization */
  .bloom-bar {
    position: absolute;
    inset: 13px 0;
    height: 14px;
    border-radius: 0 !important;
  }

  .coverage-row {
    display: grid;
    border-top: 2px solid var(--parchment-dk);
    margin-top: .4rem;
    padding-top: .3rem;
  }

  .coverage-label {
    display: block;
    font-size: .72rem;
    font-weight: 500;
    color: var(--sage);
    text-transform: uppercase;
    letter-spacing: .06em;
    padding-right: 1rem;
  }

  .coverage-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    padding-bottom: 4px;
    height: 44px;
  }

  .coverage-bar {
    width: 70%;
    border-radius: 3px 3px 0 0;
    transition: height .4s ease, background .4s ease;
    min-height: 0;
  }

  .coverage-count {
    font-size: .68rem;
    color: var(--moss-lt);
    font-weight: 500;
  }
}

/* ==========================================================================
   3. LARGE SCREEN EXTRA ENHANCEMENTS
   ========================================================================== */
@media (min-width: 1200px) {
  .month-full { display: inline; }
  .month-abbr { display: none; }
}
</style>
