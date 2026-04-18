import type { Scene } from './types';

export const finalScenes: Scene[] = [
  {
    id: 'final_open',
    episodeId: 'final',
    isFlashback: true,
    narration: '열다섯의 밤. 골목 끝에서 누군가 맞고 있었다. 당신은 그 자리에서 얼어붙었다. 나무 뒤로 숨었다. 누군가가 사라질 때까지 숨소리를 죽였다. 아침에 신문에서 이름을 보았다.',
    speaker: '10년 전',
    defaultNext: 'final_now',
    choices: [
      { text: '(기억을 지나간다)' },
    ],
  },
  {
    id: 'final_now',
    episodeId: 'final',
    narration: '오늘. 지역 신문에 큼직한 사진이 나와 있다. "시민 영웅, 장학 재단 출연." 사진 속 남자가 웃고 있다. 그 얼굴. 당신이 10년 동안 잊으려 했던 얼굴.',
    defaultNext: 'final_choice',
    choices: [
      {
        text: '신문을 접는다',
        responseText: '한참을 창밖을 본다. 손이 떨리지 않는다. 그것이 더 무섭다.',
      },
    ],
  },
  {
    id: 'final_choice',
    episodeId: 'final',
    isBranch: true,
    narration: '그는 지금 이 도시 어딘가에서 멀쩡히 살고 있다. 어쩌면 진짜로 좋은 사람이 되었을지도 모른다. 10년 전의 그 밤을 모르는 척하면서. 당신은 결정해야 한다.',
    defaultNext: 'final_end',
    choices: [
      {
        text: '경찰에 신고한다',
        responseText: '조 형사에게 모든 것을 털어놓는다. 그가 말없이 듣는다. "...늦었지만 시작해봅시다."',
        impact: {
          honesty: 3,
          flags: { final_outcome: 'report' },
        },
        endsEpisode: true,
      },
      {
        text: '그를 찾아가 마주한다',
        responseText: '카페에서 마주 앉는다. 그가 당신을 보고 멎는다. 10년 만에 모든 것이 제자리로 돌아온다. 그가 울음인지 웃음인지 모를 소리를 낸다.',
        impact: {
          intervention: 2,
          flags: { final_outcome: 'confront' },
        },
        endsEpisode: true,
      },
      {
        text: '조 형사에게 익명으로 제보한다',
        responseText: '증거를 복사해 봉투에 넣는다. 주소를 적고, 오래 들고 있다가 우체통에 넣는다. 이름은 쓰지 않는다.',
        impact: {
          honesty: 1,
          silence: 1,
          flags: { final_outcome: 'anonymous' },
        },
        endsEpisode: true,
      },
      {
        text: '아무것도 하지 않는다',
        responseText: '신문을 쓰레기통에 버린다. 10년간 그랬던 것처럼, 오늘도 그랬던 것처럼, 내일도 그럴 것이다.',
        impact: {
          silence: 3,
          flags: { final_outcome: 'nothing' },
        },
        endsEpisode: true,
      },
    ],
  },
  {
    id: 'final_end',
    episodeId: 'final',
    narration: '...',
    defaultNext: '',
    choices: [
      { text: '(결말을 확인한다)', endsEpisode: true },
    ],
  },
];
