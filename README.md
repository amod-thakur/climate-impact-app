# CO2 Food Tracker

Track the carbon footprint of your meals using Canadian food emission data. Built with React 19, TypeScript, and Tailwind CSS.

**Live app:** https://amod-thakur.github.io/leetcode-assistant/

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
npm install
```

### Run

```bash
npm run dev
```

Open http://localhost:5173/leetcode-assistant/ in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

### Tech Stack

- React 19 + TypeScript 5.9
- Vite 7
- Tailwind CSS 4.1
- Wouter 3.9 (routing)
- Recharts 3.7 (charts, lazy-loaded)
- Vitest + React Testing Library
- vite-plugin-pwa (offline support)

### Deployment

The app auto-deploys to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`.

To enable: go to repo **Settings > Pages > Source** and select **GitHub Actions**.
