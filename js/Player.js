class Player {
  constructor() {
    // 기본 능력치
    this.hp = 20;
    this.maxHp = 20;
    this.mp = 10;
    this.maxMp = 10;

    // 공격 능력치
    this.attack = 2;
    this.magic = 0;

    // 방어 능력치
    this.defense = 0;

    // 전투 능력치
    this.critRate = 5;        // 치명타 확률 (%)
    this.critDamage = 150;     // 치명타 피해량 (%)
    this.evasion = 0;          // 회피율 (%)

    // 성장 시스템
    this.level = 1;
    this.exp = 0;
    this.expToNext = 100;

    // 인벤토리
    this.inventory = [];
    this.artifacts = [];

    // 영구/일시 능력치 구분
    this.permanentStats = {};
    this.temporaryStats = {};
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

  // MP 관리
  useMp(amount) {
    if (this.mp >= amount) {
      this.mp -= amount;
      return true;
    }
    return false;
  }

  restoreMp(amount) {
    this.mp = Math.min(this.maxMp, this.mp + amount);
  }

  // 경험치 & 레벨업
  gainExp(amount) {
    this.exp += amount;
    if (this.exp >= this.expToNext) {
      return this.levelUp();
    }
    return false;
  }

  levelUp() {
    this.level++;
    this.exp -= this.expToNext;
    this.expToNext = Math.floor(this.expToNext * 1.5);
    return true;
  }

  // 영구 능력치 증가
  increasePermanent(stat, amount) {
    if (this.hasOwnProperty(stat)) {
      this[stat] += amount;
      this.permanentStats[stat] = (this.permanentStats[stat] || 0) + amount;
    }
  }

  // 일시 능력치 적용 (추후 턴 시스템과 연동)
  applyTemporary(stat, amount, duration) {
    if (!this.temporaryStats[stat]) {
      this.temporaryStats[stat] = [];
    }
    this.temporaryStats[stat].push({ amount, duration });
    if (this.hasOwnProperty(stat)) {
      this[stat] += amount;
    }
  }

  // Getter 메서드
  getMp() {
    return this.mp;
  }

  getMaxMp() {
    return this.maxMp;
  }

  getLevel() {
    return this.level;
  }

  getExp() {
    return this.exp;
  }

  getExpToNext() {
    return this.expToNext;
  }
}
