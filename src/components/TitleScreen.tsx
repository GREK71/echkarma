import { useGameStore } from '../store/gameStore';
import { TOTAL_ENDINGS } from '../game/endings';
import './TitleScreen.css';

export function TitleScreen() {
  const startPrologue = useGameStore((s) => s.startPrologue);
  const goToGallery = useGameStore((s) => s.goToGallery);
  const unlockedEndings = useGameStore((s) => s.unlockedEndings);
  const completedEpisodes = useGameStore((s) => s.completedEpisodes);
  const setPhase = useGameStore((s) => s.setPhase);
  const resetAll = useGameStore((s) => s.resetAll);

  const hasProgress = completedEpisodes.length > 0;

  return (
    <div className="title-screen">
      <div className="title-bg" />
      <div className="title-overlay" />

      <div className="title-inner">
        <div className="title-eyebrow">침묵은 선택이다</div>
        <h1 className="title-main">묵인</h1>
        <p className="title-sub">默認 · Silence</p>

        <div className="title-quote">
          <p>"내가 침묵했기 때문에 세상이 달라졌다.</p>
          <p>나는 그 무게를 평생 안고 산다."</p>
        </div>

        <div className="title-buttons">
          {hasProgress ? (
            <>
              <button className="btn-primary" onClick={() => setPhase('episode_select')}>
                이어서
              </button>
              <button className="btn-secondary" onClick={() => { if (confirm('진행 상황을 초기화합니다.')) resetAll(); }}>
                처음부터
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={startPrologue}>
              시작하기
            </button>
          )}
          <button className="btn-tertiary" onClick={goToGallery}>
            결말 — {unlockedEndings.length}/{TOTAL_ENDINGS}
          </button>
        </div>

        <div className="title-bottom">
          텍스트 어드벤처 · 도덕적 선택 · 묵인 시스템
        </div>
      </div>
    </div>
  );
}
