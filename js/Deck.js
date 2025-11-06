class Deck {
  constructor() {
    this.enemies = [];
    this.items = [];
  }

  addPiece(piece) {
    if (piece.type === 'enemy') {
      this.enemies.push(piece);
    } else if (piece.type === 'item') {
      this.items.push(piece);
    }
  }

  addEnemy(enemy) {
    this.enemies.push(enemy);
  }

  addItem(item) {
    this.items.push(item);
  }

  removePiece(piece) {
    if (piece.type === 'enemy') {
      const index = this.enemies.indexOf(piece);
      if (index > -1) {
        this.enemies.splice(index, 1);
      }
    } else if (piece.type === 'item') {
      const index = this.items.indexOf(piece);
      if (index > -1) {
        this.items.splice(index, 1);
      }
    }
  }

  shuffle() {
    // 적과 아이템을 각각 섞음
    for (let i = this.enemies.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.enemies[i], this.enemies[j]] = [this.enemies[j], this.enemies[i]];
    }
    for (let i = this.items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }
  }

  // 모든 적 반환 (복사본)
  getAllEnemies() {
    return [...this.enemies];
  }

  // 모든 아이템 반환 (복사본)
  getAllItems() {
    return [...this.items];
  }

  // 적 개수
  enemyCount() {
    return this.enemies.length;
  }

  // 아이템 개수
  itemCount() {
    return this.items.length;
  }

  // 적 제거 (배치 후)
  clearEnemies() {
    this.enemies = [];
  }

  // 아이템 n개 제거 (배치 후)
  removeItems(count) {
    this.items.splice(0, count);
  }

  // 레거시 메서드 (호환성)
  draw() {
    if (this.enemies.length > 0) return this.enemies.pop();
    if (this.items.length > 0) return this.items.pop();
    return null;
  }

  size() {
    return this.enemies.length + this.items.length;
  }

  clear() {
    this.enemies = [];
    this.items = [];
  }

  clone() {
    const newDeck = new Deck();
    this.enemies.forEach(enemy => {
      newDeck.addEnemy(new Enemy(enemy));
    });
    this.items.forEach(item => {
      newDeck.addItem(new Item(item));
    });
    return newDeck;
  }
}
