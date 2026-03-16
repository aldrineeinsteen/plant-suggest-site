import type { PlantCategory } from '../../types';

const ALL_CATEGORIES: PlantCategory[] = ['vegetable', 'herb', 'fruit', 'flower'];

const CATEGORY_EMOJI: Record<PlantCategory, string> = {
  vegetable: '🥦',
  herb: '🌿',
  fruit: '🍓',
  flower: '🌸',
};

interface Props {
  activeCategories: Set<PlantCategory>;
  onToggleCategory: (cat: PlantCategory) => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterBar({ activeCategories, onToggleCategory, totalCount, filteredCount }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1.5">
        {ALL_CATEGORIES.map((cat) => {
          const active = activeCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggleCategory(cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition ${
                active
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-brand-500 hover:text-brand-700'
              }`}
            >
              {CATEGORY_EMOJI[cat]}<span className="hidden sm:inline"> {cat}</span>
            </button>
          );
        })}
      </div>
      <span className="text-xs text-gray-400 hidden sm:inline">
        {filteredCount}/{totalCount}
      </span>
    </div>
  );
}
