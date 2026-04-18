import { useGameStore, EPISODES, EPISODE_ORDER } from '../store/gameStore';
import './EpisodeSelect.css';

export function EpisodeSelect() {
  const completedEpisodes = useGameStore((s) => s.completedEpisodes);
  const startEpisode = useGameStore((s) => s.startEpisode);
  const setPhase = useGameStore((s) => s.setPhase);

  return (
    <div className="episode-select">
      <div className="ep-wrap">
        <button className="back-link" onClick={() => setPhase('title')}>
          &larr; 타이틀
        </button>

        <div className="ep-header">
          <div className="ep-eyebrow">사건 기록부</div>
          <h2 className="ep-title">의뢰</h2>
          <p className="ep-desc">
            사무소에 쌓인 의뢰들. 하나씩 응하거나, 응하지 않는 것도 당신의 선택이다.
          </p>
        </div>

        <div className="ep-list">
          {EPISODE_ORDER.map((id) => {
            const ep = EPISODES[id];
            const done = completedEpisodes.includes(id);
            const unlocked = !ep.requires || ep.requires.every((r) => completedEpisodes.includes(r));
            const status = done ? 'done' : unlocked ? 'open' : 'locked';

            return (
              <button
                key={id}
                className={`ep-card ${status}`}
                disabled={!unlocked}
                onClick={() => unlocked && startEpisode(id)}
              >
                <div className="ep-card-num">{ep.number}</div>
                <div className="ep-card-title">{ep.title}</div>
                <div className="ep-card-logline">{ep.logline}</div>
                <div className="ep-card-status">
                  {status === 'done' && <span className="status-done">완료 — 다시 열람</span>}
                  {status === 'open' && <span className="status-open">열람 가능</span>}
                  {status === 'locked' && <span className="status-locked">이전 의뢰를 먼저 마무리하세요</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
