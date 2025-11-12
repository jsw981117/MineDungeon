class Game {
  constructor() {
    this.player = new Player();
    this.board = new Board(6, 6); // 초기 6x6
    this.deck = new Deck();
    this.currentFloor = 1;
    this.uiManager = null;
    this.settings = new Settings();
    this.isFloorClear = false; // 층 완료 플래그

    // 타겟팅 모드
    this.targetingMode = false;
    this.targetingItem = null;
    this.targetingType = null; // 'single', 'row', 'col', 'area'
    this.targetingItemTile = null; // 아이템이 있던 타일
  }

  init(canvas) {
    this.uiManager = new UIManager(canvas, this);
    this.initDeck();
    this.startFloor();
  }

  initDeck() {
    // 첫 시작: 몬스터 3마리, 아이템 3개 랜덤 선택

    // 몬스터 3마리 랜덤 선택
    if (typeof ENEMIES_DATA !== 'undefined' && ENEMIES_DATA.length > 0) {
      const shuffledEnemies = [...ENEMIES_DATA].sort(() => Math.random() - 0.5);
      const selectedEnemies = shuffledEnemies.slice(0, 3);
      selectedEnemies.forEach(data => {
        this.deck.addEnemy(new Enemy(data));
      });
    }

    // 아이템 3개 랜덤 선택
    if (typeof ITEMS_DATA !== 'undefined' && ITEMS_DATA.length > 0) {
      const shuffledItems = [...ITEMS_DATA].sort(() => Math.random() - 0.5);
      const selectedItems = shuffledItems.slice(0, 3);
      selectedItems.forEach(data => {
        this.deck.addItem(new Item(data));
      });
    }
  }

  startFloor() {
    // 보드 크기 조정 (5층부터 7x7, 10층부터 8x8)
    let boardSize = 6;
    if (this.currentFloor >= 10) {
      boardSize = 8;
    } else if (this.currentFloor >= 5) {
      boardSize = 7;
    }

    // 보드 크기가 변경되면 보드 재생성
    if (this.board.width !== boardSize || this.board.height !== boardSize) {
      this.board = new Board(boardSize, boardSize);
      this.uiManager.setupCanvas(); // 캔버스 크기도 재조정
    }

    // 덱을 직접 사용 (복사하지 않음 - 아이템 이월을 위해)
    const floor = new Floor(this.currentFloor, this.board, this.deck);
    floor.generate();
    this.uiManager.updateStats();
    this.uiManager.render();
  }

  nextFloor() {
    this.currentFloor++;
    // 층 단위 버프 초기화
    this.player.clearFloorBuffs();
    this.startFloor();
  }

  onTileClick(x, y) {
    const tile = this.board.getTile(x, y);
    if (!tile) return;

    // 블럭 제거
    if (tile.hasBlock()) {
      // 깃발이 표시된 블록은 클릭 무시
      if (tile.block.isFlagged()) return;

      // 플레이어 행동: 블록 열기 (독 효과 발동)
      this.player.onPlayerAction();

      tile.removeBlock();
      tile.explored = true;

      // 피스 상호작용
      if (tile.hasPiece()) {
        const piece = tile.piece;

        // 적이면 기습 공격
        if (piece.type === 'enemy') {
          const playerDied = piece.ambush(this.player, this);
          if (playerDied) {
            this.gameOver();
            return;
          }
          // 기습 후에는 적이 남아있음 (플레이어가 다시 클릭해야 공격)
          // 적 블록 클릭 시에는 자동 탐색 체크 안 함
        } else {
          // 아이템/이벤트 블록 제거 (공개만 됨)
          // 비-적 블록 탐색 시 자동 탐색 체크
          this.checkEnemyWipeout();
        }

        this.uiManager.updateStats();
        this.uiManager.render();

        // 독으로 사망 체크
        if (this.player.isDead()) {
          this.gameOver();
          return;
        }
      } else {
        // 빈칸 - 연쇄 탐색
        if (tile.adjacentEnemies === 0) {
          this.floodFill(x, y);
        }
        // 빈 블록 탐색 시 자동 탐색 체크
        this.checkEnemyWipeout();
        this.uiManager.render();

        // 독으로 사망 체크
        if (this.player.isDead()) {
          this.gameOver();
          return;
        }
      }
      return;
    }

    // 이미 탐색된 타일 - 피스가 있으면 상호작용
    if (tile.explored && tile.hasPiece()) {
      const piece = tile.piece;
      let shouldRemove = false;

      // 플레이어 행동: 공격 또는 아이템 사용 (독 효과 발동)
      this.player.onPlayerAction();

      // 적이면 플레이어 선공
      if (piece.type === 'enemy') {
        shouldRemove = piece.playerAttack(this.player, this, tile);

        // 레벨업 체크
        if (this.player.exp >= this.player.expToNext) {
          const leveledUp = this.player.levelUp();
          if (leveledUp) {
            this.showLevelUpReward();
          }
        }
      } else if (piece.type === 'item') {
        // 아이템: 타겟팅이 필요한지 확인
        const targetingEffects = {
          'bow_attack': 'single',
          'staff_attack': 'row',
          'bomb_attack': 'area',
          'poison_apply_3': 'single',
          'burn_apply_4': 'single',
          'freeze_apply': 'single'
        };

        if (targetingEffects[piece.effect]) {
          // 타겟팅 모드 시작
          this.startTargeting(piece, targetingEffects[piece.effect], tile);
          shouldRemove = false; // 아직 제거하지 않음
        } else {
          // 즉시 사용 아이템
          shouldRemove = piece.interact(this.player, this, tile);
        }
      } else {
        // 이벤트는 일반 상호작용
        shouldRemove = piece.interact(this.player, this, tile);
      }

      if (shouldRemove) {
        tile.removePiece();

        // 적 제거 시 주변 숫자 업데이트
        if (piece.type === 'enemy') {
          this.board.updateAdjacentNumbers(tile.x, tile.y);
        }
      }

      this.uiManager.updateStats();
      this.uiManager.render();

      // 플레이어 사망 체크
      if (this.player.isDead()) {
        this.gameOver();
      }
    }
  }

  checkEnemyWipeout() {
    const tiles = this.board.getTiles();
    const blockedTiles = tiles.filter(t => t.hasBlock());

    // 블록이 없으면 체크 안함
    if (blockedTiles.length === 0) return;

    // 모든 블록 타일이 적인지 확인
    const allEnemies = blockedTiles.every(tile => {
      return tile.hasPiece() && tile.piece.type === 'enemy';
    });

    if (allEnemies) {
      // 모든 블록 제거하고 적 공개
      blockedTiles.forEach(tile => {
        tile.removeBlock();
        tile.explored = true;
      });

      console.log(`모든 적 발견! 적들이 ${this.player.attack} 피해를 입습니다.`);

      // 각 적에게 플레이어 공격력만큼 피해 적용
      let totalKills = 0;
      blockedTiles.forEach(tile => {
        if (tile.hasPiece() && tile.piece.type === 'enemy') {
          const enemy = tile.piece;
          enemy.hp -= this.player.attack;

          // 적 사망 처리
          if (enemy.hp <= 0) {
            console.log(`${enemy.name} 처치!`);

            // 사망 효과 발동
            if (enemy.effect) {
              EffectHandler.apply(enemy.effect, enemy, {
                player: this.player,
                game: this,
                tile: tile,
                event: 'on_death'
              });
            }

            // 경험치 및 골드 획득
            this.player.gainExp(1);
            this.player.gold += 5; // 고정 5골드
            totalKills++;

            // 내구도 감소
            enemy.durability--;
            if (enemy.durability <= 0) {
              this.deck.removeEnemy(enemy);
              console.log(`${enemy.name}이(가) 덱에서 제거되었습니다!`);
            }

            // 타일에서 제거
            tile.removePiece();

            // 주변 타일 숫자 업데이트
            this.board.updateAdjacentNumbers(tile.x, tile.y);
          }
        }
      });

      // 레벨업 체크
      if (this.player.exp >= this.player.expToNext) {
        const leveledUp = this.player.levelUp();
        if (leveledUp) {
          this.showLevelUpReward();
        }
      }

      this.uiManager.updateStats();
      this.uiManager.render();

      this.showMessage('필살기 발동!');
    }
  }

  floodFill(x, y) {
    const queue = [[x, y]];
    const visited = new Set();

    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      const key = `${cx},${cy}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const tile = this.board.getTile(cx, cy);
      if (!tile) continue;

      // 블럭 제거
      if (tile.hasBlock()) {
        tile.removeBlock();
      }
      tile.explored = true;

      // 주변 적이 0이면 8방향 확장
      if (tile.adjacentEnemies === 0 && !tile.hasPiece()) {
        const directions = [
          [-1, -1], [0, -1], [1, -1],
          [-1, 0],           [1, 0],
          [-1, 1],  [0, 1],  [1, 1]
        ];

        for (const [dx, dy] of directions) {
          const nx = cx + dx;
          const ny = cy + dy;
          const neighborKey = `${nx},${ny}`;
          if (!visited.has(neighborKey)) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  onTileFlag(x, y) {
    const tile = this.board.getTile(x, y);
    if (!tile) return;

    // 블럭이 있을 때만 깃발 토글 가능
    if (tile.hasBlock()) {
      tile.block.toggleFlag();
    }
  }

  gameOver() {
    this.showMessage('Game Over!');
    setTimeout(() => {
      this.currentFloor = 1;
      this.player = new Player();
      this.startFloor();
    }, 2000);
  }

  showMessage(text, duration = 2000) {
    // 기존 메시지 제거
    const existingMsg = document.querySelector('.game-message');
    if (existingMsg) {
      existingMsg.remove();
    }

    // 새 메시지 생성
    const message = document.createElement('div');
    message.className = 'game-message';
    message.textContent = text;
    document.body.appendChild(message);

    // 자동 제거
    setTimeout(() => {
      message.remove();
    }, duration);
  }

  showEventChoices(event) {
    showEventChoicesPopup(event);
  }

  showShop() {
    showShopPopup();
  }

  showLevelUpReward() {
    // 능력치 증가 선택지 생성 (3개 무작위)
    const statOptions = [
      { stat: 'hp', text: 'HP +20', value: 20 },
      { stat: 'mp', text: 'MP +10', value: 10 },
      { stat: 'attack', text: '공격력 +3', value: 3 },
      { stat: 'magic', text: '마법력 +3', value: 3 },
      { stat: 'defense', text: '방어력 +2', value: 2 },
      { stat: 'critRate', text: '치명타율 +5%', value: 5 },
      { stat: 'critDamage', text: '치명타 피해 +15%', value: 15 },
      { stat: 'evasion', text: '회피율 +5%', value: 5 }
    ];

    // 무작위로 3개 선택
    const shuffled = [...statOptions].sort(() => Math.random() - 0.5);
    const choices = shuffled.slice(0, 3);

    showStatRewardPopup(choices);
  }

  showItemReward(hasCallback = false) {
    // 아이템/아티팩트 선택지 생성 (3개 무작위)
    const choices = [];

    // 아이템 2개, 아티팩트 1개
    if (typeof ITEMS_DATA !== 'undefined') {
      const shuffledItems = [...ITEMS_DATA].sort(() => Math.random() - 0.5);
      shuffledItems.slice(0, 2).forEach(itemData => {
        choices.push({ ...itemData, type: 'item' });
      });
    }

    if (typeof ARTIFACTS_DATA !== 'undefined') {
      const shuffledArtifacts = [...ARTIFACTS_DATA].sort(() => Math.random() - 0.5);
      shuffledArtifacts.slice(0, 1).forEach(artifactData => {
        choices.push({ ...artifactData, type: 'artifact' });
      });
    }

    showItemRewardPopup(choices, hasCallback);
  }

  showEnemyAddReward() {
    // 적 선택지 생성 (3개 무작위)
    if (typeof ENEMIES_DATA === 'undefined' || ENEMIES_DATA.length === 0) {
      return;
    }

    const shuffled = [...ENEMIES_DATA].sort(() => Math.random() - 0.5);
    const choices = shuffled.slice(0, Math.min(3, ENEMIES_DATA.length));

    showEnemyRewardPopup(choices);
  }

  // 타겟팅 모드 시작
  startTargeting(item, targetingType, itemTile = null) {
    this.targetingMode = true;
    this.targetingItem = item;
    this.targetingType = targetingType;
    this.targetingItemTile = itemTile;
    this.showMessage(`${item.name} 사용 - 타겟을 선택하세요`, 5000);
    this.uiManager.render();
  }

  // 타겟팅 모드 종료
  cancelTargeting() {
    this.targetingMode = false;
    this.targetingItem = null;
    this.targetingType = null;
    this.targetingItemTile = null;
    this.uiManager.render();
  }

  // 타겟팅 완료 (타일 선택됨)
  useItemOnTarget(tileX, tileY) {
    if (!this.targetingMode || !this.targetingItem) return;

    // 플레이어 행동: 아이템 사용 (독 효과 발동)
    this.player.onPlayerAction();

    const item = this.targetingItem;
    const tile = this.board.getTile(tileX, tileY);

    // 타겟팅 타입에 따라 처리
    let targets = [];
    if (this.targetingType === 'single') {
      if (tile && tile.hasPiece()) {
        targets = [tile.piece];
      }
    } else if (this.targetingType === 'row') {
      // 해당 행의 모든 적
      for (let x = 0; x < this.board.width; x++) {
        const t = this.board.getTile(x, tileY);
        if (t && t.explored && t.hasPiece() && t.piece.type === 'enemy') {
          targets.push(t.piece);
        }
      }
    } else if (this.targetingType === 'col') {
      // 해당 열의 모든 적
      for (let y = 0; y < this.board.height; y++) {
        const t = this.board.getTile(tileX, y);
        if (t && t.explored && t.hasPiece() && t.piece.type === 'enemy') {
          targets.push(t.piece);
        }
      }
    } else if (this.targetingType === 'area') {
      // 3x3 영역
      targets = { tile, area: '3x3' };
    }

    // 아이템 사용
    if (item.effect) {
      EffectHandler.apply(item.effect, item, {
        player: this.player,
        game: this,
        tile,
        target: targets.length === 1 ? targets[0] : null,
        targets: Array.isArray(targets) ? targets : null,
        event: 'on_use'
      });
    }

    // 내구도 감소
    item.durability--;
    if (item.durability <= 0) {
      this.deck.removeItem(item);
      this.showMessage(`${item.name}이(가) 파괴되었습니다!`);
    }

    // 아이템이 있던 타일에서 제거
    if (this.targetingItemTile && this.targetingItemTile.hasPiece() && this.targetingItemTile.piece === item) {
      this.targetingItemTile.removePiece();
    }

    // 적 사망 처리
    const allTiles = this.board.getTiles();
    allTiles.forEach(t => {
      if (t.hasPiece() && t.piece.type === 'enemy' && t.piece.hp <= 0) {
        const enemy = t.piece;
        console.log(`${enemy.name} 처치!`);

        // 사망 효과 발동
        if (enemy.effect) {
          EffectHandler.apply(enemy.effect, enemy, {
            player: this.player,
            game: this,
            tile: t,
            event: 'on_death'
          });
        }

        // 경험치 및 골드 획득
        this.player.gainExp(1);
        this.player.gold += 5; // 고정 5골드

        // 내구도 감소
        enemy.durability--;
        if (enemy.durability <= 0) {
          this.deck.removeEnemy(enemy);
          console.log(`${enemy.name}이(가) 덱에서 제거되었습니다!`);
        }

        // 타일에서 제거
        t.removePiece();

        // 주변 타일 숫자 업데이트
        this.board.updateAdjacentNumbers(t.x, t.y);
      }
    });

    // 레벨업 체크
    if (this.player.exp >= this.player.expToNext) {
      const leveledUp = this.player.levelUp();
      if (leveledUp) {
        this.showLevelUpReward();
      }
    }

    // 타겟팅 모드 종료
    this.cancelTargeting();
    this.uiManager.updateStats();
    this.uiManager.render();

    // 플레이어 사망 체크 (독 피해 등)
    if (this.player.isDead()) {
      this.gameOver();
      return;
    }
  }
}
