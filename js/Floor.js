class Floor {
  constructor(level, board, deck) {
    this.level = level;
    this.board = board;
    this.deck = deck;
    this.minEmptyTiles = 10;
  }

  generate() {
    this.board.reset();
    this.deck.shuffle();

    const tiles = this.board.getTiles();
    shuffleArray(tiles);

    const totalTiles = tiles.length;
    const numEmpty = this.minEmptyTiles;
    const numPieces = totalTiles - numEmpty;

    // 피스 배치 (덱에서)
    let pieceIndex = 0;
    while (pieceIndex < numPieces && this.deck.size() > 0) {
      const piece = this.deck.draw();
      if (piece) {
        tiles[pieceIndex].setPiece(piece);
        pieceIndex++;
      }
    }

    // 이벤트 강제 배치 (계단)
    if (EVENTS_DATA && EVENTS_DATA.length > 0) {
      const stairEvent = new Event(EVENTS_DATA[0]);
      const emptyTile = tiles.find(t => !t.hasPiece());
      if (emptyTile) {
        emptyTile.setPiece(stairEvent);
      }
    }

    // 주변 적 개수 계산
    this.board.calculateAllAdjacentEnemies();

    // 모든 타일에 블럭 배치 (지뢰찾기처럼 숨김)
    for (const tile of tiles) {
      tile.setBlock(new Block());
    }
  }
}
