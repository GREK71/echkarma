import type { Scene } from './types';

export const ep3Scenes: Scene[] = [
  {
    id: 'ep3_open',
    episodeId: 'ep3',
    narration: '변호사가 의뢰한다. "성폭행 사건으로 기소된 청년이 있습니다. 무죄입니다. 그런데 알리바이를 증명할 유일한 목격자가 있어요. 그 사람이 진술을 거부합니다. 찾아서 설득해주세요."',
    speaker: '의뢰인 — 변호사',
    defaultNext: 'ep3_partner_check',
    choices: [
      {
        text: '"왜 거부합니까?"',
        responseText: '"...그건 저도 모릅니다."',
      },
      {
        text: '"사례비는 충분합니까?"',
        responseText: '변호사가 봉투 두 장을 놓는다.',
        impact: { flags: { ep3_motive: 'money' } },
      },
      {
        text: '"의뢰 받겠습니다."',
        responseText: '변호사가 말없이 일어선다.',
      },
    ],
  },
  {
    id: 'ep3_partner',
    alias: 'ep3_partner_check',
    episodeId: 'ep3',
    narration: '사무실을 나서기 전, 오랜 파트너가 말한다. "...요즘 괜찮으세요?" 그녀의 눈이 당신을 살핀다.',
    speaker: '파트너 — 이주연',
    condition: (s) => s.flags['ep1_outcome'] === 'silent' || s.silenceCount >= 2,
    defaultNext: 'ep3_find_witness',
    choices: [
      {
        text: '"괜찮습니다."',
        responseText: '그녀가 고개를 젓는다. "...그때처럼 하실 건가요?" 당신의 손이 잠시 멎는다.',
        impact: { flags: { ep3_partner_said: 'yes' } },
      },
      {
        text: '"...무슨 뜻이지."',
        responseText: '"아뇨. 죄송해요." 그녀는 더 말하지 않는다.',
        impact: { flags: { ep3_partner_said: 'no' } },
      },
    ],
  },
  {
    id: 'ep3_partner_skip',
    alias: 'ep3_partner_check',
    episodeId: 'ep3',
    narration: '파트너가 조용히 인사한다. "조심히 다녀오세요."',
    speaker: '파트너 — 이주연',
    defaultNext: 'ep3_find_witness',
    choices: [
      { text: '고개를 끄덕인다' },
    ],
  },
  {
    id: 'ep3_find_witness',
    episodeId: 'ep3',
    narration: '목격자는 시장 구석 작은 가게를 운영한다. 당신을 보자 고개를 젓는다. "...저는 할 말이 없습니다. 돌아가세요."',
    speaker: '목격자 — 최영호',
    defaultNext: 'ep3_confront',
    choices: [
      {
        text: '"한 청년이 무기징역을 받을 수 있습니다."',
        responseText: '그가 손을 떨며 물컵을 쥔다. "...저는 그 자리에 없었던 게 아닙니다."',
      },
      {
        text: '"왜 말을 못 하시는 겁니까?"',
        responseText: '그가 오래 침묵한다. "...제가 그날 밤, 다른 것을 봤습니다. 제가 한 짓을요."',
        impact: { flags: { ep3_witness_secret: 'yes' } },
      },
    ],
  },
  {
    id: 'ep3_confront',
    episodeId: 'ep3',
    narration: '목격자는 조용히 말한다. "저는 그날 밤, 제 가게 물건을 불태우고 보험금을 탔습니다. 그 자리에 있었다고 증언하면, 저는 사기죄로 들어갑니다. 제 딸이 학교를 다니고 있습니다."',
    speaker: '최영호',
    isBranch: true,
    defaultNext: 'ep3_decision',
    choices: [
      { text: '(결정을 내린다)' },
    ],
  },
  {
    id: 'ep3_decision',
    episodeId: 'ep3',
    isBranch: true,
    narration: '무고한 청년과 이 남자. 둘 중 하나를 선택해야 한다. 혹은, 아무것도 하지 않는 쪽을 선택해야 한다.',
    defaultNext: 'ep3_end',
    choices: [
      {
        text: '증언을 강요한다 (사기 드러남)',
        responseText: '"선생님 선택입니다. 하지만 한 사람이 죽어가고 있습니다." 그가 오래 고개를 숙인다. "...알겠습니다."',
        impact: {
          honesty: 2,
          intervention: 1,
          flags: { ep3_outcome: 'force' },
        },
        endsEpisode: true,
      },
      {
        text: '목격자와 거래한다 (익명 증언 + 사기 덮기)',
        responseText: '변호사와 협상한다. 익명 서면 진술로 가는 길을 연다. 법적으로는 회색지대. 당신은 두 쪽 모두를 살린다. 반쯤.',
        impact: {
          intervention: 2,
          silence: 1,
          flags: { ep3_outcome: 'deal' },
        },
        endsEpisode: true,
      },
      {
        text: '의뢰를 포기한다',
        responseText: '변호사에게 전화한다. "목격자를 찾지 못했습니다." 전화 너머 긴 침묵. "...알겠습니다." 청년은 다음 주에 1심 선고를 받는다.',
        impact: {
          silence: 2,
          flags: { ep3_outcome: 'abandon' },
        },
        endsEpisode: true,
      },
    ],
  },
  {
    id: 'ep3_end',
    episodeId: 'ep3',
    narration: '밤이 깊다. 사무실 창으로 먼 곳의 불빛이 흔들린다. 잠이 오지 않는다.',
    defaultNext: '',
    choices: [
      { text: '(에피소드를 마친다)', endsEpisode: true },
    ],
  },
];
