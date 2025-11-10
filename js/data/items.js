const ITEMS_DATA = [
  // 공격 아이템 (층 버프)
  {
    id: 'sword',
    name: '검',
    type: 'item',
    durability: 3,
    effect: 'attack_buff_2',
    description: '이번 층에서 공격력 +5'
  },

  // 공격 아이템 (타겟팅)
  {
    id: 'bow',
    name: '활',
    type: 'item',
    durability: 3,
    effect: 'bow_attack',
    description: '공개된 적 하나에게 피해'
  },

  {
    id: 'magic_staff',
    name: '마법 지팡이',
    type: 'item',
    durability: 3,
    effect: 'staff_attack',
    description: '열/행 전체 공격'
  },

  {
    id: 'bomb',
    name: '폭탄',
    type: 'item',
    durability: 2,
    effect: 'bomb_attack',
    description: '3×3 영역의 블록과 아이템을 파괴'
  },

  // 키워드 아이템
  {
    id: 'poison_dagger',
    name: '독 단검',
    type: 'item',
    durability: 3,
    effect: 'poison_apply_3',
    description: '공개된 적에게 독3 부여'
  },

  {
    id: 'fire_bottle',
    name: '화염병',
    type: 'item',
    durability: 3,
    effect: 'burn_apply_4',
    description: '공개된 적에게 화상4 부여'
  },

  {
    id: 'freeze_potion',
    name: '빙결 물약',
    type: 'item',
    durability: 2,
    effect: 'freeze_apply',
    description: '공개된 적에게 빙결 부여'
  },

  // 지원 아이템
  {
    id: 'healing_potion',
    name: '회복 물약',
    type: 'item',
    durability: 3,
    effect: 'heal_5',
    description: 'HP 25 회복'
  },

  {
    id: 'mana_potion',
    name: '마나 물약',
    type: 'item',
    durability: 3,
    effect: 'mana_restore_5',
    description: 'MP 15 회복'
  },

  {
    id: 'antidote',
    name: '해독제',
    type: 'item',
    durability: 2,
    effect: 'remove_poison',
    description: '독 상태 제거'
  }
];
