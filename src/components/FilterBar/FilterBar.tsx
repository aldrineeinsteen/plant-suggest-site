import type { PlantCategory } from '../../types';

const ALL_CATEGORIES: PlantCategory[] = ['vegetable', 'herb', 'fruit', 'flower'];

interface Props {
  activeCategories: Set<PlantCategory>;
  onToggleCategory: (cat: PlantCategory) => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterBar({ activeCategories, onToggleCategory, totalCount, filteredCount }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-500">
        Showing <strong>{filteredCount}</strong> of {totalCount} plants
      </span>
      <div className="flex flex-wrap gap-1.5 ml-auto">
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
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
