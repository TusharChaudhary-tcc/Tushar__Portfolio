import { useCallback, useEffect, useState } from 'react';
import { GameHeader } from './SnakeGame';

const labels = ['JS', 'TS', 'API', 'UI', 'SQL', 'AI'];
const createBoard = () => {
  const board = Array(16).fill(0);
  board[Math.floor(Math.random() * 16)] = 2;
  let second = Math.floor(Math.random() * 16);
  while (board[second]) second = Math.floor(Math.random() * 16);
  board[second] = 2;
  return board;
};

const moveLine = (line) => {
  const values = line.filter(Boolean);
  const result = [];
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1]) { result.push(values[i] * 2); i += 1; } else result.push(values[i]);
  }
  while (result.length < 4) result.push(0);
  return result;
};

const hasMoves = (values) => values.some((value, index) => {
  if (!value) return true;
  const row = Math.floor(index / 4);
  const column = index % 4;
  return (column < 3 && values[index + 1] === value) || (row < 3 && values[index + 4] === value);
});

export default function Code2048({ onBack }) {
  const [board, setBoard] = useState(createBoard);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);

  const restart = useCallback(() => { setBoard(createBoard()); setScore(0); setWon(false); setOver(false); }, []);
  const shift = useCallback((key) => {
    const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
    if (won || over) return;
    const next = Array(16).fill(0);
    const lines = [];
    if (normalizedKey === 'ArrowLeft' || normalizedKey === 'a') for (let y = 0; y < 4; y += 1) lines.push([0, 1, 2, 3].map((x) => board[y * 4 + x]));
    if (normalizedKey === 'ArrowRight' || normalizedKey === 'd') for (let y = 0; y < 4; y += 1) lines.push([3, 2, 1, 0].map((x) => board[y * 4 + x]));
    if (normalizedKey === 'ArrowUp' || normalizedKey === 'w') for (let x = 0; x < 4; x += 1) lines.push([0, 1, 2, 3].map((y) => board[y * 4 + x]));
    if (normalizedKey === 'ArrowDown' || normalizedKey === 's') for (let x = 0; x < 4; x += 1) lines.push([3, 2, 1, 0].map((y) => board[y * 4 + x]));
    if (!lines.length) return;
    let gained = 0;
    lines.forEach((line, index) => {
      const moved = moveLine(line);
      moved.forEach((value, position) => {
        const coordinate = normalizedKey === 'ArrowLeft' || normalizedKey === 'a' ? [Math.floor(index / 1), position] : normalizedKey === 'ArrowRight' || normalizedKey === 'd' ? [Math.floor(index / 1), 3 - position] : [normalizedKey === 'ArrowUp' || normalizedKey === 'w' ? position : 3 - position, index];
        const cell = coordinate[0] * 4 + coordinate[1];
        next[cell] = value;
      });
      gained += moved.reduce((sum, value, position) => sum + (value > line[position] && value > 2 ? value : 0), 0);
    });
    if (next.every((value, index) => value === board[index])) return;
    const empty = next.map((value, index) => value ? -1 : index).filter((index) => index >= 0);
    if (empty.length) next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
    setBoard(next);
    setScore((value) => value + gained);
    if (next.some((value) => value >= 2048)) setWon(true);
    else if (!hasMoves(next)) setOver(true);
  }, [board, over, won]);

  useEffect(() => {
    const handler = (event) => { if (event.key === 'Escape') onBack(); else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) { event.preventDefault(); shift(event.key); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onBack, shift]);

  return <div className="game-screen">
    <GameHeader title="CODE 2048" subtitle="Merge the stack until the build reaches 2048." onBack={onBack} onRestart={restart} />
    <div className="game-stats"><span>SCORE <strong>{score}</strong></span><span>TARGET <strong>2048</strong></span><span>STATUS <strong>{won ? 'BUILT' : over ? 'LOCKED' : 'RUNNING'}</strong></span></div>
    <div className="code2048-board">{board.map((value, index) => <div key={index} className={`code2048-tile tile-${value}`}>{value ? (value <= 64 ? labels[Math.log2(value) - 1] || value : value) : ''}<small>{value || ''}</small></div>)}</div>
    <div className="game-message">{won ? 'BUILD COMPLETE — excellent merge strategy.' : over ? 'NO VALID MOVES — restart to rebuild.' : 'Use Arrow Keys or WASD to merge tiles'}</div>
  </div>;
}
