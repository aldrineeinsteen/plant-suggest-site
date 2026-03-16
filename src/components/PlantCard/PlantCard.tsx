import type { PlantRecommendation, WindowType } from '../../types';
import { WindowBadge } from '../WindowBadge/WindowBadge';
import { HolidayBadge } from '../HolidayBadge/HolidayBadge';

const CATEGORY_COLOURS: Record<string, string> = {
  vegetable: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  herb: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  fruit: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  flower: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

interface Props {
  recommendation: PlantRecommendation;
  /** When true, renders without the outer article card wrapper (for use inside PlantSheet) */
  inSheet?: boolean;
  /** Reflects whether this plant is in the user's list. */
  isInPlan?: boolean;
  /** When provided, renders an interactive Add / Saved button at the top of the card. */
  onTogglePlan?: () => void;
}

export function PlantCard({ recommendation: rec, inSheet = false, isInPlan = false, onTogglePlan }: Props) {
  const { plant } = rec;

  const windows: { type: WindowType; label: string }[] = [
    { type: 'indoorSeedStart', label: '' },
    { type: 'directSow', label: '' },
    { type: 'transplant', label: '' },
    { type: 'firstHarvest', label: '' },
    { type: 'harvest', label: '' },
  ];

  const windowMap: Partial<Record<WindowType, ReturnType<typeof Object.values>[0]>> = {
    indoorSeedStart: rec.indoorSeedStartWindow,
    directSow: rec.directSowWindow,
    transplant: rec.transplantWindow,
    firstHarvest: rec.firstHarvestWindow,
    harvest: rec.harvestWindow,
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{plant.commonName}</h2>
          {plant.scientificName && (
            <p className="text-xs italic text-gray-400 dark:text-gray-500">{plant.scientificName}</p>
          )}
          {rec.isNextSeason && (
            <span className="mt-1 inline-block rounded-full border border-indigo-100 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300">
              Next season
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {onTogglePlan && (
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePlan(); }}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                isInPlan
                  ? 'bg-brand-600 text-white hover:bg-brand-700 dark:hover:bg-brand-500'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-brand-500 hover:text-brand-600 dark:hover:border-brand-400 dark:hover:text-brand-400'
              }`}
            >
              {isInPlan ? '✓ Saved' : '+ Add to List'}
            </button>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
              CATEGORY_COLOURS[plant.category] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            {plant.category}
          </span>
        </div>
      </div>

      {/* Planning windows */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {windows.map(({ type }) => {
          const w = windowMap[type];
          return w ? <WindowBadge key={type} windowType={type} window={w} /> : null;
        })}
      </div>

      {/* Companion plants */}
      {rec.companionPlants.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Companion plants</p>
          <div className="flex flex-wrap gap-1">
            {rec.companionPlants.map((cp) => (
              <span
                key={cp.id}
                className="rounded-full bg-brand-50 dark:bg-brand-900/40 px-2 py-0.5 text-xs text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-800"
              >
                {cp.commonName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Plants to avoid */}
      {rec.plantsToAvoid.length > 0 && (
        <div className="mt-2">
          <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Avoid near</p>
          <div className="flex flex-wrap gap-1">
            {rec.plantsToAvoid.map((p) => (
              <span
                key={p.id}
                className="rounded-full bg-red-50 dark:bg-red-950 px-2 py-0.5 text-xs text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900"
              >
                {p.commonName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {rec.warnings.length > 0 && (
        <ul className="mt-3 space-y-1">
          {rec.warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
              <span aria-hidden="true" className="mt-0.5 shrink-0">⚠</span>
              {w}
            </li>
          ))}
        </ul>
      )}

      {/* Holiday highlights */}
      {rec.holidayHighlights.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          {rec.holidayHighlights.map((h, i) => (
            <HolidayBadge key={i} highlight={h} />
          ))}
        </div>
      )}

      {/* Notes */}
      {plant.notes && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-700 pt-2">{plant.notes}</p>
      )}

      {/* Garden planning */}
      <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
        <p className="mb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Garden planning</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-700 dark:text-gray-300">
          <span>
            <span className="text-gray-400 dark:text-gray-500">Spacing </span>
            {plant.spacingCm} cm
          </span>
          <span>
            <span className="text-gray-400 dark:text-gray-500">SFG </span>
            {plant.plantsPerSqFt >= 1
              ? `${plant.plantsPerSqFt} per sq ft`
              : `1 per ${Math.round(1 / plant.plantsPerSqFt)} sq ft`}
          </span>
          {plant.successionIntervalWeeks && (
            <span className="col-span-2">
              <span className="text-gray-400 dark:text-gray-500">Succession </span>
              every {plant.successionIntervalWeeks}w
              {plant.successionRounds ? ` · ${plant.successionRounds} rounds` : ''}
            </span>
          )}
        </div>
        {plant.interPlantIds && plant.interPlantIds.length > 0 && (
          <div className="mt-1.5">
            <span className="text-xs text-gray-400 dark:text-gray-500">Inter-plant with </span>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {rec.companionPlants
                .filter((cp) => plant.interPlantIds!.includes(cp.id))
                .map((cp) => (
                  <span
                    key={cp.id}
                    className="rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300"
                  >
                    {cp.commonName}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Follow with — crop rotation suggestions */}
      {rec.followWithPlants.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Good crops to plant after this</p>
          <div className="flex flex-wrap gap-1">
            {rec.followWithPlants.map((p) => (
              <span
                key={p.id}
                className="rounded-full bg-sky-50 dark:bg-sky-950 border border-sky-100 dark:border-sky-900 px-2 py-0.5 text-xs text-sky-700 dark:text-sky-300"
              >
                {p.commonName}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );

  if (inSheet) return <div>{content}</div>;
  return (
    <article className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition hover:shadow-md">
      {content}
    </article>
  );
}
