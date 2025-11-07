const ENEMIES_DATA = [
  {
    id: 'goblin',
    name: '고블린',
    type: 'enemy',
    hp: 3,
    attack: 1,
    defense: 0,
    durability: 4,
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
    durability: 3,
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
    durability: 5,
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
    durability: 3,
    expReward: 60,
    critRate: 10,
    evasion: 5,
    effect: 'poison_attack'
  },
  {
    id: 'bomb_rat',
    name: '폭탄쥐',
    type: 'enemy',
    hp: 3,
    attack: 1,
    defense: 0,
    durability: 4,
    expReward: 40,
    effect: 'bomb_death'
  },
  {
    id: 'flame_mage',
    name: '화염 마법사',
    type: 'enemy',
    hp: 4,
    attack: 1,
    defense: 0,
    durability: 3,
    expReward: 50,
    effect: 'burn_attack'
  }
];
