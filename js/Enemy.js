class Enemy extends Piece {
  constructor(data) {
    super(data);
    this.hp = data.hp;
    this.maxHp = data.hp;
  }

  interact(player, game) {
    // 전투 발생
    if (this.effect) {
      EffectHandler.apply(this.effect, this, { player, game, event: 'on_combat' });
    }

    // 적 체력 감소
    this.hp -= player.getAttack();

    if (this.hp <= 0) {
      // 적 사망 처리
      if (this.effect) {
        EffectHandler.apply(this.effect, this, { player, game, event: 'on_death' });
      }
      return true; // 적 제거
    }

    // 플레이어 피해
    player.takeDamage(1);

    return false;
  }

  getHp() {
    return this.hp;
  }
}
