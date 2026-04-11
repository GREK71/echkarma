export type NPCId = 'elder' | 'issel' | 'minju' | 'luka';

export interface NPCState {
  id: NPCId;
  name: string;
  alive: boolean;
  revealed: boolean;
}

export function createInitialNPCs(): Record<NPCId, NPCState> {
  return {
    elder: { id: 'elder', name: '정 노인', alive: true, revealed: true },
    issel: { id: 'issel', name: '이설', alive: true, revealed: true },
    minju: { id: 'minju', name: '민준', alive: true, revealed: true },
    luka: { id: 'luka', name: '루카', alive: true, revealed: false },
  };
}
