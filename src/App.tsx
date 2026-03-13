import { usePlanner } from './hooks/usePlanner';
import { PlannerPage } from './pages/PlannerPage';
import { ResultsPage } from './pages/ResultsPage';

export default function App() {
  const { status, statusLabel, result, errorMessage, run, reset } = usePlanner();

  const isLoading = status === 'geocoding' || status === 'weather' || status === 'planning';

  if (status === 'done' && result) {
    return <ResultsPage result={result} onReset={reset} />;
  }

  return (
    <PlannerPage
      onSubmit={run}
      isLoading={isLoading}
      errorMessage={errorMessage}
      statusLabel={statusLabel}
    />
  );
}

