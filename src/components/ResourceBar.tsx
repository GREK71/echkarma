import { useGameStore } from '../store/gameStore';
import { RESOURCE_CONFIG, type ResourceKey } from '../game/resources';
import './ResourceBar.css';

const RESOURCE_ORDER: ResourceKey[] = ['hp', 'food'];

export function ResourceBar() {
  const resources = useGameStore((s) => s.resources);

  return (
    <div className="resource-bar">
      {RESOURCE_ORDER.map((key) => {
        const cfg = RESOURCE_CONFIG[key];
        const value = resources[key];
        const pct = (value / cfg.max) * 100;
        const isLow = key === 'hp' ? value <= 2 : value <= 1;

        return (
          <div key={key} className={`resource-item ${isLow ? 'resource-low' : ''}`}>
            <span className="resource-icon">{cfg.icon}</span>
            <div className="resource-info">
              <span className="resource-label">{cfg.label}</span>
              <div className="resource-bar-bg">
                <div
                  className={`resource-bar-fill resource-${key}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span className="resource-value">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
