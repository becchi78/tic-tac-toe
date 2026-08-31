import type { Board, Cell, GameStatus, Player } from './types';

export const WIN_LINES: readonly [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function createBoard(): Board {
  return Array<Cell>(9).fill(null);
}

export function currentTurn(board: Board): Player {
  let xCount = 0;
  let oCount = 0;
  for (const cell of board) {
    if (cell === 'X') xCount++;
    else if (cell === 'O') oCount++;
  }
  return xCount <= oCount ? 'X' : 'O';
}

export function getWinner(
  board: Board
): { winner: Player; line: [number, number, number] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const cell = board[a];
    if (cell !== null && cell === board[b] && cell === board[c]) {
      return { winner: cell, line };
    }
  }
  return null;
}

export function isDraw(board: Board): boolean {
  return getWinner(board) === null && board.every((cell) => cell !== null);
}

export function availableMoves(board: Board): number[] {
  const moves: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      moves.push(i);
    }
  }
  return moves;
}

export function getGameStatus(board: Board): GameStatus {
  const winnerInfo = getWinner(board);
  if (winnerInfo !== null) {
    return {
      kind: 'win',
      winner: winnerInfo.winner,
      line: winnerInfo.line,
    };
  }
  if (isDraw(board)) {
    return { kind: 'draw' };
  }
  return {
    kind: 'playing',
    turn: currentTurn(board),
  };
}

export function applyMove(board: Board, index: number, player: Player): Board {
  if (!Number.isInteger(index) || index < 0 || index >= board.length) {
    throw new Error(`Invalid move index: ${index}`);
  }
  if (board[index] !== null) {
    throw new Error(`Cell ${index} is already occupied`);
  }
  if (getWinner(board) !== null || isDraw(board)) {
    throw new Error('Game is already over');
  }
  const nextBoard = [...board];
  nextBoard[index] = player;
  return nextBoard;
}
