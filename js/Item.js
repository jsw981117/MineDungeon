class Item extends Piece {
  constructor(data) {
    super(data);
    this.attack = data.attack || 0;
    this.durability = data.durability || 1;
    this.maxDurability = data.durability || 1;
    this.usable = data.usable || false;
    this.equippable = data.equippable !== undefined ? data.equippable : true;
    this.effect = data.effect || null;
    this.effectValue = data.effectValue || 0;
    this.isShield = data.isShield || false;
    this.isVampiric = data.isVampiric || false;
  }

  interact(player, game, tile = null) {
    // 아이템 획득 - 인벤토리에 추가
    console.log(`${this.name} 획득!`);

    const added = player.addItem(this);
    if (!added) {
      console.log('인벤토리가 가득 찼습니다!');
      return false; // 타일에서 제거하지 않음
    }

    return true; // 타일에서 제거
  }

  use(player) {
    if (!this.usable) return false;

    switch (this.effect) {
      case 'heal':
        player.heal(this.effectValue);
        console.log(`${this.name} 사용! HP ${this.effectValue} 회복`);
        break;
      case 'discard':
        console.log(`${this.name}을(를) 버렸습니다.`);
        break;
      default:
        return false;
    }

    // 내구도 감소
    this.durability--;
    return true;
  }

  getDurability() {
    return this.durability;
  }

  isUsable() {
    return this.usable;
  }

  isEquippable() {
    return this.equippable;
  }
}
