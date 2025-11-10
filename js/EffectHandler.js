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

      case 'poison_attack':
        if (event === 'on_combat' && player) {
          player.addStatusEffect('poison', 2);
          console.log('독 2 부여됨!');
        }
        break;

      case 'burn_attack':
        if (event === 'on_combat' && player) {
          player.addStatusEffect('burn', 3);
          console.log('화상 3 부여됨!');
        }
        break;

      // 아이템 효과 - 회복
      case 'heal_3':
        if (player) player.heal(3);
        break;

      case 'heal_5':
        if (player) player.heal(25);
        break;

      case 'mana_restore_5':
        if (player) player.restoreMp(15);
        break;

      // 아이템 효과 - 버프
      case 'attack_boost':
        if (player) player.attack += 1;
        break;

      case 'attack_buff_2':
        if (player) {
          player.applyFloorBuff('attack', 5);
          console.log('이번 층에서 공격력 +5!');
        }
        break;

      // 아이템 효과 - 키워드 부여
      case 'poison_apply_3':
        if (target && target.type === 'enemy') {
          target.addStatusEffect('poison', 3);
          console.log(`${target.name}에게 독 3 부여!`);
        }
        break;

      case 'burn_apply_4':
        if (target && target.type === 'enemy') {
          target.addStatusEffect('burn', 4);
          console.log(`${target.name}에게 화상 4 부여!`);
        }
        break;

      case 'freeze_apply':
        if (target && target.type === 'enemy') {
          target.addStatusEffect('freeze');
          console.log(`${target.name}에게 빙결 부여!`);
        }
        break;

      case 'remove_poison':
        if (player) {
          player.removeStatusEffect('poison');
          console.log('독 제거됨!');
        }
        break;

      // 아이템 효과 - 공격 아이템
      case 'bow_attack':
        // 공개된 적 하나에게 피해 (타겟 선택 필요)
        if (target && target.type === 'enemy') {
          const damage = player.getAttack();
          target.hp -= damage;
          console.log(`${target.name}에게 ${damage} 피해!`);
        }
        break;

      case 'staff_attack':
        // 열/행 전체 공격 (타겟 선택 필요)
        if (context.targets && player) {
          const damage = Math.floor(player.magic * 1.5);
          context.targets.forEach(t => {
            if (t.type === 'enemy') {
              t.hp -= damage;
              console.log(`${t.name}에게 ${damage} 피해!`);
            }
          });
        }
        break;

      case 'bomb_attack':
        // 3×3 영역의 블록과 아이템 파괴
        if (context.tile && game) {
          const row = context.tile.row;
          const col = context.tile.col;
          const board = game.board;

          for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
              const tile = board.getTile(r, c);
              if (tile) {
                if (tile.hasBlock()) {
                  tile.removeBlock();
                }
                if (tile.hasPiece() && tile.piece.type === 'item') {
                  tile.removePiece();
                }
              }
            }
          }
          console.log('폭탄 폭발!');
        }
        break;

      // 적 사망 효과
      case 'split_on_death':
        if (event === 'on_death' && game) {
          // 분열 로직 (간단히 구현)
          console.log('Enemy splits!');
        }
        break;

      case 'bomb_death':
        if (event === 'on_death' && game && context.tile) {
          // 폭탄쥐 사망 시 주변 3×3 폭발
          const row = context.tile.row;
          const col = context.tile.col;
          const board = game.board;

          for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
              const tile = board.getTile(r, c);
              if (tile) {
                if (tile.hasBlock()) {
                  tile.removeBlock();
                }
                if (tile.hasPiece() && tile.piece.type === 'item') {
                  tile.removePiece();
                }
              }
            }
          }
          console.log('폭탄쥐 폭발!');
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
