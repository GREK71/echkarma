import type { Scene } from './types';

export const ep1Scenes: Scene[] = [
  {
    id: 'ep1_open',
    episodeId: 'ep1',
    narration: '사무실 문이 열리고 한 여자가 들어선다. 손끝이 떨리고 있다. "남편이 사흘째 연락이 안 돼요. 경찰은 성인 실종은 손 놓고 있다더군요. 찾아주세요. 제발."',
    speaker: '의뢰인 — 박수연',
    defaultNext: 'ep1_accept',
    choices: [
      {
        text: '"사례비부터 이야기합시다."',
        responseText: '그녀는 말없이 봉투를 꺼낸다. 준비해 온 것 같다.',
        impact: { flags: { ep1_tone: 'transactional' } },
      },
      {
        text: '"두 분은 어떤 사이셨습니까?"',
        responseText: '그녀의 눈이 잠시 흔들린다. "...좋은 사이였어요. 남들 보기엔."',
        impact: { flags: { ep1_tone: 'probe' } },
      },
      {
        text: '"최근에 다투신 적은?"',
        responseText: '"...없어요." 너무 빠른 대답이다.',
        impact: { flags: { ep1_tone: 'probe' } },
      },
    ],
  },
  {
    id: 'ep1_accept',
    episodeId: 'ep1',
    narration: '의뢰를 받는다. 남편의 마지막 행적은 강변 근처 낡은 모텔. 그곳 주변부터 뒤진다. 가장 먼저 찾아갈 곳을 정한다.',
    defaultNext: 'ep1_find',
    choices: [
      {
        text: '모텔 사장을 만난다',
        responseText: '오래 장사한 노인이다. 돈 한 장에 말이 풀린다. "그 사람, 며칠 전부터 자주 와요. 혼자."',
        impact: { flags: { ep1_path: 'motel' } },
        nextScene: 'ep1_find',
      },
      {
        text: '남편의 직장 동료를 찾는다',
        responseText: '동료는 한참을 망설이다 말한다. "형이... 집에만 가면 안색이 변했어요."',
        impact: { flags: { ep1_path: 'colleague' }, honesty: 0, intervention: 1 },
        nextScene: 'ep1_find',
      },
      {
        text: '의뢰인의 언니에게 연락한다',
        responseText: '언니는 전화를 끊지 않는다. 한참의 침묵 후. "...그 사람, 우리 수연이한테 손을 댔어요."',
        impact: { flags: { ep1_path: 'sister', ep1_knows: 'abuse' }, honesty: 1 },
        nextScene: 'ep1_find',
      },
    ],
  },
  {
    id: 'ep1_find',
    episodeId: 'ep1',
    narration: '단서를 엮어 모텔 근처 옥탑방을 찾아낸다. 문을 두드리자 남자가 나온다. 눈 밑이 시커멓다. "...누구세요."',
    speaker: '남편 — 장재우',
    isBranch: true,
    defaultNext: 'ep1_husband',
    choices: [
      {
        text: '"당신 아내분이 의뢰하셨습니다."',
        responseText: '남자의 낯빛이 변한다. "...들어오세요." 문이 열린다.',
        nextScene: 'ep1_husband',
      },
    ],
  },
  {
    id: 'ep1_husband',
    episodeId: 'ep1',
    narration: '좁은 방 안. 남자는 담배도 피우지 않고 벽을 본다. "...그 사람 앞에서 살 자신이 없었어요. 10년을, 참았어요. 제가 참으면 괜찮다고 생각했는데." 그가 손목의 흉터를 가린다. "다시 돌아가면, 저는 다음 번엔 창문으로 떨어질 겁니다."',
    speaker: '장재우',
    defaultNext: 'ep1_decision',
    choices: [
      {
        text: '"왜 이제야 말합니까?"',
        responseText: '"...말할 사람이 없었어요."',
      },
      {
        text: '"증거는 있습니까?"',
        responseText: '그가 병원 기록을 꺼낸다. 병명란이 "계단에서 넘어짐"으로 가득하다.',
        impact: { flags: { ep1_evidence: 'yes' } },
      },
      {
        text: '말없이 고개를 끄덕인다',
        responseText: '그가 고개를 숙인다. 작게 흐느낀다.',
      },
    ],
  },
  {
    id: 'ep1_decision',
    episodeId: 'ep1',
    isBranch: true,
    narration: '사무실로 돌아온다. 의뢰인이 기다리고 있다. 그녀의 떨리는 손. 남편의 병원 기록. 옥탑방의 흉터. 세 가지 중 어느 것이 진실인지, 혹은 모두가 진실인지. 말을 어떻게 꺼낼지 결정해야 한다.',
    defaultNext: 'ep1_end',
    choices: [
      {
        text: '위치와 사실을 모두 알린다',
        responseText: '"남편분은 스스로 피하신 겁니다. 이유는 본인이 말씀드리도록 하겠습니다." 그녀의 얼굴이 굳는다.',
        impact: {
          honesty: 2,
          flags: { ep1_outcome: 'told' },
        },
        endsEpisode: true,
      },
      {
        text: '다른 곳으로 갔다고 둘러댄다',
        responseText: '"지방 어딘가라고 합니다. 돌아올 생각이 없어 보였습니다." 그녀가 봉투를 만지작거린다. "...알겠습니다."',
        impact: {
          silence: 1,
          intervention: 1,
          flags: { ep1_outcome: 'misled' },
        },
        endsEpisode: true,
      },
      {
        text: '"못 찾았습니다."',
        responseText: '그녀가 한참을 당신을 본다. 무언가 알고 있다는 눈빛. 그녀는 말없이 일어선다.',
        impact: {
          silence: 2,
          flags: { ep1_outcome: 'silent' },
        },
        endsEpisode: true,
      },
    ],
  },
  {
    id: 'ep1_end',
    episodeId: 'ep1',
    narration: '의뢰인이 문을 닫고 나간다. 사무실이 다시 조용해진다. 창밖으로 해가 진다. 당신은 오래 앉아 있는다.',
    defaultNext: '',
    choices: [
      {
        text: '(에피소드를 마친다)',
        endsEpisode: true,
      },
    ],
  },
];
