# CO2 Food Tracker — MVP Requirements (v2)

## 1. Problem Statement

**Most Canadians have no idea which foods drive their carbon footprint.** Beef
has 100x the emissions of lentils, yet this information isn't visible at the
grocery store, on a menu, or in Canada's Food Guide. Without visibility, people
can't make informed choices — even when they want to.

### Who is this for?

**Primary persona:** Climate-curious Canadians who already care about the
environment but don't know where food ranks or which swaps matter most. They
are not dietitians. They are not scientists. They want a quick, credible answer
to: *"How does what I eat affect the climate?"*

**Not for (in MVP):** Professional dietitians, institutional meal planners,
anyone seeking precise caloric/nutritional tracking.

### What does success look like?

| Metric                         | Target (MVP)                           |
|--------------------------------|----------------------------------------|
| Time to first insight          | < 30 seconds from opening the app      |
| Core question answered         | "Which of my foods has the biggest impact?" |
| Return usage                   | User saves at least 3 daily estimates in first week |
| Trust                          | User can trace every number to a cited source |

---

## 2. Core Concept: Meal Estimator (not Daily Tracker)

The previous design tried to be a **daily food diary**. That requires:
- Complete food coverage (20 items isn't enough for a real day)
- Habit formation (logging every meal)
- Accuracy expectations (users expect totals to be "right")

**The redesigned MVP is a Meal Estimator with optional daily saving.**

### User Flow

```
[1. EXPLORE]           [2. BUILD]              [3. LEARN]
Browse 45 food items → Build a plate/meal   → See total CO2e impact
sorted by emissions    select items + qty      with real-world comparison
                                               + one swap suggestion
                                    ↓
                          [4. SAVE (optional)]
                          Save to daily estimate
                          View past days
```

### Why this works better

| Problem with v1              | How v2 fixes it                              |
|------------------------------|----------------------------------------------|
| 20 items too few for logging | 45 items covers ~80% of typical Canadian meals |
| Users expect complete tracking | Framed as "estimate" — incomplete is expected |
| No value until you log a full day | Value in 30 seconds via Explorer mode       |
| Abstract numbers (0.045 kg?) | Real-world equivalents on every screen        |
| Global emission data for CA app | Canadian-specific data where available        |

---

## 3. Canada's Food Guide — Plate Model

The 2019 Canada Food Guide uses a **plate proportion model** (no serving counts):

```
┌─────────────────────────────────────┐
│                                     │
│        Vegetables & Fruits          │
│            (½ plate)                │
│                                     │
├──────────────────┬──────────────────┤
│   Whole Grain    │    Protein       │
│    Foods         │     Foods        │
│  (¼ plate)       │   (¼ plate)      │
│                  │                  │
└──────────────────┴──────────────────┘
        + Water as drink of choice
```

**CFG principles applied in this app:**
- Choose plant-based protein foods more often
- Eat plenty of vegetables and fruits
- Choose whole grain foods
- Make water the drink of choice
- Limit highly processed foods

**Important design note:** The plate model is **per meal**, not per day. The
app applies plate balance evaluation at the **meal level** (when building a
plate), not at the daily aggregate level. This matches how the CFG intended
it to be used.

---

## 4. Canadian Portion Sizes

Based on Health Canada Reference Amounts (2007 guide / CFIA Schedule M):

| Category              | One Portion                                   |
|-----------------------|-----------------------------------------------|
| Vegetables (cooked)   | 125 mL (½ cup)                                |
| Vegetables (raw/leafy)| 250 mL (1 cup)                                |
| Fruit                 | 1 medium piece, or 125 mL (½ cup)             |
| Whole grains (cooked) | 125 mL (½ cup) cooked, or 1 slice bread (35 g)|
| Meat / Fish / Poultry | 75 g (2.5 oz) cooked                          |
| Legumes (cooked)      | 175 mL (¾ cup)                                |
| Tofu                  | 150 g (¾ cup)                                 |
| Eggs                  | 2 large                                       |
| Nuts / Seeds          | 60 mL (¼ cup, ~30 g)                          |
| Dairy (milk)          | 250 mL (1 cup)                                |
| Dairy (cheese)        | 50 g (1.5 oz)                                 |
| Dairy (yogurt)        | 175 g (¾ cup)                                 |

---

## 5. Food Items — 45 Items with Emission Data

### Data Source Strategy

The previous version used only global averages, which **overstate Canadian beef
by 2-3x** and don't reflect Canadian agricultural practices. This version uses
a layered approach:

| Priority | Source                                        | Used For              |
|----------|-----------------------------------------------|-----------------------|
| 1st      | Canadian LCA studies (AAFC, CFC, EFC, Holos)  | Beef, chicken, pork, eggs, dairy |
| 2nd      | Poore & Nemecek 2018 (global averages)         | Plant foods, fish, tofu |
| Fallback | Informed estimates based on similar items      | Clearly marked         |

Every item displays its data source so users can verify.

### Emission Factor Basis

All weights are **as-purchased (raw/retail)** unless otherwise noted. For meats,
the emission factor is per kg of **retail cuts** (not liveweight, not carcass
weight). This matches what users buy at the store.

### 5a. Vegetables & Fruits — 15 Items

Source: Poore & Nemecek 2018 (no Canadian-specific LCA available for most produce)

| #  | Item           | Portion (CA)       | Wt (g) | CO2e/kg | CO2e/portion | Dominant GHG    | Source |
|----|----------------|--------------------|--------|---------|--------------|-----------------|--------|
| 1  | Potatoes       | 1 medium           | 150    | 0.2     | 0.030        | CO2             | P&N    |
| 2  | Onions         | 1 medium           | 110    | 0.3     | 0.033        | CO2             | P&N    |
| 3  | Carrots        | 125 mL chopped     | 80     | 0.2     | 0.016        | CO2             | P&N    |
| 4  | Cabbage        | 125 mL shredded    | 75     | 0.3     | 0.023        | CO2             | P&N    |
| 5  | Lettuce        | 250 mL (1 cup)     | 55     | 0.4     | 0.022        | CO2             | P&N    |
| 6  | Spinach/Kale   | 125 mL cooked      | 90     | 0.5     | 0.045        | N2O             | P&N    |
| 7  | Broccoli       | 125 mL chopped     | 80     | 0.6     | 0.048        | N2O             | P&N    |
| 8  | Peppers        | 1 medium           | 120    | 0.5     | 0.060        | CO2             | P&N    |
| 9  | Tomatoes       | 1 medium           | 125    | 1.0     | 0.125        | CO2             | P&N    |
| 10 | Corn           | 1 medium cob       | 150    | 0.7     | 0.105        | N2O             | P&N    |
| 11 | Peas (green)   | 125 mL             | 80     | 0.4     | 0.032        | N2O             | P&N    |
| 12 | Apples         | 1 medium           | 180    | 0.4     | 0.072        | CO2             | P&N    |
| 13 | Bananas        | 1 medium           | 120    | 0.7     | 0.084        | CO2             | P&N    |
| 14 | Blueberries    | 125 mL             | 75     | 0.7     | 0.053        | CO2             | P&N    |
| 15 | Oranges        | 1 medium           | 130    | 0.3     | 0.039        | CO2             | P&N    |

### 5b. Whole Grain Foods — 7 Items

| #  | Item              | Portion (CA)       | Wt (g) | CO2e/kg | CO2e/portion | Dominant GHG    | Source |
|----|-------------------|--------------------|--------|---------|--------------|-----------------|--------|
| 16 | Oats              | 175 mL cooked      | 30 dry | 0.6     | 0.018        | N2O             | P&N    |
| 17 | Barley            | 125 mL cooked      | 45 dry | 0.6     | 0.027        | N2O             | P&N    |
| 18 | Quinoa            | 125 mL cooked      | 45 dry | 0.8     | 0.036        | CO2             | P&N    |
| 19 | Whole Wheat Bread | 1 slice            | 35     | 1.4     | 0.049        | N2O             | P&N    |
| 20 | Pasta (whole grain)| 125 mL cooked     | 50 dry | 1.2     | 0.060        | N2O             | P&N    |
| 21 | Corn Tortilla     | 1 medium           | 30     | 0.7     | 0.021        | N2O             | P&N    |
| 22 | Brown Rice        | 125 mL cooked      | 65 dry | 3.0     | 0.195        | **CH4**         | P&N    |

### 5c. Protein Foods — 23 Items

#### Plant-Based Protein

| #  | Item            | Portion (CA)       | Wt (g) | CO2e/kg | CO2e/portion | Dominant GHG    | Source |
|----|-----------------|--------------------|--------|---------|--------------|-----------------|--------|
| 23 | Lentils         | 175 mL cooked      | 75 dry | 0.9     | 0.068        | N2O             | P&N    |
| 24 | Black Beans     | 175 mL cooked      | 75 dry | 1.0     | 0.075        | N2O             | P&N    |
| 25 | Chickpeas       | 175 mL cooked      | 75 dry | 1.0     | 0.075        | N2O             | P&N    |
| 26 | Tofu            | 150 g              | 150    | 3.2     | 0.480        | CO2             | P&N    |
| 27 | Peanut Butter   | 30 mL (2 tbsp)     | 32     | 2.5     | 0.080        | CO2             | P&N    |
| 28 | Almonds         | 60 mL              | 30     | 0.4     | 0.012        | CO2             | P&N    |
| 29 | Seeds (mixed)   | 60 mL              | 30     | 0.5     | 0.015        | CO2             | P&N    |

#### Animal Protein — Canadian-Specific Data

| #  | Item            | Portion (CA)       | Wt (g) | CO2e/kg | CO2e/portion | Dominant GHG    | Source        |
|----|-----------------|--------------------|--------|---------|--------------|-----------------|---------------|
| 30 | Chicken         | 75 g cooked        | 100 raw| 2.2     | 0.220        | CO2, N2O        | CFC LCA 2023  |
| 31 | Turkey          | 75 g cooked        | 100 raw| 3.0     | 0.300        | CO2, N2O        | P&N (est.)    |
| 32 | Pork            | 75 g cooked        | 100 raw| 3.5     | 0.350        | CO2, N2O        | CA Pork LCA   |
| 33 | Eggs            | 2 large            | 100    | 2.4     | 0.240        | CO2, N2O        | EFC LCA 2022  |
| 34 | Salmon (farmed) | 75 g cooked        | 100 raw| 12.0    | 1.200        | CO2             | P&N           |
| 35 | White Fish (cod)| 75 g cooked        | 100 raw| 4.0     | 0.400        | CO2             | P&N           |
| 36 | Beef            | 75 g cooked        | 100 raw| 26.0    | 2.600        | **CH4**         | NBSA/Holos    |

Note: Meat portions use **100 g raw weight** (yields ~75 g cooked after ~25%
moisture loss). The emission factor applies to the raw/retail weight. This is
a correction from v1 which mixed raw and cooked weights.

#### Dairy — Canadian-Specific Data

| #  | Item            | Portion (CA)       | Wt (g) | CO2e/kg | CO2e/portion | Dominant GHG    | Source         |
|----|-----------------|--------------------|--------|---------|--------------|-----------------|----------------|
| 37 | Milk (2%)       | 250 mL             | 258    | 1.0     | 0.258        | CH4             | CA Dairy LCA   |
| 38 | Yogurt          | 175 g              | 175    | 1.4     | 0.245        | CH4             | CA Dairy LCA   |
| 39 | Cheddar Cheese  | 50 g               | 50     | 5.3     | 0.265        | CH4             | CA Dairy LCA   |
| 40 | Butter          | 15 mL (1 tbsp)     | 14     | 7.3     | 0.102        | CH4             | CA Dairy LCA   |

#### Common Additions (frequently used but missing from v1)

| #  | Item               | Portion (CA)       | Wt (g) | CO2e/kg | CO2e/portion | Dominant GHG | Source |
|----|--------------------|--------------------|--------|---------|--------------|--------------|--------|
| 41 | Cooking Oil (canola)| 15 mL (1 tbsp)   | 14     | 3.0     | 0.042        | CO2          | P&N    |
| 42 | Sugar              | 5 mL (1 tsp)      | 4      | 1.2     | 0.005        | CO2          | P&N    |
| 43 | Soy Milk           | 250 mL             | 258    | 0.7     | 0.181        | CO2          | P&N    |
| 44 | Maple Syrup        | 15 mL (1 tbsp)     | 20     | 1.3     | 0.026        | CO2          | Est.   |
| 45 | Coffee (brewed)    | 250 mL (1 cup)     | 250    | 0.06    | 0.015        | CO2          | P&N    |

### Key Corrections from v1

| Item    | v1 (Global Avg) | v2 (Canadian)  | Difference | Why                           |
|---------|-----------------|----------------|------------|-------------------------------|
| Beef    | 60.0 kg CO2e/kg | 26.0 kg CO2e/kg| **-57%**   | Canadian cattle practices, no deforestation factor |
| Chicken | 6.0             | 2.2            | **-63%**   | CFC lifecycle assessment 2023 |
| Eggs    | 4.5             | 2.4            | **-47%**   | EFC lifecycle assessment 2022 |
| Pork    | 7.0             | 3.5            | **-50%**   | Canadian pork LCA             |

These are not small differences. Using global averages would have **destroyed
credibility** with any user who follows Canadian agriculture.

---

## 6. Real-World Equivalents

Every emission number in the app is paired with a real-world comparison. Without
this, numbers like "0.045 kg CO2e" mean nothing to a normal person.

### Equivalence Scale

| CO2e Amount | Equivalent                                           |
|-------------|------------------------------------------------------|
| 0.05 kg     | Charging your phone for a month                      |
| 0.25 kg     | Driving 1 km in an average Canadian car              |
| 1.0 kg      | Driving 4 km                                         |
| 2.6 kg      | One portion of beef = driving ~10 km                 |
| 4.0 kg      | Average Canadian's daily food emissions              |
| 1,460 kg    | Average Canadian's annual food emissions (~4 kg/day) |

Source: Average Canadian car emits ~0.25 kg CO2/km (NRCan). Average Canadian
dietary emissions ~3.98 kg CO2e/person/day (Veeramani et al., 2017).

### How equivalents appear in the UI

- **On each food item:** "One portion of beef (75 g) = 2.6 kg CO2e — like driving 10 km"
- **On meal total:** "This meal = 3.2 kg CO2e — like driving from Toronto to Mississauga"
- **On daily total:** "Today's food = X kg CO2e — that's Y% of the average Canadian's daily food footprint"

The driving comparison works because most Canadians drive and intuitively
understand distance. The "% of average Canadian" works as a no-judgment
benchmark.

---

## 7. Functional Requirements

### R1: Food Explorer

The **landing experience**. User opens the app and can immediately browse all
45 food items, sorted by CO2e per portion (lowest to highest by default).

- Items grouped by CFG category with visual tabs
- Each item shows: name, portion description, CO2e per portion, driving equivalent
- Tap an item to see: emission factor, data source, dominant GHG, contextual note
- Sort options: by emissions (low/high), alphabetical, by category
- Search: type-ahead filter by name

**Why this is R1:** Delivers the core "aha moment" in < 30 seconds without
any logging or setup.

### R2: Meal Builder

User selects food items to build a meal (not a full day — a single meal).

- Add items from the Explorer with portion count (default 1, adjustable: 0.5–5)
- Live-updating total: CO2e in kg + driving equivalent
- **Plate balance indicator** shows CFG proportions for this meal:
  - Visual split of Vegetables & Fruits / Whole Grains / Protein
  - Informational only — no enforcement
- **One swap suggestion** (see Section 8): identifies the highest-emission item
  and suggests one lower-emission alternative from the same category

### R3: Save to Daily Estimate

After building a meal, user can optionally save it to a date.

- Multiple meals can be saved to the same date (breakfast, lunch, dinner, snack)
- Meal labels are optional (user can skip labeling)
- Daily view shows: all saved meals + daily total CO2e + driving equivalent
- **Framed as "estimate"** — the UI says "Daily Estimate" not "Daily Total"
  to set expectations that this is approximate

### R4: History

- Calendar or list view of past daily estimates
- Each day shows total CO2e and the driving equivalent
- Simple line chart of last 7 and 30 days
- "Average Canadian" reference line on the chart (3.98 kg CO2e/day)
- No targets, no judgments — the reference line is purely contextual

### R5: Onboarding (First Launch)

A single-screen onboarding shown on first open:

- "Food is responsible for 25% of global greenhouse gas emissions."
- "In Canada, the average person's food creates ~4 kg CO2e per day — like driving 16 km."
- "This app helps you see which foods matter most."
- "All data is Canadian where available, with cited sources."
- [Start Exploring] button → goes to Food Explorer

No account creation. No permissions. No setup.

---

## 8. Swap Suggestion — One Rule

The previous design had a 13-rule nudge engine. For MVP, we use **one rule**:

```
When a meal is built, identify the item with the highest CO2e contribution.
Find the lowest-emission item in the same CFG category.
Show: "Your highest-impact item is [X] ([X_co2e]).
       Swapping to [Y] would save [delta] — like driving [km] less."
```

**Examples:**
- "Your highest-impact item is Beef (2.6 kg). Swapping to Chicken would save
  2.38 kg — like driving 10 km less."
- "Your highest-impact item is Brown Rice (0.195 kg). Swapping to Oats would
  save 0.18 kg — like skipping 0.7 km of driving."

**Rules:**
- Only show if the swap saves > 0.1 kg CO2e (skip trivial differences)
- One suggestion per meal, always the highest-impact swap
- Neutral tone: "swapping to" not "you should" or "consider"
- Always quantify the savings in both CO2e and driving km

---

## 9. Data Model

```
FoodItem
├── id: string
├── name: string
├── category: "vegetables_fruits" | "whole_grains" | "protein" | "other"
├── sub_category: "plant" | "animal" | "dairy" | null
├── portion_description: string         # "125 mL cooked"
├── portion_weight_grams: number        # raw/as-purchased weight
├── weight_basis: "raw" | "dry" | "as_sold"   # explicit, no ambiguity
├── co2e_per_kg: number                 # kg CO2e per kg of product
├── co2e_per_portion: number            # pre-calculated
├── dominant_ghg: "CO2" | "CH4" | "N2O"
├── ghg_note: string                    # e.g., "75% methane from digestion"
├── data_source: string                 # "CFC LCA 2023" or "Poore & Nemecek 2018"
└── data_source_url: string             # link to paper/report

Meal
├── id: string
├── date: string                        # YYYY-MM-DD
├── label: string | null                # "breakfast", "lunch", etc. (optional)
├── items: MealItem[]
├── total_co2e: number
└── driving_km_equivalent: number       # total_co2e / 0.25

MealItem
├── food_item_id: string
├── portions: number                    # 0.5, 1, 1.5, 2, etc.
└── co2e: number                        # food_item.co2e_per_portion × portions

DailyEstimate                           # derived, not stored separately
├── date: string
├── meals: Meal[]
├── total_co2e: number
├── driving_km_equivalent: number
└── vs_canadian_average: number         # total_co2e / 3.98 (as percentage)
```

### Changes from v1 data model
- **weight_basis** field: eliminates raw vs. cooked ambiguity
- **data_source / data_source_url**: every number is traceable
- **sub_category**: enables swap suggestions within category
- **Meal replaces DailyLog**: supports per-meal plate balance
- **driving_km_equivalent**: pre-calculated for display
- **Removed NudgeResult model**: single swap rule doesn't need a data structure

---

## 10. Technical Decisions

### Platform: PWA (Progressive Web App)

| Requirement        | How PWA delivers it                                |
|--------------------|----------------------------------------------------|
| Offline support    | Service worker caches app shell + 45-item dataset  |
| Local storage      | IndexedDB via Dexie.js for saved meals             |
| No install needed  | Share a URL, works immediately                     |
| Installable        | Add to home screen on Android + iOS                |
| No app store fees  | Deploy to GitHub Pages or Vercel (free)             |
| Privacy            | All data stays on device                           |

### Data Durability Mitigation

Safari (iOS) can evict IndexedDB data after 7 days of inactivity. We mitigate:

1. **Request persistent storage** on first launch: `navigator.storage.persist()`
2. **Manual backup/restore**: Settings page with "Export my data" / "Import data"
   as a JSON file — simple, user-controlled, no server needed
3. **Clear warning**: If `persist()` is denied, show a one-time notice: "Your
   browser may clear saved data after inactivity. Use Export to back up."

### Suggested Stack

| Layer       | Choice            | Rationale                               |
|-------------|-------------------|-----------------------------------------|
| Framework   | React (Vite)      | Fast build, wide ecosystem              |
| Storage     | Dexie.js          | IndexedDB wrapper, offline-first        |
| Offline     | Workbox           | Service worker tooling                  |
| Hosting     | Vercel or GH Pages| Free tier, no backend needed            |
| Styling     | Tailwind CSS      | Rapid prototyping                       |
| Charts      | Recharts          | Lightweight, React-native               |
| Testing     | Vitest + RTL      | Matches Vite ecosystem                  |

---

## 11. Non-Functional Requirements

| Requirement      | Detail                                                      |
|------------------|-------------------------------------------------------------|
| First load       | < 3 seconds on 3G (app shell + data is ~50 KB total)       |
| Offline          | 100% functional offline after first load                    |
| Accessibility    | WCAG 2.1 AA — screen reader, keyboard nav, contrast ratios |
| Privacy          | Zero network requests after initial load (no analytics MVP) |
| Browser support  | Chrome, Safari, Firefox, Edge (last 2 versions)             |
| Mobile-first     | Designed for phone screens, usable on desktop               |

---

## 12. Out of Scope for MVP

- Recipes (focus is ingredients only)
- Barcode / receipt scanning
- Restaurant meals or processed/packaged foods
- CO2 budgets, targets, or gamification
- Social features or sharing
- Custom food items beyond the curated 45
- Nutritional information (calories, macros)
- Other emission categories (transport, clothing, LLM usage)
- User accounts or cloud sync
- Multi-language support (English only for MVP)
- Data export as CSV (JSON backup covers this)

---

## 13. What Comes After MVP

If the MVP validates (users return, save 3+ daily estimates in week 1):

| Phase | Feature                              | Why                              |
|-------|--------------------------------------|----------------------------------|
| v1.1  | Expand to 100+ food items            | Cover more real meals            |
| v1.2  | Weekly summary with trends           | Reward consistent users          |
| v1.3  | "Build a better plate" mode          | Guided CFG-aligned meal building |
| v2.0  | Nutritional info alongside emissions | Full picture: health + climate   |
| v2.1  | LLM usage tracker module             | Original vision for multi-category |
| v3.0  | Cloud sync + accounts (optional)     | Cross-device, long-term history  |

---

## 14. Data Sources & References

### Canadian-Specific Sources (Priority 1)

- **Canadian Beef:** National Beef Sustainability Assessment (NBSA); Legesse et al.
  via AAFC Holos model. ~22 kg CO2e/kg carcass weight, ~26 kg CO2e/kg retail cuts.
  https://www.beefresearch.ca/topics/environmental-footprint-of-beef-production/
- **Canadian Chicken:** Chicken Farmers of Canada LCA 2023 (conducted by Groupe
  AGÉCO). 2.2 kg CO2e/kg eviscerated chicken.
  https://www.chickenfarmers.ca/the-chicken-industry-life-cycle-assessment-lca/
- **Canadian Pork:** Dyer & Desjardins, Canadian pork LCA. 2.6–5.0 kg CO2e/kg
  depending on region; midpoint 3.5 used.
  https://www.sciencedirect.com/science/article/abs/pii/S0959652615017114
- **Canadian Eggs:** Pelletier (2018) and EFC LCA 2022. 2.4 kg CO2e/kg
  conventional. https://www.eggfarmers.ca/2023/09/what-makes-canadian-eggs-so-sustainable/
- **Canadian Dairy:** Vergé et al., Canadian dairy LCA. Milk 0.92–1.25 CO2e/L;
  cheese 5.3; butter 7.3 kg CO2e/kg.
  https://www.journalofdairyscience.org/article/S0022-0302(13)00479-7/fulltext
- **Canadian Dietary Average:** Veeramani et al. (2017). 3.98 kg CO2e/person/day.
  https://www.sciencedirect.com/science/article/abs/pii/S0959652621024628

### Global Sources (Priority 2 — Used for Plant Foods)

- **Poore & Nemecek (2018):** "Reducing food's environmental impacts through
  producers and consumers." *Science*, 360(6392), 987-992.
  https://doi.org/10.1126/science.aaq0216
- **Our World in Data:** GHG emissions per kg of food product (visualization of
  Poore & Nemecek). https://ourworldindata.org/grapher/ghg-per-kg-poore

### Context & Methodology

- **Canada's Food Guide (2019):** https://food-guide.canada.ca/en/
- **Health Canada Reference Amounts:** CFIA Schedule M portion sizes.
- **GWP values:** IPCC AR5 — 100-year Global Warming Potential (CO2=1, CH4=28, N2O=265).
- **Driving equivalence:** NRCan average Canadian passenger vehicle ~0.25 kg CO2/km.
- **StatCan Household Food Emissions (2015):**
  https://www150.statcan.gc.ca/n1/pub/16-508-x/16-508-x2019004-eng.htm
- **AAFC Agricultural GHG Indicator:**
  https://agriculture.canada.ca/en/agricultural-production/agricultural-greenhouse-gas-indicator
