import type { LocationInput, GrowingSetup } from '../types';
import { PlannerForm } from '../components/PlannerForm/PlannerForm';
import { LoadingSpinner } from '../components/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';

interface Props {
  onSubmit: (location: LocationInput, setup: GrowingSetup) => void;
  isLoading: boolean;
  errorMessage: string | null;
  statusLabel: string;
}

export function PlannerPage({ onSubmit, isLoading, errorMessage, statusLabel }: Props) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 to-green-100 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="text-5xl mb-3" aria-hidden="true">🌱</div>
          <h1 className="text-3xl font-bold text-brand-800">Plant Suggest</h1>
          <p className="mt-2 text-sm text-gray-600">
            Find the right plants for your garden and the best time to grow them.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
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
