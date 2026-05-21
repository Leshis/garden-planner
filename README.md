# 🌿 Bloom Calendar

A Nuxt 3 garden planning app that shows when your plants flower and in what colours, so you can ensure year-round colour in your garden.

## Features

- **Search plants** via the [Perenual API](https://perenual.com/docs/api) (largest plant database, 300,000+ species)
- **Bloom timeline** — a 12-month calendar grid showing exactly when each plant flowers
- **Colour stripes** — flower colours rendered directly on the calendar bars
- **Coverage summary** — see which months have no flowers so you can fill the gaps
- **Colour palette view** — monthly swatch summary across your entire garden
- **Persistent** — your garden is saved to localStorage between sessions

## Quick Start

### 1. Get a free API key

Visit [perenual.com/docs/api](https://perenual.com/docs/api) and sign up for a free key (300 req/day).

### 2. Configure

```bash
cp .env.example .env
# Edit .env and paste your key:
# NUXT_PUBLIC_PERENUAL_KEY=sk-YOUR_KEY
```

### 3. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Nuxt 3** (Vue 3 + Vite under the hood)
- **Perenual API** for plant data (flower colour, blooming season)
- **localStorage** for client-side persistence
- No external UI libraries — pure CSS with botanical aesthetics

## Notes

- Bloom times are approximate and vary by climate, cultivar, and growing conditions
- The free Perenual tier covers the majority of common garden plants
- Some plants may have `null` flower colour or season — the app handles this gracefully
