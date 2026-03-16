import { useEffect } from 'react';
import { usePlanner } from './hooks/usePlanner';
import { usePlan } from './hooks/usePlan';
import { useDarkMode } from './hooks/useDarkMode';
import { decodeShareLink } from './lib/shareLink';
import { PlannerPage } from './pages/PlannerPage';
import { ResultsPage } from './pages/ResultsPage';

export default function App() {
  const { status, statusLabel, result, errorMessage, run, reset } = usePlanner();
  const plan = usePlan();
  const { isDark, toggle: toggleDark } = useDarkMode();

  // Restore state from a share link on first load
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const decoded = decodeShareLink(hash);
    if (!decoded) return;
    // Strip the hash so the URL is clean and sharing again works correctly
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    plan.seedPlan(decoded.planIds);
    run(decoded.inputs, decoded.setup);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = status === 'geocoding' || status === 'weather' || status === 'planning';

  if (status === 'done' && result) {
    return <ResultsPage result={result} onReset={reset} plan={plan} isDark={isDark} onToggleDark={toggleDark} />;
  }

  return (
    <PlannerPage
      onSubmit={run}
      isLoading={isLoading}
      errorMessage={errorMessage}
      statusLabel={statusLabel}
      isDark={isDark}
      onToggleDark={toggleDark}
    />
  );
}

