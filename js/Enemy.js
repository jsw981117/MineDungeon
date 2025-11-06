class Enemy extends Piece {
  constructor(data) {
    super(data);
    this.hp = data.hp;
    this.maxHp = data.hp;
    this.attack = data.attack || 1;
    this.defense = data.defense || 0;
    this.expReward = data.expReward || (this.maxHp * 10);

    // 선택적 능력치 (강한 적용)
    this.critRate = data.critRate || 0;
    this.critDamage = data.critDamage || 150;
    this.evasion = data.evasion || 0;
  }

  // 기습 공격 (블럭 제거 시 적 발견)
  ambush(player, game) {
    console.log(`${this.name}의 기습!`);

    // 적이 먼저 공격 (기습 ×1.5)
    const result = CombatCalculator.enemyAttackPlayer(this, player, true);

    if (result.isEvaded) {
      console.log('회피!');
    } else {
      player.hp = Math.max(0, player.hp - result.damage);
      if (result.isCrit) console.log(`치명타! ${result.damage} 피해!`);
      else console.log(`${result.damage} 피해!`);
    }

    // 전투 효과
    if (this.effect) {
      EffectHandler.apply(this.effect, this, { player, game, event: 'on_combat' });
    }

    return player.isDead();
  }

  // 플레이어 선공 (이미 밝혀진 적 클릭)
  playerAttack(player, game) {
    console.log(`${this.name}에게 공격!`);

    // 플레이어가 먼저 공격
    const playerResult = CombatCalculator.playerAttackEnemy(player, this);

    if (playerResult.isEvaded) {
      console.log('적이 회피!');
    } else {
      this.hp = Math.max(0, this.hp - playerResult.damage);
      if (playerResult.isCrit) console.log(`치명타! ${playerResult.damage} 피해!`);
      else console.log(`${playerResult.damage} 피해!`);
    }

    // 적 사망 체크
    if (this.hp <= 0) {
      console.log(`${this.name} 처치!`);
      if (this.effect) {
        EffectHandler.apply(this.effect, this, { player, game, event: 'on_death' });
      }

      // 경험치 획득
      player.gainExp(this.expReward);

      return true; // 적 제거
    }

    // 적이 반격
    const enemyResult = CombatCalculator.enemyAttackPlayer(this, player, false);

    if (enemyResult.isEvaded) {
      console.log('회피!');
    } else {
      player.hp = Math.max(0, player.hp - enemyResult.damage);
      if (enemyResult.isCrit) console.log(`${this.name}의 치명타! ${enemyResult.damage} 피해!`);
      else console.log(`${this.name}의 반격! ${enemyResult.damage} 피해!`);
    }

    return false; // 적 생존
  }

  // 기존 interact는 playerAttack과 동일하게
  interact(player, game) {
    return this.playerAttack(player, game);
  }

  getHp() {
    return this.hp;
  }
}
