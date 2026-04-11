import { useGameStore } from '../store/gameStore';
import './NPCStatus.css';

export function NPCStatus() {
  const npcs = useGameStore((s) => s.npcs);

  const visibleNpcs = Object.values(npcs).filter((n) => n.revealed);

  return (
    <div className="npc-status">
      {visibleNpcs.map((npc) => (
        <div key={npc.id} className={`npc-chip ${npc.alive ? 'alive' : 'dead'}`}>
          <span className="npc-dot" />
          <span className="npc-name">{npc.name}</span>
        </div>
      ))}
    </div>
  );
}
