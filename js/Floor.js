class Floor {
  constructor(level, board) {
    this.level = level;
    this.board = board;
  }

  generate() {
    this.board.reset();

    const tiles = this.board.getTiles();
    shuffleArray(tiles);

    let tileIndex = 0;

    // 1단계: 계단 배치 (1개)
    const stairData = { id: 'stair', name: '계단', type: 'event', description: '다음 층으로' };
    const stairEvent = new Event(stairData);
    tiles[tileIndex].setPiece(stairEvent);
    tileIndex++;

    // 2단계: 적 배치 (10개)
    const enemyCount = 10;
    for (let i = 0; i < enemyCount; i++) {
      if (tileIndex >= tiles.length) break;

      const enemyData = {
        id: 'monster',
        name: '몬스터',
        type: 'enemy',
        hp: 10 + (this.level - 1) * 2,  // 층마다 체력 +2
        attack: 2 + Math.floor((this.level - 1) / 2),  // 2층마다 공격력 +1
        description: '기본 몬스터'
      };

      const enemy = new Enemy(enemyData);
      tiles[tileIndex].setPiece(enemy);
      tileIndex++;
    }

    // 3단계: 아이템 배치 (3-5개 랜덤)
    const itemCount = 3 + Math.floor(Math.random() * 3); // 3-5개
    for (let i = 0; i < itemCount; i++) {
      if (tileIndex >= tiles.length) break;

      // 랜덤 아이템 선택
      const randomItemData = ITEMS_DATA[Math.floor(Math.random() * ITEMS_DATA.length)];
      const item = new Item({...randomItemData});
      tiles[tileIndex].setPiece(item);
      tileIndex++;
    }

    console.log(`Floor ${this.level} 생성: 계단 1, 적 ${enemyCount}, 아이템 ${itemCount}, 빈칸 ${tiles.length - tileIndex}`);

    // 4단계: 주변 적 개수 계산
    this.board.calculateAllAdjacentEnemies();

    // 5단계: 모든 타일에 블럭 배치 (지뢰찾기처럼 숨김)
    for (const tile of tiles) {
      tile.setBlock(new Block());
    }
  }
}
