import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHeader } from './SnakeGame';

const initial = { p1: { x: 18, y: 50, hp: 100 }, p2: { x: 82, y: 50, hp: 100 }, shots: [], round: 1 };

export default function NeonDuel({ onBack }) {
  const [state, setState] = useState(initial);
  const stateRef = useRef(initial);
  const keys = useRef(new Set());
  const [status, setStatus] = useState('ready');
  const [winner, setWinner] = useState('');
  const [wins, setWins] = useState({ p1: 0, p2: 0 });
  const frame = useRef();
  const lastShot = useRef({ p1: 0, p2: 0 });

  const restart = useCallback(() => { stateRef.current = { ...initial, shots: [] }; setState(stateRef.current); setWins({ p1: 0, p2: 0 }); setWinner(''); setStatus('playing'); }, []);

  useEffect(() => {
    const down = (event) => {
      if (event.key === 'Escape') onBack();
      const valid = ['w', 'a', 's', 'd', 'f', 'W', 'A', 'S', 'D', 'F', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
      if (valid.includes(event.key)) { event.preventDefault(); keys.current.add(event.key.toLowerCase()); if (status === 'ready') setStatus('playing'); }
    };
    const up = (event) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [onBack, status]);

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const tick = (now) => {
      const next = JSON.parse(JSON.stringify(stateRef.current));
      const move = (player, up, down, left, right) => {
        player.x += (keys.current.has(right) ? 1 : 0) * 0.22 - (keys.current.has(left) ? 1 : 0) * 0.22;
        player.y += (keys.current.has(down) ? 1 : 0) * 0.22 - (keys.current.has(up) ? 1 : 0) * 0.22;
        player.x = Math.max(7, Math.min(93, player.x)); player.y = Math.max(12, Math.min(88, player.y));
      };
      move(next.p1, 'w', 's', 'a', 'd'); move(next.p2, 'arrowup', 'arrowdown', 'arrowleft', 'arrowright');
      const shoot = (from, owner, key) => {
        if (keys.current.has(key) && now - lastShot.current[owner] > 420) {
          next.shots.push({ id: now + owner, owner, x: from.x, y: from.y, vx: owner === 'p1' ? 0.9 : -0.9 });
          lastShot.current[owner] = now;
        }
      };
      shoot(next.p1, 'p1', 'f'); shoot(next.p2, 'p2', 'enter');
      next.shots = next.shots.map((shot) => ({ ...shot, x: shot.x + shot.vx })).filter((shot) => shot.x > 2 && shot.x < 98);
      next.shots.forEach((shot) => {
        const target = shot.owner === 'p1' ? next.p2 : next.p1;
        if (Math.hypot(shot.x - target.x, shot.y - target.y) < 6) { target.hp = Math.max(0, target.hp - 12); shot.x = -100; }
      });
      const defeated = next.p1.hp === 0 || next.p2.hp === 0;
      stateRef.current = next; setState(next);
      if (defeated) {
        const roundWinner = next.p1.hp > 0 ? 'p1' : 'p2';
        setWins((current) => {
          const updated = { ...current, [roundWinner]: current[roundWinner] + 1 };
          if (updated[roundWinner] >= 2) { setWinner(roundWinner === 'p1' ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS'); setStatus('won'); }
          else { setWinner(roundWinner === 'p1' ? 'PLAYER 1 TAKES THE ROUND' : 'PLAYER 2 TAKES THE ROUND'); setStatus('round'); }
          return updated;
        });
      } else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [status]);

  const nextRound = () => { stateRef.current = { ...initial, round: state.round + 1 }; setState(stateRef.current); setWinner(''); setStatus('playing'); };

  return <div className="game-screen duel-game">
    <GameHeader title="NEON DUEL" subtitle="Two pilots. One arena. Best of three." onBack={onBack} onRestart={restart} />
    <div className="game-stats"><span>P1 ROUNDS <strong>{wins.p1}</strong></span><span>ROUND <strong>{state.round}/3</strong></span><span>P2 ROUNDS <strong>{wins.p2}</strong></span></div>
    <div className="duel-arena"><div className="duel-obstacle obstacle-a" /><div className="duel-obstacle obstacle-b" />{state.shots.map((shot) => <i key={shot.id} className={`energy-shot ${shot.owner}`} style={{ left: `${shot.x}%`, top: `${shot.y}%` }} />)}<div className="duel-player p1" style={{ left: `${state.p1.x}%`, top: `${state.p1.y}%` }}>1</div><div className="duel-player p2" style={{ left: `${state.p2.x}%`, top: `${state.p2.y}%` }}>2</div><div className="duel-health p1-health" style={{ width: `${state.p1.hp}%` }} /><div className="duel-health p2-health" style={{ width: `${state.p2.hp}%` }} /></div>
    <div className="parking-controls"><span>P1: W A S D + F</span><span>P2: ARROWS + ENTER</span></div>
    {(status === 'ready' || status === 'round' || status === 'won') && <div className="game-overlay"><strong>{status === 'ready' ? 'NEON DUEL' : winner}</strong><span>{status === 'ready' ? 'Press movement or attack keys to deploy.' : status === 'won' ? 'Match complete. Rematch?' : 'Reset the arena for the next round.'}</span><button type="button" onClick={status === 'round' ? nextRound : restart}>{status === 'ready' ? 'Start Match' : status === 'round' ? 'Next Round' : 'Rematch'}</button></div>}
  </div>;
}
