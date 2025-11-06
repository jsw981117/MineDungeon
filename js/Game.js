class Game {
  constructor() {
    this.player = new Player();
    this.board = new Board(8, 8);
    this.deck = new Deck();
    this.currentFloor = 1;
    this.uiManager = null;
    this.settings = new Settings();
  }

  init(canvas) {
    this.uiManager = new UIManager(canvas, this);
    this.initDeck();
    this.startFloor();
  }

  initDeck() {
    // 적 추가
    if (typeof ENEMIES_DATA !== 'undefined') {
      ENEMIES_DATA.forEach(data => {
        this.deck.addPiece(new Enemy(data));
      });
    }

    // 아이템 추가
    if (typeof ITEMS_DATA !== 'undefined') {
      ITEMS_DATA.forEach(data => {
        this.deck.addPiece(new Item(data));
      });
    }
  }

  startFloor() {
    const deckCopy = this.deck.clone();
    const floor = new Floor(this.currentFloor, this.board, deckCopy);
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
    console.log(`레벨 업! 현재 레벨: ${this.player.level}`);
    // main.js에서 팝업 UI로 구현 예정
    // 4가지 중 2~3개 선택지:
    // 1. 아티팩트 획득
    // 2. 능력치 증가 (HP+5, ATK+1, DEF+1 등)
    // 3. 아이템 획득 (덱에 추가)
    // 4. 적 추가 (덱에 추가)
  }
}
