class Enemy extends Piece {
  constructor(data) {
    super(data);
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.attack = data.attack || 1;
  }

  // 기습 공격 (블럭 제거 시 적 발견)
  ambush(player, game) {
    console.log(`${this.name}의 기습!`);

    // 적이 먼저 공격 (기습 ×1.5)
    const damage = Math.floor(this.attack * 1.5);
    player.takeDamage(damage);
    console.log(`${damage} 피해!`);

    return player.isDead();
  }

  // 플레이어 선공 (이미 밝혀진 적 클릭)
  playerAttack(player, game, tile = null) {
    console.log(`${this.name}에게 공격!`);

    // 플레이어가 먼저 공격
    const playerDamage = player.getAttack();
    this.hp = Math.max(0, this.hp - playerDamage);
    console.log(`${playerDamage} 피해!`);

    // 적 사망 체크
    if (this.hp <= 0) {
      console.log(`${this.name} 처치!`);

      // 주변 타일 숫자 업데이트
      if (tile && game.board) {
        game.board.updateAdjacentNumbers(tile.x, tile.y);
      }

      return true; // 타일에서 제거
    }

    // 적이 반격
    const enemyDamage = this.attack;
    player.takeDamage(enemyDamage);
    console.log(`${this.name}의 반격! ${enemyDamage} 피해!`);

    return false; // 적 생존
  }

  // 기존 interact는 playerAttack과 동일하게
  interact(player, game, tile = null) {
    return this.playerAttack(player, game, tile);
  }

  getHp() {
    return this.hp;
  }
}
