import { useGameStore } from '../store/gameStore';
import { KARMA_MAX, getKarmaLevel } from '../game/karma';
import './KarmaGauge.css';

export function KarmaGauge() {
  const karma = useGameStore((s) => s.karma);
  const level = getKarmaLevel(karma);
  const pct = (karma / KARMA_MAX) * 100;

  return (
    <div className="karma-gauge">
      <div className="karma-label">
        <span>업보</span>
        <span className={`karma-value karma-${level}`}>{karma}</span>
      </div>
      <div className="karma-bar-bg">
        <div
          className={`karma-bar-fill karma-${level}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="karma-range">
        <span>선</span>
        <span>악</span>
      </div>
    </div>
  );
}
