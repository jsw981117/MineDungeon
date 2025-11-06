class EffectHandler {
  static apply(effectId, source, context) {
    if (!effectId) return;

    const { player, game, target, event } = context;

    switch (effectId) {
      // 전투 효과
      case 'damage_1':
        if (target) target.hp -= 1;
        break;

      case 'damage_2':
        if (target) target.hp -= 2;
        break;

      case 'bleed_attack':
        if (event === 'on_combat' && player) {
          player.takeDamage(2);
        }
        break;

      // 아이템 효과
      case 'heal_3':
        if (player) player.heal(3);
        break;

      case 'heal_5':
        if (player) player.heal(5);
        break;

      case 'attack_boost':
        if (player) player.attack += 1;
        break;

      // 적 사망 효과
      case 'split_on_death':
        if (event === 'on_death' && game) {
          // 분열 로직 (간단히 구현)
          console.log('Enemy splits!');
        }
        break;

      // 이벤트 효과
      case 'next_floor':
        if (game) {
          game.nextFloor();
        }
        break;

      case 'shop':
        if (game) {
          game.showShop();
        }
        break;

      // 선택지 효과
      case 'gain_artifact':
        if (player && context.artifactData) {
          player.addArtifact(new Artifact(context.artifactData));
        }
        break;

      case 'gain_item':
        if (player && context.itemData) {
          player.addItem(new Item(context.itemData));
        }
        break;

      default:
        console.warn(`Unknown effect: ${effectId}`);
    }
  }
}
