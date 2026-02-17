import type { ScoreValue } from '../types';

interface ArrowBadgeProps {
  score: ScoreValue;
  size?: 'sm' | 'md' | 'lg';
}

const sizes: Record<string, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
};

const getStyle = (score: ScoreValue): string => {
  if (score === 'X') return 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-600';
  if (score === '10') return 'bg-yellow-400 text-yellow-900';
  if (score === '9') return 'bg-yellow-300 text-yellow-800';
  if (score === '8') return 'bg-red-500 text-white';
  if (score === '7') return 'bg-red-400 text-white';
  if (score === '6') return 'bg-blue-500 text-white';
  if (score === '5') return 'bg-blue-400 text-white';
  if (score === '4') return 'bg-gray-900 text-white';
  if (score === '3') return 'bg-gray-700 text-white';
  if (score === '2') return 'bg-white text-gray-800 ring-1 ring-gray-300';
  if (score === '1') return 'bg-gray-100 text-gray-600 ring-1 ring-gray-300';
  if (score === 'M') return 'bg-gray-300 text-gray-500';
  return 'bg-slate-100 text-slate-700';
};

export default function ArrowBadge({ score, size = 'md' }: ArrowBadgeProps) {
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold ${getStyle(score)}`}>
      {score}
    </div>
  );
}
