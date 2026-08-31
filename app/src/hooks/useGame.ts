import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chooseMove } from '../core/cpu';
import { applyMove, createBoard, getGameStatus } from '../core/game';
import type {
  Board,
  Difficulty,
  GameStatus,
  Mode,
  Player,
  Score,
} from '../core/types';

export interface UseGameOptions {
  cpuDelayMs?: number;
}

export interface UseGameReturn {
  board: Board;
  mode: Mode;
  difficulty: Difficulty;
  humanPlayer: Player;
  cpuPlayer: Player;
  score: Score;
  status: GameStatus;
  winningLine: [number, number, number] | null;
  isCpuThinking: boolean;
  play: (index: number) => void;
  reset: () => void;
  resetScore: () => void;
  setMode: (mode: Mode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setHumanPlayer: (player: Player) => void;
}

const INITIAL_SCORE: Score = { X: 0, O: 0, draw: 0 };

export function useGame(options?: UseGameOptions): UseGameReturn {
  const cpuDelayMs = options?.cpuDelayMs ?? 250;

  const [board, setBoard] = useState<Board>(() => createBoard());
  const [mode, setModeState] = useState<Mode>('pvp');
  const [difficulty, setDifficultyState] = useState<Difficulty>('normal');
  const [humanPlayer, setHumanPlayerState] = useState<Player>('X');
  const [score, setScore] = useState<Score>(INITIAL_SCORE);
  const [isCpuThinking, setIsCpuThinking] = useState<boolean>(false);

  const hasScoredRef = useRef<boolean>(false);

  const cpuPlayer: Player = humanPlayer === 'X' ? 'O' : 'X';
  const status: GameStatus = useMemo(() => getGameStatus(board), [board]);
  const winningLine = status.kind === 'win' ? status.line : null;

  // 決着時にスコアを 1 局につき 1 回加算
  useEffect(() => {
    if (status.kind === 'playing') {
      hasScoredRef.current = false;
    } else if (!hasScoredRef.current) {
      hasScoredRef.current = true;
      if (status.kind === 'win') {
        const winner = status.winner;
        setScore((prev) => ({ ...prev, [winner]: prev[winner] + 1 }));
      } else if (status.kind === 'draw') {
        setScore((prev) => ({ ...prev, draw: prev.draw + 1 }));
      }
    }
  }, [status]);

  const play = useCallback((index: number) => {
    setBoard((currentBoard) => {
      const currentStatus = getGameStatus(currentBoard);
      if (currentStatus.kind !== 'playing') {
        return currentBoard;
      }
      if (
        index < 0 ||
        index >= currentBoard.length ||
        currentBoard[index] !== null
      ) {
        return currentBoard;
      }
      return applyMove(currentBoard, index, currentStatus.turn);
    });
  }, []);

  const reset = useCallback(() => {
    setBoard(createBoard());
    setIsCpuThinking(false);
  }, []);

  const resetScore = useCallback(() => {
    setScore(INITIAL_SCORE);
  }, []);

  const setMode = useCallback((newMode: Mode) => {
    setModeState(newMode);
    setBoard(createBoard());
    setIsCpuThinking(false);
  }, []);

  const setDifficulty = useCallback((newDifficulty: Difficulty) => {
    setDifficultyState(newDifficulty);
    setBoard(createBoard());
    setIsCpuThinking(false);
  }, []);

  const setHumanPlayer = useCallback((newPlayer: Player) => {
    setHumanPlayerState(newPlayer);
    setBoard(createBoard());
    setIsCpuThinking(false);
  }, []);

  // CPU 自動着手
  useEffect(() => {
    if (mode !== 'cpu') {
      setIsCpuThinking(false);
      return;
    }

    if (status.kind !== 'playing') {
      setIsCpuThinking(false);
      return;
    }

    if (status.turn !== cpuPlayer) {
      setIsCpuThinking(false);
      return;
    }

    setIsCpuThinking(true);
    const timerId = setTimeout(() => {
      try {
        const move = chooseMove(board, difficulty, cpuPlayer);
        play(move);
      } catch {
        // 万が一の手番エラー等は無視
      } finally {
        setIsCpuThinking(false);
      }
    }, cpuDelayMs);

    return () => {
      clearTimeout(timerId);
      setIsCpuThinking(false);
    };
  }, [board, mode, difficulty, cpuPlayer, status, cpuDelayMs, play]);

  return {
    board,
    mode,
    difficulty,
    humanPlayer,
    cpuPlayer,
    score,
    status,
    winningLine,
    isCpuThinking,
    play,
    reset,
    resetScore,
    setMode,
    setDifficulty,
    setHumanPlayer,
  };
}
