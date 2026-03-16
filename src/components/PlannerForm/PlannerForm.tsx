import { useState } from 'react';
import type { LocationInput, GrowingSetup } from '../../types';

const COUNTRIES = [
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ES', name: 'Spain' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

interface Props {
  onSubmit: (location: LocationInput, setup: GrowingSetup) => void;
  isLoading: boolean;
}

export function PlannerForm({ onSubmit, isLoading }: Props) {
  const [country, setCountry] = useState('GB');
  const [postcode, setPostcode] = useState('');
  const [greenhouse, setGreenhouse] = useState(false);
  const [propagator, setPropagator] = useState(false);
  const [coldFrame, setColdFrame] = useState(false);
  const [postcodeError, setPostcodeError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = postcode.trim();
    if (!trimmed) {
      setPostcodeError('Please enter a postcode or ZIP code.');
      return;
    }
    setPostcodeError('');
    onSubmit(
      { country, postcode: trimmed },
      {
        hasGreenhouse: greenhouse,
        hasHeatedPropagator: propagator,
        hasColdFrame: coldFrame,
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Location */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Your location
        </legend>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Postcode / ZIP code
          </label>
          <input
            id="postcode"
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="e.g. SW1A 1AA"
            autoComplete="postal-code"
            className={`block w-full rounded-lg border px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 shadow-sm focus:outline-none focus:ring-1 ${
              postcodeError
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-gray-300 dark:border-gray-600 focus:border-brand-500 focus:ring-brand-500'
            }`}
          />
          {postcodeError && (
            <p className="mt-1 text-xs text-red-600">{postcodeError}</p>
          )}
        </div>
      </fieldset>

      {/* Growing setup */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Growing setup
        </legend>

        {[
          {
            id: 'greenhouse',
            label: 'Greenhouse',
            description: 'Extends and enables your season significantly.',
            checked: greenhouse,
            onChange: setGreenhouse,
          },
          {
            id: 'propagator',
            label: 'Heated propagator / heat mat',
            description: 'Improves germination rates for warmth-loving plants.',
            checked: propagator,
            onChange: setPropagator,
          },
          {
            id: 'coldframe',
            label: 'Cold frame',
            description: 'Allows earlier transplanting and hardening off.',
            checked: coldFrame,
            onChange: setColdFrame,
          },
        ].map(({ id, label, description, checked, onChange }) => (
          <label
            key={id}
            htmlFor={id}
            className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-600 p-3 cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 transition"
          >
            <input
              id={id}
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">{description}</span>
            </div>
          </label>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Finding plants…' : 'Find plants for my garden'}
      </button>
    </form>
  );
}
