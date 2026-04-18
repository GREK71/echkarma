import { create } from 'zustand';
import { createInitialProtagonist, computeMentalState, type ProtagonistState } from '../game/protagonist';
import { determineEnding, TOTAL_ENDINGS, type EndingId } from '../game/endings';
import { findScene, EPISODES, EPISODE_ORDER, type EpisodeId } from '../data/episodes';
import type { Choice } from '../data/episodes/types';

export type GamePhase = 'title' | 'prologue' | 'episode_select' | 'playing' | 'episode_end' | 'ending' | 'gallery';

export interface SystemMsg {
  type: 'flag' | 'memory' | 'warning' | 'choice';
  text: string;
}

interface GameState {
  phase: GamePhase;
  currentEpisode: EpisodeId | null;
  currentSceneId: string;
  flags: Record<string, string>;
  protagonist: ProtagonistState;
  completedEpisodes: EpisodeId[];
  responseText: string | null;
  systemMessages: SystemMsg[];
  endingId: EndingId | null;
  unlockedEndings: EndingId[];

  startPrologue: () => void;
  finishPrologue: () => void;
  startEpisode: (id: EpisodeId) => void;
  makeChoice: (choice: Choice) => void;
  dismissResponse: () => void;
  backToEpisodeSelect: () => void;
  setPhase: (phase: GamePhase) => void;
  shiftMessage: () => void;
  goToGallery: () => void;
  resetAll: () => void;
}

function getStoredEndings(): EndingId[] {
  try {
    const stored = localStorage.getItem('mukin-endings');
    return stored ? (JSON.parse(stored) as EndingId[]) : [];
  } catch {
    return [];
  }
}

function saveEndings(endings: EndingId[]) {
  localStorage.setItem('mukin-endings', JSON.stringify(endings));
}

function getStoredProgress() {
  try {
    const stored = localStorage.getItem('mukin-progress');
    if (!stored) return null;
    return JSON.parse(stored) as {
      completedEpisodes: EpisodeId[];
      flags: Record<string, string>;
      protagonist: ProtagonistState;
    };
  } catch {
    return null;
  }
}

function saveProgress(
  completedEpisodes: EpisodeId[],
  flags: Record<string, string>,
  protagonist: ProtagonistState
) {
  localStorage.setItem(
    'mukin-progress',
    JSON.stringify({ completedEpisodes, flags, protagonist })
  );
}

export const useGameStore = create<GameState>((set, get) => {
  const saved = getStoredProgress();
  return {
    phase: 'title',
    currentEpisode: null,
    currentSceneId: '',
    flags: saved?.flags ?? {},
    protagonist: saved?.protagonist ?? createInitialProtagonist(),
    completedEpisodes: saved?.completedEpisodes ?? [],
    responseText: null,
    systemMessages: [],
    endingId: null,
    unlockedEndings: getStoredEndings(),

    startPrologue: () =>
      set({
        phase: 'prologue',
        currentEpisode: null,
        currentSceneId: '',
        flags: {},
        protagonist: createInitialProtagonist(),
        completedEpisodes: [],
        responseText: null,
        systemMessages: [],
        endingId: null,
      }),

    finishPrologue: () =>
      set({
        phase: 'episode_select',
      }),

    startEpisode: (id) => {
      const meta = EPISODES[id];
      set({
        phase: 'playing',
        currentEpisode: id,
        currentSceneId: meta.entryScene,
        responseText: null,
        systemMessages: [],
      });
    },

    setPhase: (phase) => set({ phase }),
    shiftMessage: () => set((s) => ({ systemMessages: s.systemMessages.slice(1) })),
    goToGallery: () => set({ phase: 'gallery' }),

    dismissResponse: () => {
      const s = get();
      const scene = findScene(s.currentSceneId);
      if (!scene) return;
      set({ responseText: null });
    },

    backToEpisodeSelect: () => {
      const s = get();
      // 최종 에피소드 완료 시 엔딩 계산
      if (s.completedEpisodes.includes('final')) {
        const finalOutcome = s.flags['final_outcome'];
        const mentalState = computeMentalState(s.protagonist);
        const updatedProtagonist = { ...s.protagonist, mentalState };
        const ending = determineEnding({
          protagonist: updatedProtagonist,
          finalOutcome,
        });
        const updated = s.unlockedEndings.includes(ending)
          ? s.unlockedEndings
          : [...s.unlockedEndings, ending];
        saveEndings(updated);
        set({
          phase: 'ending',
          endingId: ending,
          unlockedEndings: updated,
          protagonist: updatedProtagonist,
        });
        return;
      }
      set({ phase: 'episode_select' });
    },

    resetAll: () => {
      localStorage.removeItem('mukin-progress');
      set({
        phase: 'title',
        currentEpisode: null,
        currentSceneId: '',
        flags: {},
        protagonist: createInitialProtagonist(),
        completedEpisodes: [],
        responseText: null,
        systemMessages: [],
        endingId: null,
      });
    },

    makeChoice: (choice) => {
      const state = get();
      const currentScene = findScene(state.currentSceneId);
      if (!currentScene) return;

      let newFlags = { ...state.flags };
      let newProtagonist = { ...state.protagonist };
      const msgs: SystemMsg[] = [];

      // Resolve probability if defined
      let effectiveChoice: Partial<Choice> = choice;
      if (choice.successChance !== undefined) {
        const success = Math.random() < choice.successChance;
        const outcome = success ? choice.onSuccess : choice.onFailure;
        if (outcome) effectiveChoice = { ...choice, ...outcome };
        msgs.push({
          type: 'flag',
          text: success ? '시도는 이어졌다' : '시도는 어긋났다',
        });
      }

      // Apply impact
      const impact = effectiveChoice.impact ?? choice.impact;
      if (impact) {
        if (impact.honesty) newProtagonist.honestyCount += impact.honesty;
        if (impact.silence) newProtagonist.silenceCount += impact.silence;
        if (impact.intervention) newProtagonist.interventionCount += impact.intervention;
        if (impact.flags) {
          for (const [k, v] of Object.entries(impact.flags)) {
            newFlags[k] = v;
          }
        }
        if (impact.setFlags) {
          for (const f of impact.setFlags) newFlags[f] = 'true';
        }

        // 선택 성향 변화 알림
        if ((impact.silence ?? 0) >= 2) {
          msgs.push({ type: 'memory', text: '침묵의 무게가 쌓인다' });
        } else if ((impact.honesty ?? 0) >= 2) {
          msgs.push({ type: 'memory', text: '진실을 말한 대가가 남는다' });
        }
      }

      // Mental state update
      newProtagonist.mentalState = computeMentalState(newProtagonist);

      // Episode end?
      const endsEpisode = effectiveChoice.endsEpisode ?? choice.endsEpisode;
      if (endsEpisode) {
        const completed = state.currentEpisode
          ? state.completedEpisodes.includes(state.currentEpisode)
            ? state.completedEpisodes
            : [...state.completedEpisodes, state.currentEpisode]
          : state.completedEpisodes;
        saveProgress(completed, newFlags, newProtagonist);
        set({
          flags: newFlags,
          protagonist: newProtagonist,
          completedEpisodes: completed,
          systemMessages: [...state.systemMessages, ...msgs],
          phase: 'episode_end',
          responseText: effectiveChoice.responseText ?? choice.responseText ?? null,
        });
        return;
      }

      // Find next scene
      const nextSceneId = effectiveChoice.nextScene ?? choice.nextScene ?? currentScene.defaultNext;
      if (!nextSceneId) {
        // No next scene - treat as episode end
        set({
          flags: newFlags,
          protagonist: newProtagonist,
          systemMessages: [...state.systemMessages, ...msgs],
        });
        return;
      }

      // Resolve conditional scene (if multiple candidates)
      // 같은 id면 바로 가고, 여러 conditional이 있으면 gameStore 외부에서 처리하지 않음 (data가 관리)
      const responseText = effectiveChoice.responseText ?? choice.responseText;

      set({
        flags: newFlags,
        protagonist: newProtagonist,
        currentSceneId: resolveConditionalScene(nextSceneId, newFlags, newProtagonist),
        responseText: responseText ?? null,
        systemMessages: [...state.systemMessages, ...msgs],
      });
    },
  };
});

function resolveConditionalScene(
  targetId: string,
  flags: Record<string, string>,
  protagonist: ProtagonistState
): string {
  // 1) id 정확히 일치하면 그걸 사용
  const exact = ALL_SCENES.find((s) => s.id === targetId);
  if (exact) return exact.id;

  // 2) alias로 묶인 씬들이 있으면 condition이 true인 것을 고름
  const aliasMatches = ALL_SCENES.filter((s) => s.alias === targetId);
  if (aliasMatches.length === 0) return targetId;

  const state = {
    flags,
    honestyCount: protagonist.honestyCount,
    silenceCount: protagonist.silenceCount,
    interventionCount: protagonist.interventionCount,
  };
  // condition 있는 것 먼저 검사
  for (const c of aliasMatches) {
    if (c.condition && c.condition(state)) return c.id;
  }
  // fallback: condition 없는 씬
  const fallback = aliasMatches.find((s) => !s.condition);
  return fallback?.id ?? aliasMatches[0].id;
}

import { ALL_SCENES } from '../data/episodes';

export { TOTAL_ENDINGS, EPISODES, EPISODE_ORDER };
