import type { NPCId } from './npc';

export type EndingId = 'wasteland_king' | 'karma_echo_ends' | 'survivor' | 'reconciliation' | 'atonement' | 'fallen';

export interface Ending {
  id: EndingId;
  title: string;
  subtitle: string;
  description: string;
  stars: number;
}

export const ENDINGS: Record<EndingId, Ending> = {
  wasteland_king: {
    id: 'wasteland_king',
    title: '폐허의 왕',
    subtitle: 'Wasteland King',
    description: '당신은 칸을 쓰러뜨리고 새로운 약탈자의 수장이 되었다. 힘으로 얻은 왕좌 위에서, 당신은 자신이 파괴하려 했던 것과 같은 존재가 되었음을 깨닫는다.',
    stars: 1,
  },
  karma_echo_ends: {
    id: 'karma_echo_ends',
    title: '메아리의 끝',
    subtitle: "Karma's Echo Ends",
    description: '쌓인 업보의 무게에 짓눌려, 당신은 아무것도 선택할 수 없게 되었다. 싸울 수도, 항복할 수도 없는 채로 폐허 속에 남겨진다.',
    stars: 2,
  },
  survivor: {
    id: 'survivor',
    title: '생존자',
    subtitle: 'Survivor',
    description: '정착지는 살아남았지만, 당신이 치른 대가는 모두가 알고 있다. 살아있되 온전하지 못한 승리. 사람들의 눈빛 속에서 경계를 읽는다.',
    stars: 3,
  },
  reconciliation: {
    id: 'reconciliation',
    title: '화해',
    subtitle: 'Reconciliation',
    description: '칸과의 대화는 길고 고통스러웠지만, 결국 그는 무기를 내려놓았다. 같은 전쟁이 만든 두 사람의 공존이 시작된다.',
    stars: 4,
  },
  atonement: {
    id: 'atonement',
    title: '속죄',
    subtitle: 'Atonement',
    description: '당신은 칸을 놓아주었다. 이설이 당신 곁에 서서 고개를 끄덕인다. 업보의 무게가 서서히 가벼워지는 것을 느끼며, 새로운 아침을 맞는다.',
    stars: 5,
  },
  fallen: {
    id: 'fallen',
    title: '쓰러진 자',
    subtitle: 'The Fallen',
    description: '끝내 몸이 버텨주지 못했다. 굶주림과 상처가 쌓여 당신은 폐허 한가운데 쓰러진다. 의식이 흐려지며, 메아리만이 남는다.',
    stars: 0,
  },
};

export function determineEnding(
  karma: number,
  npcs: Record<NPCId, { alive: boolean }>,
  branchC: 'kill_success' | 'kill_fail' | 'dialogue_success' | 'dialogue_fail' | 'spare'
): EndingId {
  // 속죄: 카르마 ≤4, 이설 생존, 칸을 살려줌
  if (karma <= 4 && npcs.issel.alive && branchC === 'spare') {
    return 'atonement';
  }
  // 화해: 카르마 ≤8, 대화 성공
  if (karma <= 8 && branchC === 'dialogue_success') {
    return 'reconciliation';
  }
  // 폐허의 왕: 카르마 ≥9, 살해 성공
  if (karma >= 9 && branchC === 'kill_success') {
    return 'wasteland_king';
  }
  // 메아리의 끝: 카르마 ≥9, 살해 실패 또는 항복
  if (karma >= 9) {
    return 'karma_echo_ends';
  }
  // 생존자: 카르마 4-8, 그 외
  return 'survivor';
}
