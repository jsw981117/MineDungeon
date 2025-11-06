class Game {
  constructor() {
    this.player = new Player();
    this.board = new Board(8, 8);
    this.deck = new Deck();
    this.currentFloor = 1;
    this.uiManager = null;
    this.settings = new Settings();
    this.isFloorClear = false; // 층 완료 플래그
  }

  init(canvas) {
    this.uiManager = new UIManager(canvas, this);
    this.initDeck();
    this.startFloor();
  }

  initDeck() {
    // 첫 시작: 아이템만 추가 (적은 매 층마다 추가)
    if (typeof ITEMS_DATA !== 'undefined') {
      ITEMS_DATA.forEach(data => {
        this.deck.addPiece(new Item(data));
      });
    }
  }

  startFloor() {
    // 매 층마다 적을 새로 추가 (이전 층의 적은 모두 배치되었으므로)
    if (typeof ENEMIES_DATA !== 'undefined') {
      ENEMIES_DATA.forEach(data => {
        this.deck.addEnemy(new Enemy(data));
      });
    }

    // 덱을 직접 사용 (복사하지 않음 - 아이템 이월을 위해)
    const floor = new Floor(this.currentFloor, this.board, this.deck);
    floor.generate();
    this.uiManager.updateStats();
    this.uiManager.render();
  }

  nextFloor() {
    this.currentFloor++;
    this.startFloor();
  }

  onTileClick(x, y) {
    const tile = this.board.getTile(x, y);
    if (!tile) return;

    // 블럭 제거
    if (tile.hasBlock()) {
      // 깃발이 표시된 블록은 클릭 무시
      if (tile.block.isFlagged()) return;

      tile.removeBlock();
      tile.explored = true;

      // 피스 상호작용
      if (tile.hasPiece()) {
        const piece = tile.piece;
        let shouldRemove = false;

        // 적이면 기습 공격
        if (piece.type === 'enemy') {
          const playerDied = piece.ambush(this.player, this);
          if (playerDied) {
            this.gameOver();
            return;
          }
          // 기습 후에는 적이 남아있음 (플레이어가 다시 클릭해야 공격)
        } else {
          // 아이템/이벤트는 일반 상호작용
          shouldRemove = piece.interact(this.player, this);
        }

        if (shouldRemove) {
          tile.removePiece();
        }

        this.uiManager.updateStats();
        this.uiManager.render();
      } else {
        // 빈칸 - 연쇄 탐색
        if (tile.adjacentEnemies === 0) {
          this.floodFill(x, y);
        }
        this.uiManager.render();
      }
      return;
    }

    // 이미 탐색된 타일 - 피스가 있으면 상호작용
    if (tile.explored && tile.hasPiece()) {
      const piece = tile.piece;
      let shouldRemove = false;

      // 적이면 플레이어 선공
      if (piece.type === 'enemy') {
        shouldRemove = piece.playerAttack(this.player, this);

        // 레벨업 체크
        if (this.player.exp >= this.player.expToNext) {
          const leveledUp = this.player.levelUp();
          if (leveledUp) {
            this.showLevelUpReward();
          }
        }
      } else {
        // 아이템/이벤트는 일반 상호작용
        shouldRemove = piece.interact(this.player, this);
      }

      if (shouldRemove) {
        tile.removePiece();
      }

      this.uiManager.updateStats();
      this.uiManager.render();

      // 플레이어 사망 체크
      if (this.player.isDead()) {
        this.gameOver();
      }
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
    alert('Game Over!');
    this.currentFloor = 1;
    this.player = new Player();
    this.startFloor();
  }

  showEventChoices(event) {
    // 추후 팝업으로 구현
    console.log('Event:', event.name);
  }

  showShop() {
    // 추후 구현
    console.log('Shop opened');
  }

  showLevelUpReward() {
    // 능력치 증가 선택지 생성 (3개 무작위)
    const statOptions = [
      { stat: 'hp', text: 'HP +5', value: 5 },
      { stat: 'mp', text: 'MP +5', value: 5 },
      { stat: 'attack', text: '공격력 +1', value: 1 },
      { stat: 'magic', text: '마법력 +1', value: 1 },
      { stat: 'defense', text: '방어력 +1', value: 1 },
      { stat: 'critRate', text: '치명타율 +3%', value: 3 },
      { stat: 'critDamage', text: '치명타 피해 +10%', value: 10 },
      { stat: 'evasion', text: '회피율 +3%', value: 3 }
    ];

    // 무작위로 3개 선택
    const shuffled = [...statOptions].sort(() => Math.random() - 0.5);
    const choices = shuffled.slice(0, 3);

    showStatRewardPopup(choices);
  }

  showItemReward(hasCallback = false) {
    // 아이템 선택지 생성 (3개 무작위)
    const itemChoices = [];

    // 아이템 풀에서 무작위 선택
    if (typeof ITEMS_DATA !== 'undefined') {
      const shuffled = [...ITEMS_DATA].sort(() => Math.random() - 0.5);
      shuffled.slice(0, 3).forEach(itemData => {
        itemChoices.push({ ...itemData, type: 'item' });
      });
    }

    // 아티팩트는 추후 구현
    // 현재는 아이템만 3개 표시

    showItemRewardPopup(itemChoices, hasCallback);
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
}
