import type { LocationInput, GrowingSetup } from '../types';
import { PlannerForm } from '../components/PlannerForm/PlannerForm';
import { LoadingSpinner } from '../components/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';

interface Props {
  onSubmit: (location: LocationInput, setup: GrowingSetup) => void;
  isLoading: boolean;
  errorMessage: string | null;
  statusLabel: string;
  isDark: boolean;
  onToggleDark: () => void;
}

export function PlannerPage({ onSubmit, isLoading, errorMessage, statusLabel, isDark, onToggleDark }: Props) {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-brand-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-start justify-center px-4 py-12">
      {/* Dark mode toggle */}
      <button
        onClick={onToggleDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="absolute top-4 right-4 rounded-full p-2 text-lg text-gray-500 hover:bg-black/10 dark:text-gray-400 dark:hover:bg-white/10 transition"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="text-5xl mb-3" aria-hidden="true">🌱</div>
          <h1 className="text-3xl font-bold text-brand-800 dark:text-brand-400">Plant Suggest</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Find the right plants for your garden and the best time to grow them.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white dark:bg-gray-800 dark:border-gray-700 p-6 shadow-md border border-gray-100">
          <PlannerForm onSubmit={onSubmit} isLoading={isLoading} />
        </div>

        {/* Status / errors */}
        {isLoading && statusLabel && (
          <div className="mt-6">
            <LoadingSpinner label={statusLabel} />
          </div>
        )}
        {errorMessage && (
          <div className="mt-4">
            <ErrorMessage message={errorMessage} />
          </div>
        )}
      </div>
    </main>
  );
}
