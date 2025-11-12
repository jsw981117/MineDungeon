class Piece {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.effect = data.effect || null;
    this.description = data.description || null;
  }

  interact(player, game) {
    // 하위 클래스에서 구현
  }

  getType() {
    return this.type;
  }
}
