class Board {
  constructor(width = 8, height = 8) {
    this.width = width;
    this.height = height;
    this.tiles = [];
    this.init();
  }

  init() {
    this.tiles = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(new Tile(x, y));
      }
      this.tiles.push(row);
    }
  }

  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.tiles[y][x];
  }

  getTiles() {
    return this.tiles.flat();
  }

  reset() {
    this.init();
  }

  exploreBlock(x, y) {
    const tile = this.getTile(x, y);
    if (tile && tile.hasBlock()) {
      tile.removeBlock();
      return true;
    }
    return false;
  }
}
