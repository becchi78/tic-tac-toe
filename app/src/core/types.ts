export type Player = 'X' | 'O';

export type Cell = Player | null;

export type Board = Cell[];

export type Difficulty = 'easy' | 'normal' | 'hard';

export type Mode = 'pvp' | 'cpu';

export type GameStatus =
  | { kind: 'playing'; turn: Player }
  | { kind: 'win'; winner: Player; line: [number, number, number] }
  | { kind: 'draw' };

export interface Score {
  X: number;
  O: number;
  draw: number;
}
