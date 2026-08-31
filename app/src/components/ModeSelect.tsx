import React from 'react';
import type { Difficulty, Mode, Player } from '../core/types';

export interface ModeSelectProps {
  mode: Mode;
  difficulty: Difficulty;
  humanPlayer: Player;
  onModeChange: (mode: Mode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onHumanPlayerChange: (player: Player) => void;
}

export const ModeSelect: React.FC<ModeSelectProps> = ({
  mode,
  difficulty,
  humanPlayer,
  onModeChange,
  onDifficultyChange,
  onHumanPlayerChange,
}) => {
  return (
    <div className="mode-select">
      <div className="mode-options">
        <label>
          <input
            type="radio"
            name="game-mode"
            value="pvp"
            checked={mode === 'pvp'}
            onChange={() => onModeChange('pvp')}
          />
          2人プレイ
        </label>
        <label>
          <input
            type="radio"
            name="game-mode"
            value="cpu"
            checked={mode === 'cpu'}
            onChange={() => onModeChange('cpu')}
          />
          CPU対戦
        </label>
      </div>

      {mode === 'cpu' && (
        <div className="cpu-options">
          <div>
            <label htmlFor="difficulty-select">難易度: </label>
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
            >
              <option value="easy">かんたん</option>
              <option value="normal">ふつう</option>
              <option value="hard">むずかしい</option>
            </select>
          </div>

          <div className="player-options">
            <span>プレイヤー: </span>
            <label>
              <input
                type="radio"
                name="human-player"
                value="X"
                checked={humanPlayer === 'X'}
                onChange={() => onHumanPlayerChange('X')}
              />
              先手 (X)
            </label>
            <label>
              <input
                type="radio"
                name="human-player"
                value="O"
                checked={humanPlayer === 'O'}
                onChange={() => onHumanPlayerChange('O')}
              />
              後手 (O)
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeSelect;
