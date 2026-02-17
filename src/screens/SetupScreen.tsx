import { useState } from 'react';
import type { SessionConfig } from '../types';
import Button from '../components/Button';
import NumberInput from '../components/NumberInput';

interface SetupScreenProps {
  onStart: (config: SessionConfig) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [config, setConfig] = useState<SessionConfig>({
    distance: 18,
    arrowsPerEnd: 3,
    endsPerRound: 10,
    rounds: 2,
  });

  const totalArrows = config.rounds * config.endsPerRound * config.arrowsPerEnd;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-slate-800 text-center">🎯 Nock</h1>
      </div>

      <div className="flex-1 p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <NumberInput
            label="Distance (m)"
            value={config.distance}
            onChange={(v) => setConfig({ ...config, distance: v })}
            max={100}
          />
          <NumberInput
            label="Arrows per End"
            value={config.arrowsPerEnd}
            onChange={(v) => setConfig({ ...config, arrowsPerEnd: v })}
            max={6}
          />
          <NumberInput
            label="Ends per Round"
            value={config.endsPerRound}
            onChange={(v) => setConfig({ ...config, endsPerRound: v })}
            max={20}
          />
          <NumberInput
            label="Rounds"
            value={config.rounds}
            onChange={(v) => setConfig({ ...config, rounds: v })}
            max={10}
          />
        </div>

        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <p className="text-slate-600">
            <span className="font-bold text-2xl text-slate-800">{totalArrows}</span> total arrows
          </p>
          <p className="text-slate-500 text-sm">
            Max score: {totalArrows * 10}
          </p>
        </div>
      </div>

      <div className="p-4">
        <Button
          variant="success"
          onClick={() => onStart(config)}
          className="w-full py-4 text-xl"
        >
          Start Session
        </Button>
      </div>
    </div>
  );
}
