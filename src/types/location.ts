export interface LocationInput {
  /** ISO 3166-1 alpha-2 country code, e.g. "GB" */
  country: string;
  postcode: string;
}

export interface GeoLocation {
  lat: number;
  lon: number;
  displayName: string;
}

export interface GrowingSetup {
  hasGreenhouse: boolean;
  hasHeatedPropagator: boolean;
  hasColdFrame: boolean;
}
