import { useEffect, useState } from 'react';
import BrandIcon from './BrandIcon';
import { GameHeader } from './SnakeGame';

const PAIRS = ['react', 'typescript', 'json', 'html', 'github', 'leetcode'];

const shuffled = () => [...PAIRS, ...PAIRS].sort(() => Math.random() - 0.5).map((name, index) => ({ id: index, name }));

export default function MemoryMatrix({ onBack }) {
  const [cards, setCards] = useState(shuffled);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (flipped.length !== 2) return undefined;
    const [first, second] = flipped.map((id) => cards.find((card) => card.id === id));
    const timer = window.setTimeout(() => {
      if (first.name === second.name) setMatched((current) => [...current, first.name]);
      setFlipped([]);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [cards, flipped]);

  const choose = (card) => {
    if (flipped.length === 2 || flipped.includes(card.id) || matched.includes(card.name)) return;
    setFlipped((current) => [...current, card.id]);
    if (flipped.length === 1) setMoves((value) => value + 1);
  };
  const restart = () => { setCards(shuffled()); setFlipped([]); setMatched([]); setMoves(0); setSeconds(0); };
  const won = matched.length === PAIRS.length;

  return (
    <div className="game-screen">
      <GameHeader title="MEMORY MATRIX" subtitle="Pair the technologies. Keep the stack in memory." onBack={onBack} onRestart={restart} />
      <div className="game-stats"><span>MOVES <strong>{moves}</strong></span><span>TIME <strong>{seconds}s</strong></span><span>PAIRS <strong>{matched.length}/{PAIRS.length}</strong></span></div>
      <div className="memory-grid">
        {cards.map((card) => {
          const visible = flipped.includes(card.id) || matched.includes(card.name);
          return <button type="button" key={card.id} className={`memory-card ${visible ? 'is-visible' : ''} ${matched.includes(card.name) ? 'is-matched' : ''}`} onClick={() => choose(card)} aria-label={visible ? card.name : 'Hidden technology card'}>
            {visible ? <BrandIcon name={card.name} size={34} /> : <span>?</span>}
          </button>;
        })}
      </div>
      {won && <div className="game-win-message">MATRIX DECODED — all pairs matched.</div>}
    </div>
  );
}
