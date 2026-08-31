import { describe, expect, it } from 'vitest';
import { chooseMove } from './cpu';
import {
  applyMove,
  availableMoves,
  createBoard,
  currentTurn,
  getGameStatus,
  getWinner,
} from './game';
import type { Board } from './types';

describe('cpu core', () => {
  describe('validation and error handling', () => {
    it('throws error when board has no available moves', () => {
      const fullBoard: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(() => chooseMove(fullBoard, 'hard', 'X')).toThrow(
        'No available moves'
      );
    });

    it('throws error when game is already won', () => {
      const wonBoard: Board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      expect(() => chooseMove(wonBoard, 'hard', 'O')).toThrow(
        'No available moves'
      );
    });
  });

  describe("chooseMove('hard')", () => {
    it('chooses immediate winning move when X can win in 1 move', () => {
      const board: Board = ['X', 'X', null, 'O', 'O', null, null, null, null];
      // X's turn, winning move is index 2
      const move = chooseMove(board, 'hard', 'X');
      expect(move).toBe(2);
    });

    it('chooses immediate winning move when O can win in 1 move', () => {
      const board: Board = ['X', 'X', null, 'O', 'O', null, 'X', null, null];
      // O's turn, winning move is index 5
      const move = chooseMove(board, 'hard', 'O');
      expect(move).toBe(5);
    });

    it("blocks opponent's winning threat (reach) as O", () => {
      const board: Board = ['X', 'X', null, 'O', null, null, null, null, null];
      // X has reach on [0, 1, 2], O must block at index 2
      const move = chooseMove(board, 'hard', 'O');
      expect(move).toBe(2);
    });

    it("blocks opponent's winning threat (reach) as X", () => {
      const board: Board = ['X', null, null, 'O', 'O', null, 'X', null, null];
      // O has reach on [3, 4, 5], X must block at index 5
      const move = chooseMove(board, 'hard', 'X');
      expect(move).toBe(5);
    });

    it('property test: self-play from all 9 initial moves results in draw (hard CPU never loses)', () => {
      for (let firstMove = 0; firstMove < 9; firstMove++) {
        let board = applyMove(createBoard(), firstMove, 'X');

        while (getGameStatus(board).kind === 'playing') {
          const turn = currentTurn(board);
          const move = chooseMove(board, 'hard', turn);
          board = applyMove(board, move, turn);
        }

        const status = getGameStatus(board);
        expect(status).toEqual({ kind: 'draw' });
        expect(getWinner(board)).toBeNull();
        expect(availableMoves(board)).toHaveLength(0);
      }
    });

    it('property test: self-play from empty board results in draw', () => {
      let board = createBoard();

      while (getGameStatus(board).kind === 'playing') {
        const turn = currentTurn(board);
        const move = chooseMove(board, 'hard', turn);
        board = applyMove(board, move, turn);
      }

      expect(getGameStatus(board)).toEqual({ kind: 'draw' });
    });
  });

  describe("chooseMove('easy')", () => {
    it('always returns a move included in availableMoves', () => {
      const board: Board = ['X', null, 'O', null, 'X', null, 'O', null, null];
      const validMoves = availableMoves(board);

      for (let i = 0; i < 50; i++) {
        const move = chooseMove(board, 'easy', 'X');
        expect(validMoves).toContain(move);
      }
    });

    it('selects expected move based on rng input', () => {
      const board: Board = ['X', null, 'O', null, 'X', null, 'O', null, null];
      const validMoves = availableMoves(board); // [1, 3, 5, 7, 8]

      // rng = 0 should pick index 0 -> validMoves[0] = 1
      expect(chooseMove(board, 'easy', 'X', () => 0)).toBe(validMoves[0]);

      // rng = 0.999 should pick last index -> validMoves[4] = 8
      expect(chooseMove(board, 'easy', 'X', () => 0.999)).toBe(
        validMoves[validMoves.length - 1]
      );
    });
  });

  describe("chooseMove('normal')", () => {
    it('always returns a move included in availableMoves', () => {
      const board: Board = ['X', null, 'O', null, 'X', null, 'O', null, null];
      const validMoves = availableMoves(board);

      for (let i = 0; i < 50; i++) {
        const move = chooseMove(board, 'normal', 'X');
        expect(validMoves).toContain(move);
      }
    });

    it('chooses minimax best move when rng < 0.7', () => {
      const board: Board = ['X', 'X', null, 'O', 'O', null, null, null, null];
      // rng = 0.5 < 0.7 -> should choose best move (index 2)
      const move = chooseMove(board, 'normal', 'X', () => 0.5);
      expect(move).toBe(2);
    });

    it('chooses random move when rng >= 0.7 based on secondary rng roll', () => {
      const board: Board = ['X', 'X', null, 'O', 'O', null, null, null, null];
      const validMoves = availableMoves(board); // [2, 5, 6, 7, 8]

      // 1st call: 0.8 (>= 0.7 -> random branch), 2nd call: 0.0 -> validMoves[0]
      const rngSequence = [0.8, 0.0];
      let callCount = 0;
      const rng = () => rngSequence[callCount++];

      const move = chooseMove(board, 'normal', 'X', rng);
      expect(move).toBe(validMoves[0]);
    });
  });
});
