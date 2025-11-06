class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.piece = null;
    this.block = null;
  }

  setPiece(piece) {
    this.piece = piece;
  }

  removePiece() {
    this.piece = null;
  }

  setBlock(block) {
    this.block = block;
  }

  removeBlock() {
    this.block = null;
  }

  hasPiece() {
    return this.piece !== null;
  }

  hasBlock() {
    return this.block !== null;
  }

  isEmpty() {
    return !this.hasPiece() && !this.hasBlock();
  }
}
