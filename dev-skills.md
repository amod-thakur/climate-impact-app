# CO2 Food Tracker — Development Guidelines

## Design Principles

### SOLID
- **Single Responsibility**: Each module/component has one clear purpose. Hooks manage state, utils handle calculations, components render UI.
- **Open/Closed**: Components accept props for extension; data layer uses generic hooks (`useLocalStorage<T>`) for new storage keys without modification.
- **Liskov Substitution**: All `FoodItem` variants (veg, grains, protein) satisfy the same interface — no special-casing by type.
- **Interface Segregation**: Props are minimal and focused. No god-objects passed through the tree.
- **Dependency Inversion**: Business logic (utils, hooks) depends on TypeScript interfaces, not concrete implementations. Components consume hooks, not raw `localStorage` calls.

### Code Quality Standards
- **Readability**: Self-documenting function names, explicit types, no abbreviations. Comments explain *why*, not *what*.
- **Maintainability**: Flat module structure, co-located tests, single source of truth for types (`src/types.ts`).
- **Scalability**: Static data as a typed module (swappable for API later). Storage behind a hook abstraction (swappable for IndexedDB later).
- **Extensibility**: Adding a new food item = one object in `foods.ts`. Adding a new route = one entry in the router config.

### Security
- No `dangerouslySetInnerHTML` usage
- JSON import validates schema before writing to localStorage (no arbitrary code execution)
- All external links use `rel="noopener noreferrer"` with `target="_blank"`
- No eval, no inline scripts, no dynamic require/import from user input
- CSP-friendly: no inline styles via `style` attribute for dynamic user content
- Data source URLs are hardcoded constants (not user-editable)

### Performance
- No memory leaks: cleanup in `useEffect` return functions, no orphaned event listeners
- No excessive re-renders: memoize derived state, use `React.memo` only where measured
- Lazy-load Recharts (only on `/history` route)
- Static food data imported at build time (zero async, zero loading states)
- Tailwind CSS purged in production
- Bundle budget: < 70 KB gzipped critical path

### Responsiveness
- Mobile-first design (Tailwind `sm:`, `md:`, `lg:` breakpoints)
- Touch targets >= 44x44px (WCAG)
- No horizontal scroll at 320px viewport width
- Bottom nav on mobile (< 768px), side nav on desktop (>= 768px)
- Fluid typography and spacing

---

## Testing Strategy

### Philosophy
- **TDD**: Write failing tests first, then implement to pass
- **No mocks for unit tests**: Test real logic with real data structures
- **Three layers**: Unit → Integration → E2E

### Unit Tests
- **Scope**: Individual functions, hooks, and pure components in isolation
- **Tools**: Vitest + React Testing Library
- **Pattern**: `*.test.ts` / `*.test.tsx` co-located with source files
- **Coverage target**: 90%+ for hooks and utils, 80%+ for components
- **No mocking** of internal modules; use real implementations
- Test edge cases: empty arrays, boundary values (0.5 and 5 portions), invalid JSON

### Integration Tests
- **Scope**: Multi-component interactions and user flows
- **Tools**: Vitest + React Testing Library with `@testing-library/user-event`
- **Flows tested**:
  1. Explorer → add item → Builder shows item
  2. Build meal → adjust portions → total updates
  3. Build meal → save → appears in History
  4. Export data → import data → meals restored
  5. First visit → onboarding shows → dismiss → doesn't show again
- Use `localStorage` directly (not mocked) via jsdom environment

### E2E Tests
- **Scope**: Full app flows in a real browser
- **Tools**: Playwright
- **Flows**: Critical path — onboarding → explore → build → save → history
- **Devices**: Mobile (375px) and desktop (1280px) viewports
- **Run**: Before merge to main branch

### Test Naming Convention
```
describe('[ModuleName]', () => {
  it('should [expected behavior] when [condition]', () => {
    // Arrange → Act → Assert
  });
});
```

---

## Branching Strategy

### Branch Naming
```
claude/<ticket-id>-<short-description>-<session-id>
```
Example: `claude/t-01-scaffold-vite-react-ts-ccHIG`

### Workflow
1. Create a feature branch from the default development branch
2. Implement the ticket on the feature branch
3. Write and pass all tests on the feature branch
4. Validate: `npm run lint && npm test && npm run build`
5. Merge to the default branch only after all validations pass
6. Delete the feature branch after merge

### Default Development Branch
```
claude/implement-foundation-epic-ccHIG
```

### Rules
- One branch per ticket
- No direct commits to the default branch (merge only)
- Each branch must pass all tests independently before merge
- Commit messages reference the ticket: `T-01: Scaffold Vite + React + TypeScript`

---

## Project Structure

```
src/
├── components/          # Shared UI components (NavBar, CO2Badge, FoodCard, etc.)
│   └── __tests__/       # Component tests (co-located alternative: *.test.tsx next to source)
├── pages/               # Route-level page components
│   ├── ExplorerPage.tsx
│   ├── BuilderPage.tsx
│   ├── HistoryPage.tsx
│   └── SettingsPage.tsx
├── hooks/               # Custom React hooks
│   ├── useLocalStorage.ts
│   └── useMealBuilder.ts
├── utils/               # Pure utility functions
│   ├── equivalents.ts
│   ├── swap.ts
│   └── backup.ts
├── data/                # Static data modules
│   └── foods.ts
├── types.ts             # All TypeScript interfaces and type unions
├── App.tsx              # Root component with router
├── App.test.tsx         # Smoke test
└── main.tsx             # Entry point
```

### Co-located Tests
Tests live next to their source files:
```
src/hooks/useLocalStorage.ts
src/hooks/useLocalStorage.test.ts
src/utils/equivalents.ts
src/utils/equivalents.test.ts
```

---

## Tech Stack

| Layer       | Choice             | Version |
|-------------|--------------------|---------|
| Language    | TypeScript         | 5.x     |
| Framework   | React              | 18.x    |
| Bundler     | Vite               | 6.x     |
| Styling     | Tailwind CSS       | 4.x     |
| Routing     | React Router       | 7.x     |
| State       | useReducer/useState| built-in|
| Persistence | localStorage       | built-in|
| Charts      | Recharts           | 2.x     |
| Testing     | Vitest + RTL       | latest  |
| E2E Testing | Playwright         | latest  |
| PWA         | vite-plugin-pwa    | latest  |
| Linting     | ESLint             | 9.x     |
| Formatting  | Prettier           | 3.x     |

---

## Commit Message Format

```
T-XX: <imperative verb> <what changed>

- Detail 1
- Detail 2
```

Examples:
```
T-01: Scaffold Vite + React + TypeScript project

- Initialize with npm create vite@latest (react-ts template)
- Enable TypeScript strict mode
- Verify dev server and production build

T-04: Set up Vitest and React Testing Library

- Configure vitest.config.ts with jsdom environment
- Add smoke test for App component
- Add test:coverage script
```
