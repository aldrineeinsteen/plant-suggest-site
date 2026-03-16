// One-shot script: adds spacingCm, plantsPerSqFt, successionIntervalWeeks,
// successionRounds and interPlantIds to every plant JSON entry.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Key: plant id.  Values:
//   spacingCm           – plant-to-plant spacing in centimetres (required)
//   plantsPerSqFt       – SFG density (required).  0.25 = 1 per 4 sq ft, 16 = 16 per sq ft
//   successionIntervalWeeks / successionRounds – optional
//   interPlantIds       – subset of companionPlantIds suited for same-bed inter-planting
const PLANT_DATA = {
  // ── VEGETABLES ──────────────────────────────────────────────────────────
  'tomato':                   { spacingCm: 60,  plantsPerSqFt: 0.25, interPlantIds: ['basil'] },
  'courgette':                { spacingCm: 60,  plantsPerSqFt: 0.25, interPlantIds: ['nasturtium'] },
  'lettuce':                  { spacingCm: 25,  plantsPerSqFt: 4,    successionIntervalWeeks: 2, successionRounds: 5, interPlantIds: ['carrot', 'chive'] },
  'carrot':                   { spacingCm: 8,   plantsPerSqFt: 16,   successionIntervalWeeks: 3, successionRounds: 4 },
  'pea':                      { spacingCm: 8,   plantsPerSqFt: 9,    successionIntervalWeeks: 3, successionRounds: 2 },
  'sweetcorn':                { spacingCm: 35,  plantsPerSqFt: 1 },
  'spinach':                  { spacingCm: 15,  plantsPerSqFt: 9,    successionIntervalWeeks: 2, successionRounds: 4 },
  'kale':                     { spacingCm: 45,  plantsPerSqFt: 1 },
  'beetroot':                 { spacingCm: 10,  plantsPerSqFt: 9,    successionIntervalWeeks: 3, successionRounds: 3 },
  'onion':                    { spacingCm: 10,  plantsPerSqFt: 9 },
  'runner-bean':              { spacingCm: 15,  plantsPerSqFt: 4,    interPlantIds: ['sweetcorn'] },
  'french-bean':              { spacingCm: 15,  plantsPerSqFt: 9 },
  'pepper-sweet':             { spacingCm: 45,  plantsPerSqFt: 1,    interPlantIds: ['basil'] },
  'chilli':                   { spacingCm: 45,  plantsPerSqFt: 1 },
  'aubergine':                { spacingCm: 50,  plantsPerSqFt: 1 },
  'leek':                     { spacingCm: 15,  plantsPerSqFt: 4 },
  'brussels-sprouts':         { spacingCm: 60,  plantsPerSqFt: 0.25 },
  'cabbage':                  { spacingCm: 45,  plantsPerSqFt: 1 },
  'cauliflower':              { spacingCm: 60,  plantsPerSqFt: 0.25 },
  'broccoli':                 { spacingCm: 45,  plantsPerSqFt: 1 },
  'purple-sprouting-broccoli':{ spacingCm: 60,  plantsPerSqFt: 0.25 },
  'parsnip':                  { spacingCm: 10,  plantsPerSqFt: 9 },
  'swede':                    { spacingCm: 25,  plantsPerSqFt: 4 },
  'celeriac':                 { spacingCm: 30,  plantsPerSqFt: 1 },
  'radish':                   { spacingCm: 5,   plantsPerSqFt: 16,   successionIntervalWeeks: 2, successionRounds: 6 },
  'swiss-chard':              { spacingCm: 30,  plantsPerSqFt: 1 },
  'pak-choi':                 { spacingCm: 25,  plantsPerSqFt: 4,    successionIntervalWeeks: 3, successionRounds: 3 },
  'spring-onion':             { spacingCm: 5,   plantsPerSqFt: 16,   successionIntervalWeeks: 2, successionRounds: 5 },
  'melon':                    { spacingCm: 60,  plantsPerSqFt: 0.25 },
  'broad-bean':               { spacingCm: 25,  plantsPerSqFt: 4 },
  'broad-bean-spring':        { spacingCm: 25,  plantsPerSqFt: 4 },
  'garlic':                   { spacingCm: 15,  plantsPerSqFt: 4 },
  'spring-cabbage':           { spacingCm: 30,  plantsPerSqFt: 1 },
  'kohlrabi':                 { spacingCm: 20,  plantsPerSqFt: 4,    successionIntervalWeeks: 3, successionRounds: 3 },
  'turnip':                   { spacingCm: 15,  plantsPerSqFt: 9,    successionIntervalWeeks: 3, successionRounds: 3 },
  'pumpkin':                  { spacingCm: 90,  plantsPerSqFt: 0.25 },
  'cucumber':                 { spacingCm: 60,  plantsPerSqFt: 0.5 },
  'potato-first-early':       { spacingCm: 30,  plantsPerSqFt: 1 },
  'potato-maincrop':          { spacingCm: 40,  plantsPerSqFt: 0.5 },
  'asparagus':                { spacingCm: 40,  plantsPerSqFt: 0.5 },
  'celery':                   { spacingCm: 30,  plantsPerSqFt: 1 },
  'rocket':                   { spacingCm: 10,  plantsPerSqFt: 9,    successionIntervalWeeks: 3, successionRounds: 4 },
  'globe-artichoke':          { spacingCm: 90,  plantsPerSqFt: 0.125 },
  'butternut-squash':         { spacingCm: 90,  plantsPerSqFt: 0.25 },
  'sweet-potato':             { spacingCm: 30,  plantsPerSqFt: 1 },
  'jerusalem-artichoke':      { spacingCm: 45,  plantsPerSqFt: 0.5 },
  'salsify':                  { spacingCm: 10,  plantsPerSqFt: 9 },
  'horseradish':              { spacingCm: 60,  plantsPerSqFt: 0.25 },
  'chicory':                  { spacingCm: 30,  plantsPerSqFt: 1 },
  'cavolo-nero':              { spacingCm: 45,  plantsPerSqFt: 1 },
  'collard-greens':           { spacingCm: 45,  plantsPerSqFt: 1 },
  'mustard-greens':           { spacingCm: 15,  plantsPerSqFt: 4,    successionIntervalWeeks: 2, successionRounds: 4 },
  'land-cress':               { spacingCm: 20,  plantsPerSqFt: 4,    successionIntervalWeeks: 3, successionRounds: 3 },
  'edamame':                  { spacingCm: 20,  plantsPerSqFt: 4 },
  'shallot':                  { spacingCm: 15,  plantsPerSqFt: 4 },
  'lima-bean':                { spacingCm: 20,  plantsPerSqFt: 4 },
  'tomatillo':                { spacingCm: 60,  plantsPerSqFt: 0.25 },
  'chickpea':                 { spacingCm: 15,  plantsPerSqFt: 4 },
  'okra':                     { spacingCm: 45,  plantsPerSqFt: 1 },
  'spaghetti-squash':         { spacingCm: 90,  plantsPerSqFt: 0.25 },
  'winter-lettuce':           { spacingCm: 25,  plantsPerSqFt: 4 },
  'daikon':                   { spacingCm: 20,  plantsPerSqFt: 4,    successionIntervalWeeks: 3, successionRounds: 3 },

  // ── HERBS ───────────────────────────────────────────────────────────────
  'basil':      { spacingCm: 20, plantsPerSqFt: 4,    interPlantIds: ['tomato'] },
  'chive':      { spacingCm: 20, plantsPerSqFt: 4,    interPlantIds: ['carrot', 'lettuce'] },
  'rosemary':   { spacingCm: 60, plantsPerSqFt: 0.25 },
  'dill':       { spacingCm: 20, plantsPerSqFt: 4,    successionIntervalWeeks: 3, successionRounds: 3 },
  'fennel':     { spacingCm: 35, plantsPerSqFt: 1 },
  'parsley':    { spacingCm: 20, plantsPerSqFt: 4,    interPlantIds: ['tomato', 'carrot'] },
  'mint':       { spacingCm: 30, plantsPerSqFt: 1 },
  'thyme':      { spacingCm: 30, plantsPerSqFt: 1 },
  'oregano':    { spacingCm: 30, plantsPerSqFt: 1 },
  'sage':       { spacingCm: 45, plantsPerSqFt: 1 },
  'lavender':   { spacingCm: 45, plantsPerSqFt: 1 },
  'coriander':  { spacingCm: 10, plantsPerSqFt: 9,    successionIntervalWeeks: 2, successionRounds: 5 },
  'lemon-balm': { spacingCm: 40, plantsPerSqFt: 0.5 },
  'borage':     { spacingCm: 45, plantsPerSqFt: 1,    interPlantIds: ['tomato', 'courgette'] },
  'chervil':    { spacingCm: 10, plantsPerSqFt: 9,    successionIntervalWeeks: 3, successionRounds: 4 },
  'tarragon':   { spacingCm: 45, plantsPerSqFt: 1 },

  // ── FRUITS ──────────────────────────────────────────────────────────────
  'strawberry': { spacingCm: 30, plantsPerSqFt: 1 },
  // cucumber and pumpkin definitions above also apply to fruits.json entries

  // ── FLOWERS ─────────────────────────────────────────────────────────────
  'marigold':    { spacingCm: 20, plantsPerSqFt: 4,    interPlantIds: ['tomato', 'courgette'] },
  'nasturtium':  { spacingCm: 30, plantsPerSqFt: 1 },
  'sunflower':   { spacingCm: 45, plantsPerSqFt: 1 },
  'cosmos':      { spacingCm: 30, plantsPerSqFt: 1 },
  'zinnia':      { spacingCm: 20, plantsPerSqFt: 4 },
  'calendula':   { spacingCm: 20, plantsPerSqFt: 4 },
  'cornflower':  { spacingCm: 20, plantsPerSqFt: 4 },
  'sweet-pea':   { spacingCm: 20, plantsPerSqFt: 4 },
  'dahlia':      { spacingCm: 45, plantsPerSqFt: 1 },
  'snapdragon':  { spacingCm: 20, plantsPerSqFt: 4 },
  'petunia':     { spacingCm: 20, plantsPerSqFt: 4 },
};

const dataDir = path.join(__dirname, '..', 'public', 'data', 'plants');
const files = ['vegetables.json', 'herbs.json', 'fruits.json', 'flowers.json'];

let totalUpdated = 0;
const missing = [];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const plants = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const updated = plants.map(plant => {
    const extra = PLANT_DATA[plant.id];
    if (!extra) {
      missing.push(`${file}: ${plant.id}`);
      return plant;
    }
    const result = {
      ...plant,
      spacingCm: extra.spacingCm,
      plantsPerSqFt: extra.plantsPerSqFt,
    };
    if (extra.successionIntervalWeeks != null) {
      result.successionIntervalWeeks = extra.successionIntervalWeeks;
      if (extra.successionRounds != null) result.successionRounds = extra.successionRounds;
    }
    if (extra.interPlantIds && extra.interPlantIds.length > 0) {
      result.interPlantIds = extra.interPlantIds;
    }
    return result;
  });

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  console.log(`✅  ${file}: ${updated.length} plants updated`);
  totalUpdated += updated.length;
});

if (missing.length) {
  console.warn('\n⚠  No data found for:');
  missing.forEach(m => console.warn('   -', m));
} else {
  console.log(`\n✅  All ${totalUpdated} plants updated successfully.`);
}
