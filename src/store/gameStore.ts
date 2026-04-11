import { create } from 'zustand';
import { clampKarma } from '../game/karma';
import { createInitialNPCs, type NPCId, type NPCState } from '../game/npc';
import { createInitialResources, applyResourceChange, isFoodConsumptionTurn, consumeFood, clampResource, type Resources } from '../game/resources';
import { scenes, type Choice, type SceneConditionState } from '../data/scenes';
import { determineEnding, type EndingId } from '../game/endings';
import { rollRandomEvent, type RandomEvent, type RandomEventChoice } from '../data/randomEvents';

export type GamePhase = 'title' | 'playing' | 'ending' | 'gallery';

export interface ResourceEvent {
  type: 'cost' | 'food_consumed' | 'starving';
  message: string;
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
  lastResourceEvent: ResourceEvent | null;
  // Response text shown after a choice, before next scene
  responseText: string | null;
  // Random event state
  activeRandomEvent: RandomEvent | null;
  occurredEvents: Record<string, number>;

  startGame: () => void;
  setPhase: (phase: GamePhase) => void;
  makeChoice: (choice: Choice) => void;
  makeRandomEventChoice: (choice: RandomEventChoice) => void;
  dismissResponse: () => void;
  goToGallery: () => void;
  clearResourceEvent: () => void;
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

  // First try scenes with matching conditions
  for (const scene of candidates) {
    if (scene.condition && scene.condition(state)) {
      return scene.id;
    }
  }
  // Then try scenes without conditions
  const noCondition = candidates.filter((s) => !s.condition);
  if (noCondition.length > 0) return noCondition[0].id;
  // Fallback
  return candidates[0]?.id ?? null;
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
  lastResourceEvent: null,
  responseText: null,
  activeRandomEvent: null,
  occurredEvents: {},

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
      lastResourceEvent: null,
      responseText: null,
      activeRandomEvent: null,
      occurredEvents: {},
    }),

  setPhase: (phase) => set({ phase }),
  clearResourceEvent: () => set({ lastResourceEvent: null }),

  dismissResponse: () => {
    const state = get();
    // After dismissing response text, proceed to next scene or random event
    set({ responseText: null });

    // Check for random event
    const currentScene = scenes.find((s) => s.id === state.currentSceneId);
    const act = currentScene?.act ?? 1;
    const evt = rollRandomEvent(act, state.occurredEvents, state.turn);
    if (evt) {
      set({ activeRandomEvent: evt });
    }
  },

  makeRandomEventChoice: (choice: RandomEventChoice) => {
    const state = get();
    let newKarma = clampKarma(state.karma + choice.karmaChange);
    let newResources = { ...state.resources };

    if (choice.resourceCost) {
      newResources = applyResourceChange(newResources, choice.resourceCost);
    }

    // Track event occurrence
    const newOccurred = { ...state.occurredEvents };
    if (state.activeRandomEvent) {
      const evtId = state.activeRandomEvent.id;
      newOccurred[evtId] = (newOccurred[evtId] ?? 0) + 1;
    }

    // Check HP death
    if (newResources.hp <= 0) {
      const fallenId: EndingId = 'fallen';
      const updatedEndings: EndingId[] = state.unlockedEndings.includes(fallenId)
        ? state.unlockedEndings
        : [...state.unlockedEndings, fallenId];
      saveEndings(updatedEndings);
      set({
        karma: newKarma,
        resources: newResources,
        endingId: 'fallen',
        unlockedEndings: updatedEndings,
        phase: 'ending',
        activeRandomEvent: null,
        occurredEvents: newOccurred,
        lastResourceEvent: null,
      });
      return;
    }

    set({
      karma: newKarma,
      resources: newResources,
      activeRandomEvent: null,
      occurredEvents: newOccurred,
      responseText: choice.responseText,
    });
  },

  makeChoice: (choice) => {
    const state = get();
    let newKarma = clampKarma(state.karma + choice.karmaChange);
    let newResources = { ...state.resources };
    const newNpcs = { ...state.npcs };
    const newBranches = { ...state.branchResults };
    const currentScene = scenes.find((s) => s.id === state.currentSceneId);
    const currentTurn = currentScene?.turn ?? state.turn;
    let resourceEvent: ResourceEvent | null = null;

    if (choice.resourceCost) {
      newResources = applyResourceChange(newResources, choice.resourceCost);
    }

    if (choice.npcEffect) {
      const npc = newNpcs[choice.npcEffect.id];
      newNpcs[choice.npcEffect.id] = { ...npc, alive: choice.npcEffect.alive };
    }
    if (choice.revealNpc) {
      const npc = newNpcs[choice.revealNpc];
      newNpcs[choice.revealNpc] = { ...npc, revealed: true };
    }

    if (choice.branchResult) {
      newBranches[currentScene?.id ?? ''] = choice.branchResult;
    }

    if (currentScene?.id === 'branch_c') {
      if (choice.branchResult === 'c_dialogue' && state.karma > 8) {
        newBranches['branch_c'] = 'c_kill';
      }
      if (choice.branchResult === 'c_spare' && state.karma > 4) {
        newBranches['branch_c'] = 'c_dialogue';
        if (state.karma > 8) {
          newBranches['branch_c'] = 'c_kill';
        }
      }
    }

    // Food system
    const nextTurn = currentTurn + 1;
    if (newResources.food <= 0) {
      newResources = { ...newResources, hp: clampResource('hp', newResources.hp - 1) };
      resourceEvent = { type: 'starving', message: '식량이 없다. 굶주림이 체력을 갉아먹는다.' };
    } else if (isFoodConsumptionTurn(nextTurn)) {
      newResources = consumeFood(newResources);
      if (newResources.food <= 0) {
        resourceEvent = { type: 'starving', message: '마지막 식량이 떨어졌다. 다음 턴부터 굶주림이 시작된다.' };
      } else {
        resourceEvent = { type: 'food_consumed', message: '정착지의 식량이 소모되었다.' };
      }
    }

    // Check HP death
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
        branchResults: newBranches,
        endingId: 'fallen',
        unlockedEndings: updatedEndings,
        phase: 'ending',
        turn: currentTurn,
        lastResourceEvent: null,
        responseText: null,
      });
      return;
    }

    // Check game end
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
        karma: newKarma,
        resources: newResources,
        npcs: newNpcs,
        branchResults: newBranches,
        endingId: ending,
        unlockedEndings: updatedEndings,
        phase: 'ending',
        turn: currentTurn,
        lastResourceEvent: null,
        responseText: null,
      });
      return;
    }

    const nextSceneId = findNextScene(currentTurn, choice.nextScene, newNpcs, newKarma, newBranches, newResources);
    const newHistory = [...state.textHistory];
    if (currentScene) {
      newHistory.push(currentScene.narration);
      newHistory.push(`> ${choice.text}`);
    }

    // If choice has responseText, show it before proceeding
    if (choice.responseText) {
      set({
        karma: newKarma,
        resources: newResources,
        npcs: newNpcs,
        branchResults: newBranches,
        turn: nextTurn,
        currentSceneId: nextSceneId ?? state.currentSceneId,
        textHistory: newHistory,
        lastResourceEvent: resourceEvent,
        responseText: choice.responseText,
        activeRandomEvent: null,
      });
    } else {
      // No response text — check for random event directly
      const act = currentScene?.act ?? 1;
      const evt = rollRandomEvent(act, state.occurredEvents, nextTurn);

      set({
        karma: newKarma,
        resources: newResources,
        npcs: newNpcs,
        branchResults: newBranches,
        turn: nextTurn,
        currentSceneId: nextSceneId ?? state.currentSceneId,
        textHistory: newHistory,
        lastResourceEvent: resourceEvent,
        responseText: null,
        activeRandomEvent: evt,
      });
    }
  },

  goToGallery: () => set({ phase: 'gallery' }),
}));

export { TOTAL_ENDINGS };
