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
    const totalTiles = tiles.length;
    const numBlocks = Math.floor(totalTiles * 0.6);
    const numEmpty = this.minEmptyTiles;
    const numPieces = totalTiles - numBlocks - numEmpty;

    // 블럭 배치
    for (let i = 0; i < numBlocks; i++) {
      tiles[i].setBlock(new Block());
    }

    // 피스 배치
    for (let i = numBlocks; i < numBlocks + numPieces && this.deck.size() > 0; i++) {
      const piece = this.deck.draw();
      if (piece) {
        tiles[i].setPiece(piece);
      }
    }

    // 이벤트 강제 배치 (계단)
    const emptyTile = tiles.find(t => !t.hasPiece() && !t.hasBlock());
    if (emptyTile && EVENTS_DATA && EVENTS_DATA.length > 0) {
      const stairEvent = new Event(EVENTS_DATA[0]);
      emptyTile.setPiece(stairEvent);
    }
  }
}
