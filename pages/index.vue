<template>
  <div class="page">

    <header class="header">
      <div class="header-inner">
        <div class="header-brand">
          <span class="brand-leaf">🌿</span>
          <div>
            <h1 class="brand-title">Bloom Calendar</h1>
            <p class="brand-sub">Plan your garden's colour year-round</p>
          </div>
        </div>

        <div class="header-right">
          <PlantSearch />
        </div>
      </div>
    </header>

    <main class="main">

      <ColourPalette v-if="plants.length > 0" class="palette-section" />

      <section class="calendar-card">
        <div class="card-header">
          <h2 class="card-title">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="title-icon">
              <rect x="3" y="4" width="14" height="13" rx="2"/>
              <path d="M3 8h14M7 2v4M13 2v4"/>
            </svg>
            Bloom Timeline
          </h2>
          <span class="plant-count">{{ plants.length }} plant{{ plants.length !== 1 ? 's' : '' }}</span>
        </div>
        <BloomCalendar />
        <CompanionFinder />
      </section>

      <aside v-if="plants.length > 0" class="garden-sidebar">
        <h2 class="sidebar-title">My Garden</h2>
        <TransitionGroup name="card" tag="div" class="plant-cards">
          <GardenPlantCard v-for="plant in plants" :key="plant.id" :plant="plant" />
        </TransitionGroup>
      </aside>

    </main>

    <footer class="footer">
      Powered by Gemini Intelligence • Cultivating Beautiful Successions. Bloom times are approximate and vary by climate &amp; cultivar.
    </footer>
  </div>
</template>

<script setup lang="ts">
const { plants, loadGarden } = useGarden()

onMounted(() => {
  loadGarden()
})
</script>

<style scoped>
/* ── Page shell ── */
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.header {
  background: var(--ink);
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-inner {
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: .9rem;
  flex-shrink: 0;
}

.brand-leaf { font-size: 2rem; }

.brand-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: #f7f3ec;
  letter-spacing: -.01em;
}
.brand-sub {
  font-size: .78rem;
  color: var(--sage);
  margin-top: .1rem;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

/* ── Main ── */
.main {
  flex: 1;
  max-width: 1340px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "palette" "calendar" "sidebar";
  gap: 1.5rem;
}

.palette-section { grid-area: palette; }

/* ── Calendar card ── */
.calendar-card {
  grid-area: calendar;
  background: var(--cream);
  border: 1px solid var(--parchment-dk);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.2rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ink);
}
.title-icon {
  width: 20px; height: 20px;
  color: var(--moss);
}

.plant-count {
  font-size: .78rem;
  color: var(--sage);
  background: var(--parchment-dk);
  padding: .25rem .75rem;
  border-radius: 20px;
}

/* ── Sidebar ── */
.garden-sidebar {
  grid-area: sidebar;
}

.sidebar-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  color: var(--ink-soft);
  margin-bottom: .8rem;
}

.plant-cards {
  display: flex;
  flex-direction: column;
  gap: .6rem;
}

/* ── Responsive layout ── */
@media (min-width: 900px) {
  .main {
    grid-template-columns: 1fr 280px;
    grid-template-areas:
      "palette  palette"
      "calendar sidebar";
    align-items: start;
  }
}

/* ── Card transitions ── */
.card-enter-active { transition: all .3s ease; }
.card-leave-active { transition: all .2s ease; }
.card-enter-from   { opacity: 0; transform: translateY(-8px); }
.card-leave-to     { opacity: 0; transform: translateY(8px); }

/* ── Footer ── */
.footer {
  text-align: center;
  padding: 1.2rem;
  font-size: .75rem;
  color: var(--sage);
  border-top: 1px solid var(--parchment-dk);
  background: var(--cream);
}
</style>
