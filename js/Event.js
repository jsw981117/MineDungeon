class Event extends Piece {
  constructor(data) {
    super(data);
  }

  interact(player, game, tile = null) {
    switch (this.id) {
      case 'stair':
        game.nextFloor();
        return false; // 계단은 제거하지 않음
      case 'treasure_chest':
        return this.openTreasureChest(player, game);
      case 'fountain':
        return this.useFountain(player, game);
      case 'forge':
        return this.useForge(player, game);
      default:
        console.log(`${this.name} 상호작용`);
        return true;
    }
  }

  openTreasureChest(player, game) {
    // 황금 열쇠 확인
    let hasKey = false;
    let keySlotIndex = -1;

    for (let i = 0; i < player.inventory.length; i++) {
      const item = player.inventory[i];
      if (item && item.id === 'golden_key') {
        hasKey = true;
        keySlotIndex = i;
        break;
      }
    }

    if (!hasKey) {
      game.showMessage('황금 열쇠가 필요합니다!');
      return false; // 상자 그대로 유지
    }

    // 열쇠 소모
    player.inventory[keySlotIndex] = null;
    if (player.equippedSlot === keySlotIndex) {
      player.equippedSlot = null;
    }

    // 랜덤 아이템 지급
    const allItems = game.settings.getItems();
    const validItems = allItems.filter(item => item.id !== 'golden_key' && item.id !== 'health_potion');

    if (validItems.length > 0) {
      const randomItem = validItems[Math.floor(Math.random() * validItems.length)];
      const newItem = new Item({
        ...randomItem,
        type: 'item'
      });

      const added = player.addItem(newItem);
      if (added) {
        console.log(`보물 상자에서 ${newItem.name}을(를) 획득했습니다!`);
        game.showMessage(`${newItem.name} 획득!`);
      } else {
        console.log('인벤토리가 가득 차서 아이템을 받을 수 없습니다!');
        game.showMessage('인벤토리가 가득 찼습니다!');
      }
    }

    return true; // 상자 제거
  }

  useFountain(player, game) {
    player.heal(5);
    console.log('생명의 샘에서 HP 5 회복!');
    game.showMessage('HP +5');
    return true; // 샘 제거
  }

  useForge(player, game) {
    if (player.equippedSlot === null || !player.inventory[player.equippedSlot]) {
      game.showMessage('장착된 아이템이 없습니다!');
      return false; // 대장간 그대로 유지
    }

    const equippedItem = player.inventory[player.equippedSlot];
    equippedItem.durability = equippedItem.maxDurability;
    console.log(`대장간에서 ${equippedItem.name}의 내구도를 수리했습니다!`);
    game.showMessage(`${equippedItem.name} 수리 완료!`);
    return true; // 대장간 제거
  }
}
