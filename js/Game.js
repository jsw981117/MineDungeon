class Game {
  constructor() {
    this.settings = new Settings();
    this.init();
  }

  init() {
    this.player = new Player();
    const boardSize = this.settings.getBoardSize();
    this.board = new Board(boardSize, boardSize);
    this.currentFloor = 1;
    this.uiManager = null;
  }

  initCanvas(canvas) {
    this.uiManager = new UIManager(canvas, this);
    this.startFloor();
  }

  startFloor() {
    const floor = new Floor(this.currentFloor, this.board, this.settings);
    floor.generate();
    if (this.uiManager) {
      this.uiManager.updateStats();
      this.uiManager.render();
    }
  }

  nextFloor() {
    this.currentFloor++;
    this.startFloor();
  }

  restart() {
    this.init();
    if (this.uiManager) {
      const boardSize = this.settings.getBoardSize();
      this.board = new Board(boardSize, boardSize);
      this.uiManager.resetZoomAndPan();
      this.uiManager.setupCanvas();
      this.startFloor();
    }
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

        // 적이면 기습 공격
        if (piece.type === 'enemy') {
          const playerDied = piece.ambush(this.player, this);
          if (playerDied) {
            this.gameOver();
            return;
          }
        } else if (piece.type === 'event') {
          // 이벤트 (계단)
          if (piece.id === 'stair') {
            this.nextFloor();
            return;
          }
        } else {
          // 비-적 블록 탐색 시 자동 소탕 체크
          this.checkEnemyWipeout();
        }

        this.uiManager.updateStats();
        this.uiManager.render();
      } else {
        // 빈칸 - 연쇄 탐색
        if (tile.adjacentEnemies === 0) {
          this.floodFill(x, y);
        }
        // 빈 블록 탐색 시 자동 소탕 체크
        this.checkEnemyWipeout();
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
        shouldRemove = piece.playerAttack(this.player, this, tile);
      } else if (piece.type === 'event') {
        // 이벤트 (계단)
        if (piece.id === 'stair') {
          this.nextFloor();
          return;
        }
      } else {
        // 아이템은 일반 상호작용
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

      console.log(`모든 적 발견! 적들이 ${this.player.getAttack()} 피해를 입습니다.`);

      // 각 적에게 플레이어 공격력만큼 피해 적용
      let totalKills = 0;
      blockedTiles.forEach(tile => {
        if (tile.hasPiece() && tile.piece.type === 'enemy') {
          const enemy = tile.piece;
          enemy.hp -= this.player.getAttack();

          // 적 사망 처리
          if (enemy.hp <= 0) {
            console.log(`${enemy.name} 처치!`);
            totalKills++;

            // 타일에서 제거
            tile.removePiece();

            // 주변 타일 숫자 업데이트
            this.board.updateAdjacentNumbers(tile.x, tile.y);
          }
        }
      });

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

  // 인벤토리 슬롯 클릭 핸들러
  onInventoryClick(slotIndex) {
    this.player.equipItem(slotIndex);
    this.uiManager.render();
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
}
