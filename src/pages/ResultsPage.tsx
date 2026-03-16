import { useState } from 'react';
import type { PlannerResult, PlantCategory, PlantRecommendation } from '../types';
import type { UsePlanReturn } from '../hooks/usePlan';
import { PlantCard } from '../components/PlantCard/PlantCard';
import { FilterBar } from '../components/FilterBar/FilterBar';
import CalendarView from '../components/CalendarView/CalendarView';
import { PlantSheet } from '../components/PlantSheet/PlantSheet';

const ALL_CATEGORIES = new Set<PlantCategory>(['vegetable', 'herb', 'fruit', 'flower']);

interface Props {
  result: PlannerResult;
  onReset: () => void;
  plan: UsePlanReturn;
  isDark: boolean;
  onToggleDark: () => void;
}

export function ResultsPage({ result, onReset, plan, isDark, onToggleDark }: Props) {
  const [activeCategories, setActiveCategories] = useState<Set<PlantCategory>>(
    new Set(ALL_CATEGORIES)
  );
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>(
    () => (typeof window !== 'undefined' && window.innerWidth < 640) ? 'calendar' : 'cards'
  );
  const [monthOffset, setMonthOffset] = useState(-2);
  const [climateOpen, setClimateOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState<PlantRecommendation | null>(null);

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const startMonth = viewDate.getMonth() + 1;
  const startYear = viewDate.getFullYear();

  function navigate(delta: number) {
    setMonthOffset((prev) => Math.max(-24, Math.min(24, prev + delta)));
  }

  function resetToDefault() {
    setMonthOffset(0);
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <PlantSheet
        rec={selectedRec}
        onClose={() => setSelectedRec(null)}
        isInPlan={selectedRec ? plan.isInPlan(selectedRec.plant.id) : false}
        onTogglePlan={selectedRec ? () => plan.togglePlan(selectedRec.plant.id) : () => {}}
      />
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🌱</span>
            <span className="font-bold text-brand-800 dark:text-brand-400">Plant Suggest</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300 hidden sm:block truncate max-w-xs">
            {result.location.displayName.split(',').slice(0, 2).join(',')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-full p-1.5 text-base text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={onReset}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-brand-400 hover:text-brand-700 dark:hover:border-brand-400 dark:hover:text-brand-400 transition"
            >
              ← New search
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8">
        {/* Constrained header content — always centred */}
        <div className="mx-auto max-w-5xl">
          {/* Climate summary */}
          <section className="mb-6 rounded-xl border border-brand-100 dark:border-gray-700 bg-brand-50 dark:bg-gray-800">
            {/* Header row — always visible */}
            <button
              onClick={() => setClimateOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              aria-expanded={climateOpen}
            >
              <h2 className="text-sm font-semibold text-brand-800 dark:text-brand-300">Climate summary</h2>
              <div className="flex items-center gap-2">
                {/* Temp badge — visible when collapsed */}
                {!climateOpen && (
                  <span className="rounded-full bg-brand-100 dark:bg-gray-700 border border-brand-200 dark:border-gray-600 px-2 py-0.5 text-xs font-medium text-brand-800 dark:text-brand-300">
                    {climate.avgSummerTempC}°C · {climate.growingSeasonDays}d
                  </span>
                )}
                <span className="text-brand-600 dark:text-brand-400 text-sm select-none">{climateOpen ? '▲' : '▼'}</span>
              </div>
            </button>
            {/* Expandable detail */}
            {climateOpen && (
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-4">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-500 block">Last spring frost</span>
                  <strong>{frostLabel}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-500 block">First autumn frost</span>
                  <strong>{autumnFrostLabel}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-500 block">Growing season</span>
                  <strong>{climate.growingSeasonDays} days</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-500 block">Avg summer temp</span>
                  <strong>{climate.avgSummerTempC}°C</strong>
                </div>
              </div>
            )}
          </section>

          {/* Filter bar + view toggle — single row */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <FilterBar
              activeCategories={activeCategories}
              onToggleCategory={toggleCategory}
              totalCount={result.recommendations.length}
              filteredCount={filtered.length}
            />
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-medium ml-auto shrink-0">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 transition ${
                  viewMode === 'cards'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 border-l border-gray-300 dark:border-gray-600 transition ${
                  viewMode === 'calendar'
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'calendar' ? (
          <div className="mx-auto max-w-5xl px-4">
            <CalendarView
              recommendations={filtered}
              startMonth={startMonth}
              startYear={startYear}
              monthOffset={monthOffset}
              onNavigate={navigate}
              onReset={resetToDefault}
              onSelectPlant={setSelectedRec}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-5xl">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-16">No plants match the selected filters.</p>
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
