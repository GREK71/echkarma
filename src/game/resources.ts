export interface Resources {
  hp: number;
  food: number;
  trust: number;
}

export const RESOURCE_CONFIG = {
  hp:    { min: 0, max: 8, initial: 5, label: '체력',   icon: '\u2764' },
  food:  { min: 0, max: 8, initial: 5, label: '식량',   icon: '\ud83c\udf5e' },
  trust: { min: 0, max: 6, initial: 3, label: '신뢰도', icon: '\ud83e\udd1d' },
} as const;

export type ResourceKey = keyof Resources;

export function createInitialResources(): Resources {
  return {
    hp: RESOURCE_CONFIG.hp.initial,
    food: RESOURCE_CONFIG.food.initial,
    trust: RESOURCE_CONFIG.trust.initial,
  };
}

export function clampResource(key: ResourceKey, value: number): number {
  const cfg = RESOURCE_CONFIG[key];
  return Math.max(cfg.min, Math.min(cfg.max, value));
}

export function applyResourceChange(
  resources: Resources,
  changes: Partial<Resources>
): Resources {
  const result = { ...resources };
  for (const [key, delta] of Object.entries(changes) as [ResourceKey, number][]) {
    result[key] = clampResource(key, result[key] + delta);
  }
  return result;
}

// 식량 자동 소모 턴: 3, 6, 9, 12, 15, 18
export function isFoodConsumptionTurn(turn: number): boolean {
  return turn >= 3 && turn % 3 === 0 && turn <= 18;
}

export function consumeFood(resources: Resources): Resources {
  const result = { ...resources };
  if (result.food > 0) {
    result.food -= 1;
  } else {
    // 식량 없으면 HP 감소
    result.hp = clampResource('hp', result.hp - 1);
  }
  return result;
}
