import { describe, expect, it } from 'vitest';
import {
  WIN_LINES,
  applyMove,
  availableMoves,
  createBoard,
  currentTurn,
  getGameStatus,
  getWinner,
  isDraw,
} from './game';
import type { Board } from './types';

describe('game core', () => {
  describe('createBoard', () => {
    it('creates an empty 9-cell board with null', () => {
      const board = createBoard();
      expect(board).toHaveLength(9);
      expect(board.every((cell) => cell === null)).toBe(true);
    });

    it('returns a new array instance on each call', () => {
      const b1 = createBoard();
      const b2 = createBoard();
      expect(b1).not.toBe(b2);
    });
  });

  describe('currentTurn', () => {
    it('returns X for an empty board', () => {
      const board = createBoard();
      expect(currentTurn(board)).toBe('X');
    });

    it('returns O after 1 move (X played)', () => {
      const board: Board = [
        'X',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      expect(currentTurn(board)).toBe('O');
    });

    it('returns X after 2 moves (X and O played)', () => {
      const board: Board = ['X', 'O', null, null, null, null, null, null, null];
      expect(currentTurn(board)).toBe('X');
    });

    it('returns O after 3 moves', () => {
      const board: Board = ['X', 'O', 'X', null, null, null, null, null, null];
      expect(currentTurn(board)).toBe('O');
    });
  });

  describe('applyMove', () => {
    it('places player mark on empty cell and returns new board', () => {
      const board = createBoard();
      const newBoard = applyMove(board, 4, 'X');
      expect(newBoard[4]).toBe('X');
      expect(board[4]).toBeNull();
    });

    it('throws on out-of-range negative index', () => {
      const board = createBoard();
      expect(() => applyMove(board, -1, 'X')).toThrow();
    });

    it('throws on out-of-range index >= 9', () => {
      const board = createBoard();
      expect(() => applyMove(board, 9, 'X')).toThrow();
    });

    it('throws on non-integer index', () => {
      const board = createBoard();
      expect(() => applyMove(board, 1.5, 'X')).toThrow();
    });

    it('throws when target cell is already occupied', () => {
      const board = applyMove(createBoard(), 0, 'X');
      expect(() => applyMove(board, 0, 'O')).toThrow();
    });

    it('throws when game is already won', () => {
      const winBoard: Board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      expect(() => applyMove(winBoard, 5, 'X')).toThrow();
    });

    it('throws when game is already a draw', () => {
      const drawBoard: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(() => applyMove(drawBoard, 0, 'X')).toThrow();
    });
  });

  describe('getWinner', () => {
    it('returns null for an empty board', () => {
      expect(getWinner(createBoard())).toBeNull();
    });

    it('returns null when there is no winner in an in-progress game', () => {
      const board: Board = ['X', 'O', 'X', 'O', 'X', null, null, null, null];
      expect(getWinner(board)).toBeNull();
    });

    it('detects all 8 winning lines for player X', () => {
      for (const line of WIN_LINES) {
        const board = createBoard();
        board[line[0]] = 'X';
        board[line[1]] = 'X';
        board[line[2]] = 'X';
        const result = getWinner(board);
        expect(result).toEqual({ winner: 'X', line });
      }
    });

    it('detects all 8 winning lines for player O', () => {
      for (const line of WIN_LINES) {
        const board = createBoard();
        board[line[0]] = 'O';
        board[line[1]] = 'O';
        board[line[2]] = 'O';
        const result = getWinner(board);
        expect(result).toEqual({ winner: 'O', line });
      }
    });
  });

  describe('isDraw', () => {
    it('returns false for empty board', () => {
      expect(isDraw(createBoard())).toBe(false);
    });

    it('returns false for in-progress game', () => {
      const board: Board = ['X', 'O', 'X', 'O', null, null, null, null, null];
      expect(isDraw(board)).toBe(false);
    });

    it('returns false for full board with a winner', () => {
      const board: Board = ['X', 'X', 'X', 'O', 'O', 'X', 'O', 'X', 'O'];
      expect(isDraw(board)).toBe(false);
    });

    it('returns true for draw board', () => {
      const drawBoard: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(isDraw(drawBoard)).toBe(true);
    });
  });

  describe('availableMoves', () => {
    it('returns 0..8 for empty board', () => {
      expect(availableMoves(createBoard())).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8,
      ]);
    });

    it('returns remaining empty indices in ascending order', () => {
      const board: Board = ['X', null, 'O', null, 'X', null, 'O', null, null];
      expect(availableMoves(board)).toEqual([1, 3, 5, 7, 8]);
    });

    it('returns empty array for full board', () => {
      const fullBoard: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(availableMoves(fullBoard)).toEqual([]);
    });
  });

  describe('getGameStatus', () => {
    it('returns playing with turn X on empty board', () => {
      expect(getGameStatus(createBoard())).toEqual({
        kind: 'playing',
        turn: 'X',
      });
    });

    it('returns playing with turn O after 1 move', () => {
      const board = applyMove(createBoard(), 4, 'X');
      expect(getGameStatus(board)).toEqual({ kind: 'playing', turn: 'O' });
    });

    it('returns win with winner and line when a player wins', () => {
      const board: Board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      expect(getGameStatus(board)).toEqual({
        kind: 'win',
        winner: 'X',
        line: [0, 1, 2],
      });
    });

    it('returns draw when game ends in a tie', () => {
      const drawBoard: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(getGameStatus(drawBoard)).toEqual({ kind: 'draw' });
    });
  });
});
