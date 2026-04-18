import { useGameStore } from '../store/gameStore';
import { ENDINGS, TOTAL_ENDINGS, type EndingId } from '../game/endings';
import './EndingGallery.css';

const ORDER: EndingId[] = ['atonement', 'accomplice', 'collapse', 'silence'];

export function EndingGallery() {
  const unlocked = useGameStore((s) => s.unlockedEndings);
  const setPhase = useGameStore((s) => s.setPhase);

  return (
    <div className="gallery-screen">
      <div className="gallery-wrap">
        <button className="back-link" onClick={() => setPhase('title')}>
          &larr; 타이틀
        </button>

        <div className="gallery-header">
          <div className="gallery-eyebrow">결말 목록</div>
          <h2 className="gallery-title">4가지 결말</h2>
          <p className="gallery-count">{unlocked.length} / {TOTAL_ENDINGS} 도달</p>
        </div>

        <div className="gallery-list">
          {ORDER.map((id) => {
            const e = ENDINGS[id];
            const found = unlocked.includes(id);
            return (
              <div key={id} className={`gallery-card tone-${e.tone} ${found ? 'found' : 'hidden'}`}>
                <div className="gallery-card-left">
                  <div className="gallery-card-num">{ORDER.indexOf(id) + 1}</div>
                </div>
                <div className="gallery-card-right">
                  <div className="gallery-card-title">{found ? e.title : '???'}</div>
                  <div className="gallery-card-subtitle">{found ? e.subtitle : '???'}</div>
                  <p className="gallery-card-desc">
                    {found ? e.description : '아직 도달하지 못한 결말입니다.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
