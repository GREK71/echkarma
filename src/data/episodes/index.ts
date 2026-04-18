import type { Scene } from './types';
import { ep1Scenes } from './ep1';
import { ep2Scenes } from './ep2';
import { ep3Scenes } from './ep3';
import { finalScenes } from './final';

export type EpisodeId = 'ep1' | 'ep2' | 'ep3' | 'final';

export interface EpisodeMeta {
  id: EpisodeId;
  number: string;
  title: string;
  logline: string;
  entryScene: string;
  requires?: EpisodeId[]; // 완료되어야 할 이전 에피소드
}

export const EPISODES: Record<EpisodeId, EpisodeMeta> = {
  ep1: {
    id: 'ep1',
    number: 'Episode 01',
    title: '사라진 남편',
    logline: '아내가 남편 실종 신고를 한다. 남편은 스스로 사라졌다.',
    entryScene: 'ep1_open',
  },
  ep2: {
    id: 'ep2',
    number: 'Episode 02',
    title: '열다섯 살',
    logline: '가출한 아이를 찾았다. 집에 돌려보내면 안 되는 이유가 있다.',
    entryScene: 'ep2_open',
    requires: ['ep1'],
  },
  ep3: {
    id: 'ep3',
    number: 'Episode 03',
    title: '유일한 목격자',
    logline: '무고한 사람을 구할 수 있다. 그러나 대가가 있다.',
    entryScene: 'ep3_open',
    requires: ['ep2'],
  },
  final: {
    id: 'final',
    number: 'Final Episode',
    title: '10년 전의 그 사람',
    logline: '가해자가 나타난다. 이제 주인공 자신의 선택이다.',
    entryScene: 'final_open',
    requires: ['ep3'],
  },
};

export const EPISODE_ORDER: EpisodeId[] = ['ep1', 'ep2', 'ep3', 'final'];

export const ALL_SCENES: Scene[] = [
  ...ep1Scenes,
  ...ep2Scenes,
  ...ep3Scenes,
  ...finalScenes,
];

export function findScene(id: string): Scene | undefined {
  return ALL_SCENES.find((s) => s.id === id);
}

export function getEpisodeOf(sceneId: string): EpisodeId | undefined {
  const scene = findScene(sceneId);
  return scene?.episodeId;
}
