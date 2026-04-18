import type { NPCId } from '../game/npc';
import type { ResourceKey } from '../game/resources';

/**
 * 확률 선택지 결과. successChance가 지정된 Choice는
 * Math.random() < successChance ? onSuccess : onFailure 로 분기.
 */
export interface ChoiceOutcome {
  karmaChange?: number;
  resourceCost?: Partial<Record<ResourceKey, number>>;
  affinityChange?: Partial<Record<NPCId, number>>;
  npcEffect?: { id: NPCId; alive: boolean };
  grantClue?: string;
  responseText?: string;
  branchResult?: string;
}

export interface Choice {
  text: string;
  karmaChange: number;
  npcEffect?: { id: NPCId; alive: boolean };
  revealNpc?: NPCId;
  nextScene?: string;
  branchResult?: string;
  resourceCost?: Partial<Record<ResourceKey, number>>;
  requireResource?: { resource: ResourceKey; min: number };
  responseText?: string;
  affinityChange?: Partial<Record<NPCId, number>>;
  requireAffinity?: { npc: NPCId; min: number };
  grantClue?: string;
  requireClue?: string;
  /** 0~1 사이 성공 확률. 지정되면 onSuccess/onFailure로 분기. */
  successChance?: number;
  onSuccess?: ChoiceOutcome;
  onFailure?: ChoiceOutcome;
}

export interface SceneConditionState {
  karma: number;
  npcs: Record<string, { alive: boolean; revealed: boolean }>;
  branchResults: Record<string, string>;
  resources: { hp: number; food: number };
}

/**
 * 향후 터치 추리 확장 지점.
 * 'dialogue'(기본) — 현재 GameScreen 렌더링
 * 'investigation' — 향후 InvestigationScreen에서 터치/포인트&클릭 식으로 렌더링
 */
export type SceneInteractiveType = 'dialogue' | 'investigation';

/** 추리/탐색 씬에서 터치 대상 (향후 사용) */
export interface Interactable {
  id: string;
  label: string;
  x: number; // 0~100 (%)
  y: number;
  width?: number;
  height?: number;
  onTap?: { grantClue?: string; narration?: string };
}

export interface Scene {
  id: string;
  act: 1 | 2 | 3;
  turn: number;
  narration: string;
  speaker?: string;
  choices: Choice[];
  isBranch?: boolean;
  isFlashback?: boolean;
  condition?: (state: SceneConditionState) => boolean;
  /** 기본 'dialogue'. 'investigation'은 향후 확장 */
  interactiveType?: SceneInteractiveType;
  /** 추리 씬의 터치 대상 (향후) */
  interactables?: Interactable[];
}

export const scenes: Scene[] = [
  // === ACT 1: 도입 & 세계 인식 (턴 1-7) ===
  {
    id: 'act1_turn1',
    act: 1,
    turn: 1,
    narration: '먼지 뒤덮인 폐허 위로 희미한 햇살이 비친다. 당신은 기억을 잃은 채 작은 정착지 근처에서 눈을 뜬다. 멀리서 누군가 다가온다.',
    choices: [
      { text: '경계하며 일어선다', karmaChange: 0, branchResult: 'turn1_alert', responseText: '주먹을 쥐고 몸을 일으킨다. 다가오던 그림자가 잠시 멈칫한다.' },
      { text: '조용히 누워서 상황을 살핀다', karmaChange: 0, branchResult: 'turn1_observe', responseText: '눈을 가늘게 뜨고 숨을 고른다. 발소리가 가까워진다... 여자의 목소리가 들린다.' },
    ],
  },
  {
    id: 'act1_turn2_alert',
    act: 1,
    turn: 2,
    narration: '여인이 양손을 들어 보이며 천천히 다가온다. "적이 아니에요. 경계심이 강하시군요... 여긴 우리 정착지 외곽이에요. 저는 이설이라고 합니다." 그녀는 당신의 눈빛을 살피며 조심스럽게 말한다.',
    speaker: '이설',
    condition: (state) => state.branchResults['act1_turn1'] === 'turn1_alert',
    choices: [
      { text: '"...미안하다. 반사적으로."', karmaChange: -1, affinityChange: { issel: 1 }, responseText: '이설이 작게 웃는다. "살아남으려면 그 정도는 당연하죠."' },
      { text: '"무기는 없나? 여기 안전한 건가?"', karmaChange: 0, resourceCost: { hp: 1 }, responseText: '이설이 고개를 끄덕인다. "일단 안전해요. 따라오세요."' },
      { text: '"가까이 오지 마." (경계를 유지한다)', karmaChange: 1, affinityChange: { issel: -1 }, responseText: '이설이 한 발 물러선다. 그녀의 표정에 실망이 스친다.' },
    ],
  },
  {
    id: 'act1_turn2_observe',
    act: 1,
    turn: 2,
    narration: '여인이 당신 옆에 무릎을 꿇는다. "깨어났군요. 걱정했어요... 이틀이나 의식이 없었거든요." 그녀가 물을 건넨다. "저는 이설이에요. 여긴 우리 정착지 외곽이에요."',
    speaker: '이설',
    condition: (state) => state.branchResults['act1_turn1'] !== 'turn1_alert',
    choices: [
      { text: '물을 받아 마신다. "고맙다."', karmaChange: -1, resourceCost: { hp: 1 }, affinityChange: { issel: 1 }, responseText: '목을 적시자 시야가 또렷해진다. 이설이 안도의 한숨을 쉰다.' },
      { text: '"이틀... 여기서 무슨 일이 있었지?"', karmaChange: 0, responseText: '이설의 표정이 어두워진다. "그건... 안에서 이야기해요."' },
      { text: '"......"(묵묵히 따라간다)', karmaChange: 0, affinityChange: { issel: -1 }, responseText: '당신은 아무 말 없이 일어선다. 이설이 불안한 눈으로 앞장선다.' },
    ],
  },
  {
    id: 'act1_turn3',
    act: 1,
    turn: 3,
    narration: '정착지에 들어서자 백발의 노인이 맞이한다. "또 한 명의 길 잃은 영혼이로군." 정 노인은 지팡이를 짚고 당신을 살핀다. "여기서 지내려면 규칙을 따라야 한다. 약탈하지 말 것, 나누어 먹을 것."',
    speaker: '정 노인',
    choices: [
      { text: '"규칙을 따르겠습니다."', karmaChange: -1, affinityChange: { elder: 1 }, responseText: '정 노인이 고개를 끄덕인다. "좋아. 잘 지낼 수 있을 게다."' },
      { text: '"내가 왜 남의 규칙을 따라야 하지?"', karmaChange: 1, affinityChange: { elder: -1 }, responseText: '노인의 눈이 좁아진다. "이곳에서 혼자 살아남을 수 있다고 생각하나?"' },
      { text: '"먹을 것부터 주시오."', karmaChange: 1, resourceCost: { food: 1 }, affinityChange: { elder: -1 }, responseText: '노인이 한숨을 쉬며 마른 빵을 건넨다. 주변 사람들의 시선이 차갑다.' },
    ],
  },
  {
    id: 'act1_turn4',
    act: 1,
    turn: 4,
    narration: '정착지의 하루가 시작된다. 물 길어오기, 바리케이드 보수, 식량 배분. 작은 아이 민준이 당신에게 다가온다. "형... 아니, 아저씨? 같이 물 길으러 가요!"',
    speaker: '민준',
    choices: [
      { text: '민준과 함께 물을 길으러 간다', karmaChange: -1, resourceCost: { food: 1 }, affinityChange: { minju: 1 }, responseText: '민준이 환하게 웃는다. 돌아오는 길에 먹을 수 있는 열매를 발견했다.' },
      { text: '"바쁘다. 다른 사람한테 부탁해."', karmaChange: 1, affinityChange: { minju: -1 }, responseText: '민준의 어깨가 축 처진다. 뒤에서 이설이 안쓰러운 눈으로 바라본다.' },
      { text: '바리케이드 보수를 돕는다', karmaChange: 0, resourceCost: { hp: -1 }, responseText: '무거운 잔해를 옮기다 손에 상처가 났다. 하지만 방벽은 한층 튼튼해졌다.' },
    ],
  },
  {
    id: 'act1_turn5',
    act: 1,
    turn: 5,
    narration: '밤이 되었다. 멀리서 불빛이 보인다. 약탈자들의 캠프다. 이설이 다가와 속삭인다. "저들이 점점 가까이 오고 있어요. 정 노인은 대화로 해결하려 하지만... 저는 걱정돼요."',
    speaker: '이설',
    choices: [
      { text: '"대화가 통할 리 없어. 준비해야 해."', karmaChange: 1, affinityChange: { issel: -1 }, responseText: '이설이 입술을 깨문다. "...그럴지도 모르죠." 그녀의 눈에 불안이 깊어진다.' },
      { text: '"정 노인의 판단을 믿어보자."', karmaChange: -1, affinityChange: { issel: 1 }, responseText: '이설이 고개를 끄덕이지만, 완전히 안심한 표정은 아니다.' },
      {
        text: '"혼자 정찰을 나가보겠다."',
        karmaChange: 0,
        successChance: 0.7,
        onSuccess: {
          karmaChange: 0,
          resourceCost: { hp: -1 },
          responseText: '어둠 속을 조심스럽게 움직였다. 약탈자 캠프의 위치를 파악했다. 팔에 작은 찰과상이 남았다.',
        },
        onFailure: {
          karmaChange: 0,
          resourceCost: { hp: -2 },
          responseText: '발을 헛디뎌 돌무더기에서 구르고 말았다. 정보는커녕, 상처만 입고 돌아왔다.',
        },
      },
    ],
  },
  {
    id: 'act1_turn6',
    act: 1,
    turn: 6,
    narration: '다음 날 아침, 정착지 외곽에서 약탈자 한 명이 발견된다. 부상을 입고 쓰러져 있다. 사람들이 웅성거린다. "저자를 어떻게 할 것인가?"',
    choices: [
      { text: '치료해준다', karmaChange: -2, resourceCost: { food: -1 }, affinityChange: { issel: 1 }, responseText: '약탈자가 의식을 되찾았다. "왜... 왜 살려준 거야?" 그의 눈에 혼란이 서린다.' },
      {
        text: '묶어서 심문한다',
        karmaChange: 1,
        successChance: 0.6,
        onSuccess: {
          karmaChange: 1,
          affinityChange: { issel: -1 },
          grantClue: 'raider_symbol',
          responseText: '"정보를 내놓으면 살려주겠다." 약탈자가 떨리는 목소리로 캠프의 위치와 기호를 불었다.',
        },
        onFailure: {
          karmaChange: 1,
          affinityChange: { issel: -2 },
          responseText: '약탈자는 끝내 입을 굳게 다물었다. 당신의 폭력만이 공허하게 메아리쳤다.',
        },
      },
      { text: '정착지 밖으로 내쫓는다', karmaChange: 0, responseText: '약탈자가 절뚝이며 사라진다. 그가 돌아가 동료에게 뭐라고 전할지... 알 수 없다.' },
      { text: '위협을 제거한다', karmaChange: 2, affinityChange: { issel: -2 }, responseText: '일은 끝났다. 하지만 사람들의 시선이 예전 같지 않다. 민준이 고개를 돌린다.' },
    ],
  },

  // === 분기점 A: 민준의 선택 (턴 7) ===
  {
    id: 'branch_a',
    act: 1,
    turn: 7,
    isBranch: true,
    narration: '약탈자 무리가 정착지 앞에 나타났다. 그들의 손에는 민준이 붙잡혀 있다. "물자를 내놓으면 아이를 돌려보내지. 아니면... 글쎄, 결과는 뻔하겠지?"',
    choices: [
      { text: '물자를 넘긴다 (민준 생존)', karmaChange: -1, resourceCost: { food: -3 }, affinityChange: { issel: 1 }, npcEffect: { id: 'minju', alive: true }, branchResult: 'a_supplies' },
      {
        text: '기습 공격을 감행한다 (민준 위험)',
        karmaChange: 2,
        successChance: 0.4,
        branchResult: 'a_attack',
        onSuccess: {
          karmaChange: 2,
          resourceCost: { hp: -1 },
          affinityChange: { issel: -2, minju: -1 },
          npcEffect: { id: 'minju', alive: true },
          responseText: '찰나에 칼이 번뜩였다. 약탈자 둘을 쓰러뜨리고 민준을 낚아챘다. 그러나 사람들의 눈빛은 얼어있었다.',
          branchResult: 'a_attack',
        },
        onFailure: {
          karmaChange: 2,
          resourceCost: { hp: -3 },
          affinityChange: { issel: -3, minju: -3 },
          npcEffect: { id: 'minju', alive: false },
          responseText: '기습은 실패했다. 민준이 쓰러지는 모습이 눈앞에 새겨졌다. 당신은 피를 토하며 물러섰다.',
          branchResult: 'a_attack',
        },
      },
      {
        text: '대화로 시간을 끈다',
        karmaChange: 0,
        successChance: 0.65,
        branchResult: 'a_negotiate',
        requireAffinity: { npc: 'issel', min: 3 },
        onSuccess: {
          karmaChange: -1,
          affinityChange: { issel: 2, minju: 1 },
          npcEffect: { id: 'minju', alive: true },
          responseText: '당신의 차분한 말에 약탈자들이 주춤했다. 그 사이 이설이 뒤에서 움직였고, 민준은 무사히 빠져나왔다.',
          branchResult: 'a_negotiate',
        },
        onFailure: {
          karmaChange: 0,
          resourceCost: { hp: -1, food: -2 },
          affinityChange: { issel: 1 },
          npcEffect: { id: 'minju', alive: true },
          responseText: '대화는 길어졌지만 결국 물자 일부를 넘겨야 했다. 민준은 돌아왔고, 창고는 가벼워졌다.',
          branchResult: 'a_negotiate',
        },
      },
      { text: '민준 대신 자신을 인질로 제안한다', karmaChange: -2, resourceCost: { hp: -2 }, affinityChange: { issel: 2 }, npcEffect: { id: 'minju', alive: true }, branchResult: 'a_sacrifice' },
    ],
  },

  // === ACT 2: 갈등 심화 (턴 8-14) ===
  {
    id: 'act2_turn8',
    act: 2,
    turn: 8,
    narration: '분기점 A의 여파가 정착지를 뒤흔들었다. 사람들의 시선이 당신에게 쏠린다. 이설이 조용히 말한다. "앞으로 어떻게 할 건가요?"',
    speaker: '이설',
    choices: [
      { text: '"방어를 강화해야 해."', karmaChange: 0, resourceCost: { hp: -1 } },
      { text: '"약탈자들과 다시 대화해봐야 해."', karmaChange: -1, affinityChange: { issel: 1 } },
      { text: '"이 정착지를 떠나는 게 나을지도."', karmaChange: 0, affinityChange: { issel: -2 } },
    ],
  },
  {
    id: 'act2_turn9',
    act: 2,
    turn: 9,
    narration: '정착지 밖 탐색 중 이상한 신호를 발견한다. 벽에 새겨진 기호들 — 약탈자의 것이 아니다. 누군가 의도적으로 남긴 흔적이다.',
    choices: [
      {
        text: '신호를 따라간다',
        karmaChange: 0,
        successChance: 0.8,
        revealNpc: 'luka',
        onSuccess: {
          karmaChange: 0,
          grantClue: 'raider_symbol',
          responseText: '벽을 따라 조심스럽게 이동했다. 신호의 주인 — 한 남자의 흔적을 따라가고 있다.',
        },
        onFailure: {
          karmaChange: 0,
          resourceCost: { hp: -2 },
          responseText: '어둠 속에서 무언가에 걸려 굴렀다. 상처를 입었지만, 멀리서 누군가 지켜보고 있었다는 느낌만 남았다.',
        },
      },
      { text: '위험할 수 있으니 무시한다', karmaChange: 0 },
      { text: '정 노인에게 보고한다', karmaChange: -1, affinityChange: { elder: 1 } },
    ],
  },
  {
    id: 'act2_turn10_luka',
    act: 2,
    turn: 10,
    narration: '신호를 따라가니 숨겨진 지하 벙커가 나타난다. 안에서 한 남자가 나온다. "오래 기다렸어. 나는 루카. 약탈자들 안에서 빠져나온 사람이야." 그의 눈에는 절박함이 서려 있다.',
    speaker: '루카',
    condition: (state) => state.npcs.luka?.revealed === true,
    choices: [
      { text: '"너를 믿을 수 있나?"', karmaChange: 0, affinityChange: { luka: 1 } },
      { text: '"약탈자들의 약점을 알려줘."', karmaChange: 1 },
      { text: '"정착지로 함께 가자."', karmaChange: -1, resourceCost: { food: -1 }, affinityChange: { luka: 2 }, grantClue: 'secret_passage' },
    ],
  },
  {
    id: 'act2_turn10_no_luka',
    act: 2,
    turn: 10,
    narration: '정착지의 식량이 줄어들고 있다. 사람들 사이에서 불만이 커진다. 일부는 떠나자고 하고, 일부는 싸우자고 한다.',
    condition: (state) => state.npcs.luka?.revealed !== true,
    choices: [
      { text: '식량 배급을 줄여서 버틴다', karmaChange: 0, resourceCost: { food: -1 }, affinityChange: { issel: -1 } },
      { text: '약탈자 캠프에서 식량을 탈취한다', karmaChange: 2, resourceCost: { hp: -1, food: 3 } },
      { text: '주변 폐허를 탐색해 식량을 찾는다', karmaChange: 0, resourceCost: { hp: -1, food: 2 } },
    ],
  },
  {
    id: 'act2_turn11',
    act: 2,
    turn: 11,
    narration: '한밤중 약탈자들의 소규모 습격이 있었다. 바리케이드를 일부 뚫었지만 격퇴했다. 아침이 밝자 피해를 확인한다. 부상자가 여럿이다.',
    choices: [
      { text: '부상자를 먼저 치료한다', karmaChange: -1, resourceCost: { food: -1, hp: 1 }, affinityChange: { issel: 1 }, responseText: '부상자를 돌보는 동안 당신의 상처도 함께 소독했다. 몸이 조금 가벼워진다.' },
      { text: '바리케이드 복구를 우선한다', karmaChange: 0, resourceCost: { hp: -1 } },
      {
        text: '보복 공격을 준비한다',
        karmaChange: 2,
        successChance: 0.5,
        onSuccess: {
          karmaChange: 2,
          resourceCost: { hp: -1, food: 2 },
          affinityChange: { issel: -1 },
          responseText: '야간 기습은 성공했다. 약탈자 몇을 제압하고 소량의 식량을 얻었다. 그러나 당신의 손에 묻은 피는 쉽게 지워지지 않는다.',
        },
        onFailure: {
          karmaChange: 2,
          resourceCost: { hp: -3 },
          affinityChange: { issel: -2 },
          responseText: '적의 경계는 예상보다 삼엄했다. 역공을 당해 쫓기듯 돌아왔다. 많이 다쳤고, 사람들의 신뢰는 더 깊이 식었다.',
        },
      },
    ],
  },
  {
    id: 'act2_turn12',
    act: 2,
    turn: 12,
    narration: '이설이 조용히 찾아온다. "당신의 짐 속에서 이걸 발견했어요." 그녀가 내미는 것은 낡은 군번줄이다. 당신의 이름과 소속이 적혀 있다. "당신도... 전쟁에 참여했던 건가요?"',
    speaker: '이설',
    choices: [
      { text: '"...기억나지 않아. 하지만 이건 내 것이 맞는 것 같다."', karmaChange: 0, affinityChange: { issel: 1 }, grantClue: 'military_tag' },
      { text: '"그래, 나도 한때는 군인이었어."', karmaChange: 0, affinityChange: { issel: 1 }, grantClue: 'military_tag' },
      { text: '"그걸 왜 뒤졌어?" (화를 낸다)', karmaChange: 1, affinityChange: { issel: -2 } },
    ],
  },
  {
    id: 'act2_turn13',
    act: 2,
    turn: 13,
    narration: '정 노인이 모두를 모았다. "약탈자의 수장 — 칸이라는 자가 직접 협상을 원한다고 한다. 하지만 덫일 수 있다." 노인의 얼굴에 깊은 고민이 서려 있다.',
    speaker: '정 노인',
    choices: [
      { text: '"제가 가겠습니다."', karmaChange: 0 },
      { text: '"덫이라면 역으로 이용하자."', karmaChange: 1 },
      { text: '"가지 맙시다. 방어에 집중해야 합니다."', karmaChange: 0 },
    ],
  },

  // === 분기점 B: 장로의 결단 (턴 14) ===
  {
    id: 'branch_b',
    act: 2,
    turn: 14,
    isBranch: true,
    narration: '약탈자들이 정착지를 포위했다. 정 노인이 앞으로 나선다. "내가 인질로 가겠다. 그 대신 사람들을 해치지 마라." 칸의 부하가 비웃는다. "노인 하나로는 부족해."',
    choices: [
      { text: '정 노인의 결정을 존중한다 (노인 위험)', karmaChange: -1, affinityChange: { elder: 1 }, npcEffect: { id: 'elder', alive: false }, branchResult: 'b_let_go' },
      { text: '전투를 선택한다 — 정 노인을 지킨다', karmaChange: 1, resourceCost: { hp: -2, food: -1 }, npcEffect: { id: 'elder', alive: true }, branchResult: 'b_fight' },
      { text: '정착지를 포기하고 모두 탈출한다', karmaChange: 0, resourceCost: { food: -2 }, affinityChange: { issel: -2 }, branchResult: 'b_flee' },
      {
        text: '루카의 비밀 통로로 협상한다',
        karmaChange: -2,
        affinityChange: { luka: 2 },
        npcEffect: { id: 'elder', alive: true },
        branchResult: 'b_luka_negotiate',
        requireClue: 'secret_passage',
        requireAffinity: { npc: 'luka', min: 4 },
      },
    ],
  },

  // === ACT 3: 클라이맥스 & 최종 대결 (턴 15-20) ===
  {
    id: 'act3_turn15',
    act: 3,
    turn: 15,
    narration: '분기점 B의 결과 이후, 살아남은 자들이 모였다. 최종 대결이 다가오고 있음을 모두가 느낀다. 밤하늘 아래 당신은 생각에 잠긴다.',
    choices: [
      { text: '동료들과 전략을 짠다', karmaChange: 0, affinityChange: { issel: 1 } },
      { text: '혼자 무기를 점검한다', karmaChange: 0, resourceCost: { hp: 1 } },
      { text: '이설과 대화한다', karmaChange: -1, affinityChange: { issel: 1 } },
    ],
  },
  {
    id: 'act3_turn16',
    act: 3,
    turn: 16,
    isFlashback: true,
    narration: '기억의 파편이 돌아온다. 전쟁의 불길, 비명, 그리고... 같은 부대에 있던 누군가의 얼굴. 흐릿하지만 분명히 아는 얼굴이다. 칸의 얼굴과 겹쳐진다.',
    choices: [
      { text: '"그 사람이 칸이었단 말인가..."', karmaChange: 0 },
      { text: '기억을 억누른다', karmaChange: 1 },
      { text: '이설에게 기억을 이야기한다', karmaChange: -1 },
    ],
  },
  {
    id: 'act3_turn17',
    act: 3,
    turn: 17,
    narration: '칸의 약탈자 무리가 최종 공격을 준비하고 있다는 첩보가 들어온다. 시간이 별로 없다. 당신은 결단을 내려야 한다.',
    choices: [
      { text: '선제공격을 감행한다', karmaChange: 2, resourceCost: { hp: -2 }, affinityChange: { issel: -1 } },
      { text: '방어 태세를 갖추고 기다린다', karmaChange: 0, resourceCost: { food: -1 } },
      { text: '칸에게 단독 면담을 요청한다', karmaChange: -1, resourceCost: { hp: -1 }, requireAffinity: { npc: 'issel', min: 3 } },
    ],
  },
  {
    id: 'act3_turn18_high',
    act: 3,
    turn: 18,
    narration: '마지막 밤. 이설이 당신을 물끄러미 바라본다. "당신은... 이미 돌아올 수 없는 곳까지 왔어요. 내일 무엇을 선택하든, 그 선택은 당신 안에서 이미 정해져 있을 거예요." 그녀의 목소리가 떨린다.',
    speaker: '이설',
    condition: (state) => state.karma >= 9,
    choices: [
      { text: '"그래. 끝을 볼 뿐이다."', karmaChange: 1, affinityChange: { issel: -1 } },
      { text: '"...그럴지도 모르지. 하지만 아직 모른다."', karmaChange: 0 },
      { text: '"내가 선택한 길이다. 후회는 없어."', karmaChange: 0, affinityChange: { issel: -1 } },
    ],
  },
  {
    id: 'act3_turn18_low',
    act: 3,
    turn: 18,
    narration: '마지막 밤. 이설이 당신의 손을 가만히 잡는다. "당신이 지금까지 지킨 것들... 저는 다 봤어요. 내일 어떤 선택을 하더라도, 저는 당신 편이에요."',
    speaker: '이설',
    condition: (state) => state.karma <= 4,
    choices: [
      { text: '"고마워. 너 덕분에 여기까지 올 수 있었어."', karmaChange: -1, affinityChange: { issel: 2 } },
      { text: '"...네가 옆에 있어서 다행이야."', karmaChange: -1, affinityChange: { issel: 1 } },
      { text: '손을 맞잡는다. 말은 필요 없었다.', karmaChange: -1, affinityChange: { issel: 2 } },
    ],
  },
  {
    id: 'act3_turn18',
    act: 3,
    turn: 18,
    narration: '마지막 밤이다. 내일이면 모든 것이 결정된다. 이설이 조용히 말한다. "내일 당신이 어떤 선택을 할지, 저는 가늠이 안 돼요. 하지만... 무엇을 하든 끝까지 보고 싶어요."',
    speaker: '이설',
    choices: [
      { text: '"고마워. 내일은 반드시 끝내겠어."', karmaChange: 0 },
      { text: '"후회하는 건 없어. 다만..."', karmaChange: -1 },
      { text: '"살아남는 게 전부야." (냉담하게)', karmaChange: 1, affinityChange: { issel: -1 } },
    ],
  },

  // === 분기점 C: 칸과의 대면 (턴 19) ===
  {
    id: 'branch_c',
    act: 3,
    turn: 19,
    isBranch: true,
    narration: '칸과 마주한다. 가까이서 본 그의 얼굴에는 당신과 같은 전쟁의 상흔이 새겨져 있다. "기억나나? 우리는 같은 부대였어." 칸이 쓸쓸히 웃는다. "전쟁이 우리를 이렇게 만들었지."',
    speaker: '칸',
    choices: [
      { text: '칸을 공격한다', karmaChange: 2, resourceCost: { hp: -2 }, branchResult: 'c_kill' },
      { text: '대화를 시도한다 (카르마 ≤8 필요)', karmaChange: -1, branchResult: 'c_dialogue', requireAffinity: { npc: 'issel', min: 5 } },
      { text: '칸을 놓아준다 (카르마 ≤4 필요)', karmaChange: -2, affinityChange: { issel: 2 }, branchResult: 'c_spare' },
      { text: '항복한다', karmaChange: 0, affinityChange: { issel: -3 }, branchResult: 'c_surrender' },
    ],
  },

  // === 턴 20: 에필로그 (엔딩 직전) ===
  {
    id: 'act3_turn20',
    act: 3,
    turn: 20,
    narration: '모든 것이 끝났다. 먼지가 가라앉고 폐허 위로 다시 해가 뜬다. 당신이 걸어온 길의 메아리가 되돌아온다.',
    choices: [
      { text: '(결말을 확인한다)', karmaChange: 0 },
    ],
  },
];
