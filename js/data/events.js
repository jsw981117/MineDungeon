const EVENTS_DATA = [
  {
    id: 'stairs',
    name: '계단',
    type: 'event',
    effect: 'next_floor',
    choices: []
  },
  {
    id: 'shop',
    name: '상점',
    type: 'event',
    effect: 'shop',
    choices: []
  },
  {
    id: 'treasure',
    name: '보물상자',
    type: 'event',
    effect: null,
    choices: [
      {
        text: '아이템 획득',
        effect: 'gain_item'
      },
      {
        text: '무시',
        effect: null
      }
    ]
  }
];
