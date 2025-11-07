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
    this.expToNext = 3;

    // 인벤토리
    this.inventory = [];
    this.artifacts = [];

    // 영구/일시 능력치 구분
    this.permanentStats = {};
    this.temporaryStats = {};

    // 상태 효과 (키워드)
    this.statusEffects = {}; // { poison: 3, burn: 2, freeze: true }

    // 층 단위 임시 버프
    this.floorBuffs = []; // [{ stat: 'attack', value: 2 }, ...]
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
    if (this.exp >= this.expToNext) {
      this.level++;
      this.exp = 0; // 경험치 리셋
      this.expToNext = 3 + (this.level - 1); // 3, 4, 5, 6...
      return true;
    }
    return false;
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

  // 상태 효과 관리
  addStatusEffect(keyword, value = 1) {
    if (KEYWORDS_DATA[keyword].stackable && KEYWORDS_DATA[keyword].hasValue) {
      // 중첩 가능하고 값이 있는 경우 (독, 화상)
      this.statusEffects[keyword] = (this.statusEffects[keyword] || 0) + value;
    } else {
      // 중첩 불가능한 경우 (빙결)
      this.statusEffects[keyword] = true;
    }
  }

  removeStatusEffect(keyword) {
    delete this.statusEffects[keyword];
  }

  hasStatusEffect(keyword) {
    return !!this.statusEffects[keyword];
  }

  getStatusEffect(keyword) {
    return this.statusEffects[keyword];
  }

  decreaseStatusEffect(keyword, amount = 1) {
    if (this.statusEffects[keyword]) {
      if (typeof this.statusEffects[keyword] === 'number') {
        this.statusEffects[keyword] -= amount;
        if (this.statusEffects[keyword] <= 0) {
          delete this.statusEffects[keyword];
        }
      }
    }
  }

  // 층 단위 임시 버프
  applyFloorBuff(stat, value) {
    this[stat] += value;
    this.floorBuffs.push({ stat, value });
  }

  clearFloorBuffs() {
    this.floorBuffs.forEach(buff => {
      this[buff.stat] -= buff.value;
    });
    this.floorBuffs = [];
  }
}
