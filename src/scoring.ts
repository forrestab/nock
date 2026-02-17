import type { ScoreValue, SessionConfig, Metrics } from './types';

export const SCORE_VALUES: ScoreValue[] = ['M', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'X'];

export const getScoreNumeric = (score: ScoreValue): number => {
  if (score === 'M') return 0;
  if (score === 'X') return 10;
  return parseInt(score, 10);
};

export const calculateMetrics = (ends: ScoreValue[][], config: SessionConfig): Metrics => {
  const allScores = ends.flat();
  const totalArrows = allScores.length;
  const totalScore = allScores.reduce((sum, s) => sum + getScoreNumeric(s), 0);

  const xCount = allScores.filter(s => s === 'X').length;
  const tenCount = allScores.filter(s => s === '10').length;
  const nineCount = allScores.filter(s => s === '9').length;

  const redInCount = allScores.filter(s =>
    s === 'X' || s === '10' || s === '9' || s === '8' || s === '7'
  ).length;

  const roundScores: number[] = [];
  for (let r = 0; r < config.rounds; r++) {
    const startEnd = r * config.endsPerRound;
    const endEnd = Math.min(startEnd + config.endsPerRound, ends.length);
    const roundEnds = ends.slice(startEnd, endEnd);
    const roundTotal = roundEnds.flat().reduce((sum, s) => sum + getScoreNumeric(s), 0);
    roundScores.push(roundTotal);
  }

  return {
    totalScore,
    totalArrows,
    scorePerArrow: totalArrows > 0 ? (totalScore / totalArrows).toFixed(2) : '0.00',
    scorePerEnd: ends.length > 0 ? (totalScore / ends.length).toFixed(1) : '0.0',
    roundScores,
    xCount,
    tenCount,
    nineCount,
    redInCount,
    redInPercent: totalArrows > 0 ? ((redInCount / totalArrows) * 100).toFixed(1) : '0.0',
    maxPossible: config.arrowsPerEnd * config.endsPerRound * config.rounds * 10,
  };
};
