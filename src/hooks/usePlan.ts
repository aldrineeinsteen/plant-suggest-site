import { useState } from 'react';

const PLAN_KEY = 'plant-suggest-plan';
const PLAN_VERSION = 1;

type PlanStorage = { v: number; ids: string[] };

function loadPlanIds(): string[] {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Migrate: old format was a raw string[] with no version wrapper
    if (Array.isArray(parsed)) {
      const ids = parsed.filter((x): x is string => typeof x === 'string');
      savePlanIds(ids);
      return ids;
    }
    const wrapper = parsed as Partial<PlanStorage>;
    if (wrapper.v !== PLAN_VERSION || !Array.isArray(wrapper.ids)) return [];
    return wrapper.ids.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

function savePlanIds(ids: string[]): void {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify({ v: PLAN_VERSION, ids }));
  } catch {
    // Quota exceeded or storage unavailable — silently skip
  }
}

export interface UsePlanReturn {
  planIds: string[];
  isInPlan: (id: string) => boolean;
  togglePlan: (id: string) => void;
  clearPlan: () => void;
  /** Overwrite the saved list (e.g. when restoring from a share link). */
  seedPlan: (ids: string[]) => void;
}

export function usePlan(): UsePlanReturn {
  const [planIds, setPlanIds] = useState<string[]>(() => loadPlanIds());

  function isInPlan(id: string): boolean {
    return planIds.includes(id);
  }

  function togglePlan(id: string): void {
    setPlanIds((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      savePlanIds(next);
      return next;
    });
  }

  function clearPlan(): void {
    localStorage.removeItem(PLAN_KEY);
    setPlanIds([]);
  }

  function seedPlan(ids: string[]): void {
    savePlanIds(ids);
    setPlanIds(ids);
  }

  return { planIds, isInPlan, togglePlan, clearPlan, seedPlan };
}
