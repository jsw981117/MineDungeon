class Item extends Piece {
  constructor(data) {
    super(data);
    this.durability = data.durability;
    this.maxDurability = data.durability;
  }

  interact(player, game) {
    // 아이템 획득
    player.addItem(this);
    return true; // 피스 제거
  }

  use(player, game, target = null) {
    if (this.durability <= 0) return false;

    // 효과 적용
    if (this.effect) {
      EffectHandler.apply(this.effect, this, { player, game, target });
    }

    this.durability--;

    return this.durability > 0;
  }

  getDurability() {
    return this.durability;
  }
}
