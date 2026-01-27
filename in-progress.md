# CO2 Food Tracker — In-Progress Status

**Branch:** `claude/implement-core-features-epic4-r46i3`
**Last updated:** 2026-01-27
**Last commit:** `989cd47` — T-16..T-20: Implement Epic 4 core features (R1–R5)

---

## Completed Work

### Epic 1: Project Foundation (T-01 through T-05) — DONE
- Vite + React 19 + TypeScript 5.9 scaffold
- Tailwind CSS 4.1 with custom theme variables
- Wouter 3.9 routing (4 routes: `/`, `/build`, `/history`, `/settings`)
- Vitest + React Testing Library configured
- ESLint + Prettier configured

### Epic 2: Data & State Layer (T-06 through T-10) — DONE
- TypeScript types in `src/types.ts` (FoodItem, Meal, MealItem, DailyEstimate, etc.)
- 45 food items in `src/data/foods.ts` with Canadian-specific CO2e data
- `useLocalStorage` hook for persistence
- `useMealBuilder` hook (useReducer-based meal state management)
- Utility functions: equivalents, swap algorithm, backup export/import

### Epic 3: Shared UI Components (T-11 through T-15) — DONE
- NavBar (bottom on mobile, side on desktop)
- CO2Badge (color-coded emission display with driving km equivalent)
- FoodCard (expandable food item card with "Add to Meal")
- PlateViz (Canada's Food Guide plate proportions)
- SwapCard (single swap suggestion display)

### Epic 4: Core Features (T-16 through T-20) — DONE
- **T-16 — Food Explorer page** (`src/pages/ExplorerPage.tsx`): Search, category tabs (All/Veg & Fruit/Whole Grains/Protein/Other), sort options (CO2e asc/desc, alpha, category), FoodCard list, "Add to Meal" button
- **T-17 — Meal Builder page** (`src/pages/BuilderPage.tsx`): Item list with portion selector (0.5–5), remove buttons, CO2Badge per item, total CO2e + driving km, PlateViz, SwapCard, Clear Meal
- **T-18 — Save to Daily Estimate** (in BuilderPage): Date picker, optional label with quick picks (Breakfast/Lunch/Dinner/Snack), saves to localStorage, post-save confirmation
- **T-19 — History page** (`src/pages/HistoryPage.tsx`): Daily estimates list (newest first), expandable day details, lazy-loaded Recharts line chart with 7/30 day toggle, Canadian average reference line (3.98 kg CO2e/day)
- **T-20 — Onboarding modal** (`src/components/OnboardingModal.tsx`): First-visit modal with 4 key messages, focus trap, Escape/background click dismiss, "Start Exploring" button

---

## Remaining Work

### Epic 5: Settings & Data Durability (T-21 through T-24)

#### T-21 · Settings page layout — P1
**File:** `src/pages/SettingsPage.tsx` (currently a placeholder)
**What to do:**
- Build sections: Backup, Storage, About/Sources
- Link to all data sources from REQUIREMENTS.md §14 (open in new tab)
- Display app version
- The page shell exists but only has a title and subtitle

#### T-22 · JSON export (backup) — P1
**Dependencies:** T-10 (done), T-21
**What to do:**
- Add "Export my data" button on Settings page
- Use existing `exportData()` and `triggerDownload()` from `src/utils/backup.ts`
- File named `co2-tracker-backup-YYYY-MM-DD.json`
- Functions already exist — this is primarily UI wiring

#### T-23 · JSON import (restore) — P1
**Dependencies:** T-10 (done), T-21
**What to do:**
- Add "Import data" file input on Settings page accepting `.json`
- Use existing `importData()` from `src/utils/backup.ts`
- Show preview: "This backup contains X meals from Y dates. Import?"
- Handle invalid file with clear error message
- Ask whether to merge with or replace existing data
- Note: current `importData()` replaces only — merge logic needs to be added

#### T-24 · Storage persistence request + warning — P2
**Dependencies:** T-08 (done)
**What to do:**
- Call `navigator.storage.persist()` on first launch
- If denied: show dismissible banner about using Export for backup
- Store `storage_persisted` flag in localStorage
- Handle browsers without `persist()` support

### Epic 6: PWA & Offline (T-25 through T-27)

#### T-25 · Configure vite-plugin-pwa + Workbox — P1
**What to do:**
- Install `vite-plugin-pwa`
- Configure Workbox for precaching all static assets
- CacheFirst strategy for app shell
- Disable SW in dev mode

#### T-26 · Web app manifest — P1
**What to do:**
- Create `manifest.json` (app name, icons, theme color, standalone display)
- Create placeholder icons (192x192, 512x512)
- Set start_url, theme_color, background_color

#### T-27 · Offline verification test — P2
**Dependencies:** T-25, all core features
**What to do:**
- Verify all features work offline after first load

### Epic 7: Quality & Polish (T-28 through T-32)

#### T-28 · Accessibility audit (WCAG 2.1 AA) — P1
- Keyboard navigation, focus management, color contrast, screen reader audit
- Run Axe/Lighthouse accessibility checks

#### T-29 · Mobile responsiveness pass — P1
- Verify all pages at 320px–428px
- Touch targets >= 44x44px, text >= 16px, no horizontal scroll

#### T-30 · Cross-browser testing — P2
- Chrome, Safari, Firefox, Edge (last 2 versions)

#### T-31 · Performance audit (< 3s on 3G) — P1
- Lighthouse Performance >= 90
- FCP < 2s, TTI < 3s on 3G throttling
- Critical path < 70 KB gzipped
- Recharts is already lazy-loaded (confirmed in build output as separate chunk)

#### T-32 · Integration test suite — P2
- 5 user flows: Explorer→Builder, portion adjust, save→history, export→import, onboarding
- Coverage targets: hooks + utils 90%+, pages 70%+

---

## Architecture & Key Files

### Project Structure
```
src/
├── components/          # Shared UI (NavBar, CO2Badge, FoodCard, PlateViz, SwapCard, HistoryChart, OnboardingModal)
├── context/             # MealBuilderContext.tsx + mealBuilderContextValue.ts
├── data/                # foods.ts (45 items)
├── hooks/               # useLocalStorage, useMealBuilder, useMealBuilderContext
├── pages/               # ExplorerPage, BuilderPage, HistoryPage, SettingsPage
├── utils/               # equivalents.ts, swap.ts, backup.ts
├── types.ts             # All TypeScript types
├── App.tsx              # Root: MealBuilderProvider > OnboardingModal + NavBar + Router
├── main.tsx             # Entry point
└── index.css            # Tailwind theme with custom CSS variables
```

### Key Patterns
- **State sharing:** `MealBuilderContext` wraps the app — Explorer's "Add to Meal" adds items to context, Builder reads from same context
- **Persistence:** `useLocalStorage<Meal[]>('co2-tracker-meals', [])` for saved meals
- **Onboarding:** `useLocalStorage('onboarding_seen', false)` controls modal visibility
- **Code splitting:** `HistoryChart` is lazy-loaded via `React.lazy(() => import(...))`
- **ESLint constraint:** `react-refresh/only-export-components` requires separating context object, provider component, and consumer hook into separate files

### Dependencies
- React 19.2, TypeScript 5.9, Vite 7.2
- Tailwind CSS 4.1 (with @tailwindcss/vite plugin)
- Wouter 3.9 (client-side routing)
- Recharts 3.7 (charts, lazy-loaded)
- Vitest 4.0 + @testing-library/react 16.3

### Test Status
- 139 tests passing across 13 test files
- `npm run lint` — clean
- `npm run build` — clean (2 chunks, HistoryChart in separate chunk)

### localStorage Keys
| Key | Type | Purpose |
|-----|------|---------|
| `co2-tracker-meals` | `Meal[]` | All saved meal estimates |
| `onboarding_seen` | `boolean` | Whether onboarding modal was dismissed |

### Existing Utility Functions (ready to use for Epic 5)
- `exportData(): string` — exports all meals as JSON string
- `importData(json: string): boolean` — validates and imports backup JSON
- `triggerDownload(json: string, filename: string): void` — triggers browser file download

---

## Notes for Next Session
1. **Start with Epic 5** (T-21 → T-22 + T-23 → T-24) — Settings page + backup/restore
2. `src/utils/backup.ts` already has export/import/download functions — T-22 and T-23 are mostly UI work
3. T-23 requires adding **merge vs replace** logic to `importData()` — current implementation only replaces
4. SettingsPage is a placeholder at `src/pages/SettingsPage.tsx` — needs full implementation
5. After Epic 5, proceed to Epic 6 (PWA) then Epic 7 (Quality)
6. REQUIREMENTS.md §14 has the full list of data sources to link from Settings page
