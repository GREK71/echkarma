import { create } from 'zustand';
import { clampKarma } from '../game/karma';
import { createInitialNPCs, type NPCId, type NPCState } from '../game/npc';
import { scenes, type Choice } from '../data/scenes';
import { determineEnding, type EndingId } from '../game/endings';

export type GamePhase = 'title' | 'playing' | 'ending' | 'gallery';

interface GameState {
  phase: GamePhase;
  turn: number;
  karma: number;
  npcs: Record<NPCId, NPCState>;
  currentSceneId: string;
  branchResults: Record<string, string>;
  endingId: EndingId | null;
  unlockedEndings: EndingId[];
  textHistory: string[];

  // Actions
  startGame: () => void;
  setPhase: (phase: GamePhase) => void;
  makeChoice: (choice: Choice) => void;
  goToGallery: () => void;
}

function getStoredEndings(): EndingId[] {
  try {
    const stored = localStorage.getItem('echo-karma-endings');
    return stored ? JSON.parse(stored) : [];
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
  if (nextSceneId) {
    return nextSceneId;
  }
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
  // If multiple candidates with no condition match, pick first without condition
  const noCondition = candidates.find((s) => !s.condition);
  return noCondition?.id ?? candidates[0]?.id ?? null;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'title',
  turn: 1,
  karma: 5,
  npcs: createInitialNPCs(),
  currentSceneId: 'act1_turn1',
  branchResults: {},
  endingId: null,
  unlockedEndings: getStoredEndings(),
  textHistory: [],

  startGame: () =>
    set({
      phase: 'playing',
      turn: 1,
      karma: 5,
      npcs: createInitialNPCs(),
      currentSceneId: 'act1_turn1',
      branchResults: {},
      endingId: null,
      textHistory: [],
    }),

  setPhase: (phase) => set({ phase }),

  makeChoice: (choice) => {
    const state = get();
    let newKarma = clampKarma(state.karma + choice.karmaChange);
    const newNpcs = { ...state.npcs };
    const newBranches = { ...state.branchResults };
    const currentScene = scenes.find((s) => s.id === state.currentSceneId);
    const currentTurn = currentScene?.turn ?? state.turn;

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
        // Can't dialogue with high karma - force different outcome
        newBranches['branch_c'] = 'c_kill';
      }
      if (choice.branchResult === 'c_spare' && state.karma > 4) {
        newBranches['branch_c'] = 'c_dialogue';
        if (state.karma > 8) {
          newBranches['branch_c'] = 'c_kill';
        }
      }
    }

    // Check if game should end
    const nextTurn = currentTurn + 1;
    if (nextTurn > 20 || currentScene?.id === 'act3_turn20') {
      // Determine ending
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
        npcs: newNpcs,
        branchResults: newBranches,
        endingId: ending,
        unlockedEndings: updatedEndings,
        phase: 'ending',
        turn: currentTurn,
      });
      return;
    }

    // Find next scene
    const nextSceneId = findNextScene(currentTurn, choice.nextScene, newNpcs, newKarma);

    // Add to history
    const newHistory = [...state.textHistory];
    if (currentScene) {
      newHistory.push(currentScene.narration);
      newHistory.push(`> ${choice.text}`);
    }

    set({
      karma: newKarma,
      npcs: newNpcs,
      branchResults: newBranches,
      turn: nextTurn,
      currentSceneId: nextSceneId ?? state.currentSceneId,
      textHistory: newHistory,
    });
  },

  goToGallery: () => set({ phase: 'gallery' }),
}));
