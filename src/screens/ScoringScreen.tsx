import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import type { SessionConfig, ScoreValue } from '../types';
import { SCORE_VALUES, getScoreNumeric, calculateMetrics } from '../scoring';
import Button from '../components/Button';
import ArrowBadge from '../components/ArrowBadge';
import EndRow from '../components/EndRow';

const STORAGE_KEY = 'nock-session';

interface ScoringScreenProps {
  config: SessionConfig;
  onReset: () => void;
}

interface SessionState {
  ends: ScoreValue[][];
  currentEnd: ScoreValue[];
}

function loadSession(config: SessionConfig): SessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (
        saved.configHash === JSON.stringify(config) &&
        Array.isArray(saved.ends) &&
        Array.isArray(saved.currentEnd)
      ) {
        return { ends: saved.ends, currentEnd: saved.currentEnd };
      }
    }
  } catch { /* ignore corrupt data */ }
  return { ends: [], currentEnd: [] };
}

function saveSession(config: SessionConfig, ends: ScoreValue[][], currentEnd: ScoreValue[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    configHash: JSON.stringify(config),
    ends,
    currentEnd,
  }));
}

export default function ScoringScreen({ config, onReset }: ScoringScreenProps) {
  const initial = loadSession(config);
  const [ends, setEnds] = useState<ScoreValue[][]>(initial.ends);
  const [currentEnd, setCurrentEnd] = useState<ScoreValue[]>(initial.currentEnd);
  const listRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const totalEnds = config.endsPerRound * config.rounds;
  const completedEnds = ends.length;
  const isEndComplete = currentEnd.length >= config.arrowsPerEnd;
  const isSessionComplete = completedEnds >= totalEnds;

  const currentRound = Math.floor(completedEnds / config.endsPerRound) + 1;
  const endInRound = (completedEnds % config.endsPerRound) + 1;

  const allEndsForMetrics = currentEnd.length > 0 ? [...ends, currentEnd] : ends;
  const metrics = calculateMetrics(allEndsForMetrics, config);
  const currentEndScore = currentEnd.reduce((sum, s) => sum + getScoreNumeric(s), 0);
  const maxEndScore = config.arrowsPerEnd * 10;

  // Persist to localStorage on every change
  useEffect(() => {
    saveSession(config, ends, currentEnd);
  }, [config, ends, currentEnd]);

  // Auto-scroll to bottom when new end is added
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [ends.length]);

  const handleScore = (score: ScoreValue) => {
    if (isEndComplete || isSessionComplete) return;

    const newEnd = [...currentEnd, score];

    if (newEnd.length >= config.arrowsPerEnd) {
      setEnds([...ends, newEnd]);
      setCurrentEnd([]);
    } else {
      setCurrentEnd(newEnd);
    }
  };

  const handleUndo = () => {
    if (currentEnd.length > 0) {
      setCurrentEnd(currentEnd.slice(0, -1));
    } else if (ends.length > 0) {
      const lastEnd = ends[ends.length - 1];
      setEnds(ends.slice(0, -1));
      setCurrentEnd(lastEnd.slice(0, -1));
    }
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    onReset();
  };

  const canUndo = currentEnd.length > 0 || ends.length > 0;

  const handleSaveScreenshot = async () => {
    if (!summaryRef.current) return;

    try {
      const canvas = await html2canvas(summaryRef.current, {
        backgroundColor: '#f1f5f9',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `archery-session-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to save screenshot:', err);
    }
  };

  // Session complete view
  if (isSessionComplete) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <div ref={summaryRef} className="flex-1 overflow-auto bg-slate-100">
          <div className="bg-white border-b p-4">
            <h1 className="text-xl font-bold text-slate-800 text-center">Session Complete!</h1>
            <p className="text-sm text-slate-500 text-center">{config.distance}m &bull; {new Date().toLocaleDateString()}</p>
          </div>

          {/* Summary card */}
          <div className="p-4">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center mb-4">
              <p className="text-5xl font-bold text-emerald-600">{metrics.totalScore}</p>
              <p className="text-slate-500">out of {metrics.maxPossible} ({((metrics.totalScore / metrics.maxPossible) * 100).toFixed(1)}%)</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-amber-500">{metrics.xCount}</p>
                <p className="text-xs text-slate-500">X's</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-blue-500">{metrics.tenCount}</p>
                <p className="text-xs text-slate-500">10's</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-slate-600">{metrics.nineCount}</p>
                <p className="text-xs text-slate-500">9's</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-xl font-bold text-slate-700">{metrics.scorePerArrow}</p>
                <p className="text-xs text-slate-500">per arrow</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-700">{metrics.scorePerEnd}</p>
                <p className="text-xs text-slate-500">per end</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-500">{metrics.redInPercent}%</p>
                <p className="text-xs text-slate-500">red in</p>
              </div>
            </div>
          </div>

          {/* All ends list */}
          <div className="bg-white">
            {ends.map((end, i) => {
              const endTotal = end.reduce((sum, s) => sum + getScoreNumeric(s), 0);
              const roundNum = Math.floor(i / config.endsPerRound) + 1;
              const isRoundStart = i % config.endsPerRound === 0;
              const isRoundEnd = (i + 1) % config.endsPerRound === 0 || i === ends.length - 1;
              const endNum = (i % config.endsPerRound) + 1;

              return (
                <div key={i}>
                  <EndRow
                    endNumber={endNum}
                    arrows={end}
                    total={endTotal}
                    maxScore={maxEndScore}
                    isCurrentRoundStart={isRoundStart}
                    roundNumber={roundNum}
                  />
                  {isRoundEnd && (
                    <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-600">Round {roundNum} Total</span>
                      <div>
                        <span className="text-lg font-bold text-slate-800">{metrics.roundScores[roundNum - 1]}</span>
                        <span className="text-sm text-slate-400">/{config.endsPerRound * config.arrowsPerEnd * 10}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-white border-t flex gap-3">
          <Button
            variant="default"
            onClick={handleSaveScreenshot}
            className="flex-1 py-4 text-lg"
          >
            📷 Save
          </Button>
          <Button
            variant="primary"
            onClick={handleReset}
            className="flex-1 py-4 text-lg"
          >
            New Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
      {/* Compact header */}
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center flex-shrink-0">
        <div>
          <p className="text-sm text-slate-500">{config.distance}m &bull; R{currentRound} E{endInRound}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-sm">
            <span className="text-amber-600 font-medium">X:{metrics.xCount}</span>
            <span className="text-blue-600 font-medium">10:{metrics.tenCount}</span>
            <span className="text-slate-500 font-medium">9:{metrics.nineCount}</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">{metrics.totalScore}</p>
          </div>
        </div>
      </div>

      {/* Ends list */}
      <div className="flex-1 overflow-auto" ref={listRef}>
        {ends.length === 0 && currentEnd.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Score your first arrow</p>
          </div>
        ) : (
          <div className="bg-white">
            {ends.map((end, i) => {
              const endTotal = end.reduce((sum, s) => sum + getScoreNumeric(s), 0);
              const roundNum = Math.floor(i / config.endsPerRound) + 1;
              const isRoundStart = i % config.endsPerRound === 0;
              const isRoundEnd = (i + 1) % config.endsPerRound === 0;
              const endNum = (i % config.endsPerRound) + 1;

              return (
                <div key={i}>
                  <EndRow
                    endNumber={endNum}
                    arrows={end}
                    total={endTotal}
                    maxScore={maxEndScore}
                    isCurrentRoundStart={isRoundStart}
                    roundNumber={roundNum}
                  />
                  {isRoundEnd && (
                    <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-600">Round {roundNum} Total</span>
                      <div>
                        <span className="text-lg font-bold text-slate-800">{metrics.roundScores[roundNum - 1]}</span>
                        <span className="text-sm text-slate-400">/{config.endsPerRound * config.arrowsPerEnd * 10}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current end input area */}
      <div className="bg-white border-t flex-shrink-0">
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">
              End {endInRound} of {config.endsPerRound}
            </span>
            <span className="text-xl font-bold text-blue-600">{currentEndScore}</span>
          </div>
          <div className="flex gap-2 justify-center">
            {Array.from({ length: config.arrowsPerEnd }).map((_, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold
                  ${i < currentEnd.length
                    ? ''
                    : 'bg-slate-50 text-slate-300 border-2 border-dashed border-slate-200'
                  }`}
              >
                {i < currentEnd.length ? (
                  <ArrowBadge score={currentEnd[i]} size="md" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Score buttons */}
        <div className="p-2">
          <div className="grid grid-cols-6 gap-1.5">
            {SCORE_VALUES.map(score => {
              const getButtonStyle = (): string => {
                if (score === 'X') return 'bg-yellow-400 border-yellow-500 text-yellow-900';
                if (score === '10') return 'bg-yellow-300 border-yellow-400 text-yellow-900';
                if (score === '9') return 'bg-yellow-200 border-yellow-300 text-yellow-800';
                if (score === '8') return 'bg-red-500 border-red-600 text-white';
                if (score === '7') return 'bg-red-400 border-red-500 text-white';
                if (score === '6') return 'bg-blue-500 border-blue-600 text-white';
                if (score === '5') return 'bg-blue-400 border-blue-500 text-white';
                if (score === '4') return 'bg-gray-800 border-gray-900 text-white';
                if (score === '3') return 'bg-gray-600 border-gray-700 text-white';
                if (score === '2') return 'bg-white border-gray-300 text-gray-700';
                if (score === '1') return 'bg-gray-100 border-gray-300 text-gray-600';
                if (score === 'M') return 'bg-gray-200 border-gray-300 text-gray-500';
                return '';
              };

              return (
                <button
                  key={score}
                  onClick={() => handleScore(score)}
                  disabled={isEndComplete}
                  className={`text-lg font-bold py-3 rounded-lg border-2 transition-all active:scale-95 disabled:opacity-40 ${getButtonStyle()}`}
                >
                  {score}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="px-2 pb-2 flex gap-2">
          <Button
            variant="ghost"
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex-1 py-2"
          >
            ↩ Undo
          </Button>
          <Button
            variant="danger"
            onClick={handleReset}
            className="flex-1 py-2"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
