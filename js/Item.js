class Item extends Piece {
  constructor(data) {
    super(data);
    this.attack = data.attack || 0;
    this.durability = data.durability || 1;
    this.maxDurability = data.durability || 1;
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

  getDurability() {
    return this.durability;
  }
}
