export type PlantCategory = 'vegetable' | 'herb' | 'fruit' | 'flower';

export type GreenhouseBenefit = 'none' | 'extends' | 'enables';
export type PropagatorBenefit = 'none' | 'accelerates' | 'required';
export type ColdFrameBenefit = 'none' | 'hardens' | 'enables-earlier';

export interface WeekRange {
  min: number;
  max: number;
}

export interface PlantDefinition {
  id: string;
  commonName: string;
  scientificName?: string;
  category: PlantCategory;
  germinationTempMinC: number;
  germinationTempMaxC: number;
  /** Weeks relative to last frost date for direct sowing (can be negative = before frost) */
  sowingOffsetWeeks: WeekRange;
  /** Weeks relative to transplant date for indoor start (typically negative) */
  indoorStartOffsetWeeks: WeekRange;
  /** Weeks after last frost for transplanting outdoors */
  transplantOffsetWeeks: WeekRange;
  daysToFirstHarvest: number;
  harvestDurationDays: number;
  directSowOnly: boolean;
  greenhouseBenefit: GreenhouseBenefit;
  propagatorBenefit: PropagatorBenefit;
  coldFrameBenefit: ColdFrameBenefit;
  companionPlantIds: string[];
  avoidNearIds: string[];
  notes?: string;
  /** Plant-to-plant spacing in centimetres */
  spacingCm: number;
  /** Square Foot Gardening density — plants per square foot (e.g. 0.25 = 1 per 4 sq ft, 16 = 16 per sq ft) */
  plantsPerSqFt: number;
  /** Succession sow interval in weeks — omit if only sown once */
  successionIntervalWeeks?: number;
  /** Max rounds of succession sowing */
  successionRounds?: number;
  /** IDs of companion plants particularly suited to same-bed inter-planting */
  interPlantIds?: string[];
  /** IDs of plants well-suited to follow this crop in the same bed (crop rotation) */
  followWithIds?: string[];
}
