import { create } from 'zustand';
import { clampKarma } from '../game/karma';
import { createInitialNPCs, type NPCId, type NPCState } from '../game/npc';
import { createInitialResources, applyResourceChange, isFoodConsumptionTurn, consumeFood, clampResource, type Resources } from '../game/resources';
import { scenes, type Choice } from '../data/scenes';
import { determineEnding, type EndingId } from '../game/endings';

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

  startGame: () => void;
  setPhase: (phase: GamePhase) => void;
  makeChoice: (choice: Choice) => void;
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

function findNextScene(
  currentTurn: number,
  nextSceneId: string | undefined,
  npcs: Record<NPCId, NPCState>,
  karma: number
): string | null {
  if (nextSceneId) return nextSceneId;
  const nextTurn = currentTurn + 1;
  const candidates = scenes.filter((s) => s.turn === nextTurn);
  for (const scene of candidates) {
    if (scene.condition) {
      const state = { karma, npcs };
      if (scene.condition(state)) return scene.id;
    } else if (candidates.length === 1) {
      return scene.id;
    }
  }
  const noCondition = candidates.find((s) => !s.condition);
  return noCondition?.id ?? candidates[0]?.id ?? null;
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
    }),

  setPhase: (phase) => set({ phase }),
  clearResourceEvent: () => set({ lastResourceEvent: null }),

  makeChoice: (choice) => {
    const state = get();
    let newKarma = clampKarma(state.karma + choice.karmaChange);
    let newResources = { ...state.resources };
    const newNpcs = { ...state.npcs };
    const newBranches = { ...state.branchResults };
    const currentScene = scenes.find((s) => s.id === state.currentSceneId);
    const currentTurn = currentScene?.turn ?? state.turn;
    let resourceEvent: ResourceEvent | null = null;

    // Apply resource costs
    if (choice.resourceCost) {
      newResources = applyResourceChange(newResources, choice.resourceCost);
    }

    // Apply NPC effects
    if (choice.npcEffect) {
      const npc = newNpcs[choice.npcEffect.id];
      newNpcs[choice.npcEffect.id] = { ...npc, alive: choice.npcEffect.alive };
    }
    if (choice.revealNpc) {
      const npc = newNpcs[choice.revealNpc];
      newNpcs[choice.revealNpc] = { ...npc, revealed: true };
    }

    // Store branch result
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
        if (state.karma > 8) {
          newBranches['branch_c'] = 'c_kill';
        }
      }
    }

    // Food system
    const nextTurn = currentTurn + 1;
    if (newResources.food <= 0) {
      // 식량 0: 매 턴 HP -1
      newResources = { ...newResources, hp: clampResource('hp', newResources.hp - 1) };
      resourceEvent = { type: 'starving', message: '식량이 없다. 굶주림이 체력을 갉아먹는다.' };
    } else if (isFoodConsumptionTurn(nextTurn)) {
      // 3턴마다 식량 1 소모
      newResources = consumeFood(newResources);
      if (newResources.food <= 0) {
        resourceEvent = { type: 'starving', message: '마지막 식량이 떨어졌다. 다음 턴부터 굶주림이 시작된다.' };
      } else {
        resourceEvent = { type: 'food_consumed', message: '정착지의 식량이 소모되었다.' };
      }
    }

    // Check HP death -> fallen ending
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
      });
      return;
    }

    // Check if game should end
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
      });
      return;
    }

    const nextSceneId = findNextScene(currentTurn, choice.nextScene, newNpcs, newKarma);
    const newHistory = [...state.textHistory];
    if (currentScene) {
      newHistory.push(currentScene.narration);
      newHistory.push(`> ${choice.text}`);
    }

    set({
      karma: newKarma,
      resources: newResources,
      npcs: newNpcs,
      branchResults: newBranches,
      turn: nextTurn,
      currentSceneId: nextSceneId ?? state.currentSceneId,
      textHistory: newHistory,
      lastResourceEvent: resourceEvent,
    });
  },

  goToGallery: () => set({ phase: 'gallery' }),
}));

export { TOTAL_ENDINGS };
