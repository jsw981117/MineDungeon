const ENEMIES_DATA = [
  {
    id: 'goblin',
    name: '고블린',
    type: 'enemy',
    hp: 20,
    attack: 3,
    defense: 0,
    durability: 4,
    expReward: 30,
    effect: null,
    description: '가장 흔한 몬스터. 약하지만 내구도가 높아 여러 층에 등장한다.'
  },
  {
    id: 'orc',
    name: '오크',
    type: 'enemy',
    hp: 35,
    attack: 6,
    defense: 3,
    durability: 3,
    expReward: 50,
    effect: null,
    description: '높은 체력과 방어력을 지닌 전사. 강력하지만 내구도가 낮다.'
  },
  {
    id: 'slime',
    name: '슬라임',
    type: 'enemy',
    hp: 15,
    attack: 3,
    defense: 0,
    durability: 5,
    expReward: 20,
    effect: 'split_on_death',
    description: '사망 시 분열하는 젤리 몬스터. 가장 높은 내구도를 가진다.'
  },
  {
    id: 'small_slime',
    name: '작은 슬라임',
    type: 'enemy',
    hp: 8,
    attack: 2,
    defense: 0,
    durability: 2,
    expReward: 10,
    effect: null,
    description: '분열된 슬라임. 약하지만 여전히 성가시다.'
  },
  {
    id: 'vampire',
    name: '뱀파이어',
    type: 'enemy',
    hp: 28,
    attack: 7,
    defense: 2,
    durability: 3,
    expReward: 60,
    critRate: 10,
    evasion: 5,
    effect: 'poison_attack',
    description: '공격 시 독2를 부여하는 흡혈귀. 치명타와 회피 능력을 가진다.'
  },
  {
    id: 'bomb_rat',
    name: '폭탄쥐',
    type: 'enemy',
    hp: 18,
    attack: 4,
    defense: 0,
    durability: 4,
    expReward: 40,
    effect: 'bomb_death',
    description: '사망 시 주변 3×3 영역을 폭파시키는 위험한 쥐.'
  },
  {
    id: 'flame_mage',
    name: '화염 마법사',
    type: 'enemy',
    hp: 22,
    attack: 9,
    defense: 0,
    durability: 3,
    expReward: 50,
    effect: 'burn_attack',
    description: '공격 시 화상3을 부여하는 마법사. 낮은 공격력이지만 위험하다.'
  }
];
