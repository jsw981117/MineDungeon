class Deck {
  constructor() {
    this.pieces = [];
  }

  addPiece(piece) {
    this.pieces.push(piece);
  }

  removePiece(piece) {
    const index = this.pieces.indexOf(piece);
    if (index > -1) {
      this.pieces.splice(index, 1);
    }
  }

  shuffle() {
    for (let i = this.pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pieces[i], this.pieces[j]] = [this.pieces[j], this.pieces[i]];
    }
  }

  draw() {
    return this.pieces.pop();
  }

  size() {
    return this.pieces.length;
  }

  clear() {
    this.pieces = [];
  }

  clone() {
    const newDeck = new Deck();
    this.pieces.forEach(piece => {
      if (piece.type === 'enemy') {
        newDeck.addPiece(new Enemy(piece));
      } else if (piece.type === 'item') {
        newDeck.addPiece(new Item(piece));
      }
    });
    return newDeck;
  }
}
