<template>
  <div class="card" :style="{ borderLeftColor: plant.hex_colours[0] }">
    <img v-if="plant.image" :src="plant.image" :alt="plant.common_name" class="card-img" />
    <div v-else class="card-img card-img--empty">🌸</div>

    <div class="card-body">
      <div class="card-top">
        <div>
          <div class="card-name">{{ plant.common_name }}</div>
          <div class="card-sci">{{ plant.scientific_name }}</div>
        </div>
        <button class="card-remove" @click="removePlant(plant.id)" title="Remove from garden">×</button>
      </div>

      <div class="card-colours" v-if="plant.hex_colours.length">
        <div
          v-for="(hex, i) in plant.hex_colours"
          :key="i"
          class="swatch"
          :style="{ background: hex }"
          :title="plant.flower_color?.split(',')[i]?.trim()"
        ></div>
        <span class="colour-label">{{ plant.flower_color ?? 'Unknown colour' }}</span>
      </div>

      <div class="card-season" v-if="plant.flowering_season">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" class="season-icon">
          <circle cx="8" cy="8" r="3"/>
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
        </svg>
        {{ plant.flowering_season }}
      </div>
      <div v-else class="card-season card-season--unknown">Season unknown</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GardenPlant } from '~/composables/usePerenual'

defineProps<{ plant: GardenPlant }>()
const { removePlant } = useGarden()
</script>

<style scoped>
.card {
  display: flex;
  gap: .75rem;
  background: var(--cream);
  border: 1px solid var(--parchment-dk);
  border-left: 4px solid var(--sage);
  border-radius: var(--radius);
  padding: .75rem;
  transition: box-shadow .2s;
}
.card:hover { box-shadow: var(--shadow); }

.card-img {
  width: 52px; height: 52px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
  background: var(--sage-lt);
  align-self: flex-start;
}
.card-img--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-body { flex: 1; min-width: 0; }

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: .5rem;
  margin-bottom: .4rem;
}

.card-name {
  font-size: .85rem;
  font-weight: 500;
  color: var(--ink);
  text-transform: capitalize;
  line-height: 1.3;
}
.card-sci {
  font-size: .72rem;
  color: var(--moss-lt);
  font-style: italic;
}

.card-remove {
  background: none;
  border: none;
  color: var(--sage);
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  transition: color .15s;
}
.card-remove:hover { color: #c05050; }

.card-colours {
  display: flex;
  align-items: center;
  gap: .3rem;
  margin-bottom: .35rem;
}

.swatch {
  width: 14px; height: 14px;
  border-radius: 50%;
  border: 1.5px solid rgba(0,0,0,.1);
  flex-shrink: 0;
}

.colour-label {
  font-size: .72rem;
  color: var(--ink-soft);
  text-transform: capitalize;
}

.card-season {
  display: flex;
  align-items: center;
  gap: .3rem;
  font-size: .72rem;
  color: var(--moss);
  background: var(--parchment-dk);
  padding: .2rem .55rem;
  border-radius: 20px;
  width: fit-content;
  text-transform: capitalize;
}
.card-season--unknown { color: var(--sage); }

.season-icon {
  width: 12px; height: 12px;
  flex-shrink: 0;
}
</style>
