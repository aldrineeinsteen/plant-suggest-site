import type { PlantRecommendation, WindowType } from '../../types';
import { WindowBadge } from '../WindowBadge/WindowBadge';
import { HolidayBadge } from '../HolidayBadge/HolidayBadge';

const CATEGORY_COLOURS: Record<string, string> = {
  vegetable: 'bg-lime-100 text-lime-800',
  herb: 'bg-teal-100 text-teal-800',
  fruit: 'bg-orange-100 text-orange-800',
  flower: 'bg-pink-100 text-pink-800',
};

interface Props {
  recommendation: PlantRecommendation;
}

export function PlantCard({ recommendation: rec }: Props) {
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

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{plant.commonName}</h2>
          {plant.scientificName && (
            <p className="text-xs italic text-gray-400">{plant.scientificName}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
            CATEGORY_COLOURS[plant.category] ?? 'bg-gray-100 text-gray-700'
          }`}
        >
          {plant.category}
        </span>
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
          <p className="mb-1 text-xs font-semibold text-gray-500">Companion plants</p>
          <div className="flex flex-wrap gap-1">
            {rec.companionPlants.map((cp) => (
              <span
                key={cp.id}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 border border-brand-100"
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
          <p className="mb-1 text-xs font-semibold text-gray-500">Avoid near</p>
          <div className="flex flex-wrap gap-1">
            {rec.plantsToAvoid.map((p) => (
              <span
                key={p.id}
                className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700 border border-red-100"
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
        <p className="mt-3 text-xs text-gray-500 italic border-t border-gray-100 pt-2">{plant.notes}</p>
      )}
    </article>
  );
}
