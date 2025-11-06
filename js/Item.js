class Item extends Piece {
  constructor(data) {
    super(data);
    this.durability = data.durability;
    this.maxDurability = data.durability;
  }

  interact(player, game) {
    // 아이템 사용
    console.log(`${this.name} 사용!`);

    // 효과 적용
    if (this.effect) {
      EffectHandler.apply(this.effect, this, { player, game, event: 'on_use' });
    }

    // 내구도 감소
    this.durability--;
    if (this.durability <= 0) {
      game.deck.removeItem(this);
      console.log(`${this.name}이(가) 덱에서 제거되었습니다!`);
    }

    return true; // 타일에서 제거
  }

  use(player, game, target = null) {
    // interact()와 동일
    return this.interact(player, game);
  }

  getDurability() {
    return this.durability;
  }
}
