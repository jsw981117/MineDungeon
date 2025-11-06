class Player {
  constructor() {
    this.hp = 20;
    this.maxHp = 20;
    this.attack = 2;
    this.defense = 0;
    this.inventory = [];
    this.artifacts = [];
  }

  takeDamage(amount) {
    const damage = Math.max(0, amount - this.defense);
    this.hp = Math.max(0, this.hp - damage);
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addItem(item) {
    this.inventory.push(item);
  }

  removeItem(item) {
    const index = this.inventory.indexOf(item);
    if (index > -1) {
      this.inventory.splice(index, 1);
    }
  }

  addArtifact(artifact) {
    this.artifacts.push(artifact);
  }

  getAttack() {
    return this.attack;
  }

  getHp() {
    return this.hp;
  }

  getMaxHp() {
    return this.maxHp;
  }

  isDead() {
    return this.hp <= 0;
  }
}
