import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './PrologueScreen.css';

const PROLOGUE_LINES = [
  '전쟁은 언제 시작되었는지, 왜 시작되었는지 아무도 기억하지 못한다.',
  '그저 하늘이 무너지던 날, 도시는 폐허가 되었고 사람들은 흩어졌다.',
  '당신은 병사였다. 어떤 부대, 어떤 전장에 있었는지는 기억나지 않는다.',
  '다만 손끝에 남은 감각이 말해준다 — 당신은 많은 것을 잃었고, 더 많은 것을 빼앗았다는 것을.',
  '그리고 오늘, 먼지 뒤덮인 폐허 위에서... 당신은 다시 눈을 뜬다.',
];

export function PrologueScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const setPhase = useGameStore((s) => s.setPhase);
  const [visibleCount, setVisibleCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (visibleCount >= PROLOGUE_LINES.length) {
      setFinished(true);
      return;
    }
    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, visibleCount === 0 ? 600 : 1800);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  const handleSkip = () => {
    if (!finished) {
      setVisibleCount(PROLOGUE_LINES.length);
      setFinished(true);
    }
  };

  const handleStart = () => {
    startGame();
  };

  return (
    <div className="prologue-screen" onClick={handleSkip}>
      <div className="prologue-bg" />
      <div className="prologue-overlay" />

      <div className="prologue-lines">
        {PROLOGUE_LINES.slice(0, visibleCount).map((line, i) => (
          <p key={i} className="prologue-line" style={{ animationDelay: `${i === visibleCount - 1 ? 0 : 0}s` }}>
            {line}
          </p>
        ))}
      </div>

      {finished && (
        <div className="prologue-actions">
          <button className="prologue-btn-start" onClick={handleStart}>
            눈을 뜬다
          </button>
        </div>
      )}

      {!finished && (
        <div className="prologue-hint">탭하여 건너뛰기</div>
      )}

      <button className="prologue-skip" onClick={(e) => { e.stopPropagation(); setPhase('title'); }}>
        &larr; 타이틀
      </button>
    </div>
  );
}
