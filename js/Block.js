class Block {
  constructor() {
    this.explored = false;
    this.flagged = false;
  }

  explore() {
    this.explored = true;
  }

  isExplored() {
    return this.explored;
  }

  toggleFlag() {
    this.flagged = !this.flagged;
  }

  isFlagged() {
    return this.flagged;
  }
}
