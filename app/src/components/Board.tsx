import React, { useRef } from 'react';
import type { Board as BoardType } from '../core/types';
import { Cell } from './Cell';

export interface BoardProps {
  board: BoardType;
  winningLine: [number, number, number] | null;
  isGameOver: boolean;
  isCpuThinking: boolean;
  onCellClick: (index: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  winningLine,
  isGameOver,
  isCpuThinking,
  onCellClick,
}) => {
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowUp':
        if (index >= 3) nextIndex = index - 3;
        break;
      case 'ArrowDown':
        if (index <= 5) nextIndex = index + 3;
        break;
      case 'ArrowLeft':
        if (index % 3 !== 0) nextIndex = index - 1;
        break;
      case 'ArrowRight':
        if (index % 3 !== 2) nextIndex = index + 1;
        break;
      default:
        return;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      cellRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="board" aria-label="マルバツ盤面">
      {board.map((cellValue, index) => {
        const isWinning = winningLine !== null && winningLine.includes(index);
        const isDisabled = isGameOver || cellValue !== null || isCpuThinking;

        return (
          <Cell
            key={index}
            index={index}
            value={cellValue}
            isWinning={isWinning}
            disabled={isDisabled}
            onClick={() => onCellClick(index)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            buttonRef={(el) => {
              cellRefs.current[index] = el;
            }}
          />
        );
      })}
    </div>
  );
};

export default Board;
