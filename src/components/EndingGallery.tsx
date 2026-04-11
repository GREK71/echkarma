import { useGameStore } from '../store/gameStore';
import { ENDINGS, type EndingId } from '../game/endings';
import './EndingGallery.css';

const ENDING_ORDER: EndingId[] = [
  'atonement',
  'reconciliation',
  'survivor',
  'karma_echo_ends',
  'wasteland_king',
];

export function EndingGallery() {
  const unlockedEndings = useGameStore((s) => s.unlockedEndings);
  const setPhase = useGameStore((s) => s.setPhase);

  return (
    <div className="gallery-screen">
      <div className="gallery-header">
        <button className="btn-back" onClick={() => setPhase('title')}>
          &larr; 돌아가기
        </button>
        <h2 className="gallery-title">엔딩 갤러리</h2>
        <p className="gallery-count">{unlockedEndings.length}/5 달성</p>
      </div>

      <div className="gallery-list">
        {ENDING_ORDER.map((id) => {
          const ending = ENDINGS[id];
          const unlocked = unlockedEndings.includes(id);

          return (
            <div key={id} className={`gallery-card ${unlocked ? 'unlocked' : 'locked'}`}>
              <div className="gallery-stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`star ${i < ending.stars ? 'filled' : ''}`}>
                    {i < ending.stars ? '\u2605' : '\u2606'}
                  </span>
                ))}
              </div>
              <h3 className="gallery-card-title">
                {unlocked ? ending.title : '???'}
              </h3>
              <p className="gallery-card-subtitle">
                {unlocked ? ending.subtitle : '???'}
              </p>
              {unlocked && (
                <p className="gallery-card-desc">{ending.description}</p>
              )}
              {!unlocked && (
                <p className="gallery-card-desc locked-text">아직 발견하지 못한 결말입니다.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
