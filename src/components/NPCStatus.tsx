import { useGameStore } from '../store/gameStore';
import { NPC_AFFINITY_MAX } from '../game/npc';
import './NPCStatus.css';

export function NPCStatus() {
  const npcs = useGameStore((s) => s.npcs);
  const visibleNpcs = Object.values(npcs).filter((n) => n.revealed);

  return (
    <div className="npc-status">
      {visibleNpcs.map((npc) => {
        const pct = (npc.affinity / NPC_AFFINITY_MAX) * 100;
        return (
          <div key={npc.id} className={`npc-chip ${npc.alive ? 'alive' : 'dead'}`}>
            <span className="npc-dot" />
            <span className="npc-name">{npc.name}</span>
            {npc.alive && (
              <div className="npc-affinity-bar">
                <div className="npc-affinity-fill" style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
