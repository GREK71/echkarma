import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './PrologueScreen.css';

const LINES = [
  '가상의 한국 도시. 재개발을 앞둔 낡은 빌라촌과 번듯한 신도시가 붙어 있는 곳.',
  '경찰은 바쁘거나 무능하거나 부패해 있고, 진실은 돈과 인맥 사이 어딘가에 묻혀 있다.',
  '당신은 작은 탐문 사무소를 운영한다. 경찰도 못 찾는 사람을 찾아주는 일.',
  '10년 전, 중학생이던 당신은 골목에서 누군가 맞는 것을 보았다. 당신은 도망쳤다. 신고하지 않았다.',
  '그 피해자는 다음 날 죽었다. 가해자는 잡히지 않았다.',
  '당신만 알고 있었으니까.',
];

export function PrologueScreen() {
  const finishPrologue = useGameStore((s) => s.finishPrologue);
  const setPhase = useGameStore((s) => s.setPhase);
  const [visibleCount, setVisibleCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (visibleCount >= LINES.length) {
      setFinished(true);
      return;
    }
    const first = visibleCount === 0 ? 800 : 2000;
    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, first);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  const handleSkip = () => {
    if (!finished) {
      setVisibleCount(LINES.length);
      setFinished(true);
    }
  };

  return (
    <div className="prologue-screen" onClick={handleSkip}>
      <div className="prologue-bg" />
      <div className="prologue-overlay" />

      <div className="prologue-inner">
        <button className="prologue-back" onClick={(e) => { e.stopPropagation(); setPhase('title'); }}>
          &larr; 타이틀로
        </button>

        <div className="prologue-lines">
          {LINES.slice(0, visibleCount).map((line, i) => (
            <p key={i} className={`prologue-line ${i === LINES.length - 1 ? 'last' : ''}`}>
              {line}
            </p>
          ))}
        </div>

        {finished && (
          <div className="prologue-cta">
            <div className="cta-divider" />
            <button className="btn-primary" onClick={(e) => { e.stopPropagation(); finishPrologue(); }}>
              사무소로 들어간다
            </button>
          </div>
        )}

        {!finished && (
          <div className="prologue-hint">탭하여 건너뛰기</div>
        )}
      </div>
    </div>
  );
}
