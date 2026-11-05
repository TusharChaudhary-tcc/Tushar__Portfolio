import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHeader } from './SnakeGame';

const lanePositions = [25, 50, 75];

export default function WildRush({ onBack }) {
  const [lane, setLane] = useState(1);
  const [playerY, setPlayerY] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [objects, setObjects] = useState([]);
  const [coins, setCoins] = useState(0);
  const [distance, setDistance] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('wild-rush-best') || 0));
  const [status, setStatus] = useState('ready');
  const keys = useRef(new Set());
  const last = useRef(0);
  const frame = useRef();
  const jump = useRef(0);

  const restart = useCallback(() => {
    setLane(1); setPlayerY(0); setSliding(false); setObjects([]); setCoins(0); setDistance(0); setStatus('running'); last.current = performance.now();
  }, []);

  useEffect(() => {
    const down = (event) => {
      if (event.key === 'Escape') onBack();
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(event.key)) {
        event.preventDefault();
        setLane((value) => Math.max(0, Math.min(2, value + (event.key.toLowerCase() === 'a' || event.key === 'ArrowLeft' ? -1 : 1))));
        if (status === 'ready') restart();
      }
      if (['ArrowUp', 'w', 'W'].includes(event.key) && status === 'running' && jump.current === 0) jump.current = 1;
      if (['ArrowDown', 's', 'S'].includes(event.key)) setSliding(true);
    };
    const up = (event) => { if (['ArrowDown', 's', 'S'].includes(event.key)) setSliding(false); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [onBack, restart, status]);

  useEffect(() => {
    if (status !== 'running') return undefined;
    const tick = (now) => {
      const delta = Math.min(40, now - last.current);
      last.current = now;
      setDistance((value) => value + delta * 0.012);
      if (jump.current) {
        jump.current += delta / 420;
        setPlayerY(Math.sin(Math.min(jump.current, 1) * Math.PI) * 38);
        if (jump.current >= 1) { jump.current = 0; setPlayerY(0); }
      }
      setObjects((current) => {
        let next = current.map((object) => ({ ...object, y: object.y + delta * (0.04 + distance / 20000) })).filter((object) => object.y < 105);
        if (Math.random() < 0.018 + distance / 300000) next = [...next, { id: now, lane: Math.floor(Math.random() * 3), y: -8, type: Math.random() > 0.72 ? 'coin' : Math.random() > 0.5 ? 'rock' : 'log' }];
        next.forEach((object) => {
          if (object.y > 78 && object.y < 92 && object.lane === lane) {
            if (object.type === 'coin') { setCoins((value) => value + 1); object.y = 110; }
            else if (playerY < 18 && !sliding) { setStatus('over'); setBest((value) => { const nextBest = Math.max(value, Math.floor(distance) + coins * 10); localStorage.setItem('wild-rush-best', String(nextBest)); return nextBest; }); }
          }
        });
        return next;
      });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [coins, distance, lane, playerY, sliding, status]);

  return <div className="game-screen wild-game">
    <GameHeader title="WILD RUSH" subtitle="Run the valley. Read the trail. Keep moving." onBack={onBack} onRestart={restart} />
    <div className="game-stats"><span>DISTANCE <strong>{Math.floor(distance)}m</strong></span><span>COINS <strong>{coins}</strong></span><span>BEST <strong>{best}</strong></span></div>
    <div className="runner-scene"><div className="mountains" /><div className="runner-tree tree-a" /><div className="runner-tree tree-b" /><div className="runner-river" /><div className="runner-road"><i /><i /><i />{objects.map((object) => <span key={object.id} className={`runner-object runner-${object.type}`} style={{ left: `${lanePositions[object.lane]}%`, top: `${object.y}%` }}>{object.type === 'coin' ? '◆' : object.type === 'log' ? '▰' : '●'}</span>)}<div className={`runner-player ${sliding ? 'is-sliding' : ''}`} style={{ left: `${lanePositions[lane]}%`, transform: `translate(-50%, ${-playerY}px)` }}>◆</div></div></div>
    <div className="parking-controls"><span>← → CHANGE LANE</span><span>↑ JUMP</span><span>↓ SLIDE</span></div>
    {(status === 'ready' || status === 'over') && <div className="game-overlay"><strong>{status === 'over' ? 'TRAIL ENDED' : 'ENTER THE VALLEY'}</strong><span>{status === 'over' ? `Distance ${Math.floor(distance)}m · ${coins} coins` : 'Avoid logs, rocks, and fallen branches.'}</span><button type="button" onClick={restart}>{status === 'over' ? 'Run Again' : 'Start Run'}</button></div>}
  </div>;
}
