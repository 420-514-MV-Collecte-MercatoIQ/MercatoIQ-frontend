# MercatoIQ — Frontend

**European Football Performance & Financial Intelligence Web Application**  
Built with React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, Recharts, and `i18next` (English default + French toggle).

---

## Features

- **Bilingual UI (EN / FR)** with instant live language switching and locale-aware currency/date formatting (`localStorage` persisted).
- **Dual Theme (Light & Dark)** inspired by modern fintech & telemetry interfaces (`data-theme="light"` editorial canvas & `data-theme="dark"` obsidian/lime contrast).
- **Gold Analytical Engines (`/analytics/*`)**:
  - **Overview (`/dashboard`)**: Live KPIs, Gold freshness timestamp, diagonal-striped Club ROI bar chart, and interactive `/command` explorer bar.
  - **Q1 · Club Transfer ROI (`/club-roi`)**: ROI rankings, fees paid vs market value gain charts, and goal contributions per €1M.
  - **Q2 · ML U23 Scouting (`/scouting`)**: Market value vs ML fair value scatter plot and undervalue ratio rankings.
  - **Q3 · UCL vs Domestic (`/ucl-vs-domestic`)**: Diverging Goals/90 delta chart and Champions League vs domestic comparison.
  - **Q4 · Super-Subs (`/super-subs`)**: Capsule comparison of bench G+A/90 vs starter baseline and Super-Sub Score leaderboard.
- **Silver Domain CRUD (`/players`, `/players/:id`, `/transfers`)**:
  - Full search, multi-filter, paginated tables (`limit <= 100`), create/edit modals aligned with NestJS `ValidationPipe` (`forbidNonWhitelisted`), valuation trajectory chart, and delete confirmations.
- **JWT Authentication & System Console (`/login`, `/register`, `/system`)**:
  - `POST /auth/login` & `POST /auth/register`, live `GET /health` monitor, RBAC role status, and an explicit opt-in **Demo Mode** for offline preview.

---

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

The app runs on **`http://localhost:5173`** (matching the backend `CORS_ORIGIN=http://localhost:5173` default) and points to `VITE_API_BASE_URL=http://localhost:3000/api/v1`.

---

## Scripts

- `npm run dev` — Start Vite dev server on port 5173
- `npm run build` — Type-check (`tsc -b`) and build production bundle
- `npm run test -- --run` — Run Vitest unit tests
- `npm run preview` — Preview production build on port 5173
