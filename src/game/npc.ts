export type NPCId = 'elder' | 'issel' | 'minju' | 'luka';

export interface NPCState {
  id: NPCId;
  name: string;
  alive: boolean;
  revealed: boolean;
  affinity: number;
}

export const NPC_AFFINITY_MAX = 10;
export const NPC_AFFINITY_MIN = 0;

export function clampAffinity(value: number): number {
  return Math.max(NPC_AFFINITY_MIN, Math.min(NPC_AFFINITY_MAX, value));
}

export function createInitialNPCs(): Record<NPCId, NPCState> {
  return {
    elder: { id: 'elder', name: '정 노인', alive: true, revealed: true, affinity: 2 },
    issel: { id: 'issel', name: '이설', alive: true, revealed: true, affinity: 3 },
    minju: { id: 'minju', name: '민준', alive: true, revealed: true, affinity: 4 },
    luka: { id: 'luka', name: '루카', alive: true, revealed: false, affinity: 0 },
  };
}
