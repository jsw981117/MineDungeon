class Floor {
  constructor(level, board, deck) {
    this.level = level;
    this.board = board;
    this.deck = deck;
    this.minEmptyRatio = 0.15; // 최소 15% 빈칸
  }

  generate() {
    this.board.reset();
    this.deck.shuffle();

    const tiles = this.board.getTiles();
    shuffleArray(tiles);

    const totalTiles = tiles.length;
    const minEmptyTiles = Math.ceil(totalTiles * this.minEmptyRatio);
    let tileIndex = 0;

    // 1단계: 이벤트 배치 (계단 필수)
    if (EVENTS_DATA && EVENTS_DATA.length > 0) {
      const stairEvent = new Event(EVENTS_DATA[0]);
      tiles[tileIndex].setPiece(stairEvent);
      tileIndex++;
    }

    // 2단계: 적 배치 (durability > 0, 최대 수 제한)
    const maxEnemies = Math.min(5 + this.level, 20);
    const availableEnemies = this.deck.getAllEnemies().filter(e => e.durability > 0);
    const enemiesToPlace = availableEnemies.slice(0, Math.min(maxEnemies, totalTiles - tileIndex - minEmptyTiles));

    for (const enemy of enemiesToPlace) {
      if (tileIndex >= totalTiles) break;

      // HP 스케일링 (baseHp + (level-1) * 5)
      enemy.maxHp = enemy.baseHp + (this.level - 1) * 5;
      enemy.hp = enemy.maxHp;

      // 적 인스턴스 직접 사용 (덱에서 제거하지 않음)
      tiles[tileIndex].setPiece(enemy);
      tileIndex++;
    }

    // 3단계: 아이템 배치 (durability > 0, 남은 공간에서 최소 빈칸 제외)
    const remainingTiles = totalTiles - tileIndex;
    const maxItemSlots = Math.max(0, remainingTiles - minEmptyTiles);

    const availableItems = this.deck.getAllItems().filter(i => i.durability > 0);
    const itemsToPlace = availableItems.slice(0, Math.min(maxItemSlots, availableItems.length));

    for (const item of itemsToPlace) {
      if (tileIndex >= totalTiles) break;
      // 아이템 인스턴스 직접 사용 (덱에서 제거하지 않음)
      tiles[tileIndex].setPiece(item);
      tileIndex++;
    }

    // 남은 타일은 빈칸으로 유지됨 (piece 없음)
    console.log(`Floor ${this.level} 생성: 이벤트 1, 적 ${enemiesToPlace.length}/${availableEnemies.length} (최대 ${maxEnemies}), 아이템 ${itemsToPlace.length}/${availableItems.length}, 빈칸 ${totalTiles - tileIndex}`);

    // 4단계: 주변 적 개수 계산
    this.board.calculateAllAdjacentEnemies();

    // 5단계: 모든 타일에 블럭 배치 (지뢰찾기처럼 숨김)
    for (const tile of tiles) {
      tile.setBlock(new Block());
    }
  }
}
