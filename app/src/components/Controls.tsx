import React from 'react';

export interface ControlsProps {
  onReset: () => void;
  onResetScore: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  onReset,
  onResetScore,
}) => {
  return (
    <div className="controls">
      <button type="button" onClick={onReset}>
        もう一度
      </button>
      <button type="button" onClick={onResetScore}>
        スコアリセット
      </button>
    </div>
  );
};

export default Controls;
