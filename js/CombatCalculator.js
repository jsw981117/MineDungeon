class CombatCalculator {
  // 방어력 피해 감소율 계산 (쌍곡선 공식)
  static calculateDamageReduction(defense) {
    return 80 * (defense / (defense + 50));
  }

  // 메인 피해 계산
  static calculateDamage(attacker, defender, options = {}) {
    const {
      isAmbush = false,        // 기습 여부
      isMagic = false,         // 마법 공격 여부
      ignoreDefense = false    // 방어력 무시 여부
    } = options;

    // 1단계: 기본 피해
    let baseDamage = isMagic ? attacker.magic : attacker.attack;

    // 2단계: 방어력 적용
    let damage = baseDamage;
    if (!ignoreDefense && defender.defense > 0) {
      const reductionPercent = this.calculateDamageReduction(defender.defense);
      damage = baseDamage * (1 - reductionPercent / 100);
    }

    // 최소 1 피해 보장
    damage = Math.max(1, damage);

    // 3단계: 변동 계수 (±10%)
    const variance = 0.9 + Math.random() * 0.2;
    damage *= variance;

    // 4단계: 회피 판정 (먼저 체크)
    if (Math.random() * 100 < defender.evasion) {
      return {
        damage: 0,
        isCrit: false,
        isEvaded: true,
        isAmbush: isAmbush
      };
    }

    // 5단계: 치명타 판정
    let isCrit = false;
    if (Math.random() * 100 < attacker.critRate) {
      damage *= (attacker.critDamage / 100);
      isCrit = true;
    }

    // 6단계: 기습 보너스
    if (isAmbush) {
      damage *= 1.5;
    }

    // 최종: 반올림
    return {
      damage: Math.floor(damage),
      isCrit: isCrit,
      isEvaded: false,
      isAmbush: isAmbush
    };
  }

  // 플레이어가 적을 공격
  static playerAttackEnemy(player, enemy) {
    return this.calculateDamage(player, enemy, { isMagic: false });
  }

  // 적이 플레이어를 공격
  static enemyAttackPlayer(enemy, player, isAmbush = false) {
    return this.calculateDamage(enemy, player, { isAmbush: isAmbush });
  }

  // 마법 공격
  static magicAttack(attacker, defender) {
    return this.calculateDamage(attacker, defender, { isMagic: true });
  }
}
