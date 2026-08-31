import { applyMove, availableMoves, currentTurn, getWinner } from './game';
import type { Board, Difficulty, Player } from './types';

function minimax(board: Board, depth: number, cpuPlayer: Player): number {
  const winnerInfo = getWinner(board);
  if (winnerInfo !== null) {
    return winnerInfo.winner === cpuPlayer ? 10 - depth : depth - 10;
  }

  const moves = availableMoves(board);
  if (moves.length === 0) {
    return 0;
  }

  const turn = currentTurn(board);
  if (turn === cpuPlayer) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const nextBoard = applyMove(board, move, turn);
      const score = minimax(nextBoard, depth + 1, cpuPlayer);
      if (score > maxScore) {
        maxScore = score;
      }
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const nextBoard = applyMove(board, move, turn);
      const score = minimax(nextBoard, depth + 1, cpuPlayer);
      if (score < minScore) {
        minScore = score;
      }
    }
    return minScore;
  }
}

function getBestMove(board: Board, cpuPlayer: Player): number {
  const moves = availableMoves(board);
  if (moves.length === 0) {
    throw new Error('No available moves');
  }

  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const nextBoard = applyMove(board, move, cpuPlayer);
    const score = minimax(nextBoard, 1, cpuPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function chooseMove(
  board: Board,
  difficulty: Difficulty,
  cpuPlayer: Player,
  rng: () => number = Math.random
): number {
  const moves = availableMoves(board);
  if (moves.length === 0 || getWinner(board) !== null) {
    throw new Error('No available moves');
  }

  if (difficulty === 'easy') {
    const index = Math.max(
      0,
      Math.min(Math.floor(rng() * moves.length), moves.length - 1)
    );
    return moves[index];
  }

  if (difficulty === 'normal') {
    if (rng() < 0.7) {
      return getBestMove(board, cpuPlayer);
    }
    const index = Math.max(
      0,
      Math.min(Math.floor(rng() * moves.length), moves.length - 1)
    );
    return moves[index];
  }

  return getBestMove(board, cpuPlayer);
}
