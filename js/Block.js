class Block {
  constructor() {
    this.explored = false;
  }

  explore() {
    this.explored = true;
  }

  isExplored() {
    return this.explored;
  }
}
