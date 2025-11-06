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

    // 2단계: 덱의 모든 적 배치 (100%)
    const enemies = this.deck.getAllEnemies();
    for (const enemy of enemies) {
      if (tileIndex >= totalTiles) {
        console.warn('타일 부족: 모든 적을 배치할 수 없음');
        break;
      }
      // 적 인스턴스 직접 사용
      tiles[tileIndex].setPiece(enemy);
      tileIndex++;
    }
    this.deck.clearEnemies(); // 배치 완료한 적 제거

    // 3단계: 아이템 배치 (남은 공간에서 최소 빈칸 제외)
    const remainingTiles = totalTiles - tileIndex;
    const maxItemSlots = Math.max(0, remainingTiles - minEmptyTiles);

    const items = this.deck.getAllItems();
    const itemsToPlace = Math.min(maxItemSlots, items.length);

    for (let i = 0; i < itemsToPlace; i++) {
      if (tileIndex >= totalTiles) break;
      // 아이템 인스턴스 직접 사용
      tiles[tileIndex].setPiece(items[i]);
      tileIndex++;
    }

    // 배치한 아이템만 덱에서 제거 (나머지는 다음 층으로 이월)
    this.deck.removeItems(itemsToPlace);

    // 남은 타일은 빈칸으로 유지됨 (piece 없음)
    console.log(`Floor ${this.level} 생성: 이벤트 1, 적 ${enemies.length}, 아이템 ${itemsToPlace}/${items.length}, 빈칸 ${totalTiles - tileIndex}`);

    // 4단계: 주변 적 개수 계산
    this.board.calculateAllAdjacentEnemies();

    // 5단계: 모든 타일에 블럭 배치 (지뢰찾기처럼 숨김)
    for (const tile of tiles) {
      tile.setBlock(new Block());
    }
  }
}
