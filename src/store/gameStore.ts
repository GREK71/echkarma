import { create } from 'zustand';
import { clampKarma } from '../game/karma';
import { createInitialNPCs, clampAffinity, type NPCId, type NPCState } from '../game/npc';
import { createInitialResources, applyResourceChange, isFoodConsumptionTurn, consumeFood, clampResource, type Resources } from '../game/resources';
import { CLUES } from '../game/clues';
import { scenes, type Choice, type ChoiceOutcome, type SceneConditionState } from '../data/scenes';
import { determineEnding, type EndingId } from '../game/endings';
import { rollRandomEvent, type RandomEvent, type RandomEventChoice } from '../data/randomEvents';

export type GamePhase = 'title' | 'prologue' | 'playing' | 'ending' | 'gallery';

export interface SystemMsg {
  type: 'affinity' | 'clue' | 'resource' | 'warning' | 'memory';
  text: string;
}

interface GameState {
  phase: GamePhase;
  turn: number;
  karma: number;
  resources: Resources;
  npcs: Record<NPCId, NPCState>;
  currentSceneId: string;
  branchResults: Record<string, string>;
  endingId: EndingId | null;
  unlockedEndings: EndingId[];
  textHistory: string[];
  responseText: string | null;
  activeRandomEvent: RandomEvent | null;
  occurredEvents: Record<string, number>;
  systemMessages: SystemMsg[];
  discoveredClues: string[];

  startGame: () => void;
  startPrologue: () => void;
  setPhase: (phase: GamePhase) => void;
  makeChoice: (choice: Choice) => void;
  makeRandomEventChoice: (choice: RandomEventChoice) => void;
  dismissResponse: () => void;
  goToGallery: () => void;
  shiftMessage: () => void;
}

function getStoredEndings(): EndingId[] {
  try {
    const stored = localStorage.getItem('echo-karma-endings');
    return stored ? (JSON.parse(stored) as EndingId[]) : [];
  } catch {
    return [];
  }
}

function saveEndings(endings: EndingId[]) {
  localStorage.setItem('echo-karma-endings', JSON.stringify(endings));
}

function buildConditionState(
  karma: number,
  npcs: Record<NPCId, NPCState>,
  branchResults: Record<string, string>,
  resources: Resources
): SceneConditionState {
  return { karma, npcs, branchResults, resources };
}

function findNextScene(
  currentTurn: number,
  nextSceneId: string | undefined,
  npcs: Record<NPCId, NPCState>,
  karma: number,
  branchResults: Record<string, string>,
  resources: Resources
): string | null {
  if (nextSceneId) return nextSceneId;
  const nextTurn = currentTurn + 1;
  const candidates = scenes.filter((s) => s.turn === nextTurn);
  const state = buildConditionState(karma, npcs, branchResults, resources);
  for (const scene of candidates) {
    if (scene.condition && scene.condition(state)) return scene.id;
  }
  const noCondition = candidates.filter((s) => !s.condition);
  if (noCondition.length > 0) return noCondition[0].id;
  return candidates[0]?.id ?? null;
}

function applyAffinityChanges(
  npcs: Record<NPCId, NPCState>,
  changes: Partial<Record<NPCId, number>>,
  messages: SystemMsg[]
): Record<NPCId, NPCState> {
  const result = { ...npcs };
  for (const [npcId, delta] of Object.entries(changes) as [NPCId, number][]) {
    if (!result[npcId]) continue;
    const old = result[npcId].affinity;
    const npc = { ...result[npcId] };
    npc.affinity = clampAffinity(npc.affinity + delta);
    result[npcId] = npc;
    if (npc.affinity !== old) {
      const arrow = delta > 0 ? '\u25B2' : '\u25BC';
      messages.push({
        type: 'affinity',
        text: `${npc.name}의 호감도가 ${delta > 0 ? '상승' : '하락'}했다 ${arrow}`,
      });
    }
  }
  return result;
}

/**
 * 확률 선택지 — successChance가 있으면 성공/실패 판정하여 효과를 merge.
 * 반환: { merged, wasSuccess } — merged는 Choice의 필드를 override 형태로 반영한 값
 */
function resolveOutcome(choice: Choice): { merged: Choice; wasSuccess: boolean | null } {
  if (choice.successChance === undefined) {
    return { merged: choice, wasSuccess: null };
  }
  const success = Math.random() < choice.successChance;
  const outcome: ChoiceOutcome | undefined = success ? choice.onSuccess : choice.onFailure;
  if (!outcome) return { merged: choice, wasSuccess: success };

  // outcome 필드로 override
  const merged: Choice = {
    ...choice,
    karmaChange: outcome.karmaChange ?? choice.karmaChange,
    resourceCost: outcome.resourceCost ?? choice.resourceCost,
    affinityChange: outcome.affinityChange ?? choice.affinityChange,
    npcEffect: outcome.npcEffect ?? choice.npcEffect,
    grantClue: outcome.grantClue ?? choice.grantClue,
    responseText: outcome.responseText ?? choice.responseText,
    branchResult: outcome.branchResult ?? choice.branchResult,
  };
  return { merged, wasSuccess: success };
}

const TOTAL_ENDINGS = 6;

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'title',
  turn: 1,
  karma: 5,
  resources: createInitialResources(),
  npcs: createInitialNPCs(),
  currentSceneId: 'act1_turn1',
  branchResults: {},
  endingId: null,
  unlockedEndings: getStoredEndings(),
  textHistory: [],
  responseText: null,
  activeRandomEvent: null,
  occurredEvents: {},
  systemMessages: [],
  discoveredClues: [],

  startGame: () =>
    set({
      phase: 'playing',
      turn: 1,
      karma: 5,
      resources: createInitialResources(),
      npcs: createInitialNPCs(),
      currentSceneId: 'act1_turn1',
      branchResults: {},
      endingId: null,
      textHistory: [],
      responseText: null,
      activeRandomEvent: null,
      occurredEvents: {},
      systemMessages: [],
      discoveredClues: [],
    }),

  startPrologue: () =>
    set({
      phase: 'prologue',
      turn: 1,
      karma: 5,
      resources: createInitialResources(),
      npcs: createInitialNPCs(),
      currentSceneId: 'act1_turn1',
      branchResults: {},
      endingId: null,
      textHistory: [],
      responseText: null,
      activeRandomEvent: null,
      occurredEvents: {},
      systemMessages: [],
      discoveredClues: [],
    }),

  setPhase: (phase) => set({ phase }),
  shiftMessage: () => set((s) => ({ systemMessages: s.systemMessages.slice(1) })),

  dismissResponse: () => {
    const state = get();
    set({ responseText: null });
    const currentScene = scenes.find((s) => s.id === state.currentSceneId);
    const act = currentScene?.act ?? 1;
    const evt = rollRandomEvent(act, state.occurredEvents, state.turn, {
      karma: state.karma,
      hp: state.resources.hp,
    });
    if (evt) {
      set({ activeRandomEvent: evt });
    }
  },

  makeRandomEventChoice: (choice: RandomEventChoice) => {
    const state = get();
    const msgs: SystemMsg[] = [];
    let newKarma = clampKarma(state.karma + choice.karmaChange);
    let newResources = { ...state.resources };
    let newNpcs = { ...state.npcs };

    if (choice.resourceCost) {
      newResources = applyResourceChange(newResources, choice.resourceCost);
    }
    if (choice.affinityChange) {
      newNpcs = applyAffinityChanges(newNpcs, choice.affinityChange, msgs);
    }

    const newOccurred = { ...state.occurredEvents };
    if (state.activeRandomEvent) {
      const evtId = state.activeRandomEvent.id;
      newOccurred[evtId] = (newOccurred[evtId] ?? 0) + 1;
    }

    if (newResources.hp <= 0) {
      const fallenId: EndingId = 'fallen';
      const updatedEndings: EndingId[] = state.unlockedEndings.includes(fallenId)
        ? state.unlockedEndings
        : [...state.unlockedEndings, fallenId];
      saveEndings(updatedEndings);
      set({
        karma: newKarma,
        resources: newResources,
        npcs: newNpcs,
        endingId: 'fallen',
        unlockedEndings: updatedEndings,
        phase: 'ending',
        activeRandomEvent: null,
        occurredEvents: newOccurred,
      });
      return;
    }

    set({
      karma: newKarma,
      resources: newResources,
      npcs: newNpcs,
      activeRandomEvent: null,
      occurredEvents: newOccurred,
      responseText: choice.responseText,
      systemMessages: [...state.systemMessages, ...msgs],
    });
  },

  makeChoice: (originalChoice) => {
    const state = get();
    const msgs: SystemMsg[] = [];

    // 확률 판정 — successChance 있으면 성공/실패 효과로 병합
    const { merged: choice, wasSuccess } = resolveOutcome(originalChoice);
    if (wasSuccess === true) {
      msgs.push({ type: 'resource', text: '시도는 성공했다' });
    } else if (wasSuccess === false) {
      msgs.push({ type: 'warning', text: '시도는 실패했다' });
    }

    let newKarma = clampKarma(state.karma + choice.karmaChange);
    let newResources = { ...state.resources };
    let newNpcs = { ...state.npcs };
    const newBranches = { ...state.branchResults };
    const newClues = [...state.discoveredClues];
    const currentScene = scenes.find((s) => s.id === state.currentSceneId);
    const currentTurn = currentScene?.turn ?? state.turn;

    if (choice.resourceCost) {
      newResources = applyResourceChange(newResources, choice.resourceCost);
    }
    if (choice.affinityChange) {
      newNpcs = applyAffinityChanges(newNpcs, choice.affinityChange, msgs);
    }
    if (choice.npcEffect) {
      const npc = newNpcs[choice.npcEffect.id];
      newNpcs[choice.npcEffect.id] = { ...npc, alive: choice.npcEffect.alive };
    }
    if (choice.revealNpc) {
      const npc = newNpcs[choice.revealNpc];
      newNpcs[choice.revealNpc] = { ...npc, revealed: true };
    }
    if (choice.grantClue && !newClues.includes(choice.grantClue)) {
      newClues.push(choice.grantClue);
      const clue = CLUES[choice.grantClue];
      if (clue) {
        msgs.push({ type: 'clue', text: `'${clue.name}'을(를) 발견했다` });
      }
    }
    if (choice.branchResult) {
      newBranches[currentScene?.id ?? ''] = choice.branchResult;
    }

    // Branch C karma restrictions
    if (currentScene?.id === 'branch_c') {
      if (choice.branchResult === 'c_dialogue' && state.karma > 8) {
        newBranches['branch_c'] = 'c_kill';
      }
      if (choice.branchResult === 'c_spare' && state.karma > 4) {
        newBranches['branch_c'] = 'c_dialogue';
        if (state.karma > 8) newBranches['branch_c'] = 'c_kill';
      }
    }

    // Food system
    const nextTurn = currentTurn + 1;
    if (newResources.food <= 0) {
      newResources = { ...newResources, hp: clampResource('hp', newResources.hp - 1) };
      msgs.push({ type: 'warning', text: '식량이 없다. 굶주림이 체력을 갉아먹는다.' });
    } else if (isFoodConsumptionTurn(nextTurn)) {
      newResources = consumeFood(newResources);
      if (newResources.food <= 0) {
        msgs.push({ type: 'warning', text: '마지막 식량이 떨어졌다!' });
      } else {
        msgs.push({ type: 'resource', text: '정착지의 식량이 소모되었다' });
      }
    }

    if (currentScene?.isFlashback) {
      msgs.push({ type: 'memory', text: '기억의 파편이 되살아난다...' });
    }

    // HP death
    if (newResources.hp <= 0) {
      const fallenId: EndingId = 'fallen';
      const updatedEndings: EndingId[] = state.unlockedEndings.includes(fallenId)
        ? state.unlockedEndings
        : [...state.unlockedEndings, fallenId];
      saveEndings(updatedEndings);
      set({
        karma: newKarma, resources: newResources, npcs: newNpcs,
        branchResults: newBranches, discoveredClues: newClues,
        endingId: 'fallen', unlockedEndings: updatedEndings,
        phase: 'ending', turn: currentTurn, responseText: null,
        systemMessages: [...state.systemMessages, ...msgs],
      });
      return;
    }

    // Game end
    if (nextTurn > 20 || currentScene?.id === 'act3_turn20') {
      const branchCResult = newBranches['branch_c'] ?? 'c_kill';
      let endingBranchC: 'kill_success' | 'kill_fail' | 'dialogue_success' | 'dialogue_fail' | 'spare';
      switch (branchCResult) {
        case 'c_kill': endingBranchC = 'kill_success'; break;
        case 'c_dialogue': endingBranchC = 'dialogue_success'; break;
        case 'c_spare': endingBranchC = 'spare'; break;
        case 'c_surrender': endingBranchC = 'kill_fail'; break;
        default: endingBranchC = 'kill_success';
      }
      const ending = determineEnding(newKarma, newNpcs, endingBranchC);
      const updatedEndings = state.unlockedEndings.includes(ending)
        ? state.unlockedEndings
        : [...state.unlockedEndings, ending];
      saveEndings(updatedEndings);
      set({
        karma: newKarma, resources: newResources, npcs: newNpcs,
        branchResults: newBranches, discoveredClues: newClues,
        endingId: ending, unlockedEndings: updatedEndings,
        phase: 'ending', turn: currentTurn, responseText: null,
        systemMessages: [...state.systemMessages, ...msgs],
      });
      return;
    }

    const nextSceneId = findNextScene(currentTurn, choice.nextScene, newNpcs, newKarma, newBranches, newResources);
    const newHistory = [...state.textHistory];
    if (currentScene) {
      newHistory.push(currentScene.narration);
      newHistory.push(`> ${choice.text}`);
    }

    if (choice.responseText) {
      set({
        karma: newKarma, resources: newResources, npcs: newNpcs,
        branchResults: newBranches, discoveredClues: newClues,
        turn: nextTurn, currentSceneId: nextSceneId ?? state.currentSceneId,
        textHistory: newHistory, responseText: choice.responseText,
        activeRandomEvent: null,
        systemMessages: [...state.systemMessages, ...msgs],
      });
    } else {
      const act = currentScene?.act ?? 1;
      const evt = rollRandomEvent(act, state.occurredEvents, nextTurn, {
        karma: newKarma,
        hp: newResources.hp,
      });
      set({
        karma: newKarma, resources: newResources, npcs: newNpcs,
        branchResults: newBranches, discoveredClues: newClues,
        turn: nextTurn, currentSceneId: nextSceneId ?? state.currentSceneId,
        textHistory: newHistory, responseText: null,
        activeRandomEvent: evt,
        systemMessages: [...state.systemMessages, ...msgs],
      });
    }
  },

  goToGallery: () => set({ phase: 'gallery' }),
}));

export { TOTAL_ENDINGS };
