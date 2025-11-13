class Item extends Piece {
  constructor(data) {
    super(data);
    this.durability = data.durability;
    this.maxDurability = data.durability;
  }

  interact(player, game, tile = null) {
    // 아이템 사용
    console.log(`${this.name} 사용!`);

    // 효과 적용
    if (this.effect) {
      EffectHandler.apply(this.effect, this, { player, game, tile, event: 'on_use' });
    }

    // 적 사망 처리 (자동 타겟팅 아이템의 경우)
    if (game && game.board) {
      const allTiles = game.board.getTiles();
      allTiles.forEach(t => {
        if (t.hasPiece() && t.piece.type === 'enemy' && t.piece.hp <= 0) {
          const enemy = t.piece;
          console.log(`${enemy.name} 처치!`);

          // 사망 효과 발동
          if (enemy.effect) {
            EffectHandler.apply(enemy.effect, enemy, {
              player: player,
              game: game,
              tile: t,
              event: 'on_death'
            });
          }

          // 경험치 및 골드 획득
          player.gainExp(1);
          player.gold += 5; // 고정 5골드

          // 내구도 감소
          enemy.durability--;
          if (enemy.durability <= 0) {
            game.deck.removeEnemy(enemy);
            console.log(`${enemy.name}이(가) 덱에서 제거되었습니다!`);
          }

          // 타일에서 제거
          t.removePiece();

          // 주변 타일 숫자 업데이트
          game.board.updateAdjacentNumbers(t.x, t.y);
        }
      });

      // 레벨업 체크
      if (player.exp >= player.expToNext) {
        const leveledUp = player.levelUp();
        if (leveledUp && game.showLevelUpReward) {
          game.showLevelUpReward();
        }
      }
    }

    // 내구도 감소
    this.durability--;
    if (this.durability <= 0) {
      game.deck.removeItem(this);
      console.log(`${this.name}이(가) 덱에서 제거되었습니다!`);
    }

    return true; // 타일에서 제거
  }

  use(player, game, tile = null, target = null) {
    // interact()와 동일
    return this.interact(player, game, tile);
  }

  getDurability() {
    return this.durability;
  }
}
