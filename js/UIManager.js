class UIManager {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.tileSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.setupCanvas();
    this.setupEvents();
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const boardSize = Math.min(containerWidth, containerHeight) * 0.9;

    this.canvas.width = boardSize;
    this.canvas.height = boardSize;
    this.tileSize = boardSize / 8;
  }

  setupEvents() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const tileX = Math.floor(x / this.tileSize);
      const tileY = Math.floor(y / this.tileSize);
      this.game.onTileClick(tileX, tileY);
    });

    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.render();
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderBoard();
  }

  renderBoard() {
    const board = this.game.board;

    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const tile = board.getTile(x, y);
        this.renderTile(tile, x, y);
      }
    }
  }

  renderTile(tile, x, y) {
    const px = x * this.tileSize;
    const py = y * this.tileSize;

    // 타일 배경
    this.ctx.fillStyle = '#ccc';
    this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

    // 타일 테두리
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);

    // 블럭
    if (tile.hasBlock()) {
      this.ctx.fillStyle = '#555';
      this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
      return;
    }

    // 탐색된 타일
    if (tile.explored) {
      // 피스가 있으면 피스 렌더링
      if (tile.hasPiece()) {
        const piece = tile.piece;
        let color = '#fff';

        if (piece.type === 'enemy') {
          color = '#c44';
        } else if (piece.type === 'item') {
          color = '#4af';
        } else if (piece.type === 'event') {
          color = '#fc4';
        }

        // 배경 원
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(
          px + this.tileSize / 2,
          py + this.tileSize / 2,
          this.tileSize / 3,
          0,
          Math.PI * 2
        );
        this.ctx.fill();

        // 이름 전체 표시 (작은 폰트)
        this.ctx.fillStyle = '#000';
        this.ctx.font = `${this.tileSize * 0.13}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const name = piece.name;
        const maxWidth = this.tileSize * 0.6;
        this.wrapText(name, px + this.tileSize / 2, py + this.tileSize / 2, maxWidth, this.tileSize * 0.15);

        // 적이면 체력바 표시
        if (piece.type === 'enemy') {
          this.renderHealthBar(piece, px, py);
        }
      } else {
        // 빈칸 - 숫자 표시
        if (tile.adjacentEnemies > 0) {
          this.ctx.fillStyle = this.getNumberColor(tile.adjacentEnemies);
          this.ctx.font = `bold ${this.tileSize * 0.4}px Arial`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(
            tile.adjacentEnemies,
            px + this.tileSize / 2,
            py + this.tileSize / 2
          );
        }
      }
    }
  }

  wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        lines.push(line);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    for (let i = 0; i < lines.length; i++) {
      this.ctx.fillText(lines[i], x, startY + i * lineHeight);
    }
  }

  renderHealthBar(enemy, px, py) {
    const barWidth = this.tileSize * 0.6;
    const barHeight = this.tileSize * 0.08;
    const barX = px + (this.tileSize - barWidth) / 2;
    const barY = py + this.tileSize * 0.1;

    // 배경
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // HP 바
    const hpRatio = enemy.hp / enemy.maxHp;
    this.ctx.fillStyle = '#0f0';
    this.ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    // 테두리
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);

    // HP 텍스트
    this.ctx.fillStyle = '#fff';
    this.ctx.font = `${this.tileSize * 0.1}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      `${enemy.hp}/${enemy.maxHp}`,
      barX + barWidth / 2,
      barY + barHeight / 2
    );
  }

  getNumberColor(num) {
    const colors = ['#000', '#0000ff', '#008000', '#ff0000', '#800080', '#800000', '#008080', '#000000', '#808080'];
    return colors[Math.min(num, colors.length - 1)];
  }

  updateStats() {
    const player = this.game.player;
    const floor = this.game.currentFloor;

    // DOM 업데이트는 index.html에 요소가 생성된 후 구현
    const floorEl = document.getElementById('floorText');
    const hpEl = document.getElementById('hpText');

    if (floorEl) floorEl.textContent = `Floor ${floor}`;
    if (hpEl) hpEl.textContent = `HP: ${player.getHp()}/${player.getMaxHp()}`;
  }
}
