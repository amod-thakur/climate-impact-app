# CO2 Food Tracker — In-Progress Status

**Branch:** `claude/implement-pwa-offline-Y5wcd`
**Last updated:** 2026-01-27
**Last commit:** (pending) — T-25..T-27: Implement Epic 6 PWA & Offline

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

### Epic 5: Settings & Data Durability (T-21 through T-24) — DONE
- **T-21 — Settings page layout** (`src/pages/SettingsPage.tsx`): Backup, Restore, Storage, About/Sources sections; all 11 data sources from REQUIREMENTS.md §14 linked (target=_blank); app version displayed
- **T-22 — JSON export** (in SettingsPage): "Export my data" button; uses `exportData()` + `triggerDownload()` from backup.ts; file named `co2-tracker-backup-YYYY-MM-DD.json`; confirmation message on success
- **T-23 — JSON import** (in SettingsPage): File picker (`.json`); `parseBackup()` validates and previews (meal count, date count, export date); merge-with-existing vs replace-existing options; error handling for invalid files; added `mergeData()` to backup.ts for deduplication by meal id
- **T-24 — Storage persistence** (in SettingsPage): `navigator.storage.persist()` called on first launch via `useStoragePersistence` hook; dismissible warning banner if denied; `storage_persisted` and `storage_banner_dismissed` flags in localStorage; handles browsers without `persist()` support

### Epic 6: PWA & Offline (T-25 through T-27) — DONE
- **T-25 — Configure vite-plugin-pwa + Workbox** (`vite.config.ts`): Installed `vite-plugin-pwa@1.2.0`; Workbox configured with CacheFirst strategy for app-shell; precaches all static assets (JS, CSS, HTML, icons, manifest); service worker disabled in dev mode; auto-update registration type
- **T-26 — Web app manifest** (`public/manifest.json`): Created manifest with app name, short name, description, standalone display mode, theme color (#16a34a), background color (#ffffff), start_url (/), icons (192x192, 512x512); generated PNG icons from SVG using sharp library; updated index.html with manifest link, theme-color meta tag, apple-touch-icon, and description meta tag
- **T-27 — Offline verification** Build tested successfully; service worker generated with 10 precached entries (635.09 KiB total); all 169 tests passing; ESLint clean; app shell and static assets cached for offline use

---

## Remaining Work

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
- 169 tests passing across 14 test files
- `npm run lint` — clean
- `npm run build` — clean (2 chunks, HistoryChart in separate chunk)

### localStorage Keys
| Key | Type | Purpose |
|-----|------|---------|
| `co2-tracker-meals` | `Meal[]` | All saved meal estimates |
| `onboarding_seen` | `boolean` | Whether onboarding modal was dismissed |
| `storage_persisted` | `boolean` | Whether `navigator.storage.persist()` was granted |
| `storage_banner_dismissed` | `boolean` | Whether user dismissed the storage warning banner |

### Backup Utility Functions (`src/utils/backup.ts`)
- `exportData(): string` — exports all meals as JSON string
- `parseBackup(json: string): BackupPreview | null` — validates and returns preview info (meal count, date count)
- `importData(json: string): boolean` — validates and imports backup JSON (replace mode)
- `mergeData(json: string): boolean` — validates and merges backup with existing data (dedup by meal id)
- `triggerDownload(json: string, filename: string): void` — triggers browser file download

---

## Notes for Next Session
1. **Start with Epic 7** (T-28 → T-32) — Quality & Polish
2. Epic 6 is fully complete — PWA configured with service worker, manifest, and icons
3. PWA features implemented:
   - Service worker with Workbox precaching (10 entries, 635 KiB)
   - CacheFirst strategy for app shell
   - Manifest with 192x192 and 512x512 PNG icons (theme color #16a34a)
   - All static assets cached for offline use
4. All 169 tests passing, ESLint clean, build successful
5. Generated files: `generate-icons.mjs` (icon generation script), `public/` directory with manifest and icons
