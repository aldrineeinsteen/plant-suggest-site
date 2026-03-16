// One-shot script: adds followWithIds to every plant JSON entry.
// followWithIds = IDs of plants well-suited to follow this crop in the same bed (crop rotation).
// Run with: node scripts/add-follow-with.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Rotation principles applied:
//   Heavy feeders (brassicas, solanums, cucurbits, com)  → legumes (nitrogen fix)
//   Legumes                                               → brassicas, alliums, root veg
//   Root veg                                              → alliums or leafy greens
//   Alliums                                               → root veg or leafy greens
//   Leafy greens                                          → roots or brassicas
//   Perennials (asparagus, rosemary, mint…)               → [] (don't rotate)
const FOLLOW_WITH = {
  // ── VEGETABLES ──────────────────────────────────────────────────────────
  'tomato':                    ['lettuce', 'spinach', 'carrot'],
  'courgette':                 ['pea', 'french-bean', 'spinach'],
  'lettuce':                   ['carrot', 'radish', 'beetroot'],
  'carrot':                    ['onion', 'spring-onion', 'lettuce'],
  'pea':                       ['cabbage', 'kale', 'lettuce', 'leek'],
  'sweetcorn':                 ['pea', 'french-bean', 'spinach'],
  'spinach':                   ['carrot', 'beetroot', 'onion'],
  'kale':                      ['pea', 'french-bean', 'carrot'],
  'beetroot':                  ['lettuce', 'pea', 'spinach'],
  'onion':                     ['carrot', 'lettuce', 'beetroot'],
  'runner-bean':               ['cabbage', 'kale', 'leek', 'broccoli'],
  'french-bean':               ['cabbage', 'broccoli', 'leek', 'kale'],
  'pepper-sweet':              ['lettuce', 'spinach', 'carrot'],
  'chilli':                    ['lettuce', 'spinach', 'carrot'],
  'aubergine':                 ['lettuce', 'spinach', 'pea'],
  'leek':                      ['carrot', 'lettuce', 'beetroot'],
  'brussels-sprouts':          ['pea', 'french-bean', 'lettuce'],
  'cabbage':                   ['pea', 'french-bean', 'beetroot'],
  'cauliflower':               ['pea', 'french-bean', 'onion'],
  'broccoli':                  ['pea', 'french-bean', 'onion'],
  'purple-sprouting-broccoli': ['pea', 'french-bean', 'lettuce'],
  'parsnip':                   ['onion', 'lettuce', 'pea'],
  'swede':                     ['pea', 'french-bean', 'lettuce'],
  'celeriac':                  ['pea', 'onion', 'lettuce'],
  'radish':                    ['carrot', 'lettuce', 'spinach'],
  'swiss-chard':               ['pea', 'carrot', 'onion'],
  'pak-choi':                  ['carrot', 'lettuce', 'beetroot'],
  'spring-onion':              ['carrot', 'lettuce', 'beetroot'],
  'melon':                     ['lettuce', 'spinach', 'pea'],
  'broad-bean':                ['cabbage', 'kale', 'broccoli', 'leek'],
  'broad-bean-spring':         ['cabbage', 'kale', 'broccoli', 'leek'],
  'garlic':                    ['carrot', 'lettuce', 'beetroot'],
  'spring-cabbage':            ['pea', 'french-bean', 'onion'],
  'kohlrabi':                  ['lettuce', 'carrot', 'spinach'],
  'turnip':                    ['pea', 'french-bean', 'lettuce'],
  'pumpkin':                   ['pea', 'french-bean', 'spinach'],
  'butternut-squash':          ['pea', 'french-bean', 'spinach'],
  'cucumber':                  ['lettuce', 'spinach', 'pea'],
  'potato-first-early':        ['pea', 'lettuce', 'french-bean', 'leek'],
  'potato-maincrop':           ['pea', 'lettuce', 'french-bean', 'leek'],
  'asparagus':                 [],
  'celery':                    ['onion', 'beetroot', 'lettuce'],
  'rocket':                    ['carrot', 'lettuce', 'beetroot'],
  'globe-artichoke':           [],
  'spaghetti-squash':          ['pea', 'french-bean', 'spinach'],
  'sweet-potato':              ['lettuce', 'pea', 'spinach'],
  'jerusalem-artichoke':       ['lettuce', 'pea'],
  'salsify':                   ['lettuce', 'pea', 'carrot'],
  'horseradish':               [],
  'chicory':                   ['lettuce', 'carrot', 'beetroot'],
  'cavolo-nero':               ['pea', 'french-bean', 'carrot'],
  'collard-greens':            ['pea', 'french-bean', 'onion'],
  'mustard-greens':            ['carrot', 'lettuce', 'beetroot'],
  'watercress':                [],
  'land-cress':                ['carrot', 'lettuce', 'beetroot'],
  'edamame':                   ['cabbage', 'lettuce', 'kale'],
  'shallot':                   ['carrot', 'lettuce', 'beetroot'],
  'lima-bean':                 ['cabbage', 'lettuce', 'kale'],
  'tomatillo':                 ['lettuce', 'spinach', 'carrot'],
  'chickpea':                  ['cabbage', 'lettuce', 'kale'],
  'okra':                      ['lettuce', 'spinach', 'carrot'],
  'winter-lettuce':            ['carrot', 'radish', 'onion'],
  'daikon':                    ['lettuce', 'carrot', 'spinach'],

  // ── HERBS ───────────────────────────────────────────────────────────────
  'basil':        ['lettuce', 'carrot'],
  'chive':        ['lettuce', 'carrot'],
  'rosemary':     [],
  'dill':         ['lettuce', 'carrot'],
  'mint':         [],
  'parsley':      ['lettuce', 'carrot'],
  'coriander':    ['lettuce', 'carrot'],
  'thyme':        [],
  'sage':         [],
  'oregano':      [],
  'lavender':     [],
  'lemon-verbena': [],
  'lemon-balm':   [],
  'borage':       ['lettuce', 'carrot'],
  'chervil':      ['carrot', 'lettuce'],
  'tarragon':     [],

  // ── FRUITS ──────────────────────────────────────────────────────────────
  'strawberry':   ['lettuce', 'spinach'],

  // ── FLOWERS ─────────────────────────────────────────────────────────────
  'marigold':    ['lettuce', 'carrot'],
  'nasturtium':  ['lettuce', 'spinach'],
  'sunflower':   ['pea', 'lettuce'],
  'cosmos':      ['lettuce', 'carrot'],
  'zinnia':      ['lettuce'],
  'calendula':   ['lettuce', 'carrot'],
  'cornflower':  ['lettuce'],
  'sweet-pea':   [],
  'dahlia':      [],
  'snapdragon':  ['lettuce', 'carrot'],
  'petunia':     [],
};

const dataDir = path.join(__dirname, '..', 'public', 'data', 'plants');
const files = ['vegetables.json', 'herbs.json', 'fruits.json', 'flowers.json'];

let totalUpdated = 0;
const missing = [];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const plants = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const updated = plants.map(plant => {
    if (!(plant.id in FOLLOW_WITH)) {
      missing.push(`${file}: ${plant.id}`);
      return plant;
    }
    const ids = FOLLOW_WITH[plant.id];
    const result = { ...plant };
    if (ids.length > 0) {
      result.followWithIds = ids;
    } else {
      // Remove if previously set (idempotent)
      delete result.followWithIds;
    }
    return result;
  });

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
  console.log(`✅  ${file}: ${updated.length} plants updated`);
  totalUpdated += updated.length;
});

if (missing.length) {
  console.warn('\n⚠  No followWith data defined for:');
  missing.forEach(m => console.warn('   -', m));
} else {
  console.log(`\n✅  All ${totalUpdated} plants updated successfully.`);
}
