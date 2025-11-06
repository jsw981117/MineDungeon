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

    // 피스
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

      // 텍스트 (이름 첫 글자)
      this.ctx.fillStyle = '#000';
      this.ctx.font = `${this.tileSize / 4}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        piece.name.charAt(0),
        px + this.tileSize / 2,
        py + this.tileSize / 2
      );
    }
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
