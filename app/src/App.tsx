import React from 'react';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { ModeSelect } from './components/ModeSelect';
import { ScoreBoard } from './components/ScoreBoard';
import { StatusBar } from './components/StatusBar';
import { useGame, type UseGameOptions } from './hooks/useGame';
import './styles/App.css';

export interface AppProps {
  gameOptions?: UseGameOptions;
}

export const App: React.FC<AppProps> = ({ gameOptions }) => {
  const {
    board,
    mode,
    difficulty,
    humanPlayer,
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
  } = useGame(gameOptions);

  const isGameOver = status.kind !== 'playing';

  return (
    <main className="game-container">
      <h1>マルバツゲーム</h1>
      <ModeSelect
        mode={mode}
        difficulty={difficulty}
        humanPlayer={humanPlayer}
        onModeChange={setMode}
        onDifficultyChange={setDifficulty}
        onHumanPlayerChange={setHumanPlayer}
      />
      <ScoreBoard score={score} />
      <StatusBar status={status} />
      <Board
        board={board}
        winningLine={winningLine}
        isGameOver={isGameOver}
        isCpuThinking={isCpuThinking}
        onCellClick={play}
      />
      <Controls onReset={reset} onResetScore={resetScore} />
    </main>
  );
};

export default App;
