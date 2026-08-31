import React from 'react';
import type { Score } from '../core/types';

export interface ScoreBoardProps {
  score: Score;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ score }) => {
  return (
    <div className="score-board" aria-label="スコアボード">
      <span>X: {score.X}勝</span>
      <span>O: {score.O}勝</span>
      <span>引き分け: {score.draw}</span>
    </div>
  );
};

export default ScoreBoard;
