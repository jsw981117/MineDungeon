class Floor {
  constructor(level, board, settings) {
    this.level = level;
    this.board = board;
    this.settings = settings;
  }

  generate() {
    this.board.reset();

    const tiles = this.board.getTiles();
    shuffleArray(tiles);

    let tileIndex = 0;

    // 1단계: 적 배치 (설정값 기반)
    const enemyCount = this.settings.getEnemyCount();
    for (let i = 0; i < enemyCount; i++) {
      if (tileIndex >= tiles.length) break;

      const enemyData = {
        id: 'monster',
        name: '몬스터',
        type: 'enemy',
        hp: this.settings.getEnemyBaseHp() + (this.level - 1) * this.settings.getHpPerFloor(),
        attack: 2 + Math.floor((this.level - 1) / this.settings.getAttackPerFloors()),
        description: '기본 몬스터'
      };

      const enemy = new Enemy(enemyData);
      tiles[tileIndex].setPiece(enemy);
      tileIndex++;
    }

    // 2단계: 아이템 배치 (설정값 기반)
    const itemCount = this.settings.getItemCount();
    const itemPool = this.settings.getItems();

    for (let i = 0; i < itemCount; i++) {
      if (tileIndex >= tiles.length) break;
      if (itemPool.length === 0) break;

      // 랜덤 아이템 선택
      const randomItemData = itemPool[Math.floor(Math.random() * itemPool.length)];
      const item = new Item({...randomItemData, type: 'item'});
      tiles[tileIndex].setPiece(item);
      tileIndex++;
    }

    // 3단계: 이벤트 배치 (보물 상자, 생명의 샘, 대장간)
    const eventPool = [
      { id: 'treasure_chest', name: '보물 상자', type: 'event' },
      { id: 'fountain', name: '생명의 샘', type: 'event' },
      { id: 'forge', name: '대장간', type: 'event' }
    ];

    // 층마다 랜덤하게 1-2개의 이벤트 배치
    const eventCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < eventCount; i++) {
      if (tileIndex >= tiles.length) break;

      const randomEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
      const event = new Event({...randomEvent});
      tiles[tileIndex].setPiece(event);
      tileIndex++;
    }

    console.log(`Floor ${this.level} 생성: 적 ${enemyCount}, 아이템 ${itemCount}, 이벤트 ${eventCount}, 빈칸 ${tiles.length - tileIndex}`);

    // 4단계: 주변 적 개수 계산
    this.board.calculateAllAdjacentEnemies();

    // 5단계: 모든 타일에 블록 배치 (지뢰찾기처럼 숨김)
    for (const tile of tiles) {
      tile.setBlock(new Block());
    }
  }
}
