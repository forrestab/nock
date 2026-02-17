import { useState, useEffect } from 'react';
import type { SessionConfig } from './types';
import SetupScreen from './screens/SetupScreen';
import ScoringScreen from './screens/ScoringScreen';

const CONFIG_KEY = 'nock-config';

export default function App() {
  const [config, setConfig] = useState<SessionConfig | null>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (config) {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(CONFIG_KEY);
    }
  }, [config]);

  if (!config) {
    return <SetupScreen onStart={setConfig} />;
  }

  return (
    <ScoringScreen
      config={config}
      onReset={() => setConfig(null)}
    />
  );
}
