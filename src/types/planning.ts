import type { PlantDefinition } from './plant';
import type { HolidayEntry } from './holiday';
import type { GeoLocation, GrowingSetup } from './location';
import type { ClimateSummary } from './climate';

/** Which quarter of the month a date falls in */
export type MonthPart = 1 | 2 | 3 | 4;

export interface MonthWindow {
  /** Human-readable label, e.g. "Early March" */
  label: string;
  /** 1=Early (days 1–7), 2=Mid (8–15), 3=Late (16–23), 4=End (24–end) */
  part: MonthPart;
  /** 1–12 */
  month: number;
  year: number;
}

export interface PlanningWindow {
  start: MonthWindow;
  end: MonthWindow;
  /** Display string, e.g. "Early March – Mid April" */
  label: string;
}

export type WindowType =
  | 'indoorSeedStart'
  | 'directSow'
  | 'transplant'
  | 'firstHarvest'
  | 'harvest';

export interface HolidayHighlight {
  holiday: HolidayEntry;
  windowType: WindowType;
  quality: 'best' | 'good';
}

export interface PlantRecommendation {
  plant: PlantDefinition;
  score: number;
  indoorSeedStartWindow?: PlanningWindow;
  directSowWindow?: PlanningWindow;
  transplantWindow?: PlanningWindow;
  firstHarvestWindow?: PlanningWindow;
  harvestWindow?: PlanningWindow;
  companionPlants: PlantDefinition[];
  plantsToAvoid: PlantDefinition[];
  warnings: string[];
  holidayHighlights: HolidayHighlight[];
  /** True when all windows have been shifted +365 days because this season's window has passed. */
  isNextSeason?: boolean;
}

export interface PlannerResult {
  location: GeoLocation;
  climate: ClimateSummary;
  setup: GrowingSetup;
  recommendations: PlantRecommendation[];
  generatedAt: Date;
}
