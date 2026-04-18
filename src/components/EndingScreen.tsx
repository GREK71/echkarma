import { useGameStore } from '../store/gameStore';
import { ENDINGS } from '../game/endings';
import './EndingScreen.css';

export function EndingScreen() {
  const endingId = useGameStore((s) => s.endingId);
  const goToGallery = useGameStore((s) => s.goToGallery);
  const setPhase = useGameStore((s) => s.setPhase);
  const resetAll = useGameStore((s) => s.resetAll);

  if (!endingId) return null;
  const ending = ENDINGS[endingId];

  return (
    <div className={`ending-screen tone-${ending.tone}`}>
      <div className="ending-wrap">
        <div className="ending-eyebrow">결말</div>
        <h1 className="ending-title">{ending.title}</h1>
        <p className="ending-subtitle">{ending.subtitle}</p>

        <div className="ending-divider" />

        <p className="ending-description">{ending.description}</p>

        <div className="ending-buttons">
          <button className="ending-btn primary" onClick={() => { resetAll(); }}>
            처음부터 다시
          </button>
          <button className="ending-btn secondary" onClick={goToGallery}>
            결말 목록
          </button>
          <button className="ending-btn tertiary" onClick={() => setPhase('title')}>
            타이틀로
          </button>
        </div>
      </div>
    </div>
  );
}
