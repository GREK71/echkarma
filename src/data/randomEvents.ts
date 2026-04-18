import type { ResourceKey } from '../game/resources';
import type { NPCId } from '../game/npc';

export interface RandomEventChoice {
  text: string;
  karmaChange: number;
  resourceCost?: Partial<Record<ResourceKey, number>>;
  affinityChange?: Partial<Record<NPCId, number>>;
  requireAffinity?: { npc: NPCId; min: number };
  responseText: string;
}

export interface RandomEvent {
  id: string;
  narration: string;
  speaker?: string;
  choices: RandomEventChoice[];
  /** 발동 확률 (0~1). 기본 0.35 */
  probability?: number;
  /** 발동 가능한 막 */
  acts?: (1 | 2 | 3)[];
  /** 한 게임에서 최대 발동 횟수 */
  maxOccurrences?: number;
  /** NPC 생존 조건 */
  requireNpc?: { id: NPCId; alive: boolean };
  /** 발동을 위한 카르마 범위 */
  requireKarma?: { min?: number; max?: number };
  /** 발동 가능 턴 범위 */
  turnRange?: { min?: number; max?: number };
}

export const randomEvents: RandomEvent[] = [
  {
    id: 'evt_intruder',
    narration: '한밤중, 바리케이드 너머에서 인기척이 느껴진다. 그림자가 빠르게 움직인다. 괴한이다.',
    choices: [
      {
        text: '소리를 질러 사람들을 깨운다',
        karmaChange: 0,
        
        responseText: '정착지가 소란스러워졌지만, 괴한은 어둠 속으로 사라졌다. 사람들이 당신을 고맙게 바라본다.',
      },
      {
        text: '혼자 추적한다',
        karmaChange: 0,
        resourceCost: { hp: -1 },
        responseText: '괴한을 쫓았지만 놓쳤다. 돌아오는 길에 팔에 찰과상을 입었다.',
      },
      {
        text: '무시하고 잠을 청한다',
        karmaChange: 0,
        resourceCost: { food: -1 },
        responseText: '아침에 일어나니 식량 일부가 사라져 있었다. 경계를 소홀히 한 대가다.',
      },
    ],
    acts: [1, 2, 3],
    maxOccurrences: 2,
  },
  {
    id: 'evt_food_theft',
    narration: '식량 저장소가 뒤집어져 있다. 누군가 밤사이 식량을 훔쳐갔다. 정착지에 동요가 번진다.',
    choices: [
      {
        text: '범인을 색출한다',
        karmaChange: 1,
        
        responseText: '의심스러운 자를 몰아세웠지만, 확실한 증거는 없다. 분위기만 험악해졌다.',
      },
      {
        text: '남은 식량을 공평하게 나눈다',
        karmaChange: -1,
        resourceCost: { food: -2 },
        responseText: '식량은 줄었지만, 당신의 공정함에 사람들이 안도한다.',
      },
      {
        text: '경비를 강화하고 넘어간다',
        karmaChange: 0,
        resourceCost: { food: -1 },
        responseText: '도난된 것은 되찾을 수 없었다. 앞으로는 경비를 세우기로 한다.',
      },
    ],
    acts: [1, 2],
    maxOccurrences: 1,
  },
  {
    id: 'evt_wounded_stranger',
    narration: '정착지 외곽에서 쓰러진 낯선 이가 발견되었다. 피를 많이 흘렸다. 약탈자인지, 길 잃은 생존자인지 알 수 없다.',
    choices: [
      {
        text: '데려와 치료한다',
        karmaChange: -2,
        resourceCost: { food: -1 },
        responseText: '낯선 이가 의식을 되찾았다. "고맙습니다..." 약한 목소리로 속삭인다.',
      },
      {
        text: '위험할 수 있으니 내버려둔다',
        karmaChange: 1,
        responseText: '다음 날 그 자리에 가보니, 이미 아무도 없었다.',
      },
      {
        text: '물만 주고 떠난다',
        karmaChange: 0,
        resourceCost: { food: -1 },
        responseText: '최소한의 도움만 주었다. 그가 살았는지는 알 수 없다.',
      },
    ],
    acts: [1, 2, 3],
    maxOccurrences: 2,
  },
  {
    id: 'evt_ruins_supply',
    narration: '폐허를 탐색하던 중 무너진 건물 지하에서 보급품 상자를 발견했다. 먼지가 두껍게 쌓여 있지만, 내용물은 온전하다.',
    choices: [
      {
        text: '식량만 가져간다',
        karmaChange: 0,
        resourceCost: { food: 3 },
        responseText: '통조림과 건조식량을 챙겼다. 며칠은 버틸 수 있겠다.',
      },
      {
        text: '의약품을 찾는다',
        karmaChange: 0,
        resourceCost: { hp: 2 },
        responseText: '붕대와 소독약을 발견했다. 상처를 치료할 수 있다.',
      },
      {
        text: '전부 정착지로 가져간다',
        karmaChange: -1,
        resourceCost: { food: 2, hp: 1 },
        responseText: '무거운 짐을 지고 돌아왔다. 사람들의 표정이 밝아진다.',
      },
    ],
    probability: 0.25,
    acts: [1, 2],
    maxOccurrences: 1,
  },
  {
    id: 'evt_settlement_conflict',
    narration: '정착지 안에서 고성이 오간다. 두 주민이 식량 배분을 두고 다투고 있다. "왜 저 사람은 더 받는 거야!"',
    choices: [
      {
        text: '중재에 나선다',
        karmaChange: -1,
        
        responseText: '양쪽을 달래며 배분을 조정했다. 불만은 남았지만, 큰 충돌은 피했다.',
      },
      {
        text: '내 일이 아니다 — 무시한다',
        karmaChange: 0,
        
        responseText: '다툼은 점점 커졌고, 결국 한 명이 정착지를 떠났다.',
      },
      {
        text: '강하게 질서를 잡는다',
        karmaChange: 1,
        
        responseText: '위압적인 태도에 다툼은 멈췄지만, 사람들의 눈에 두려움이 서렸다.',
      },
    ],
    acts: [2, 3],
    maxOccurrences: 1,
  },
  {
    id: 'evt_strange_noise',
    narration: '깊은 밤, 정착지 북쪽에서 이상한 소리가 들린다. 금속이 부딪히는 듯한, 규칙적인 소리. 누군가 신호를 보내고 있는 것 같기도 하다.',
    choices: [
      {
        text: '소리의 근원을 찾아간다',
        karmaChange: 0,
        resourceCost: { hp: -1 },
        responseText: '어둠 속을 헤맸지만 소리의 근원은 찾지 못했다. 다만 벽에 새겨진 이상한 기호를 발견했다.',
      },
      {
        text: '이설에게 알린다',
        karmaChange: 0,
        
        responseText: '이설이 심각한 표정으로 말한다. "예전에도 비슷한 소리를 들은 적이 있어요."',
      },
      {
        text: '경계만 강화하고 무시한다',
        karmaChange: 0,
        responseText: '소리는 얼마 후 멈추었다. 무엇이었는지는 미스터리로 남는다.',
      },
    ],
    acts: [1, 2],
    maxOccurrences: 1,
  },
  {
    id: 'evt_raider_scout',
    narration: '순찰 중 약탈자 정찰병과 마주쳤다. 그도 당신을 발견한 것 같다. 서로 눈이 마주친 순간, 긴장이 흐른다.',
    choices: [
      {
        text: '선제 공격한다',
        karmaChange: 2,
        resourceCost: { hp: -1 },
        responseText: '정찰병을 제압했다. 하지만 이것이 더 큰 보복을 부를 수도 있다.',
      },
      {
        text: '숨어서 지나가길 기다린다',
        karmaChange: 0,
        responseText: '숨을 죽이고 기다렸다. 정찰병은 한참을 두리번거리다 돌아갔다.',
      },
      {
        text: '손을 들어 대화를 시도한다',
        karmaChange: -1,
        
        responseText: '"동쪽은 가지 마라. 거기엔 아무것도 없어." 정찰병이 떠나며 흘린 말이 마음에 걸린다.',
      },
    ],
    acts: [2, 3],
    maxOccurrences: 2,
  },
  {
    id: 'evt_storm',
    narration: '하늘이 급격히 어두워진다. 모래폭풍이 몰려온다. 바리케이드가 흔들리고 바람이 울부짖는다.',
    choices: [
      {
        text: '바리케이드를 사수한다',
        karmaChange: 0,
        resourceCost: { hp: -2 },
        responseText: '온몸이 모래에 쓸렸지만, 바리케이드는 버텼다. 사람들이 감사한 눈으로 바라본다.',
      },
      {
        text: '건물 안으로 대피한다',
        karmaChange: 0,
        resourceCost: { food: -2 },
        responseText: '폭풍이 지나간 후 바리케이드 일부가 무너졌고, 바깥에 놓아둔 식량이 날아갔다.',
      },
    ],
    probability: 0.2,
    acts: [2, 3],
    maxOccurrences: 1,
  },
  // === 카르마 임계치 트리거 이벤트 ===
  {
    id: 'evt_evil_echo',
    narration: '밤바람 속에서 당신이 해친 자들의 얼굴이 스친다. 손끝이 떨리고, 귓가엔 누군가의 마지막 숨소리가 들린다.',
    choices: [
      {
        text: '억누른다 — 이건 환각일 뿐이다',
        karmaChange: 1,
        resourceCost: { hp: 1 },
        responseText: '호흡을 가다듬었다. 환각은 서서히 사라졌지만, 마음 한구석에 단단한 벽이 세워졌다.',
      },
      {
        text: '받아들인다 — 나는 많은 것을 빼앗았다',
        karmaChange: -1,
        resourceCost: { hp: -1 },
        responseText: '무릎을 꿇었다. 이름 모를 얼굴들에게 사죄했다. 가슴이 무너지는 것 같았지만, 조금은 가벼워졌다.',
      },
      {
        text: '이설에게 털어놓는다',
        karmaChange: -1,
        affinityChange: { issel: 2 },
        requireAffinity: { npc: 'issel', min: 5 },
        responseText: '이설은 아무 말도 하지 않고 당신의 손을 잡았다. 그 침묵이 어떤 말보다 큰 위로가 되었다.',
      },
    ],
    probability: 0.5,
    acts: [2, 3],
    maxOccurrences: 2,
    requireKarma: { min: 8 },
    turnRange: { min: 10, max: 17 },
  },
  {
    id: 'evt_redemption',
    narration: '어린 아이가 당신 앞에 쓰러진 약탈자를 가리킨다. "저 사람도... 원래는 나쁜 사람이 아니었을 거예요, 아저씨."',
    speaker: '민준',
    choices: [
      {
        text: '약탈자를 매장해준다',
        karmaChange: -1,
        resourceCost: { food: -1 },
        affinityChange: { minju: 1 },
        responseText: '민준이 당신 옆에서 함께 흙을 덮었다. 이름도 모르는 자를 위한, 작은 무덤 하나가 생겼다.',
      },
      {
        text: '"나쁜 사람이 아닌 자가 얼마나 될까." 지나간다',
        karmaChange: 1,
        affinityChange: { minju: -1 },
        responseText: '민준은 당신을 한참 바라봤다. 그 눈빛이 오래 남았다.',
      },
      {
        text: '"세상은 네가 생각하는 것보다 잔인하다." 진실을 말한다',
        karmaChange: -2,
        affinityChange: { minju: -1 },
        responseText: '민준의 눈이 떨렸다. 그는 고개를 숙였다. "알아요... 그래도, 누군가는 기억해줘야 하잖아요."',
      },
    ],
    probability: 0.5,
    acts: [2, 3],
    maxOccurrences: 1,
    requireKarma: { max: 4 },
    turnRange: { min: 10, max: 17 },
    requireNpc: { id: 'minju', alive: true },
  },
  {
    id: 'evt_hunter',
    narration: '정찰 중, 누군가 당신을 지켜보고 있다는 감각. 당신의 평판은 이미 이 일대에 퍼진 것이다. 약탈자든, 생존자든 — 당신을 쫓는 자들이 생긴 것이다.',
    choices: [
      {
        text: '숨어서 지나가길 기다린다',
        karmaChange: 0,
        responseText: '숨을 죽이고 한참을 기다렸다. 발소리는 멀어졌다. 오늘은 피했다.',
      },
      {
        text: '대치한다 — 두려움을 보이지 않는다',
        karmaChange: 1,
        resourceCost: { hp: -2 },
        responseText: '짧은 교전 후 추적자는 물러섰다. 당신은 피를 묻힌 채 돌아왔다.',
      },
      {
        text: '다른 길로 돌아간다',
        karmaChange: 0,
        resourceCost: { food: -1 },
        responseText: '먼 길을 돌아왔다. 시간과 식량을 대가로, 당신은 살아있다.',
      },
    ],
    probability: 0.5,
    acts: [2, 3],
    maxOccurrences: 2,
    requireKarma: { min: 9 },
    turnRange: { min: 13, max: 17 },
  },
];

const DEFAULT_PROBABILITY = 0.35;

export interface RollContext {
  karma: number;
  hp: number;
}

export function rollRandomEvent(
  act: 1 | 2 | 3,
  occurredEvents: Record<string, number>,
  turn: number,
  ctx?: RollContext
): RandomEvent | null {
  // 분기점 턴(7,14,19)과 첫 2턴, 마지막 2턴에서는 발동 안 함
  if (turn <= 2 || turn >= 19 || turn === 7 || turn === 14) return null;

  const karma = ctx?.karma ?? 5;
  const hp = ctx?.hp ?? 5;

  const eligible = randomEvents.filter((evt) => {
    if (evt.acts && !evt.acts.includes(act)) return false;
    const count = occurredEvents[evt.id] ?? 0;
    if (evt.maxOccurrences && count >= evt.maxOccurrences) return false;
    if (evt.requireKarma) {
      if (evt.requireKarma.min !== undefined && karma < evt.requireKarma.min) return false;
      if (evt.requireKarma.max !== undefined && karma > evt.requireKarma.max) return false;
    }
    if (evt.turnRange) {
      if (evt.turnRange.min !== undefined && turn < evt.turnRange.min) return false;
      if (evt.turnRange.max !== undefined && turn > evt.turnRange.max) return false;
    }
    return true;
  });

  if (eligible.length === 0) return null;

  // HP 2 이하이면 전체 확률을 절반으로 (플레이어 보호)
  const globalProb = hp <= 2 ? DEFAULT_PROBABILITY * 0.5 : DEFAULT_PROBABILITY;
  if (Math.random() > globalProb) return null;

  const weighted = eligible.map((evt) => ({
    evt,
    weight: evt.probability ?? DEFAULT_PROBABILITY,
  }));
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const { evt, weight } of weighted) {
    roll -= weight;
    if (roll <= 0) return evt;
  }

  return eligible[0];
}
