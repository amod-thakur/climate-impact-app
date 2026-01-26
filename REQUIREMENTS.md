# CO2 Food Tracker — MVP Requirements

## 1. Overview

A food emissions tracker that estimates greenhouse gas (GHG) impact of daily food
intake. Users select ingredients from a curated list of 20 items aligned with
**Canada's Food Guide (2019)**, log their daily consumption, and see their
estimated carbon footprint broken down by gas type.

### MVP Scope Decisions

| Decision            | Choice                                       |
|---------------------|----------------------------------------------|
| Portion system      | Canadian portion sizes (Health Canada)        |
| Tracking mode       | Daily log (not per-meal)                      |
| CO2 display         | Inform only — no budgets, no gamification     |
| Food list           | 20 curated items across all CFG categories    |
| Focus               | Ingredients and nutrition, not recipes        |
| Emission data       | Poore & Nemecek 2018 (via Our World in Data)  |

---

## 2. Canada's Food Guide — Plate Model

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

**Key CFG principles applied in this app:**
- Choose plant-based protein foods more often
- Eat plenty of vegetables and fruits
- Choose whole grain foods
- Make water the drink of choice
- Limit highly processed foods

---

## 3. Canadian Portion Sizes

Since the 2019 CFG removed numeric serving sizes, we use Health Canada's
**Reference Amounts** (based on the 2007 guide and CFIA standards) to define
one "portion" per item. These are familiar to Canadian users.

| Category             | Standard Portion Definition                        |
|----------------------|----------------------------------------------------|
| Vegetables (cooked)  | 125 mL (½ cup)                                     |
| Vegetables (raw/leafy)| 250 mL (1 cup)                                    |
| Fruit                | 1 medium piece, or 125 mL (½ cup)                  |
| Whole grains (cooked)| 125 mL (½ cup) cooked, or 1 slice bread (35 g)     |
| Meat / Fish          | 75 g (2.5 oz) cooked                               |
| Legumes (cooked)     | 175 mL (¾ cup)                                     |
| Tofu                 | 150 g (¾ cup)                                      |
| Eggs                 | 2 large                                            |
| Nuts                 | 60 mL (¼ cup, ~30 g)                               |

---

## 4. Top 20 Food Items — Emissions Data

All emission factors are **kg CO2-equivalents per kg of food product** (global
averages, Poore & Nemecek 2018). The "per portion" column uses the Canadian
portion sizes defined above.

### 4a. Vegetables & Fruits (½ plate) — 7 Items

| #  | Item         | Portion (CA)       | Weight  | kg CO2e/kg | CO2e/portion | Dominant GHG         |
|----|--------------|--------------------|---------|------------|--------------|----------------------|
| 1  | Potatoes     | 1 medium           | 150 g   | 0.2        | 0.030 kg     | CO2 (energy)         |
| 2  | Carrots      | 125 mL chopped     | 80 g    | 0.2        | 0.016 kg     | CO2 (energy)         |
| 3  | Apples       | 1 medium           | 180 g   | 0.4        | 0.072 kg     | CO2 (storage/transport) |
| 4  | Spinach/Kale | 125 mL cooked      | 90 g    | 0.5        | 0.045 kg     | N2O (fertilizer)     |
| 5  | Broccoli     | 125 mL chopped     | 80 g    | 0.6        | 0.048 kg     | N2O (fertilizer)     |
| 6  | Blueberries  | 125 mL             | 75 g    | 0.7        | 0.053 kg     | CO2 (transport)      |
| 7  | Tomatoes     | 1 medium           | 125 g   | 1.0        | 0.125 kg     | CO2 (energy)         |

### 4b. Whole Grain Foods (¼ plate) — 5 Items

| #  | Item             | Portion (CA)       | Dry Wt  | kg CO2e/kg | CO2e/portion | Dominant GHG         |
|----|------------------|--------------------|---------|------------|--------------|----------------------|
| 8  | Oats             | 175 mL cooked      | 30 g    | 0.6        | 0.018 kg     | N2O (fertilizer)     |
| 9  | Barley           | 125 mL cooked      | 45 g    | 0.6        | 0.027 kg     | N2O (fertilizer)     |
| 10 | Quinoa           | 125 mL cooked      | 45 g    | 0.8        | 0.036 kg     | CO2 (transport)      |
| 11 | Whole Wheat Bread| 1 slice            | 35 g    | 1.4        | 0.049 kg     | N2O (fertilizer)     |
| 12 | Brown Rice       | 125 mL cooked      | 65 g    | 3.0        | 0.195 kg     | **CH4 (methane)**    |

### 4c. Protein Foods (¼ plate) — 8 Items

| #  | Item             | Portion (CA)       | Weight  | kg CO2e/kg | CO2e/portion | Dominant GHG         |
|----|------------------|--------------------|---------|------------|--------------|----------------------|
| 13 | Nuts (mixed)     | 60 mL              | 30 g    | 0.5        | 0.015 kg     | CO2 (processing)     |
| 14 | Lentils          | 175 mL cooked      | 75 g    | 0.9        | 0.068 kg     | N2O (fertilizer)     |
| 15 | Beans/Chickpeas  | 175 mL cooked      | 75 g    | 1.0        | 0.075 kg     | N2O (fertilizer)     |
| 16 | Tofu             | 150 g              | 150 g   | 3.2        | 0.480 kg     | CO2 (land use)       |
| 17 | Eggs             | 2 large            | 100 g   | 4.5        | 0.450 kg     | CO2, N2O (feed)      |
| 18 | Chicken          | 75 g cooked        | 75 g    | 6.0        | 0.450 kg     | CO2, N2O (feed)      |
| 19 | Salmon (farmed)  | 75 g cooked        | 75 g    | 12.0       | 0.900 kg     | CO2 (feed, energy)   |
| 20 | Beef             | 75 g cooked        | 75 g    | 60.0       | 4.500 kg     | **CH4 (methane)**    |

### Quick Reference: Emissions per Portion (sorted low → high)

```
Nuts             ██  0.015 kg
Carrots          ██  0.016 kg
Oats             ██  0.018 kg
Barley           ██  0.027 kg
Potatoes         ██  0.030 kg
Quinoa           ███ 0.036 kg
Spinach/Kale     ███ 0.045 kg
Broccoli         ███ 0.048 kg
Whole Wheat Bread ███ 0.049 kg
Blueberries      ███ 0.053 kg
Lentils          ████ 0.068 kg
Apples           ████ 0.072 kg
Beans/Chickpeas  ████ 0.075 kg
Tomatoes         █████ 0.125 kg
Brown Rice       ██████ 0.195 kg
Eggs             ████████████ 0.450 kg
Chicken          ████████████ 0.450 kg
Tofu             █████████████ 0.480 kg
Salmon           ██████████████████████ 0.900 kg
Beef             ████████████████████████████████████████████████████████████████████ 4.500 kg
```

---

## 5. GHG Gas Breakdown

The app displays three greenhouse gases separately for educational value:

| Gas                   | Formula | GWP (100-yr) | Primary Food Sources                         |
|-----------------------|---------|-------------- |----------------------------------------------|
| Carbon Dioxide        | CO2     | 1x            | Transport, processing, energy, land use change |
| Methane               | CH4     | 28x           | Beef, lamb, rice paddies, dairy              |
| Nitrous Oxide         | N2O     | 265x          | Synthetic fertilizers, manure                |

### Why show the breakdown?
- Reducing **methane** (beef, rice) yields faster climate benefits (CH4 is short-lived)
- **N2O** from fertilizers affects almost all crops — plant-based is not zero-impact
- Educates users beyond the simplistic "CO2 = bad" framing

### Display per food item
Each food item shows:
- **Total kg CO2e** (the combined metric)
- **Dominant GHG** (which gas contributes most — see column in tables above)
- **Contextual note** (e.g., "Beef's emissions are 75% methane from digestion")

---

## 6. Functional Requirements

### R1: Food Selection
- User can browse 20 food items organized by CFG category
- Each item shows: name, Canadian portion size, CO2e per portion, dominant GHG
- Items are tagged by plate section (Vegetables & Fruits / Whole Grains / Protein)

### R2: Daily Log
- User adds items to a daily log by selecting food + number of portions
- Default is 1 portion; user can adjust (0.5, 1, 1.5, 2, etc.)
- Log is tied to a calendar date
- User can edit or remove entries from today's log

### R3: Daily Emissions Summary
- Shows total kg CO2e for the day
- Breaks down by: food category, individual item, and gas type
- Displays the sorted bar chart (similar to Quick Reference above)

### R4: Plate Balance Indicator
- Visual indicator showing how today's food maps to the CFG plate model
- Shows current ratio of Vegetables & Fruits / Whole Grains / Protein
- Does NOT enforce — purely informational

### R5: Historical View
- View past daily logs by date
- Show a simple daily total trend (e.g., last 7 or 30 days)
- No averages or targets — just the raw data

### R6: Meal Planner (Nudge System)
- Analyzes the current daily log and provides informational nudges
- Nudges are **suggestions, not requirements**
- See Section 7 for nudge rules

### R7: Data Export
- Export daily log as CSV or JSON
- Fields: date, food_item, category, portions, co2e_total, dominant_ghg

---

## 7. Meal Planner — Nudge Rules

The nudge system evaluates the daily log against CFG principles and provides
gentle, informational suggestions. It never dictates or restricts.

### Nudge Categories

#### Plate Balance Nudges
| Condition                                    | Nudge Message                                                    |
|----------------------------------------------|------------------------------------------------------------------|
| Vegetables & Fruits < 40% of items           | "Canada's Food Guide suggests filling half your plate with vegetables and fruits." |
| Vegetables & Fruits = 0                      | "Consider adding vegetables or fruits — they're the foundation of the CFG plate." |
| Whole grains = 0                             | "Try adding a whole grain like oats or barley to round out your plate." |
| Protein = 0                                  | "Your log has no protein foods yet. Lentils or beans are low-emission options." |

#### Emission-Aware Nudges
| Condition                                    | Nudge Message                                                    |
|----------------------------------------------|------------------------------------------------------------------|
| Beef >= 2 portions in a day                  | "Swapping one beef portion for lentils would save ~4.4 kg CO2e — that's like driving 18 km less." |
| Daily total > 6 kg CO2e                      | "Today's emissions are above average. The biggest contributor is [X]." |
| All protein is animal-based                  | "Canada's Food Guide recommends choosing plant-based protein foods more often." |
| Rice is the only grain                       | "Brown rice has higher methane emissions than other grains. Oats or barley are lower-impact alternatives." |

#### Swap Suggestions
| If user has...  | Suggest...            | Savings              |
|-----------------|-----------------------|----------------------|
| Beef (4.500)    | Lentils (0.068)       | ~4.43 kg CO2e/portion |
| Beef (4.500)    | Chicken (0.450)       | ~4.05 kg CO2e/portion |
| Salmon (0.900)  | Beans/Chickpeas (0.075)| ~0.83 kg CO2e/portion |
| Brown Rice (0.195)| Oats (0.018)        | ~0.18 kg CO2e/portion |
| Eggs (0.450)    | Tofu (0.480)          | No saving — inform user tofu is comparable |

### Nudge Behavior
- Maximum 2-3 nudges displayed at a time (avoid overwhelming)
- Prioritize highest-impact suggestions first
- Never frame nudges as warnings or guilt — neutral, informational tone
- Always include the quantified CO2e difference when suggesting a swap

---

## 8. Data Model (Conceptual)

```
FoodItem
├── id: string
├── name: string
├── category: "vegetables_fruits" | "whole_grains" | "protein"
├── portion_description: string        # e.g., "125 mL cooked"
├── portion_weight_grams: number       # e.g., 80
├── co2e_per_kg: number                # kg CO2e per kg of product
├── co2e_per_portion: number           # pre-calculated
├── dominant_ghg: "CO2" | "CH4" | "N2O"
└── ghg_note: string                   # e.g., "Methane from enteric fermentation"

DailyLog
├── date: string                       # YYYY-MM-DD
├── entries: DailyLogEntry[]
└── total_co2e: number                 # sum of all entries

DailyLogEntry
├── food_item_id: string
├── portions: number                   # e.g., 1.5
└── co2e: number                       # food_item.co2e_per_portion × portions

NudgeResult
├── type: "plate_balance" | "emission_swap" | "cfq_principle"
├── message: string
├── co2e_savings: number | null        # if applicable
└── priority: number                   # for display ordering
```

---

## 9. Non-Functional Requirements

| Requirement     | Detail                                                         |
|-----------------|----------------------------------------------------------------|
| Storage         | Local-first (SQLite or local file) — no account needed for MVP |
| Offline support | Must work fully offline (all data is bundled)                  |
| Platform        | TBD (CLI, web, or mobile — decide before implementation)       |
| Performance     | Instant calculations (all data is a static lookup table)       |
| Privacy         | No food data leaves the device                                 |

---

## 10. Out of Scope for MVP

- Recipe support (focus is ingredients only)
- Barcode / receipt scanning
- Restaurant meals
- CO2 budgets or targets
- Gamification, streaks, or achievements
- Social/sharing features
- Custom food items (only the curated 20)
- Nutritional information (calories, macros) — future module
- Other emission categories (transport, clothing, LLM usage)

---

## 11. Data Sources & References

- **Emission factors:** Poore, J., & Nemecek, T. (2018). "Reducing food's
  environmental impacts through producers and consumers." *Science*, 360(6392),
  987-992. https://doi.org/10.1126/science.aaq0216
- **Visualization:** Our World in Data — GHG per kg of food product.
  https://ourworldindata.org/grapher/ghg-per-kg-poore
- **Canada's Food Guide (2019):** https://food-guide.canada.ca/en/
- **Health Canada Reference Amounts:** Canada Gazette reference amounts for
  food portion sizes (CFIA Schedule M).
- **GWP values:** IPCC AR5 — 100-year Global Warming Potential.
