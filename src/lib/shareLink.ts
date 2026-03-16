import type { LocationInput, GrowingSetup } from '../types';

interface SharePayload {
  v: number;
  p: string;   // postcode
  c: string;   // country
  g: boolean;  // hasGreenhouse
  pr: boolean; // hasHeatedPropagator
  cf: boolean; // hasColdFrame
  ids: string[]; // saved plant IDs
}

export interface DecodedShareLink {
  inputs: LocationInput;
  setup: GrowingSetup;
  planIds: string[];
}

export function encodeShareLink(
  input: LocationInput,
  setup: GrowingSetup,
  planIds: string[]
): string {
  const payload: SharePayload = {
    v: 1,
    p: input.postcode,
    c: input.country,
    g: setup.hasGreenhouse,
    pr: setup.hasHeatedPropagator,
    cf: setup.hasColdFrame,
    ids: planIds,
  };
  const encoded = btoa(JSON.stringify(payload));
  return `${window.location.origin}${window.location.pathname}#${encoded}`;
}

export function decodeShareLink(hash: string): DecodedShareLink | null {
  try {
    const clean = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!clean) return null;
    const payload = JSON.parse(atob(clean)) as Partial<SharePayload>;
    if (payload.v !== 1) return null;
    if (typeof payload.p !== 'string' || !payload.p) return null;
    if (typeof payload.c !== 'string' || !payload.c) return null;
    return {
      inputs: { postcode: payload.p, country: payload.c },
      setup: {
        hasGreenhouse: Boolean(payload.g),
        hasHeatedPropagator: Boolean(payload.pr),
        hasColdFrame: Boolean(payload.cf),
      },
      planIds: Array.isArray(payload.ids)
        ? payload.ids.filter((id): id is string => typeof id === 'string')
        : [],
    };
  } catch {
    return null;
  }
}
