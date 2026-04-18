import type { Scene } from './types';

export const ep2Scenes: Scene[] = [
  {
    id: 'ep2_open',
    episodeId: 'ep2',
    narration: '중년 남자와 여자가 들어선다. 번듯한 차림. "우리 딸이 가출했습니다. 이틀 됐어요. 경찰은 미성년자라 곧 찾아준다는데, 너무 늦어요. 빨리 찾아주세요."',
    speaker: '의뢰인 부부',
    defaultNext: 'ep2_photo',
    choices: [
      {
        text: '"따님이 가출한 이유가 있습니까?"',
        responseText: '부인이 먼저 말한다. "요즘 사춘기라... 친구 문제가 좀 있었어요." 남편이 말없이 고개를 끄덕인다.',
        impact: { flags: { ep2_question: 'reason' } },
      },
      {
        text: '"사진이 있습니까?"',
        responseText: '사진을 받는다. 밝게 웃고 있다. 하지만 눈이 조금 비어 있다.',
      },
      {
        text: '"마지막으로 딸을 본 곳은?"',
        responseText: '"집 앞 놀이터요. 학원 갔다 온 뒤로는..." 남자의 대답이 너무 매끄럽다.',
        impact: { flags: { ep2_question: 'last_seen' } },
      },
    ],
  },
  {
    id: 'ep2_photo',
    episodeId: 'ep2',
    narration: 'PC방, 친구 집, 번화가. 발품을 판다. 사흘째, 기찻길 옆 버려진 창고에서 아이를 찾는다. 열다섯 살. 혼자 쭈그리고 앉아 있다.',
    defaultNext: 'ep2_child',
    choices: [
      {
        text: '조심스럽게 다가간다',
        responseText: '아이가 움찔한다. 당신을 경계한다. "...누구세요."',
      },
    ],
  },
  {
    id: 'ep2_child',
    episodeId: 'ep2',
    narration: '아이는 한참을 침묵한다. 그러다 소매를 걷는다. 팔에 여러 겹의 멍. 오래된 것, 새로운 것. "...돌아가면, 또 그래요. 집보다 여기가 나아요."',
    speaker: '열다섯 살 — 지민',
    defaultNext: 'ep2_dilemma',
    choices: [
      {
        text: '"누가 그랬지?"',
        responseText: '"...아빠요. 엄마는 봐요. 그냥 봐요."',
        impact: { flags: { ep2_abuser: 'father', ep2_knows_truth: 'yes' } },
      },
      {
        text: '"부모님한테 얘기했어?"',
        responseText: '아이가 웃는다. 슬픈 웃음이다. "...엄마가 절 때린 날도 있어요."',
        impact: { flags: { ep2_abuser: 'both', ep2_knows_truth: 'yes' } },
      },
      {
        text: '말없이 초코바를 건넨다',
        responseText: '아이가 한참을 바라보다 받는다. 한 입을 먹고 무너진다.',
        impact: { flags: { ep2_knows_truth: 'yes' }, honesty: 0, intervention: 1 },
      },
    ],
  },
  {
    id: 'ep2_dilemma',
    episodeId: 'ep2',
    isBranch: true,
    narration: '아이는 당신의 결정을 기다린다. 선택의 무게가 명확하다. 신고하면 시설. 친척 집에 부탁하면 불확실한 도피. 부모에게 돌려보내면 처음과 같다. 그리고 이미 봉투는 받았다.',
    defaultNext: 'ep2_end',
    choices: [
      {
        text: '경찰/아동보호기관에 신고한다',
        responseText: '절차가 시작된다. 아이는 일시 보호시설로 간다. 표정이 무너진다. "...이제 못 나올 거에요."',
        impact: {
          honesty: 2,
          intervention: 1,
          flags: { ep2_outcome: 'report' },
        },
        endsEpisode: true,
      },
      {
        text: '아이의 친척(이모)에게 먼저 연락한다',
        responseText: '이모가 달려온다. 눈물 없이 아이를 꼭 안는다. "미안하다, 미안하다." 법적으로는 회색지대. 당신은 보고서를 조작한다.',
        impact: {
          honesty: 1,
          intervention: 1,
          flags: { ep2_outcome: 'relative' },
        },
        endsEpisode: true,
      },
      {
        text: '의뢰인 부부에게 돌려보낸다',
        responseText: '아이가 말없이 차에 오른다. 뒷자리에서 당신을 오래 바라본다. 그 눈빛을 기억할 것이다.',
        impact: {
          silence: 2,
          flags: { ep2_outcome: 'cover' },
        },
        endsEpisode: true,
      },
      {
        text: '(잠금) 조 형사에게 내부 제보한다',
        requireFlag: { key: 'ep1_outcome', equals: 'told' },
        lockReason: '조 형사와의 신뢰가 부족하다',
        responseText: '조 형사는 말없이 듣는다. "...확증이 있으시면 맡기시죠." 그가 직접 움직인다.',
        impact: {
          honesty: 2,
          intervention: 2,
          flags: { ep2_outcome: 'tipoff' },
        },
        endsEpisode: true,
      },
    ],
  },
  {
    id: 'ep2_end',
    episodeId: 'ep2',
    narration: '사무실로 돌아온다. 봉투가 책상에 놓여 있다. 당신은 한참을 보고 있다.',
    defaultNext: '',
    choices: [
      { text: '(에피소드를 마친다)', endsEpisode: true },
    ],
  },
];
