# CO2 Food Tracker — System Architecture

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        HOSTING LAYER                         │
│                  Vercel / GitHub Pages (free)                 │
│              Static files only — no server process            │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      PWA SHELL LAYER                         │
│                                                              │
│  ┌────────────────────┐  ┌─────────────────────────────────┐ │
│  │   Service Worker   │  │  Web App Manifest               │ │
│  │   (Workbox)        │  │  (install prompt, icons, theme)  │ │
│  │                    │  └─────────────────────────────────┘ │
│  │  • Precaches app   │                                      │
│  │    shell + assets  │  ┌─────────────────────────────────┐ │
│  │  • CacheFirst for  │  │  navigator.storage.persist()    │ │
│  │    static assets   │  │  (Safari eviction mitigation)   │ │
│  │  • 100% offline    │  └─────────────────────────────────┘ │
│  │    after 1st load  │                                      │
│  └────────────────────┘                                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                         │
│                  React 18 + TypeScript (Vite)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                    PAGES / VIEWS                          ││
│  │                                                          ││
│  │  ┌───────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐  ││
│  │  │ Onboarding│ │  Food    │ │  Meal   │ │  History   │  ││
│  │  │           │ │ Explorer │ │ Builder │ │            │  ││
│  │  │ R5        │ │ R1       │ │ R2      │ │ R4         │  ││
│  │  │ One-time  │ │ Browse & │ │ Build + │ │ Calendar + │  ││
│  │  │ welcome   │ │ search   │ │ save    │ │ chart view │  ││
│  │  │ screen    │ │ 45 items │ │ meals   │ │ over time  │  ││
│  │  └───────────┘ └──────────┘ └─────────┘ └────────────┘  ││
│  │                                │                          ││
│  │                    ┌───────────┴──────────┐               ││
│  │                    │ Save to Daily        │               ││
│  │                    │ Estimate (R3)        │               ││
│  │                    │ (part of Builder)    │               ││
│  │                    └──────────────────────┘               ││
│  └──────────────────────────────────────────────────────────┘│
│                              │                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │               SHARED UI COMPONENTS                        ││
│  │                  (Tailwind CSS)                            ││
│  │                                                          ││
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            ││
│  │  │ PlateViz   │ │ CO2Badge   │ │ SwapCard   │            ││
│  │  │ CFG plate  │ │ emission + │ │ one swap   │            ││
│  │  │ proportion │ │ driving km │ │ suggestion │            ││
│  │  │ visual     │ │ equivalent │ │ per meal   │            ││
│  │  └────────────┘ └────────────┘ └────────────┘            ││
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            ││
│  │  │ FoodCard   │ │ MealChart  │ │ SearchBar  │            ││
│  │  │ item with  │ │ 7/30 day   │ │ type-ahead │            ││
│  │  │ emission   │ │ line chart │ │ filter     │            ││
│  │  │ details    │ │ (Recharts) │ │            │            ││
│  │  └────────────┘ └────────────┘ └────────────┘            ││
│  └──────────────────────────────────────────────────────────┘│
│                              │                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │               STATE MANAGEMENT                            ││
│  │              (React built-in — no Redux)                   ││
│  │                                                          ││
│  │  ┌────────────────────┐  ┌───────────────────────┐       ││
│  │  │  useMealBuilder    │  │  useLocalStorage      │       ││
│  │  │  (useReducer)      │  │  (custom hook)        │       ││
│  │  │                    │  │                       │       ││
│  │  │  Actions:          │  │  • Read/write saved   │       ││
│  │  │  • ADD_ITEM        │  │    meals from         │       ││
│  │  │  • REMOVE_ITEM     │  │    localStorage       │       ││
│  │  │  • SET_PORTIONS    │  │  • Auto-sync on       │       ││
│  │  │  • CLEAR_MEAL      │  │    state change       │       ││
│  │  │  • SET_LABEL       │  │  • JSON parse/        │       ││
│  │  │                    │  │    stringify           │       ││
│  │  │  Derived:          │  │                       │       ││
│  │  │  • total CO2e      │  └───────────────────────┘       ││
│  │  │  • driving km      │                                   ││
│  │  │  • plate balance   │  ┌───────────────────────┐       ││
│  │  │  • swap suggestion │  │  Component-local      │       ││
│  │  └────────────────────┘  │  useState             │       ││
│  │                          │                       │       ││
│  │                          │  • Sort order          │       ││
│  │                          │  • Search query        │       ││
│  │                          │  • Active tab/filter   │       ││
│  │                          │  • Onboarding shown    │       ││
│  │                          └───────────────────────┘       ││
│  └──────────────────────────────────────────────────────────┘│
│                              │                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                    DATA LAYER                             ││
│  │                                                          ││
│  │  ┌────────────────────┐  ┌───────────────────────┐       ││
│  │  │  Static Food Data  │  │  localStorage         │       ││
│  │  │  (TypeScript module)│  │  (browser API)        │       ││
│  │  │                    │  │                       │       ││
│  │  │  • 45 FoodItem     │  │  Keys:                │       ││
│  │  │    objects          │  │  • meals: Meal[]      │       ││
│  │  │  • Immutable       │  │  • onboarding_seen    │       ││
│  │  │  • Bundled with    │  │  • storage_persisted  │       ││
│  │  │    app (~5 KB)     │  │                       │       ││
│  │  │  • Zero network    │  │  Total: ~200 KB max   │       ││
│  │  │    requests        │  │  (well under 5 MB)    │       ││
│  │  └────────────────────┘  └───────────────────────┘       ││
│  │                                                          ││
│  │  ┌──────────────────────────────────────────────────┐     ││
│  │  │  Utility Functions                                │     ││
│  │  │  • emissions.ts — CO2 calculation helpers         │     ││
│  │  │  • equivalents.ts — driving km conversion         │     ││
│  │  │  • swap.ts — single swap rule logic               │     ││
│  │  │  • backup.ts — JSON export/import for durability  │     ││
│  │  └──────────────────────────────────────────────────┘     ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Key Architecture Decisions

### 2a. No Redux — React Built-in State Only

**Decision:** Use `useReducer` + `useState` + `useContext` (if needed). No Redux.

**Rationale:**

| Factor | Redux | React built-in |
|--------|-------|----------------|
| State complexity | Overkill — state is a meal array + saved meals | `useReducer` handles meal builder cleanly |
| Boilerplate | Actions, reducers, store, selectors, types | One reducer, a few hooks |
| Bundle size | redux + react-redux ≈ 11 KB gzipped | Zero — already in React |
| Learning curve | Higher for contributors unfamiliar with Redux | Standard React knowledge |
| DevTools | Redux DevTools (nice but unnecessary here) | React DevTools sufficient |
| Async side effects | Needs thunks/sagas for async | `useEffect` handles localStorage sync |

**State inventory for the entire app:**

```
In-memory (lost on refresh, that's fine):
  • currentMeal: MealItem[]     → useReducer (meal builder)
  • mealLabel: string | null    → useState (builder page)
  • searchQuery: string         → useState (explorer page)
  • sortOrder: string           → useState (explorer page)
  • activeCategory: string      → useState (explorer page)

Persisted (survives refresh):
  • savedMeals: Meal[]          → useLocalStorage hook
  • onboardingSeen: boolean     → useLocalStorage hook
```

That's it. Two persisted keys and a handful of component-local state variables. Redux
would be structural overhead for no functional gain. If post-MVP the state graph grows
(user preferences, 100+ items with filters, cloud sync state), revisit then.

**When to reconsider:** If three or more unrelated components need to read/write the
same state and prop drilling becomes unwieldy, introduce a single `useContext` provider
for shared state before reaching for Redux. For this MVP, that threshold won't be hit —
the component tree is shallow (4 pages, ~6 shared components).

---

### 2b. localStorage, Not IndexedDB (No Dexie.js)

**Decision:** Use `localStorage` with a custom `useLocalStorage` hook. Drop Dexie.js.

**Rationale:**

React has **no persistence mechanism**. `useState`, `useReducer`, `useContext` are all
in-memory — gone on page refresh. So persistence requires a browser storage API. The
question is which one.

| Factor | localStorage | IndexedDB (via Dexie.js) |
|--------|-------------|--------------------------|
| Data volume for MVP | ~200 KB (well under 5 MB limit) | Same data, same volume |
| API complexity | `JSON.parse(localStorage.getItem(key))` | Requires Dexie.js wrapper to be usable; raw IndexedDB API is notoriously painful |
| Dependencies added | **Zero** | Dexie.js ~16 KB gzipped |
| Synchronous | Yes — fine for <1 MB reads | Async-only (IndexedDB is async) |
| Structured queries | No, but unnecessary for this data | Yes, but unnecessary for this data |
| Safari 7-day eviction | **Affected** | **Equally affected** |
| Migration cost | Negligible (change hook implementation) | — |

**Critical point on Safari eviction:** The v2 requirements cite Safari's IndexedDB
eviction policy as a reason for using Dexie.js. This is incorrect — Safari's
Intelligent Tracking Prevention evicts **all** client-side storage (localStorage,
IndexedDB, cookies, cache) after 7 days of user inactivity for a given site. IndexedDB
offers no durability advantage over localStorage here. The actual mitigation is the
JSON backup/restore feature, which works identically regardless of storage backend.

**When would we need IndexedDB?**

- v1.1: 100+ food items with complex filtering → still fine in localStorage
- v2.0: Nutritional data with cross-field queries → consider migration
- v3.0: Cloud sync with conflict resolution → definitely IndexedDB or a sync library

The migration path is clean: swap the `useLocalStorage` hook internals for Dexie.js
calls. The rest of the app doesn't change because it only interacts with the hook.

---

### 2c. Static Data as TypeScript Module, Not Database

**Decision:** The 45 food items are a hardcoded TypeScript array, not stored in
localStorage or IndexedDB.

**Rationale:**

```
foods.ts — ships as part of the JS bundle

export const FOODS: FoodItem[] = [
  { id: "potato", name: "Potatoes", category: "vegetables_fruits", ... },
  { id: "beef", name: "Beef", category: "protein", ... },
  // ... 45 items total
];
```

- **Bundle size:** 45 items × ~200 bytes each ≈ 9 KB raw, ~3 KB gzipped. Trivial.
- **Zero async:** Imported synchronously at build time. No loading states, no race
  conditions, no "data not ready" edge cases.
- **Type-safe:** TypeScript enforces the `FoodItem` shape at compile time.
- **Immutable:** The data never changes at runtime. Users don't edit it.
- **Versionable:** Changes to emission data ship with app updates (git diff visible).
- **Searchable:** Simple `Array.filter()` on the imported array. No query engine needed.

**What goes in localStorage:** Only user-generated data — saved meals and preferences.
This keeps the storage footprint small and the separation of concerns clean.

---

### 2d. Routing Strategy

**Decision:** Client-side routing with a lightweight router.

**Options:**

| Option | Pros | Cons |
|--------|------|------|
| React Router v6 | Industry standard, handles nested routes | ~14 KB gzipped, more than we need |
| Wouter | 1.3 KB gzipped, hook-based, simple API | Less ecosystem, but sufficient for 4 routes |
| No router (conditional rendering) | Zero dependencies | No URL state, no back button support, no deep links |

**Recommendation:** Use a lightweight router (Wouter or React Router). The app has only
4 top-level routes, but URL-based navigation matters for:

- Back button behavior on mobile (critical for usability)
- Deep linking (share a link to the Explorer page)
- PWA "start_url" in manifest

The exact choice (React Router vs Wouter) is an implementation detail. Both work. For
MVP, the simpler option (Wouter) is slightly preferred to keep bundle size minimal.

**Routes:**

```
/             → Food Explorer (R1) — the landing page
/build        → Meal Builder (R2) + Save (R3)
/history      → History (R4)
/settings     → Backup/restore, about, data sources
```

Onboarding (R5) is a modal overlay on first visit, not a route.

---

## 3. Data Flow

### 3a. Explore → Build → Save Flow

```
  ┌──────────────┐
  │ Food Explorer │
  │    (R1)       │
  │               │
  │ Browse 45     │──── user taps "Add to Meal" ────┐
  │ static items  │                                  │
  └──────────────┘                                  ▼
                                          ┌──────────────────┐
                                          │   Meal Builder    │
                                          │      (R2)         │
                                          │                   │
                                          │ In-memory state:  │
                                          │ useMealBuilder    │
                                          │ (useReducer)      │
                                          │                   │
                                          │ • items[]         │
                                          │ • total CO2e      │
                                          │ • plate balance   │
                                          │ • swap suggestion │
                                          │                   │
                                          │ [Save to Today]   │
                                          └────────┬──────────┘
                                                   │
                                          user taps "Save"
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  useLocalStorage  │
                                          │                   │
                                          │  meals key:       │
                                          │  [...existing,    │
                                          │   newMeal]        │
                                          │                   │
                                          │  localStorage     │
                                          │  .setItem(        │
                                          │    "meals",       │
                                          │    JSON.stringify) │
                                          └────────┬──────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │     History       │
                                          │      (R4)         │
                                          │                   │
                                          │  Reads meals from │
                                          │  useLocalStorage  │
                                          │                   │
                                          │  Groups by date   │
                                          │  → DailyEstimate  │
                                          │  (derived, not    │
                                          │   stored)         │
                                          └──────────────────┘
```

### 3b. Swap Suggestion Flow

```
  useMealBuilder state
         │
         ▼
  ┌───────────────────────────┐
  │ When items[] changes:     │
  │                           │
  │ 1. Find item with highest │
  │    co2e contribution      │
  │                           │
  │ 2. Look up same-category  │
  │    items from FOODS[]     │
  │    (static data)          │
  │                           │
  │ 3. Find lowest CO2e/      │
  │    portion in category    │
  │                           │
  │ 4. If delta > 0.1 kg:     │
  │    return SwapSuggestion  │
  │    else: return null      │
  └───────────┬───────────────┘
              │
              ▼
  ┌───────────────────────────┐
  │ SwapCard component        │
  │                           │
  │ "Your highest-impact item │
  │  is Beef (2.6 kg).        │
  │  Swapping to Chicken      │
  │  would save 2.38 kg —     │
  │  like driving 10 km less."│
  └───────────────────────────┘
```

### 3c. Backup/Restore Flow

```
  Export:
  ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
  │ Settings page │ ──► │ Read all keys   │ ──► │ Trigger file │
  │ "Export Data" │     │ from localStorage│     │ download as  │
  │               │     │ → JSON blob     │     │ .json        │
  └──────────────┘     └─────────────────┘     └──────────────┘

  Import:
  ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
  │ Settings page │ ──► │ File input      │ ──► │ Validate     │
  │ "Import Data" │     │ reads .json     │     │ schema       │
  │               │     │                 │     │ → write to   │
  │               │     │                 │     │ localStorage │
  └──────────────┘     └─────────────────┘     └──────────────┘
```

---

## 4. Component Tree

```
<App>
├── <OnboardingModal />          (shows once, checks localStorage flag)
│
├── <Router>
│   ├── / → <ExplorerPage>
│   │       ├── <SearchBar />
│   │       ├── <CategoryTabs />
│   │       ├── <SortControls />
│   │       └── <FoodCard />     (× 45, filtered/sorted)
│   │           ├── CO2e badge
│   │           ├── Driving km equivalent
│   │           └── "Add to Meal" button
│   │
│   ├── /build → <BuilderPage>
│   │            ├── <MealItemList />
│   │            │   └── <MealItemRow />  (× N, with portion adjuster)
│   │            ├── <MealSummary />
│   │            │   ├── Total CO2e + driving km
│   │            │   └── <PlateViz />     (CFG plate proportions)
│   │            ├── <SwapCard />         (conditional — only if delta > 0.1)
│   │            └── <SaveMealForm />     (date picker + optional label)
│   │
│   ├── /history → <HistoryPage>
│   │              ├── <DayList />
│   │              │   └── <DaySummary /> (× N days with saved meals)
│   │              └── <TrendChart />     (Recharts line chart, 7/30 days)
│   │                  └── Reference line at 3.98 kg CO2e/day
│   │
│   └── /settings → <SettingsPage>
│                   ├── <BackupExport />
│                   ├── <BackupImport />
│                   ├── <StorageStatus />  (persist() status)
│                   └── <DataSources />    (links to all references)
│
└── <NavBar />                   (bottom nav on mobile, side nav on desktop)
```

---

## 5. Tech Stack Summary

```
┌─────────────────┬──────────────────────┬──────────────────────────────────────┐
│ Layer           │ Technology           │ Why                                  │
├─────────────────┼──────────────────────┼──────────────────────────────────────┤
│ Language        │ TypeScript           │ Type safety for data model, catch    │
│                 │                      │ errors at compile time               │
├─────────────────┼──────────────────────┼──────────────────────────────────────┤
│ Framework       │ React 18 (Vite)      │ Fast HMR, tree-shaking, ESM-native  │
├─────────────────┼──────────────────────┼──────────────────────────────────────┤
│ State (in-mem)  │ useReducer + useState│ Built-in, zero dependencies,        │
│                 │                      │ sufficient for this state graph      │
├─────────────────┼──────────────────────┼──────────────────────────────────────┤
│ Persistence     │ localStorage         │ Zero deps, sync API, ~200 KB data   │
│                 │ (custom hook)        │ is well under 5 MB limit            │
├─────────────────┼──────────────────────┼──────────────────────────────────────┤
│ Routing         │ Wouter (~1.3 KB) or  │ URL state + back button support     │
│                 │ React Router v6      │ with minimal bundle cost            │
├─────────────────┼──────────────────────┼──────────────────────────────────────┤
│ Styling         │ Tailwind CSS         │ Rapid prototyping, purged in prod,  │
│                 │                      │ mobile-first utilities               │
├─────────────────┼──────────────────────┼──────────────────────────────────────┤
│ Charts          │ Recharts             │ React-native, lightweight, handles  │
│                 │                      │ 7/30 day line chart + reference line │
├─────────────────┼──────────────────────┼──────────────────────────────────────┤
│ PWA / Offline   │ Workbox              │ Service worker generation, precache │
│                 │ (vite-plugin-pwa)    │ manifest, CacheFirst strategy       │
├─────────────────┼──────────────────────┼──────────────────────────────────────┤
│ Testing         │ Vitest + RTL         │ Matches Vite ecosystem, fast,       │
│                 │                      │ component + hook tests              │
├─────────────────┼──────────────────────┼──────────────────────────────────────┤
│ Hosting         │ Vercel or            │ Free tier, zero-config for Vite,    │
│                 │ GitHub Pages         │ HTTPS included, CDN                  │
└─────────────────┴──────────────────────┴──────────────────────────────────────┘
```

---

## 6. Bundle Size Budget

Target: **< 50 KB gzipped** for first meaningful paint (NFR from requirements).

| Asset | Estimated Size (gzipped) |
|-------|-------------------------|
| React + ReactDOM | ~42 KB |
| Wouter | ~1.3 KB |
| Tailwind (purged) | ~8 KB |
| App code + food data | ~10 KB |
| **Subtotal (critical path)** | **~61 KB** |
| Recharts (lazy loaded) | ~45 KB (loaded on /history only) |
| Workbox runtime | ~5 KB |

**Mitigation for the 61 KB critical path exceeding 50 KB target:**

- React 18 + ReactDOM is the largest chunk. Alternatives (Preact ~4 KB) could cut
  this dramatically, but at the cost of ecosystem compatibility. **Recommendation:**
  Start with React. If bundle size is a real problem after build, swap to Preact
  via the `@preact/compat` alias (zero code changes needed with Vite config).
- Recharts is code-split and lazy-loaded — only fetched when user navigates to History.
  It does not impact first load.

---

## 7. Offline Strategy

```
First Visit (online):
┌──────────┐     ┌──────────────┐     ┌───────────────────┐
│ Browser  │ ──► │ Vercel CDN   │ ──► │ index.html +      │
│ requests │     │              │     │ JS/CSS bundles +   │
│ app URL  │     │              │     │ manifest.json      │
└──────────┘     └──────────────┘     └─────────┬─────────┘
                                                │
                                    Service Worker installs
                                    Precaches all static assets
                                                │
                                                ▼
                                    ┌───────────────────┐
                                    │ Cache Storage:    │
                                    │ • App shell HTML  │
                                    │ • JS bundles      │
                                    │ • CSS             │
                                    │ • Icons/images    │
                                    │ • Font (if any)   │
                                    └───────────────────┘

Subsequent Visits (offline or online):
┌──────────┐     ┌──────────────┐     ┌───────────────────┐
│ Browser  │ ──► │ Service      │ ──► │ Serve from cache  │
│ requests │     │ Worker       │     │ (CacheFirst)      │
│ app URL  │     │ intercepts   │     │                   │
└──────────┘     └──────────────┘     └───────────────────┘
                                                │
                                    If online: check for updates
                                    in background → update cache
                                    → notify user "Update available"
```

**Zero network requests after first load.** All 45 food items are bundled in the JS.
Saved meals are in localStorage. No API calls ever.

---

## 8. What This Architecture Does NOT Include (and Why)

| Excluded | Rationale |
|----------|-----------|
| Backend / API server | All data is static + local. No user accounts. No server = no cost, no downtime, no security surface. |
| Database (PostgreSQL, Firebase, etc.) | localStorage handles ~200 KB of user data. No multi-device sync in MVP. |
| Redux / Zustand / Jotai | State graph is too simple to justify. Two persisted keys + a reducer. |
| IndexedDB / Dexie.js | localStorage is sufficient for this data volume. Safari eviction affects both equally. |
| CSS-in-JS (styled-components, Emotion) | Tailwind is faster to prototype, smaller output, no runtime overhead. |
| Server-side rendering (Next.js) | No SEO needs (it's a tool, not content). Vite SPA is simpler and fully offline. |
| CI/CD pipeline | Out of scope for architecture doc. Standard Vercel/GH Pages auto-deploy from main branch. |

---

## 9. Migration Paths (Post-MVP)

These are not planned work — they're architectural escape hatches to confirm we're not
painting ourselves into a corner.

| If we need... | Migration path | Effort |
|---------------|---------------|--------|
| More than 5 MB storage | Swap `useLocalStorage` internals to IndexedDB (Dexie.js). App code unchanged — only the hook changes. | Low |
| Global state sharing | Add a `MealsContext` provider wrapping the app. No library needed. | Low |
| Smaller bundle | Alias React → Preact via Vite config (`@preact/compat`). Zero code changes. | Low |
| Cloud sync | Add Supabase or Firebase with a sync layer. Requires auth. Major feature. | High |
| Server rendering / SEO | Migrate to Next.js or Remix. Significant restructuring. | High |

None of these migrations require rewriting the component tree, data model, or business
logic. The architecture is intentionally decoupled at the boundaries (hooks for storage,
static module for food data, standard React for UI) so that infrastructure can change
without application code changing.
