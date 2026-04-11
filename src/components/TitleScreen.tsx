import { useGameStore, TOTAL_ENDINGS } from '../store/gameStore';
import './TitleScreen.css';

export function TitleScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const goToGallery = useGameStore((s) => s.goToGallery);
  const unlockedEndings = useGameStore((s) => s.unlockedEndings);

  return (
    <div className="title-screen">
      <div className="title-bg-overlay" />
      <div className="title-content">
        <h1 className="title-main">업보의 메아리</h1>
        <p className="title-sub">Echo of Karma</p>
        <div className="title-buttons">
          <button className="btn-start" onClick={startGame}>
            새 게임
          </button>
          <button className="btn-gallery" onClick={goToGallery}>
            엔딩 갤러리 ({unlockedEndings.length}/{TOTAL_ENDINGS})
          </button>
        </div>
      </div>
    </div>
  );
}
