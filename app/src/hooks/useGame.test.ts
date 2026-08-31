import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGame } from './useGame';

describe('useGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初期状態が正しく設定されていること', () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.board).toEqual(Array(9).fill(null));
    expect(result.current.mode).toBe('pvp');
    expect(result.current.difficulty).toBe('normal');
    expect(result.current.humanPlayer).toBe('X');
    expect(result.current.cpuPlayer).toBe('O');
    expect(result.current.score).toEqual({ X: 0, O: 0, draw: 0 });
    expect(result.current.status).toEqual({ kind: 'playing', turn: 'X' });
    expect(result.current.winningLine).toBeNull();
    expect(result.current.isCpuThinking).toBe(false);
  });

  it('着手すると X と O が交互に配置され、埋まったマスは無視されること', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.play(0); // X
    });
    expect(result.current.board[0]).toBe('X');
    expect(result.current.status).toEqual({ kind: 'playing', turn: 'O' });

    // 同じマスへの着手は無視される
    act(() => {
      result.current.play(0);
    });
    expect(result.current.board[0]).toBe('X');
    expect(result.current.status).toEqual({ kind: 'playing', turn: 'O' });

    act(() => {
      result.current.play(1); // O
    });
    expect(result.current.board[1]).toBe('O');
    expect(result.current.status).toEqual({ kind: 'playing', turn: 'X' });
  });

  it('勝敗が決したときにスコアが1度だけ加算され、追加の着手が無視されること', () => {
    const { result } = renderHook(() => useGame());

    // X: 0, 1, 2 で勝ち
    // O: 3, 4
    act(() => {
      result.current.play(0); // X
      result.current.play(3); // O
      result.current.play(1); // X
      result.current.play(4); // O
      result.current.play(2); // X (win)
    });

    expect(result.current.status.kind).toBe('win');
    if (result.current.status.kind === 'win') {
      expect(result.current.status.winner).toBe('X');
      expect(result.current.status.line).toEqual([0, 1, 2]);
    }
    expect(result.current.winningLine).toEqual([0, 1, 2]);
    expect(result.current.score).toEqual({ X: 1, O: 0, draw: 0 });

    // 決着後の着手は無視される
    act(() => {
      result.current.play(5);
    });
    expect(result.current.board[5]).toBeNull();
    expect(result.current.score).toEqual({ X: 1, O: 0, draw: 0 });
  });

  it('引き分けになったときにスコアが正しく加算されること', () => {
    const { result } = renderHook(() => useGame());

    // 引き分け手順:
    // X O X
    // X X O
    // O X O
    const moves = [0, 1, 2, 5, 3, 6, 4, 8, 7];
    for (const move of moves) {
      act(() => {
        result.current.play(move);
      });
    }

    expect(result.current.status.kind).toBe('draw');
    expect(result.current.score).toEqual({ X: 0, O: 0, draw: 1 });
  });

  it('reset で盤面が初期化され、スコアは保持されること', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.play(0); // X
      result.current.play(3); // O
      result.current.play(1); // X
      result.current.play(4); // O
      result.current.play(2); // X win
    });
    expect(result.current.score.X).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.board).toEqual(Array(9).fill(null));
    expect(result.current.status).toEqual({ kind: 'playing', turn: 'X' });
    expect(result.current.score.X).toBe(1);
  });

  it('resetScore でスコアが 0 にリセットされること', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.play(0); // X
      result.current.play(3); // O
      result.current.play(1); // X
      result.current.play(4); // O
      result.current.play(2); // X win
    });
    expect(result.current.score.X).toBe(1);

    act(() => {
      result.current.resetScore();
    });

    expect(result.current.score).toEqual({ X: 0, O: 0, draw: 0 });
  });

  it('setMode, setDifficulty, setHumanPlayer で盤面がリセットされること', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.play(0);
    });
    expect(result.current.board[0]).toBe('X');

    act(() => {
      result.current.setMode('cpu');
    });
    expect(result.current.mode).toBe('cpu');
    expect(result.current.board).toEqual(Array(9).fill(null));

    act(() => {
      result.current.play(0);
    });
    expect(result.current.board[0]).toBe('X');

    act(() => {
      result.current.setDifficulty('hard');
    });
    expect(result.current.difficulty).toBe('hard');
    expect(result.current.board).toEqual(Array(9).fill(null));

    act(() => {
      result.current.play(0);
    });
    expect(result.current.board[0]).toBe('X');

    act(() => {
      result.current.setHumanPlayer('O');
    });
    expect(result.current.humanPlayer).toBe('O');
    expect(result.current.board).toEqual(Array(9).fill(null));
  });

  it('CPU 対戦モードで人間が着手後、タイマー経過で CPU が自動着手すること', () => {
    const { result } = renderHook(() => useGame({ cpuDelayMs: 200 }));

    act(() => {
      result.current.setMode('cpu');
    });

    // 人間 (X) が着手
    act(() => {
      result.current.play(0);
    });
    expect(result.current.board[0]).toBe('X');
    expect(result.current.board.filter((c) => c === 'O').length).toBe(0);

    // タイマーを進める
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // CPU (O) が1手打っていること
    expect(result.current.board.filter((c) => c === 'O').length).toBe(1);
    expect(result.current.status).toEqual({ kind: 'playing', turn: 'X' });
  });

  it('CPU が先手 (humanPlayer === "O") の場合、初手を自動着手すること', () => {
    const { result } = renderHook(() => useGame({ cpuDelayMs: 200 }));

    act(() => {
      result.current.setMode('cpu');
      result.current.setHumanPlayer('O');
    });

    expect(result.current.board.filter((c) => c !== null).length).toBe(0);

    // タイマーを進めると CPU (X) が初手を打つ
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.board.filter((c) => c === 'X').length).toBe(1);
    expect(result.current.status).toEqual({ kind: 'playing', turn: 'O' });
  });
});
