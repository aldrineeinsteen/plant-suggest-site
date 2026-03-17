Note: The tool simplified the command to ` cat > /Users/aldrine/Projects/plant-suggest-site/README.md << 'READMEEOF'
# 🌱 Plant Suggest

A climate-aware vegetable, herb, fruit, and flower planting planner for home gardeners. Enter your postcode and growing setup, and the app calculates personalised sowing, transplanting, hardening off, and harvest windows based on real historical climate data for your location.

**Live site → [aldrineeinsteen.github.io/plant-suggest-site](https://aldrineeinsteen.github.io/plant-suggest-site/)**

---

## Contents

- [How it works](#how-it-works)
- [Planting time, harvest & hardening off](#planting-time-harvest--hardening-off)
- [Plant data schema](#plant-data-schema)
- [Contributing plant data](#contributing-plant-data)
- [Development setup](#development-setup)

---

## How it works

1. **Geocoding** — The postcode is resolved to a latitude/longitude using the [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api). No API key is required.
2. **Climate data** — Three years of daily minimum temperatures are fetched from the [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api).
3. **Frost dates** — Every sub-zero day across the three-year window is identified. The day-of-year is averaged across years to produce a statistically robust **last spring frost date** and **first autumn frost date** for the location. Locations with no sub-zero days are treated as frost-free.
4. **Adjusted frost date** — The raw frost date is shifted earlier based on the user's equipment: greenhouse (−21 days), heated propagator (−14 days), cold frame (−10 days).
5. **Window calculation** — All sowing, transplanting, and harvest windows are derived from the adjusted frost date using per-plant offset values stored in the data files (see [Plant data schema](#plant-data-schema)).
6. **Scoring & ranking** — Plants are scored by climate fit, season length, companion synergy, and equipment match, and sorted accordingly.
7. **My List & sharing** — Users save plants to a personal list. A shareable URL encodes the location, setup, and saved plant IDs so another person can open the same results directly.

---

## Planting time, harvest & hardening off

### How windows are calculated

All timing is expressed as **weeks relative to the adjusted last frost date**. Negative values are before frost (frost-hardy crops), positive values are after frost (tender crops).

| Display window | Calculated from | Key field |
|---|---|---|
| Indoor seed start | `adjustedFrost + indoorStartOffsetWeeks` | `indoorStartOffsetWeeks` |
| Direct sow | `adjustedFrost + sowingOffsetWeeks` | `sowingOffsetWeeks` |
| Hardening off | ~7–10 days before transplant window start | *(derived — see note below)* |
| Transplant | `adjustedFrost + transplantOffsetWeeks` | `transplantOffsetWeeks` |
| First harvest | `transplantDate + daysToFirstHarvest` | `daysToFirstHarvest` |
| Harvest window | `firstHarvestDate` to `firstHarvestDate + harvestDurationDays` | `harvestDurationDays` |

### Hardening off

Hardening off gradually acclimatises indoor-raised seedlings to outdoor conditions over 7–14 days before the permanent transplant date. The app currently shows the **transplant date** (when plants go in the ground for good). Begin hardening off approximately **7–10 days before** the transplant window start.

| Plant | Typical transplant window (UK, last frost ≈ late April) | Begin hardening off |
|---|---|---|
| Tomato | Late May – Mid June | Mid–Late May |
| Basil | Late May – Late June | Mid May |
| Courgette | Early June – Late June | Late May |
| Sweet Pepper | Early June – Mid July | Late May |
| Sweetcorn | Late May – Mid June | Mid–Late May |
| Runner Bean | Late May – Late June | Mid May |
| Marigold | Late May – Late June | Mid May |

> **Community enhancement opportunity:** Adding a `hardeningOffDurationDays` field (integer, default `7`) to the schema would allow the app to display an explicit hardening off window. See [Contributing plant data](#contributing-plant-data).

### Verified timing data

All values in the JSON files have been cross-checked against RHS Growing Guides, seed-packet guidance, and horticultural extension service data. Timing is expressed relative to the last frost date (negative = before frost).

| Plant | Indoor start (wks) | Transplant (wks) | Days to 1st harvest | Harvest duration | Notes |
|---|---|---|---|---|---|
| Tomato | −8 to −6 | +2 to +4 | 75 | 60 days | ✓ |
| Courgette | −4 to −3 | +2 to +4 | 50 | 60 days | ✓ |
| Cucumber | −4 to −3 | +3 to +5 | 55 | 60 days | ✓ |
| Sweet Pepper | −12 to −10 | +4 to +8 | 90 | 60 days | ✓ Requires heated propagator |
| Chilli Pepper | −14 to −12 | +4 to +8 | 100 | 60 days | ✓ Requires heated propagator |
| Aubergine | −14 to −12 | +4 to +8 | 100 | 45 days | ✓ Requires heated propagator |
| Lettuce | −6 to −4 | −2 to +2 | 45 | 30 days | ✓ Cool-season, succession sow |
| Carrot | Direct sow −2 to +8 wks | — | 75 | 60 days | ✓ Direct sow only |
| Garden Pea | Direct sow −6 to +2 wks | −4 to −1 | 60 | 28 days | ✓ Early cool-season |
| Runner Bean | −3 to −2 | +2 to +4 | 70 | 60 days | ✓ |
| French Bean | −3 to −2 | +2 to +4 | 55 | 45 days | ✓ |
| Kale | −6 to −4 | −2 to +2 | 70 | 90 days | ✓ Frost-hardy |
| Spinach | −4 to −2 | −3 to 0 | 40 | 30 days | ✓ Cool-season, succession sow |
| Beetroot | Direct sow −2 to +6 wks | — | 60 | 60 days | ✓ Direct sow only |
| Onion | −12 to −10 | −4 to 0 | 120 | 30 days | ✓ Long-season |
| Leek | −14 to −12 | −6 to −2 | 150 | 90 days | ✓ Winter staple |
| Brussels Sprouts | −16 to −14 | −8 to −4 | 180 | 90 days | ✓ Very long season |
| Cabbage | −14 to −12 | −6 to 0 | 100 | 30 days | ✓ |
| Cauliflower | −16 to −14 | −6 to −2 | 140 | 21 days | ✓ |
| Basil | −6 to −4 | +2 to +4 | 30 | 90 days | ✓ Frost-tender |
| Chives | −8 to −6 | −2 to +2 | 60 | 120 days | ✓ Hardy perennial |
| Rosemary | −10 to −8 | 0 to +4 | 90 | 300 days | ✓ Perennial shrub |
| Dill | Direct sow −2 to +6 wks | — | 40 | 60 days | ✓ Direct sow only |
| Strawberry | −18 to −14 | −4 to 0 | 90 | 30 days | ✓ Runners faster than seed |
| Marigold | −6 to −4 | +2 to +4 | 50 | 90 days | ✓ |
| Nasturtium | Direct sow 0 to +6 wks | — | 50 | 90 days | ✓ |

If you spot a timing error, please [open an issue](https://github.com/aldrineeinsteen/plant-suggest-site/issues) or submit a pull request with a cited source.

---

## Plant data schema

Plant data lives in `public/data/plants/` as JSON arrays — one file per category:

```
public/data/plants/
  vegetables.json
  herbs.json
  fruits.json
  flowers.json
```

Each file is a JSON array of plant objects. The complete field reference is below. All fields marked **REQUIRED** must be present; **OPTIONAL** fields can be omitted entirely.

### Complete field reference

```jsonc
{
  // ── Identity ──────────────────────────────────────────────────────────────

  "id": "tomato",
  // REQUIRED. Unique stable identifier. Lowercase letters, numbers, hyphens only.
  // Used as the reference key in companionPlantIds, avoidNearIds, followWithIds,
  // interPlantIds, and in share link payloads.
  // ⚠️  NEVER rename an id after it has been published — it is a stable key
  //     and renaming it silently breaks saved My Lists and share links.

  "commonName": "Tomato",
  // REQUIRED. Display name shown in the UI.
  // For crops with regional name variants, include the alternative in parentheses:
  // e.g. "Courgette (Zucchini)", "Aubergine (Eggplant)".

  "scientificName": "Solanum lycopersicum",
  // OPTIONAL. Current accepted binomial name. Shown in italics on the plant card.

  "category": "vegetable",
  // REQUIRED. Controls which data file the plant belongs to and the card colour.
  // Allowed: "vegetable" | "herb" | "fruit" | "flower"

  // ── Germination temperature ───────────────────────────────────────────────

  "germinationTempMinC": 18,
  // REQUIRED. Minimum soil/compost temperature (°C) for reliable germination.
  // Used to warn when spring conditions may be too cold or a location too warm.

  "germinationTempMaxC": 29,
  // REQUIRED. Maximum soil/compost temperature (°C) for reliable germination.

  // ── Timing offsets (all values = integer weeks, relative to last frost) ───
  //
  // The adjusted last frost date is the baseline.
  //   Negative value → before the frost date  (frost-hardy or early-start crops)
  //   Positive value → after the frost date   (frost-tender crops)
  //
  // Equipment shifts applied to the baseline before calculation:
  //   Greenhouse:         −21 days (3 weeks earlier effective frost)
  //   Heated propagator:  −14 days (2 weeks earlier indoor start capability)
  //   Cold frame:         −10 days

  "sowingOffsetWeeks": { "min": 0, "max": 2 },
  // REQUIRED. Direct outdoor sowing window, relative to last frost.
  // For frost-hardy crops that tolerate cold soil, min may be negative
  // (e.g. peas: {"min": -6, "max": 2}).
  // For directSowOnly plants this is the primary timing field.
  // min must be ≤ max.

  "indoorStartOffsetWeeks": { "min": -8, "max": -6 },
  // REQUIRED (set both to 0 for directSowOnly plants).
  // When to sow seeds indoors, relative to last frost date.
  // Typically strongly negative (start indoors well before the outdoor frost date).
  // min must be ≤ max.
  // min must be ≤ transplantOffsetWeeks.min (you can't transplant before finishing indoors).

  "transplantOffsetWeeks": { "min": 2, "max": 4 },
  // REQUIRED (set both to 0 for directSowOnly plants).
  // When to move transplants permanently outdoors, relative to last frost date.
  // This is the POST-hardening-off planting date.
  // Begin hardening off approximately 7–10 days before transplantOffsetWeeks.min.
  // min must be ≤ max.

  // ── Harvest timing ────────────────────────────────────────────────────────

  "daysToFirstHarvest": 75,
  // REQUIRED. Days from the transplant date (or direct sow date for directSowOnly
  // plants) to the first expected harvest.
  // Use the mid-range value from seed-packet or reference data.
  // Must be a positive integer.

  "harvestDurationDays": 60,
  // REQUIRED. Length of the harvest window in days once it begins.
  // Single-cut crops (cabbage, cauliflower, sweetcorn): use 14–21.
  // Cut-and-come-again crops (lettuce, kale, herbs): use 60–300.
  // Must be a positive integer.

  // ── Sowing method ─────────────────────────────────────────────────────────

  "directSowOnly": false,
  // REQUIRED. true = cannot be transplanted (tap roots, resents root disturbance).
  // When true: set indoorStartOffsetWeeks and transplantOffsetWeeks both to
  // {"min": 0, "max": 0}. The sowingOffsetWeeks field is used for all timing.

  // ── Growing equipment benefits ────────────────────────────────────────────

  "greenhouseBenefit": "extends",
  // REQUIRED. How a greenhouse benefits this plant.
  // "none"    — no meaningful benefit for this species
  // "extends" — extends the usable season at one or both ends (tomato, courgette, kale)
  // "enables" — the plant is only realistically viable in cool climates with glass/poly
  //             (aubergine, cucumber, sweet pepper)

  "propagatorBenefit": "accelerates",
  // REQUIRED. How a heated propagator benefits germination/early growth.
  // "none"        — no benefit; can be started in ambient conditions
  // "accelerates" — speeds up germination or allows earlier indoor start
  // "required"    — plant cannot reliably germinate without consistent bottom heat;
  //                 plants with this value are excluded from results if the user
  //                 has not indicated they own a heated propagator

  "coldFrameBenefit": "hardens",
  // REQUIRED. How a cold frame helps.
  // "none"            — no benefit for this species
  // "hardens"         — useful staging area for hardening off transplants before
  //                     planting them in the open garden
  // "enables-earlier" — allows an earlier outdoor sowing or planting date
  //                     (lettuce, spinach, peas, carrots)

  // ── Companion planting ────────────────────────────────────────────────────

  "companionPlantIds": ["basil", "marigold"],
  // REQUIRED (use [] if none). IDs of plants with a documented beneficial companion
  // relationship. Shown in the "Companion plants" section.
  // Relationships should be BIDIRECTIONAL: if plant A lists plant B, plant B should
  // also list plant A.

  "avoidNearIds": ["fennel"],
  // REQUIRED (use [] if none). IDs of plants that inhibit this one when grown nearby.
  // Shown in the "Avoid near" section.

  "interPlantIds": ["basil"],
  // OPTIONAL. A subset of companionPlantIds that are particularly suited to same-bed
  // inter-planting (not just in adjacent beds). Shown as a specific inter-planting tip.
  // Every entry must also appear in companionPlantIds.

  "followWithIds": ["lettuce", "spinach", "carrot"],
  // OPTIONAL. IDs of plants recommended to follow this crop in the same bed as part
  // of a crop rotation plan. Heavy feeders are typically followed by leafy crops
  // or legumes that fix nitrogen.

  // ── Garden planning ───────────────────────────────────────────────────────

  "spacingCm": 60,
  // REQUIRED. Recommended centre-to-centre spacing in centimetres.

  "plantsPerSqFt": 0.25,
  // REQUIRED. Square Foot Gardening planting density.
  // Common values:
  //   0.25 — 1 plant per 4 sq ft  (tomato, courgette, Brussels sprouts, cauliflower)
  //   0.5  — 1 plant per 2 sq ft  (cucumber)
  //   1    — 1 plant per sq ft    (pepper, kale, cabbage, sweetcorn)
  //   4    — 4 plants per sq ft   (lettuce, basil, marigold, chives)
  //   9    — 9 plants per sq ft   (spinach, beetroot, peas, French beans)
  //   16   — 16 plants per sq ft  (carrot, radish)

  "successionIntervalWeeks": 3,
  // OPTIONAL. Weeks between successive batches for a continuous harvest.
  // Omit entirely for plants that are sown once per season.

  "successionRounds": 4,
  // OPTIONAL. Maximum number of succession sowing rounds per season.
  // Typically used together with successionIntervalWeeks.

  // ── Notes ─────────────────────────────────────────────────────────────────

  "notes": "Do not plant out until all frost risk has passed. Needs warm nights."
  // OPTIONAL. Short practical growing tip shown on the plant card.
  // Keep to 1–2 sentences. Plain text only — no HTML or Markdown.
}
```

### Enum quick-reference

| Field | Allowed values |
|---|---|
| `category` | `"vegetable"` · `"herb"` · `"fruit"` · `"flower"` |
| `greenhouseBenefit` | `"none"` · `"extends"` · `"enables"` |
| `propagatorBenefit` | `"none"` · `"accelerates"` · `"required"` |
| `coldFrameBenefit` | `"none"` · `"hardens"` · `"enables-earlier"` |

### Offset week constraints summary

| Constraint | Rule |
|---|---|
| `indoorStartOffsetWeeks.min ≤ .max` | min ≤ max always |
| `transplantOffsetWeeks.min ≥ indoorStartOffsetWeeks.max` | can't transplant before finishing indoors |
| `directSowOnly: true` → both indoor and transplant offsets | set to `{"min": 0, "max": 0}` |
| All offset values | must be integers (no decimals) |
| `daysToFirstHarvest`, `harvestDurationDays` | must be positive integers |

### Minimal example (direct-sow-only plant)

```json
{
  "id": "radish",
  "commonName": "Radish",
  "scientificName": "Raphanus sativus",
  "category": "vegetable",
  "germinationTempMinC": 5,
  "germinationTempMaxC": 30,
  "sowingOffsetWeeks": { "min": -4, "max": 8 },
  "indoorStartOffsetWeeks": { "min": 0, "max": 0 },
  "transplantOffsetWeeks": { "min": 0, "max": 0 },
  "daysToFirstHarvest": 25,
  "harvestDurationDays": 14,
  "directSowOnly": true,
  "greenhouseBenefit": "none",
  "propagatorBenefit": "none",
  "coldFrameBenefit": "enables-earlier",
  "companionPlantIds": ["lettuce", "carrot"],
  "avoidNearIds": [],
  "spacingCm": 5,
  "plantsPerSqFt": 16,
  "successionIntervalWeeks": 2,
  "successionRounds": 6,
  "notes": "Fastest crop in the garden. Sow little and often."
}
```

### Holiday data schema

Holiday files live in `public/data/holidays/{COUNTRY_CODE}.json`. Each file is a JSON object:

```jsonc
{
  "country": "GB",
  "year": 2026,
  "holidays": [
    {
      "name": "Easter Sunday",
      "date": "2026-04-05",
      "type": "moveable",
      "country": "GB"
    }
  ]
}
```

Currently supported countries: **AU**, **GB**, **IE**, **NZ**, **US**.

---

## Contributing plant data

Plant Suggest is designed to be community-maintained. The JSON data files are the primary way to contribute — no knowledge of JavaScript or React is required.

### What you can contribute

| Contribution | Where to edit |
|---|---|
| Fix a sowing or harvest timing value | `public/data/plants/{category}.json` |
| Add a missing plant | `public/data/plants/{category}.json` |
| Improve companion planting pairs | Both plants' `companionPlantIds` arrays |
| Add crop rotation suggestions | `followWithIds` array |
| Add hardening off duration as a schema field | `public/data/plants/` + `src/types/plant.ts` + planner logic |
| Add a new country's holidays | `public/data/holidays/{CODE}.json` |
| Fix a calculation bug in the planner | `src/lib/planner.ts` |

### How to submit a pull request

1. **Fork** the repository on GitHub.
2. **Edit** the relevant JSON file in `public/data/plants/` or `public/data/holidays/`.
3. **Validate** your JSON — the app silently skips an entire category file if it is malformed. Use [jsonlint.com](https://jsonlint.com/) or run:
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('public/data/plants/vegetables.json','utf8'))"
   ```
4. **Open a pull request** and include:
   - A brief description of what was changed and why.
   - A **cited source** for any timing data (seed packet, RHS, university extension service, cultivar database).
   - Your country/climate zone if the change is regionally specific.

### Style conventions

- `id`: `lowercase-with-hyphens`, no spaces, no special characters. Must be unique across all four category files.
- `commonName`: sentence case. Include regional variants in parentheses where helpful.
- `scientificName`: current accepted botanical name (check [Plants of the World Online](https://powo.science.kew.org/)).
- `notes`: 1–2 plain-text sentences, no HTML.
- `companionPlantIds` entries must be **bidirectional** — if plant A lists B, plant B must list A.
- All integer fields must be whole numbers; no decimals.

### Opening an issue

Use [GitHub Issues](https://github.com/aldrineeinsteen/plant-suggest-site/issues) to:

- Report incorrect timing data (please cite a source)
- Propose a new plant before writing a PR
- Report a computation or display bug
- Request a new country's holiday data

Suggested labels: `plant-data` · `bug` · `feature` · `question`

---

## Development setup

```bash
# Clone your fork
git clone https://github.com/aldrineeinsteen/plant-suggest-site.git
cd plant-suggest-site

# Install dependencies
npm install

# Start the dev server with hot reload
npm run dev

# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview
```

**Stack:** React 18 · TypeScript 5.6 · Vite 5 · Tailwind CSS 3.4  
**Climate data:** [Open-Meteo](https://open-meteo.com/) — free, no API key required  
**Geocoding:** [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)  
**Deployment:** GitHub Actions → GitHub Pages on every push to `main`

### Project structure

```
public/data/
  plants/          # Plant JSON data files — the main contribution target
  holidays/        # Public holiday JSON files per country

src/
  lib/
    planner.ts     # Core timing calculation engine
    climateInterpreter.ts  # Frost date derivation from climate data
    scorer.ts      # Plant ranking algorithm
    shareLink.ts   # Share link encode/decode
  services/
    plantDataLoader.ts   # Loads and caches plant JSON files
    weatherService.ts    # Open-Meteo API client
    geocodingService.ts  # Postcode → lat/lon
  types/
    plant.ts       # PlantDefinition TypeScript interface (mirrors JSON schema)
    planning.ts    # PlannerResult, PlantRecommendation, window types
    climate.ts     # ClimateSummary type
    location.ts    # LocationInput, GrowingSetup types
  hooks/
    usePlanner.ts  # Main orchestration hook
    usePlan.ts     # My List persistence
    useDarkMode.ts # Dark/light mode with OS detection
  pages/
    PlannerPage.tsx   # Input form page
    ResultsPage.tsx   # Results, My List, calendar view
  components/      # PlantCard, CalendarView, FilterBar, PlantSheet, …
```

---

## Licence

MIT
READMEEOF`, and this is the output of running that command instead:
heredoc>   "transplanavaScr  "g.
heredoc>  
heredoc>   "g "  "g.
heredoc>   },.
heredoc> 
heredoc> ### Whntire category f 
heredoc>   if i
heredoc> Plantalformed. Use [j  "g.
heredoc>  
heredoc>   "germita  "g.
heredoc>  
heredoc> int.com/) or run:
heredoc>    `` 
heredoc>   h
heredoc>    
heredoc>   "ghe prima.par  ,
heredoc>  n  ,
heredoc>   "transplanavaScr  'publi  "tta 
heredoc>   "g "  "g.
heredoc>   },.
heredoc> 
heredoc> #n','  },.
heredoc> 
heredoc> ###  
heredoc> ###4.   " 
heredoc> contrulconequest** and i 
heredoc>   "g":  "goin 
heredoc>   "g":  "gotiming   "gt wa  "g":  "goti w,
heredoc>      - A **cited source**   "g-e  "g.
heredoc> 
heredoc> | A 
heredoc>   "gee
heredoc> | A 
heredoc>   "gRHS  "ning p my -ea/plants/{c   // c  "g":  "geing pair  "g": 
 "geeksacinco mite s":  "g<ffffffff><ffffffff>  "gto 
heredoc>   ereks.ma:   ereks.ma  :   ds  ereks.ma:   eon  ereks.ma:   errce
 #] iend o tee #] iel#on###com
heredoc> lie #] iend ots60
heredoc>  R#co─<ffffffff> lie #] iend ots60
heredoc>  R#co──<ffffffff>  R#co───<ffffffff>afiplan erfi es60
heredoc>  R#cnc R#cmi60
heredoc>  0  coar 0  co n  R#co<ffffffff>f60
heredoc>  is a  R#c<ffffffff><ffffffff>l. is a  R#ti<ffffffff><ffffffff> <f
fffffff>ame`: curre is a  Rte  "g.
heredoc>  
heredoc>   "germie olant data
heredoc> 
heredoc> Plant Suggest is designed to be com  "nditionsma
heredoc>   ")) 
heredoc>   `notes`: 1–2 plain-text   "g.
heredoc>  
heredoc>   "germita  "g.
heredoc>  
heredoc>   "ghe primary  none es 
heredoc>   t be 
heredoc>   "ghe primaal**  ,
heredoc>  n  ,
heredoc>   "transplanavaScr   B nus  "tst 
heredoc>   "g "  "g.
heredoc>   },.
heredoc> 
heredoc> #ds m  },.
heredoc> 
heredoc> ###le
heredoc> ###ber  if i
heredoc> Plantalformed. pePlantan 
heredoc>   "germita  "g.
heredoc>  
heredoc> int.cs](h 
heredoc> int.com/) orcom/   `` 
heredoc>   h
heredoc>    
heredoc>  pl  h
heredoc>  ug  st sit /issues) to:
heredoc> 
heredoc> - Rep  "tin  "g "  "g.
heredoc>   },.
heredoc> 
heredoc> #n','  },.
heredoc> 
heredoc> # a  },.
heredoc> 
heredoc> #n' P
heredoc> #n'se 
heredoc> ###  
heredoc> ##nt ###4recontrulcoa   "g":  "goin 
heredoc>   "g":  "n   "g":  "gotig
heredoc>      - A **cited source**   "g-e  "g.
heredoc> 
heredoc> | ug
heredoc> | A 
heredoc>   "gee
heredoc> | A 
heredoc>   "gRHS  "ning p m ·  "ea| A 
heredoc>  <ffffffff> "qu  ereks.ma:   ereks.ma  :   ds  ereks.ma:   eon  er
eks.ma:   errce #] iend o tee #] iel#on###com
heredoc> lienslie #] iend ots60
heredoc>  R#co─<ffffffff> lie #] iend ots60
heredoc>  R#co──<ffffffff>  R#co───<ffffffff>afiplan erfi es60th R#co─<ffff
ffff> lie #h  R#co──<ffffffff>  R#co──<ffffffff>p R#cnc R#cmi60
heredoc>  0  coar 0  co n  R#co<ffffffff>f60
heredoc>  is 
heredoc> # 0  coar 0  cpr iuction build locally
heredoc> npm r 
heredoc>   "germie olant data
heredoc> 
heredoc> Plant Suggest is designed to be<ffffffff> Vi
heredoc> Plant Suggest is dS 3  ")) 
heredoc>   `notes`: 1–2 plain-text   "g.
heredoc>  
heredoc>   "gn-  `no.c 
heredoc>   "germita  "g.
heredoc>  
heredoc>   "ghe primaed   
heredoc>   "ghe prima* [O  t be 
heredoc>   "ghe primaal*](  "ghe// n  ,
heredoc>   "transplando  "teo  "g "  "g.
heredoc>   },.
heredoc> 
heredoc> #ds m  },.
heredoc> 
heredoc> #tH  },.
heredoc> 
heredoc> #ds <ffffffff>#dsitH
heredoc> ###le
heredoc> ##on ###by Plantalformin  "germita  "g.
heredoc>  
heredoc> int.cs
heredoc> 
heredoc>  
heredoc> int.cs](h 
heredoc> ia/
heredoc>  int.com/)    h
heredoc>    
heredoc>  pl  h
heredoc>  ug  sat  fi ps  <ffffffff><ffffffff> the
heredoc> - Rep  "tin  "g "  "g.et
heredoc>   },.
heredoc> 
heredoc> #n','  },.
heredoc> 
heredoc> # Pu
heredoc> #n' ho
heredoc> # a  },.N f
heredoc> #n' Per c#n'sry###  /
heredoc> ##ntb/  "g":  "n   "g":  "gotig
heredoc>      - A al     ion engine
heredoc>     climat
heredoc> | ug
heredoc> | A 
heredoc>   "gee
heredoc> | A 
heredoc>   "gRHS  "nintio| Aro  "li| A  da  "   <ffffffff> "qu  ereks.ma:  
 ereks.mainlienslie #] iend ots60
heredoc>  R#co─<ffffffff> lie #] iend ots60
heredoc>  R#co──<ffffffff>  R#co───<ffffffff>afiplan erfi es60th a R#co─<ff
ffffff> lie #] ienfi R#co──<ffffffff>  R#co──<ffffffff>  0  coar 0  co n  R
#co<ffffffff>f60
heredoc>  is 
heredoc> # 0  coar 0  cpr iuction build locally
heredoc> npm r 
heredoc>   "germie olant data
heredoc> 
heredoc> Plant Sugin is 
heredoc> # 0  coar 0  cpr iuct (# 0ronpm r 
heredoc>   "germie olant data
heredoc> 
heredoc> Plant SuPl  "geRe
heredoc> Plant Suggest is ddatPlant Suggest is dS 3  ")) 
heredoc>   `not    `notes`: 1mmary type
heredoc>     l 
heredoc>   "gn-  `no.c 
heredoc>   "germita  "g.rowi  "germita  "
heredoc>   
heredoc>   "ghe primaePla  "ghe prima* [Oor  "ghe primaal*](  "ghse  "trans
plando  "teo  "g "  "en  },.
heredoc> 
heredoc> #ds m  },.
heredoc> 
heredoc> #tH  },.
heredoc> 
heredoc> #ig
heredoc> # mode
heredoc> #tH  },.detection
heredoc>   p###le
heredoc> ##on lannerPa 
heredoc> int.cs
heredoc> 
heredoc>  
heredoc> int.cs](h 
heredoc> ia/
heredoc>  int.com/) Page.tsx   # Ria/
heredoc>  int.y  ist   
heredoc>  pl  h view
heredoc>  pco ug  nt- Rep  "tin  "g "  "g.al  },.
heredoc> 
heredoc> #n','  },.
heredoc> 
heredoc> # Pula
heredoc> #n'eet
heredoc> # Pu
heredoc> #n'
heredoc> 
heredoc> -#n'
heredoc> ## a  en#n' Per c#AD##ntb/