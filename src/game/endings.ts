import type { ProtagonistState } from './protagonist';

export type EndingId = 'atonement' | 'accomplice' | 'collapse' | 'silence';

export interface Ending {
  id: EndingId;
  title: string;
  subtitle: string;
  description: string;
  tone: 'dark' | 'red' | 'muted' | 'green';
}

export const ENDINGS: Record<EndingId, Ending> = {
  atonement: {
    id: 'atonement',
    title: '속죄',
    subtitle: 'Atonement',
    description: '가해자를 신고한다. 10년이 늦었다. 세상이 크게 달라지지 않는다. 그래도 그날 밤, 처음으로 잠이 온다.',
    tone: 'dark',
  },
  accomplice: {
    id: 'accomplice',
    title: '공범',
    subtitle: 'Accomplice',
    description: '가해자를 알면서도 보내준다. 이유가 있었다. 하지만 이제 당신도 진짜 공범이 됐다. 10년 전과 같아졌다.',
    tone: 'red',
  },
  collapse: {
    id: 'collapse',
    title: '붕괴',
    subtitle: 'Collapse',
    description: '진실도 침묵도 끝내 선택하지 못한다. 당신은 책상에서 일어나지 못한다. 사람이 모든 걸 감당할 수는 없다.',
    tone: 'muted',
  },
  silence: {
    id: 'silence',
    title: '묵인',
    subtitle: 'Silence',
    description: '아무것도 바뀌지 않는다. 가해자도 살고 당신도 산다. 세상은 계속 돌아간다. 그게 전부다.',
    tone: 'green',
  },
};

export interface EndingContext {
  protagonist: ProtagonistState;
  finalOutcome?: string; // 'report' | 'confront' | 'anonymous' | 'nothing'
}

export function determineEnding({ protagonist, finalOutcome }: EndingContext): EndingId {
  const { honestyCount, silenceCount, mentalState } = protagonist;

  // 붕괴: 극단적으로 엇갈린 선택이 누적 + 정신 붕괴
  if (mentalState === 'breaking') return 'collapse';

  // 속죄: 진실 3회 이상 + 최종 신고/익명 제보
  if (honestyCount >= 3 && (finalOutcome === 'report' || finalOutcome === 'anonymous')) {
    return 'atonement';
  }

  // 묵인: 침묵 3회 이상 + 최종 아무것도 안 함
  if (silenceCount >= 3 && finalOutcome === 'nothing') return 'silence';

  // 공범: 침묵 우세 + 최종이 대면/은폐
  if (silenceCount >= 2 && (finalOutcome === 'confront' || finalOutcome === 'nothing')) {
    return 'accomplice';
  }

  // 기본: 최종 선택 기반
  switch (finalOutcome) {
    case 'report':
    case 'anonymous':
      return 'atonement';
    case 'confront':
      return 'accomplice';
    case 'nothing':
      return 'silence';
    default:
      return 'collapse';
  }
}

export const TOTAL_ENDINGS = 4;
