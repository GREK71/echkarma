/**
 * 묵인 주인공 상태 모델.
 * 업보는 수치로 쌓이지 않고, 선택의 누적 카운트와 멘탈 상태로 표현된다.
 */
export interface ProtagonistState {
  honestyCount: number;       // 진실을 밝힌 횟수
  silenceCount: number;       // 침묵/은폐 선택 횟수
  interventionCount: number;  // 개입 선택 횟수
  mentalState: 'stable' | 'strained' | 'breaking';
}

export function createInitialProtagonist(): ProtagonistState {
  return {
    honestyCount: 0,
    silenceCount: 0,
    interventionCount: 0,
    mentalState: 'stable',
  };
}

export type MentalShift = 'stable' | 'strained' | 'breaking';

export function computeMentalState(p: ProtagonistState): MentalShift {
  const total = p.honestyCount + p.silenceCount + p.interventionCount;
  if (total === 0) return 'stable';
  const extremeGap = Math.abs(p.honestyCount - p.silenceCount);
  // 극단적으로 엇갈린 선택이 많으면 붕괴
  if (total >= 6 && extremeGap <= 1 && p.silenceCount >= 2) return 'breaking';
  if (total >= 4 && extremeGap <= 1) return 'strained';
  return 'stable';
}
