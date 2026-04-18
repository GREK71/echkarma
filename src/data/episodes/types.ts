import type { EpisodeId } from './index';

/** 선택 결과로 메인 상태에 반영될 변화 */
export interface ChoiceImpact {
  honesty?: number;      // 진실을 밝힌 선택 (+1 등)
  silence?: number;      // 침묵/은폐 선택
  intervention?: number; // 개입 선택
  flags?: Record<string, string>; // 임의 플래그 설정 (예: { ep1_outcome: 'told' })
  setFlags?: string[];   // 단순 플래그 (flag 이름만)
}

export interface Choice {
  text: string;
  /** 선택 결과에 의한 시스템 메시지 (선택 사항) */
  responseText?: string;
  impact?: ChoiceImpact;
  /** 다음으로 이동할 씬 id. 없으면 씬의 defaultNext 사용. */
  nextScene?: string;
  /** 이 선택이 에피소드를 종료시키는 경우 true */
  endsEpisode?: boolean;
  /** 조건 기반 잠금. 만족 안 하면 선택지 비활성 */
  requireFlag?: { key: string; equals: string };
  lockReason?: string;
  /** 확률 선택 (유지) */
  successChance?: number;
  onSuccess?: Partial<Choice>;
  onFailure?: Partial<Choice>;
}

export interface SceneState {
  flags: Record<string, string>;
  honestyCount: number;
  silenceCount: number;
  interventionCount: number;
}

export interface Scene {
  id: string;
  /** 여러 씬이 같은 alias를 공유하면, 그 alias로 target 시 condition으로 고름 */
  alias?: string;
  episodeId: EpisodeId;
  narration: string;
  speaker?: string;
  /** true면 화면 상단에 '회상' 표시 */
  isFlashback?: boolean;
  /** true면 분기점 표시 */
  isBranch?: boolean;
  /** 다음 씬(선택지에 nextScene 없을 때 fallback) */
  defaultNext?: string;
  choices: Choice[];
  /** 조건부 분기 — 여러 후보 씬 중 선택 */
  condition?: (state: SceneState) => boolean;
}
