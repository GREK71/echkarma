import { useEffect, useState } from 'react';
import { useGameStore, EPISODES } from '../store/gameStore';
import './EpisodeEnd.css';

export function EpisodeEnd() {
  const currentEpisode = useGameStore((s) => s.currentEpisode);
  const responseText = useGameStore((s) => s.responseText);
  const backToEpisodeSelect = useGameStore((s) => s.backToEpisodeSelect);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  const ep = currentEpisode ? EPISODES[currentEpisode] : null;

  return (
    <div className={`ep-end ${visible ? 'show' : ''}`}>
      <div className="ep-end-wrap">
        <div className="ep-end-meta">{ep?.number ?? ''} 종료</div>
        <h2 className="ep-end-title">{ep?.title ?? ''}</h2>

        {responseText && (
          <div className="ep-end-response">
            <p>{responseText}</p>
          </div>
        )}

        <div className="ep-end-divider" />

        <button className="ep-end-btn" onClick={backToEpisodeSelect}>
          {currentEpisode === 'final' ? '결말을 확인한다' : '사무소로 돌아간다'}
        </button>
      </div>
    </div>
  );
}
