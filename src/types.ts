export interface SessionConfig {
  distance: number;
  arrowsPerEnd: number;
  endsPerRound: number;
  rounds: number;
}

export type ScoreValue = 'M' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'X';

export interface Metrics {
  totalScore: number;
  totalArrows: number;
  scorePerArrow: string;
  scorePerEnd: string;
  roundScores: number[];
  xCount: number;
  tenCount: number;
  nineCount: number;
  redInCount: number;
  redInPercent: string;
  maxPossible: number;
}
