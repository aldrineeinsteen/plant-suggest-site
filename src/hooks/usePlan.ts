import { useState } from 'react';

const PLAN_KEY = 'plant-suggest-plan';

function loadPlanIds(): string[] {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePlanIds(ids: string[]): void {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(ids));
  } catch {
    // Quota exceeded or storage unavailable — silently skip
  }
}

export interface UsePlanReturn {
  planIds: string[];
  isInPlan: (id: string) => boolean;
  togglePlan: (id: string) => void;
  clearPlan: () => void;
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

  return { planIds, isInPlan, togglePlan, clearPlan };
}
