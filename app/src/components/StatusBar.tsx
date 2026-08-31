import React from 'react';
import type { GameStatus } from '../core/types';

export interface StatusBarProps {
  status: GameStatus;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  let message = '';

  if (status.kind === 'playing') {
    message = `手番: ${status.turn}`;
  } else if (status.kind === 'win') {
    message = `勝者: ${status.winner}!`;
  } else if (status.kind === 'draw') {
    message = '引き分け!';
  }

  return (
    <div className="status-bar" aria-live="polite">
      {message}
    </div>
  );
};

export default StatusBar;
