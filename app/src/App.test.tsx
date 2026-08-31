import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('見出し「マルバツゲーム」が描画される', () => {
    render(<App />);
    const heading = screen.getByRole('heading', { name: 'マルバツゲーム' });
    expect(heading).toBeInTheDocument();
  });
});
