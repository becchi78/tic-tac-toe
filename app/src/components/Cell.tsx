import React from 'react';
import type { Cell as CellType } from '../core/types';

export interface CellProps {
  index: number;
  value: CellType;
  isWinning: boolean;
  disabled: boolean;
  onClick: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef?: (element: HTMLButtonElement | null) => void;
}

export const Cell: React.FC<CellProps> = ({
  index,
  value,
  isWinning,
  disabled,
  onClick,
  onKeyDown,
  buttonRef,
}) => {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const stateText = value ?? '空き';
  const ariaLabel = `${row}行${col}列 ${stateText}`;

  const classNames = [
    'cell',
    value === 'X' ? 'cell-x' : '',
    value === 'O' ? 'cell-o' : '',
    isWinning ? 'winning' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
      ref={buttonRef}
    >
      {value ?? ''}
    </button>
  );
};

export default Cell;
