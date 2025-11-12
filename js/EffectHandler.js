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
          const centerY = context.tile.y;
          const centerX = context.tile.x;
          const board = game.board;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const tile = board.getTile(centerX + dx, centerY + dy);
              if (tile) {
                if (tile.hasBlock()) {
                  tile.removeBlock();
                  tile.explored = true;
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
        if (event === 'on_death' && game && context.tile) {
          // 작은 슬라임 데이터 찾기
          const smallSlimeData = ENEMIES_DATA.find(e => e.id === 'small_slime');
          if (!smallSlimeData) break;

          // 주변 빈 타일 찾기 (최대 2개)
          const centerX = context.tile.x;
          const centerY = context.tile.y;
          const board = game.board;
          const emptyTiles = [];

          const directions = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0],           [1, 0],
            [-1, 1],  [0, 1],  [1, 1]
          ];

          for (const [dx, dy] of directions) {
            const tile = board.getTile(centerX + dx, centerY + dy);
            if (tile && tile.explored && !tile.hasPiece() && !tile.hasBlock()) {
              emptyTiles.push(tile);
            }
          }

          // 최대 2마리 생성
          const spawnCount = Math.min(2, emptyTiles.length);
          for (let i = 0; i < spawnCount; i++) {
            const tile = emptyTiles[i];
            const smallSlime = new Enemy(smallSlimeData);
            tile.setPiece(smallSlime);
            game.deck.addEnemy(smallSlime);
          }

          if (spawnCount > 0) {
            console.log(`슬라임이 ${spawnCount}마리로 분열했습니다!`);
            // 주변 숫자 업데이트
            for (let i = 0; i < spawnCount; i++) {
              board.updateAdjacentNumbers(emptyTiles[i].x, emptyTiles[i].y);
            }
          }
        }
        break;

      case 'bomb_death':
        if (event === 'on_death' && game && context.tile) {
          // 폭탄쥐 사망 시 주변 3×3 폭발
          const centerY = context.tile.y;
          const centerX = context.tile.x;
          const board = game.board;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const tile = board.getTile(centerX + dx, centerY + dy);
              if (tile) {
                if (tile.hasBlock()) {
                  tile.removeBlock();
                  tile.explored = true;
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

      // 아티팩트 효과
      case 'increase_attack':
        if (player && context.value) {
          player.attack += context.value;
          console.log(`공격력 +${context.value}!`);
        }
        break;

      case 'increase_max_hp':
        if (player && context.value) {
          player.maxHp += context.value;
          player.hp += context.value; // 현재 HP도 증가
          console.log(`최대 HP +${context.value}!`);
        }
        break;

      case 'increase_defense':
        if (player && context.value) {
          player.defense += context.value;
          console.log(`방어력 +${context.value}!`);
        }
        break;

      case 'increase_crit_rate':
        if (player && context.value) {
          player.critRate += context.value;
          console.log(`치명타율 +${context.value}%!`);
        }
        break;

      case 'increase_crit_damage':
        if (player && context.value) {
          player.critDamage += context.value;
          console.log(`치명타 피해 +${context.value}%!`);
        }
        break;

      case 'increase_evasion':
        if (player && context.value) {
          player.evasion += context.value;
          console.log(`회피율 +${context.value}%!`);
        }
        break;

      default:
        console.warn(`Unknown effect: ${effectId}`);
    }
  }
}
