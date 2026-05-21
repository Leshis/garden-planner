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
            :style="bloomBarStyle(plant, mi)"
            :title="plant.common_name + ' blooms - ' + (plant.flower_color ?? 'unknown colour')"
          >
            <div
              v-for="(hex, ci) in plant.hex_colours"
              :key="ci"
              class="colour-stripe"
              :style="{ background: hex }"
            ></div>
          </div>
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

  // Blend from sage-lt → moss based on density
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

/* On mobile, rows behave like stacked individual cards instead of grid rows */
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

/* Plant label layout adjustments for mobile */
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

/* Mobile Month Container: Converts cells into small inline tags */
.plant-row .cal-cell {
  display: inline-flex;
  height: auto;
  position: relative;
}

/* Hide empty months on mobile to save vertical space */
.plant-row .no-bloom {
  display: none;
}

/* Make bloom bars look like pill tags on mobile */
.bloom-bar {
  display: flex;
  width: 100%;
  height: 24px;
  border-radius: 12px !important; /* Force pill shape on mobile */
  margin: 0 !important;
  overflow: hidden;
  position: relative;
}
.bloom-bar:hover { filter: brightness(1.08); cursor: default; }

.colour-stripe {
  flex: 1;
  min-width: 3px;
}

/* Hide complex global headers/coverage on mobile devices */
.cal-month-head,
.coverage-row {
  display: none;
}

/* Empty State */
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

/* Row animations */
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

  /* Reactivate structural timeline grid */
  .cal-grid {
    display: grid;
    grid-template-columns: 190px repeat(12, minmax(56px, 1fr));
    min-width: 870px;
    align-items: center;
  }

  /* Reset row styling from card layout back to inline grid rows */
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

  /* Restore desktop calendar layout */
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

  /* Month Name Text Responsiveness */
  .month-full { display: none; }
  .month-abbr { display: inline; }

  .plant-row .cal-cell {
    display: block;
    height: 40px;
  }
  .cal-cell.is-current-col {
    background: rgba(197,149,74,.06);
  }

  /* Bring back structural grid logic for non-blooming periods */
  .plant-row .no-bloom {
    display: block;
    height: 100%;
  }

  /* Revert bloom bars to continuous line segments */
  .bloom-bar {
    position: absolute;
    inset: 6px 0;
    height: auto;
  }

  /* Reactivate coverage system */
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
