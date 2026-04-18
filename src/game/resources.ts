export interface Resources {
  hp: number;
  food: number;
}

export const RESOURCE_CONFIG = {
  hp:   { min: 0, max: 8, initial: 5, label: '체력', icon: '\u2764' },
  food: { min: 0, max: 8, initial: 5, label: '식량', icon: '\ud83c\udf5e' },
} as const;

export type ResourceKey = keyof Resources;

export function createInitialResources(): Resources {
  return {
    hp: RESOURCE_CONFIG.hp.initial,
    food: RESOURCE_CONFIG.food.initial,
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
    if (key in RESOURCE_CONFIG) {
      result[key] = clampResource(key, result[key] + delta);
    }
  }
  return result;
}

export function isFoodConsumptionTurn(turn: number): boolean {
  // 4, 8, 12, 16턴에 식량 1 소모 (총 4회)
  return turn >= 4 && turn % 4 === 0 && turn <= 18;
}

export function consumeFood(resources: Resources): Resources {
  const result = { ...resources };
  if (result.food > 0) {
    result.food -= 1;
  } else {
    result.hp = clampResource('hp', result.hp - 1);
  }
  return result;
}
