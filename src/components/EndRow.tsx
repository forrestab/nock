import type { ScoreValue } from '../types';
import ArrowBadge from './ArrowBadge';

interface EndRowProps {
  endNumber: number;
  arrows: ScoreValue[];
  total: number;
  isCurrentRoundStart: boolean;
  roundNumber: number;
  maxScore: number;
}

export default function EndRow({ endNumber, arrows, total, isCurrentRoundStart, roundNumber, maxScore }: EndRowProps) {
  return (
    <>
      {isCurrentRoundStart && (
        <div className="bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Round {roundNumber}
        </div>
      )}
      <div className="bg-white px-3 py-2 flex items-center gap-3 border-b border-slate-100">
        <span className="w-6 text-sm text-slate-400 font-medium">{endNumber}</span>
        <div className="flex gap-1.5 flex-1">
          {arrows.map((score, i) => (
            <ArrowBadge key={i} score={score} size="sm" />
          ))}
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-slate-800">{total}</span>
          <span className="text-sm text-slate-400">/{maxScore}</span>
        </div>
      </div>
    </>
  );
}
