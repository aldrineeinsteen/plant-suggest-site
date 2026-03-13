import { useState } from 'react';
import type { PlannerResult, PlantCategory } from '../types';
import { PlantCard } from '../components/PlantCard/PlantCard';
import { FilterBar } from '../components/FilterBar/FilterBar';
import CalendarView from '../components/CalendarView/CalendarView';

const ALL_CATEGORIES = new Set<PlantCategory>(['vegetable', 'herb', 'fruit', 'flower']);

interface Props {
  result: PlannerResult;
  onReset: () => void;
}

export function ResultsPage({ result, onReset }: Props) {
  const [activeCategories, setActiveCategories] = useState<Set<PlantCategory>>(
    new Set(ALL_CATEGORIES)
  );
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');

  const now = new Date();
  const startMonth = now.getMonth() + 1;
  const startYear = now.getFullYear();

  function toggleCategory(cat: PlantCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        // Never deactivate if it's the last one
        if (next.size > 1) next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  const filtered = result.recommendations.filter((r) =>
    activeCategories.has(r.plant.category)
  );

  const { climate } = result;
  const frostLabel = climate.lastFrostDate
    ? climate.lastFrostDate.toLocaleDateString('en-GB', { month: 'long', day: 'numeric' })
    : 'none detected';
  const autumnFrostLabel = climate.firstAutumnFrostDate
    ? climate.firstAutumnFrostDate.toLocaleDateString('en-GB', { month: 'long', day: 'numeric' })
    : 'none detected';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🌱</span>
            <span className="font-bold text-brand-800">Plant Suggest</span>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block truncate max-w-xs">
            {result.location.displayName.split(',').slice(0, 2).join(',')}
          </div>
          <button
            onClick={onReset}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-brand-400 hover:text-brand-700 transition"
          >
            ← New search
          </button>
        </div>
      </header>

      <main className="px-4 py-8">
        {/* Constrained header content — always centred */}
        <div className="mx-auto max-w-5xl">
          {/* Climate summary */}
          <section className="mb-6 rounded-xl border border-brand-100 bg-brand-50 p-4">
            <h2 className="text-sm font-semibold text-brand-800 mb-2">Climate summary</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-700 sm:grid-cols-4">
              <div>
                <span className="text-xs text-gray-500 block">Last spring frost</span>
                <strong>{frostLabel}</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">First autumn frost</span>
                <strong>{autumnFrostLabel}</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Growing season</span>
                <strong>{climate.growingSeasonDays} days</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Avg summer temp</span>
                <strong>{climate.avgSummerTempC}°C</strong>
              </div>
            </div>
          </section>

          {/* Filter bar + view toggle */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <FilterBar
                activeCategories={activeCategories}
                onToggleCategory={toggleCategory}
                totalCount={result.recommendations.length}
                filteredCount={filtered.length}
              />
            </div>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs font-medium shrink-0">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 transition ${
                  viewMode === 'cards'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 border-l border-gray-300 transition ${
                  viewMode === 'calendar'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'calendar' ? (
          <CalendarView
            recommendations={filtered}
            startMonth={startMonth}
            startYear={startYear}
          />
        ) : (
          <div className="mx-auto max-w-5xl">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 py-16">No plants match the selected filters.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((rec) => (
                  <PlantCard key={rec.plant.id} recommendation={rec} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
