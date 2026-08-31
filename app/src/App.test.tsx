import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  it('見出し「マルバツゲーム」が描画される', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: 'マルバツゲーム' });
    expect(heading).toBeInTheDocument();
  });

  it('着手すると X→O→X の順にマークが入る / 埋まったマスは押しても変化しない', () => {
    render(<App />);

    const cell0 = screen.getByRole('button', { name: '1行1列 空き' });
    const cell1 = screen.getByRole('button', { name: '1行2列 空き' });
    const cell2 = screen.getByRole('button', { name: '1行3列 空き' });

    // 1手目: X
    fireEvent.click(cell0);
    expect(cell0).toHaveTextContent('X');
    expect(cell0).toHaveAccessibleName('1行1列 X');
    expect(screen.getByText('手番: O')).toBeInTheDocument();

    // 埋まったマスを再度押しても変化しない (disabled になっている)
    fireEvent.click(cell0);
    expect(cell0).toHaveTextContent('X');
    expect(screen.getByText('手番: O')).toBeInTheDocument();

    // 2手目: O
    fireEvent.click(cell1);
    expect(cell1).toHaveTextContent('O');
    expect(cell1).toHaveAccessibleName('1行2列 O');
    expect(screen.getByText('手番: X')).toBeInTheDocument();

    // 3手目: X
    fireEvent.click(cell2);
    expect(cell2).toHaveTextContent('X');
    expect(cell2).toHaveAccessibleName('1行3列 X');
    expect(screen.getByText('手番: O')).toBeInTheDocument();
  });

  it('横一列そろえると勝者テキストが出て、勝ちラインのマスに強調 class が付く', () => {
    render(<App />);

    // 1行目 (0, 1, 2) を X で揃える
    // X: 0, 1, 2
    // O: 3, 4
    const cell0 = screen.getByRole('button', { name: '1行1列 空き' });
    const cell1 = screen.getByRole('button', { name: '1行2列 空き' });
    const cell2 = screen.getByRole('button', { name: '1行3列 空き' });
    const cell3 = screen.getByRole('button', { name: '2行1列 空き' });
    const cell4 = screen.getByRole('button', { name: '2行2列 空き' });

    fireEvent.click(cell0); // X (0)
    fireEvent.click(cell3); // O (3)
    fireEvent.click(cell1); // X (1)
    fireEvent.click(cell4); // O (4)
    fireEvent.click(cell2); // X (2) -> win!

    expect(screen.getByText('勝者: X!')).toBeInTheDocument();
    expect(screen.getByText('X: 1勝')).toBeInTheDocument();

    // 勝ちラインのセルに winning クラスが付く
    expect(cell0).toHaveClass('winning');
    expect(cell1).toHaveClass('winning');
    expect(cell2).toHaveClass('winning');
    expect(cell3).not.toHaveClass('winning');
    expect(cell4).not.toHaveClass('winning');

    // 決着後はマスが disabled になる
    const cell5 = screen.getByRole('button', { name: '2行3列 空き' });
    expect(cell5).toBeDisabled();
  });

  it('盤面が埋まって勝者なしなら引き分けテキストが表示される', () => {
    render(<App />);

    // 引き分け手順:
    // [0, 1, 2] -> X O X
    // [3, 4, 5] -> X X O
    // [6, 7, 8] -> O X O
    // 順番: 0(X), 1(O), 2(X), 5(O), 3(X), 6(O), 4(X), 8(O), 7(X)
    const moveLabels = [
      '1行1列 空き', // 0: X
      '1行2列 空き', // 1: O
      '1行3列 空き', // 2: X
      '2行3列 空き', // 5: O
      '2行1列 空き', // 3: X
      '3行1列 空き', // 6: O
      '2行2列 空き', // 4: X
      '3行3列 空き', // 8: O
      '3行2列 空き', // 7: X
    ];

    for (const label of moveLabels) {
      const cell = screen.getByRole('button', { name: label });
      fireEvent.click(cell);
    }

    expect(screen.getByText('引き分け!')).toBeInTheDocument();
    expect(screen.getByText('引き分け: 1')).toBeInTheDocument();
  });

  it('「もう一度」で盤面が空になり、スコアは保持される。「スコアリセット」でスコアが 0', () => {
    render(<App />);

    // X の勝ちを作る
    fireEvent.click(screen.getByRole('button', { name: '1行1列 空き' })); // X
    fireEvent.click(screen.getByRole('button', { name: '2行1列 空き' })); // O
    fireEvent.click(screen.getByRole('button', { name: '1行2列 空き' })); // X
    fireEvent.click(screen.getByRole('button', { name: '2行2列 空き' })); // O
    fireEvent.click(screen.getByRole('button', { name: '1行3列 空き' })); // X (win)

    expect(screen.getByText('X: 1勝')).toBeInTheDocument();

    // 「もう一度」をクリック
    const resetButton = screen.getByRole('button', { name: 'もう一度' });
    fireEvent.click(resetButton);

    // 盤面が空に戻る
    expect(
      screen.getByRole('button', { name: '1行1列 空き' })
    ).toBeInTheDocument();
    expect(screen.getByText('手番: X')).toBeInTheDocument();
    // スコアは保持される
    expect(screen.getByText('X: 1勝')).toBeInTheDocument();

    // 「スコアリセット」をクリック
    const resetScoreButton = screen.getByRole('button', {
      name: 'スコアリセット',
    });
    fireEvent.click(resetScoreButton);

    expect(screen.getByText('X: 0勝')).toBeInTheDocument();
    expect(screen.getByText('O: 0勝')).toBeInTheDocument();
    expect(screen.getByText('引き分け: 0')).toBeInTheDocument();
  });

  describe('CPU 対戦', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('CPU 対戦に切替 → 人間が 1 手打つと、少し待って盤面の O が 1 つ増える', () => {
      render(<App gameOptions={{ cpuDelayMs: 200 }} />);

      // CPU対戦に切り替え
      const cpuRadio = screen.getByLabelText('CPU対戦');
      fireEvent.click(cpuRadio);

      // 人間が 1行1列 に着手
      const cell0 = screen.getByRole('button', { name: '1行1列 空き' });
      fireEvent.click(cell0);

      expect(cell0).toHaveTextContent('X');
      // この時点ではまだ CPU の着手前なので O は 0 個
      const cells = screen.getAllByRole('button', { name: /^[1-3]行[1-3]列/ });
      const oCellsBefore = cells.filter((c) => c.textContent === 'O');
      expect(oCellsBefore.length).toBe(0);

      // タイマーを進める
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // O が 1 つ増えている
      const oCellsAfter = screen
        .getAllByRole('button', { name: /^[1-3]行[1-3]列/ })
        .filter((c) => c.textContent === 'O');
      expect(oCellsAfter.length).toBe(1);
    });

    it('CPU 対戦で後手 (O) を選択した場合、ゲーム開始時に CPU (X) が初手を自動で打つ', () => {
      render(<App gameOptions={{ cpuDelayMs: 200 }} />);

      // CPU対戦に切り替え
      const cpuRadio = screen.getByLabelText('CPU対戦');
      fireEvent.click(cpuRadio);

      // 後手 (O) を選択
      const secondPlayerRadio = screen.getByLabelText('後手 (O)');
      fireEvent.click(secondPlayerRadio);

      // 初手自動着手前は空
      const cellsBefore = screen.getAllByRole('button', {
        name: /^[1-3]行[1-3]列/,
      });
      expect(cellsBefore.every((c) => c.textContent === '')).toBe(true);

      // タイマーを進める
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // CPU (X) が 1 つ打っている
      const xCellsAfter = screen
        .getAllByRole('button', { name: /^[1-3]行[1-3]列/ })
        .filter((c) => c.textContent === 'X');
      expect(xCellsAfter.length).toBe(1);
    });
  });

  describe('キーボード操作', () => {
    it('矢印キーでフォーカスが移動する', () => {
      render(<App />);

      const cell0 = screen.getByRole('button', { name: '1行1列 空き' });
      const cell1 = screen.getByRole('button', { name: '1行2列 空き' });
      const cell3 = screen.getByRole('button', { name: '2行1列 空き' });

      cell0.focus();
      expect(document.activeElement).toBe(cell0);

      // ArrowRight で 右(1) へ移動
      fireEvent.keyDown(cell0, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(cell1);

      // ArrowLeft で 左(0) へ戻る
      fireEvent.keyDown(cell1, { key: 'ArrowLeft' });
      expect(document.activeElement).toBe(cell0);

      // ArrowDown で 下(3) へ移動
      fireEvent.keyDown(cell0, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(cell3);

      // ArrowUp で 上(0) へ戻る
      fireEvent.keyDown(cell3, { key: 'ArrowUp' });
      expect(document.activeElement).toBe(cell0);
    });
  });
});
