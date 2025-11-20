class Player {
  constructor(settings) {
    // 기본 능력치
    this.hp = settings.getPlayerInitialHp();
    this.attack = settings.getPlayerAttack();

    // 인벤토리 (4칸)
    this.inventory = [null, null, null, null];
    this.equippedSlot = null; // 현재 장착 중인 슬롯 인덱스 (0-3, null이면 미장착)
  }

  takeDamage(amount) {
    // 아이템이 장착되어 있으면 내구도가 먼저 깎임
    if (this.equippedSlot !== null && this.inventory[this.equippedSlot]) {
      const equippedItem = this.inventory[this.equippedSlot];
      const slotIndex = this.equippedSlot;
      equippedItem.durability -= amount;

      if (equippedItem.durability <= 0) {
        // 아이템 파괴 - 애니메이션용 정보 반환
        console.log(`${equippedItem.name}이(가) 파괴되었습니다!`);
        const brokenItem = { ...equippedItem }; // 복사
        this.inventory[this.equippedSlot] = null;
        this.equippedSlot = null;
        return { broken: true, slotIndex, item: brokenItem };
      }
    } else {
      // 아이템 미장착 시 체력이 깎임
      this.hp = Math.max(0, this.hp - amount);
    }
    return null;
  }

  heal(amount) {
    this.hp += amount;
  }

  addItem(item) {
    // 빈 슬롯에 아이템 추가
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i] === null) {
        this.inventory[i] = item;
        return true;
      }
    }
    return false; // 인벤토리 풀
  }

  equipItem(slotIndex) {
    if (slotIndex >= 0 && slotIndex < this.inventory.length && this.inventory[slotIndex]) {
      const item = this.inventory[slotIndex];

      // 장착 불가능한 아이템은 무시
      if (!item.isEquippable()) {
        return;
      }

      // 이미 장착된 슬롯을 다시 클릭하면 해제
      if (this.equippedSlot === slotIndex) {
        this.equippedSlot = null;
      } else {
        this.equippedSlot = slotIndex;
      }
    }
  }

  useItem(slotIndex) {
    if (slotIndex >= 0 && slotIndex < this.inventory.length && this.inventory[slotIndex]) {
      const item = this.inventory[slotIndex];

      // 사용 불가능한 아이템은 무시
      if (!item.isUsable()) {
        return false;
      }

      // 아이템 사용
      const used = item.use(this);
      if (!used) {
        return false;
      }

      // 내구도가 0이 되면 아이템 제거
      if (item.durability <= 0) {
        this.inventory[slotIndex] = null;
        // 장착 중이었으면 장착 해제
        if (this.equippedSlot === slotIndex) {
          this.equippedSlot = null;
        }
      }

      return true;
    }
    return false;
  }

  getAttack() {
    let totalAttack = this.attack;
    // 장착된 아이템의 공격력 추가
    if (this.equippedSlot !== null && this.inventory[this.equippedSlot]) {
      totalAttack += this.inventory[this.equippedSlot].attack;
    }
    return totalAttack;
  }

  getHp() {
    return this.hp;
  }

  isDead() {
    return this.hp <= 0;
  }
}
