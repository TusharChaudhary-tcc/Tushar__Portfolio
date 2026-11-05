import { useState } from 'react';
import { Car, Trees, Swords } from 'lucide-react';
import NeonDuel from './NeonDuel';
import PrecisionParking from './PrecisionParking';
import WildRush from './WildRush';

const GAMES = [
  { id: 'parking', title: 'Precision Parking', description: 'Thread a responsive car through a tactical lot and settle into the perfect bay.', genre: 'CAR SIMULATOR', difficulty: 'TACTICAL', players: '1 PLAYER', icon: Car, accent: 'blue' },
  { id: 'rush', title: 'Wild Rush', description: 'Run through a living valley, dodge the wild trail, and chase a new distance record.', genre: 'ENDLESS RUNNER', difficulty: 'FAST', players: '1 PLAYER', icon: Trees, accent: 'teal' },
  { id: 'duel', title: 'Neon Duel', description: 'Pilot a neon arena battle with a friend in a best-of-three energy duel.', genre: 'LOCAL BATTLE', difficulty: 'COMPETITIVE', players: '2 PLAYERS', icon: Swords, accent: 'amber' },
];

function GamePreview({ id, Icon }) {
  if (id === 'parking') {
    return <div className="arcade-preview arcade-preview-parking" aria-hidden="true">
      {Array.from({ length: 20 }, (_, index) => <span key={index} className={index % 2 ? 'is-line' : 'is-car'} />)}
      <Icon className="arcade-preview-icon" />
    </div>;
  }
  if (id === 'rush') {
    return <div className="arcade-preview arcade-preview-rush" aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => <span key={index} className={index % 3 === 1 ? 'is-road' : 'is-tree'} />)}
      <Icon className="arcade-preview-icon" />
    </div>;
  }
  return <div className="arcade-preview arcade-preview-duel" aria-hidden="true">
    {Array.from({ length: 12 }, (_, index) => <span key={index} className={index === 4 ? 'is-blue' : index === 7 ? 'is-orange' : ''} />)}
    <Icon className="arcade-preview-icon" />
  </div>;
}

export default function GamesArcade() {
  const [selectedGame, setSelectedGame] = useState(null);
  if (selectedGame === 'parking') return <PrecisionParking onBack={() => setSelectedGame(null)} />;
  if (selectedGame === 'rush') return <WildRush onBack={() => setSelectedGame(null)} />;
  if (selectedGame === 'duel') return <NeonDuel onBack={() => setSelectedGame(null)} />;

  return <div className="arcade-screen animate-fadeIn font-sans">
    <div className="arcade-intro"><div><div className="cert-code-label">// INTERACTIVE_LAB</div><h2>Mini Games Arcade</h2><p>Small systems, sharp reflexes, and a little controlled chaos.</p></div><span className="arcade-status">3 MODULES ONLINE</span></div>
    <div className="arcade-grid">
      {GAMES.map(({ id, title, description, genre, difficulty, players, icon: Icon, accent }) => <article key={id} className={`arcade-card arcade-card-${accent}`}><div className="arcade-card-preview"><GamePreview id={id} Icon={Icon} /><span>READY</span></div><div className="arcade-card-content"><div className="arcade-card-meta"><span>{genre}</span><span>{players}</span></div><h3>{title}</h3><p>{description}</p><div className="arcade-card-footer"><span className="arcade-difficulty">{difficulty}</span><button type="button" onClick={() => setSelectedGame(id)}>Play Game <span aria-hidden="true">→</span></button></div></div></article>)}
    </div>
  </div>;
}
