export interface Clue {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const CLUES: Record<string, Clue> = {
  military_tag: {
    id: 'military_tag',
    name: '군번줄',
    description: '낡은 군번줄. 당신의 이름과 소속이 희미하게 새겨져 있다.',
    icon: '\uD83C\uDFF7\uFE0F',
  },
  raider_symbol: {
    id: 'raider_symbol',
    name: '약탈자 기호',
    description: '벽에 새겨진 이상한 기호. 약탈자의 것과는 다르다.',
    icon: '\uD83D\uDD23',
  },
  old_photo: {
    id: 'old_photo',
    name: '낡은 사진',
    description: '바랜 사진 속에 웃고 있는 군인들. 그 중 하나가 칸을 닮았다.',
    icon: '\uD83D\uDDBC\uFE0F',
  },
  secret_passage: {
    id: 'secret_passage',
    name: '비밀 통로',
    description: '루카가 알려준 약탈자 캠프로 이어지는 지하 통로.',
    icon: '\uD83D\uDEE4\uFE0F',
  },
  kan_letter: {
    id: 'kan_letter',
    name: '칸의 편지',
    description: '"전우에게" 로 시작하는 편지. 글씨가 떨린다.',
    icon: '\u2709\uFE0F',
  },
  medicine_recipe: {
    id: 'medicine_recipe',
    name: '약초 조합법',
    description: '폐허에서 찾은 메모. 주변 약초로 치료제를 만들 수 있다.',
    icon: '\uD83C\uDF3F',
  },
};
