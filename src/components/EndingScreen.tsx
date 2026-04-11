import { useGameStore } from '../store/gameStore';
import { ENDINGS } from '../game/endings';
import './EndingScreen.css';

export function EndingScreen() {
  const endingId = useGameStore((s) => s.endingId);
  const karma = useGameStore((s) => s.karma);
  const startGame = useGameStore((s) => s.startGame);
  const setPhase = useGameStore((s) => s.setPhase);

  if (!endingId) return null;
  const ending = ENDINGS[endingId];

  return (
    <div className="ending-screen">
      <div className="ending-content">
        <div className="ending-stars">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`star ${i < ending.stars ? 'filled' : ''}`}>
              {i < ending.stars ? '\u2605' : '\u2606'}
            </span>
          ))}
        </div>
        <h1 className="ending-title">{ending.title}</h1>
        <p className="ending-subtitle">{ending.subtitle}</p>
        <div className="ending-divider" />
        <p className="ending-description">{ending.description}</p>
        <div className="ending-stats">
          <span>최종 업보: {karma}</span>
        </div>
        <div className="ending-buttons">
          <button className="btn-retry" onClick={startGame}>
            다시 플레이
          </button>
          <button className="btn-title" onClick={() => setPhase('title')}>
            타이틀로
          </button>
        </div>
      </div>
    </div>
  );
}
