const ENEMIES_DATA = [
  {
    id: 'goblin',
    name: '고블린',
    type: 'enemy',
    hp: 3,
    attack: 1,
    defense: 0,
    expReward: 30,
    effect: null
  },
  {
    id: 'orc',
    name: '오크',
    type: 'enemy',
    hp: 5,
    attack: 2,
    defense: 1,
    expReward: 50,
    effect: null
  },
  {
    id: 'slime',
    name: '슬라임',
    type: 'enemy',
    hp: 2,
    attack: 1,
    defense: 0,
    expReward: 20,
    effect: 'split_on_death'
  },
  {
    id: 'vampire',
    name: '뱀파이어',
    type: 'enemy',
    hp: 4,
    attack: 2,
    defense: 1,
    expReward: 60,
    critRate: 10,
    evasion: 5,
    effect: 'bleed_attack'
  }
];
