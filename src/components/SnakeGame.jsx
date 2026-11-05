import { useCallback, useEffect, useRef, useState } from 'react';

const SIZE = 18;
const START = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }];
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
};

const randomFood = (snake) => {
  const open = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (!snake.some((part) => part.x === x && part.y === y)) open.push({ x, y });
    }
  }
  return open[Math.floor(Math.random() * open.length)] || { x: 2, y: 2 };
};

export default function SnakeGame({ onBack }) {
  const [snake, setSnake] = useState(START);
  const [food, setFood] = useState(() => randomFood(START));
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const directionRef = useRef(direction);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('tushar-snake-best') || 0));
  const [status, setStatus] = useState('ready');

  const restart = useCallback(() => {
    setSnake(START);
    setFood(randomFood(START));
    directionRef.current = { x: 1, y: 0 };
    setDirection(directionRef.current);
    setScore(0);
    setStatus('playing');
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onBack();
        return;
      }
      const next = DIRECTIONS[event.key];
      if (event.key === 'p' || event.key === 'P') {
        setStatus((current) => current === 'playing' ? 'paused' : current === 'paused' ? 'playing' : current);
        return;
      }
      if (!next) return;
      event.preventDefault();
      const current = directionRef.current;
      if (next.x + current.x === 0 && next.y + current.y === 0) return;
      directionRef.current = next;
      setDirection(next);
      if (status === 'ready') setStatus('playing');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, status]);

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const interval = window.setInterval(() => {
      setSnake((current) => {
        const head = current[0];
        const nextHead = { x: head.x + directionRef.current.x, y: head.y + directionRef.current.y };
        const hitWall = nextHead.x < 0 || nextHead.y < 0 || nextHead.x >= SIZE || nextHead.y >= SIZE;
        const hitSelf = current.some((part) => part.x === nextHead.x && part.y === nextHead.y);
        if (hitWall || hitSelf) {
          setStatus('over');
          return current;
        }
        const ate = nextHead.x === food.x && nextHead.y === food.y;
        const nextSnake = [nextHead, ...current];
        if (!ate) nextSnake.pop();
        else {
          setScore((value) => {
            const nextScore = value + 10;
            setBest((currentBest) => {
              const nextBest = Math.max(currentBest, nextScore);
              localStorage.setItem('tushar-snake-best', String(nextBest));
              return nextBest;
            });
            return nextScore;
          });
          setFood(randomFood(nextSnake));
        }
        return nextSnake;
      });
    }, Math.max(75, 145 - Math.floor(score / 50) * 8));
    return () => window.clearInterval(interval);
  }, [food, score, status]);

  return (
    <div className="game-screen">
      <GameHeader title="NEON SNAKE" subtitle="Grow the chain. Avoid the collision." onBack={onBack} onRestart={restart} />
      <div className="game-stats"><span>SCORE <strong>{score}</strong></span><span>BEST <strong>{best}</strong></span><span>SPEED <strong>{Math.max(1, Math.floor(score / 50) + 1)}</strong></span></div>
      <div className="snake-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }, (_, index) => {
          const point = { x: index % SIZE, y: Math.floor(index / SIZE) };
          const snakePart = snake.findIndex((part) => part.x === point.x && part.y === point.y);
          const isFood = food.x === point.x && food.y === point.y;
          return <div key={`${point.x}-${point.y}`} className={`snake-cell ${snakePart === 0 ? 'snake-head' : snakePart > 0 ? 'snake-body' : ''} ${isFood ? 'snake-food' : ''}`} />;
        })}
      </div>
      <div className="game-controls">
        <button type="button" className="game-restart-button" onClick={() => setStatus((current) => current === 'playing' ? 'paused' : current === 'paused' ? 'playing' : 'playing')}>
          {status === 'paused' ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div className="game-message">{status === 'ready' ? 'Press any arrow key or WASD to start' : status === 'paused' ? 'SYSTEM PAUSED — press P or Resume' : status === 'over' ? 'SYSTEM HALTED — restart to try again' : 'Use Arrow Keys or WASD to navigate'}</div>
    </div>
  );
}

export function GameHeader({ title, subtitle, onBack, onRestart }) {
  return (
    <div className="game-header">
      <div><button type="button" className="game-back-button" onClick={onBack}>← Arcade</button><h2>{title}</h2><p>{subtitle}</p></div>
      <button type="button" className="game-restart-button" onClick={onRestart}>Restart</button>
    </div>
  );
}
