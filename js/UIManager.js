class UIManager {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.tileSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.holdTimer = null;
    this.holdStartPos = null;
    this.hoverTile = null;
    this.tooltipVisible = false;
    this.inventoryHeight = 0; // 인벤토리 UI 높이
    this.setupCanvas();
    this.setupEvents();
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 인벤토리 공간 확보 (하단 15%)
    const inventoryRatio = 0.15;
    this.inventoryHeight = containerHeight * inventoryRatio;
    const boardHeight = containerHeight * (1 - inventoryRatio);

    const boardSize = Math.min(containerWidth, boardHeight) * 0.9;

    this.canvas.width = containerWidth;
    this.canvas.height = containerHeight;

    // 보드 크기에 따라 동적으로 타일 크기 계산
    const gridSize = this.game.board ? this.game.board.width : 9;
    this.tileSize = boardSize / gridSize;

    // 보드를 중앙에 배치
    this.offsetX = (containerWidth - boardSize) / 2;
    this.offsetY = (boardHeight - boardSize) / 2;
  }

  setupEvents() {
    // 마우스 이벤트
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e, e.clientX, e.clientY));
    this.canvas.addEventListener('mouseup', (e) => this.handlePointerUp(e, e.clientX, e.clientY));
    this.canvas.addEventListener('mousemove', (e) => {
      this.handlePointerMove(e, e.clientX, e.clientY);
      this.handleHover(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.cancelHold();
      this.hideTileTooltip();
    });

    // 우클릭
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - this.offsetX;
      const y = e.clientY - rect.top - this.offsetY;

      // 보드 영역인지 인벤토리 영역인지 확인
      if (y >= 0 && y < this.tileSize * this.game.board.height) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        this.game.onTileFlag(tileX, tileY);
        this.render();
      }
    });

    // 터치 이벤트
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handlePointerDown(e, touch.clientX, touch.clientY);
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.handlePointerUp(e, touch.clientX, touch.clientY);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handlePointerMove(e, touch.clientX, touch.clientY);
    });

    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.render();
    });
  }

  handlePointerDown(e, clientX, clientY) {
    // 우클릭은 무시
    if (e.button === 2) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left - this.offsetX;
    const y = clientY - rect.top - this.offsetY;

    // 인벤토리 영역 클릭 체크
    const invY = clientY - rect.top;
    if (invY >= this.canvas.height - this.inventoryHeight) {
      const slotIndex = this.getInventorySlotIndex(clientX - rect.left, invY);
      if (slotIndex !== -1) {
        this.game.onInventoryClick(slotIndex);
        return;
      }
    }

    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    this.holdStartPos = { x: tileX, y: tileY, clientX, clientY };

    const tile = this.game.board.getTile(tileX, tileY);

    // 홀드 타이머 시작
    const holdDuration = this.game.settings.getHoldDuration() * 1000;
    this.holdTimer = setTimeout(() => {
      if (tile && tile.hasBlock()) {
        // 블럭이 있으면 마킹
        this.game.onTileFlag(tileX, tileY);
        this.render();
      } else if (tile && tile.explored && tile.hasPiece()) {
        // 피스가 있으면 툴팁 표시
        this.showTileTooltip(tile.piece, clientX, clientY);
      }
      this.holdTimer = null;
    }, holdDuration);
  }

  handlePointerUp(e, clientX, clientY) {
    // 우클릭은 무시
    if (e.button === 2) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left - this.offsetX;
    const y = clientY - rect.top - this.offsetY;
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    // 홀드 타이머가 아직 실행 중이면 일반 클릭
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
      this.game.onTileClick(tileX, tileY);
    }

    this.holdStartPos = null;
  }

  handlePointerMove(e, clientX, clientY) {
    if (!this.holdStartPos) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left - this.offsetX;
    const y = clientY - rect.top - this.offsetY;
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    // 다른 타일로 이동하면 홀드 취소
    if (tileX !== this.holdStartPos.x || tileY !== this.holdStartPos.y) {
      this.cancelHold();
    }
  }

  cancelHold() {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    this.holdStartPos = null;
  }

  getInventorySlotIndex(x, y) {
    const slotSize = this.inventoryHeight * 0.8;
    const slotMargin = this.inventoryHeight * 0.1;
    const totalWidth = slotSize * 4 + slotMargin * 5;
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = this.canvas.height - this.inventoryHeight + slotMargin;

    for (let i = 0; i < 4; i++) {
      const slotX = startX + i * (slotSize + slotMargin) + slotMargin;
      const slotY = startY;

      if (x >= slotX && x < slotX + slotSize && y >= slotY && y < slotY + slotSize) {
        return i;
      }
    }

    return -1;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderBoard();
    this.renderInventory();
  }

  renderBoard() {
    const board = this.game.board;

    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);

    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const tile = board.getTile(x, y);
        this.renderTile(tile, x, y);
      }
    }

    this.ctx.restore();
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

      // 깃발(해골) 표시
      if (tile.block.isFlagged()) {
        this.ctx.font = `${this.tileSize * 0.5}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('💀', px + this.tileSize / 2, py + this.tileSize / 2);
      }
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

        // 적이면 체력(중앙)과 공격력(우측 상단) 표시
        if (piece.type === 'enemy') {
          // 중앙에 체력
          this.ctx.fillStyle = '#000';
          this.ctx.font = `bold ${this.tileSize * 0.25}px Arial`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(piece.hp, px + this.tileSize / 2, py + this.tileSize / 2);

          // 우측 상단에 공격력
          this.ctx.fillStyle = '#f00';
          this.ctx.font = `bold ${this.tileSize * 0.2}px Arial`;
          this.ctx.textAlign = 'right';
          this.ctx.textBaseline = 'top';
          this.ctx.fillText(piece.attack, px + this.tileSize - 3, py + 3);
        } else {
          // 아이템/이벤트는 이름 표시
          this.ctx.fillStyle = '#000';
          this.ctx.font = `${this.tileSize * 0.13}px Arial`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          const name = piece.name;
          const maxWidth = this.tileSize * 0.6;
          this.wrapText(name, px + this.tileSize / 2, py + this.tileSize / 2, maxWidth, this.tileSize * 0.15);
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

  renderInventory() {
    const player = this.game.player;
    const slotSize = this.inventoryHeight * 0.8;
    const slotMargin = this.inventoryHeight * 0.1;
    const totalWidth = slotSize * 4 + slotMargin * 5;
    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = this.canvas.height - this.inventoryHeight + slotMargin;

    // 배경
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, this.canvas.height - this.inventoryHeight, this.canvas.width, this.inventoryHeight);

    // 4개의 인벤토리 슬롯
    for (let i = 0; i < 4; i++) {
      const x = startX + i * (slotSize + slotMargin) + slotMargin;
      const y = startY;

      // 슬롯 배경
      const isEquipped = player.equippedSlot === i;
      this.ctx.fillStyle = isEquipped ? '#4a4' : '#555';
      this.ctx.fillRect(x, y, slotSize, slotSize);

      // 슬롯 테두리
      this.ctx.strokeStyle = isEquipped ? '#0f0' : '#fff';
      this.ctx.lineWidth = isEquipped ? 3 : 2;
      this.ctx.strokeRect(x, y, slotSize, slotSize);

      // 아이템이 있으면 표시
      const item = player.inventory[i];
      if (item) {
        // 아이템 아이콘 (원)
        this.ctx.fillStyle = '#4af';
        this.ctx.beginPath();
        this.ctx.arc(x + slotSize / 2, y + slotSize / 3, slotSize / 4, 0, Math.PI * 2);
        this.ctx.fill();

        // 아이템 이름
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${slotSize * 0.12}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(item.name, x + slotSize / 2, y + slotSize * 0.55);

        // 공격력 표시
        this.ctx.fillStyle = '#f00';
        this.ctx.font = `bold ${slotSize * 0.15}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`+${item.attack}`, x + 3, y + 3);

        // 내구도 표시
        this.ctx.fillStyle = '#0ff';
        this.ctx.font = `${slotSize * 0.12}px Arial`;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(`${item.durability}/${item.maxDurability}`, x + slotSize - 3, y + slotSize - 3);
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

  getNumberColor(num) {
    const colors = ['#000', '#0000ff', '#008000', '#ff0000', '#800080', '#800000', '#008080', '#000000', '#808080'];
    return colors[Math.min(num, colors.length - 1)];
  }

  updateStats() {
    const player = this.game.player;
    const floor = this.game.currentFloor;

    const floorEl = document.getElementById('floorText');
    const hpEl = document.getElementById('hpText');
    const attackEl = document.getElementById('attackText');

    if (floorEl) floorEl.textContent = `Floor ${floor}`;
    if (hpEl) hpEl.textContent = `HP: ${player.getHp()}/${player.getMaxHp()}`;
    if (attackEl) attackEl.textContent = `공격력: ${player.getAttack()}`;
  }

  handleHover(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left - this.offsetX;
    const y = clientY - rect.top - this.offsetY;
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    const tile = this.game.board.getTile(tileX, tileY);

    // 탐색된 타일의 피스에만 툴팁 표시
    if (tile && tile.explored && tile.hasPiece() && !tile.hasBlock()) {
      if (!this.hoverTile || this.hoverTile.x !== tileX || this.hoverTile.y !== tileY) {
        this.hoverTile = { x: tileX, y: tileY };
        this.showTileTooltip(tile.piece, clientX, clientY);
      }
    } else {
      if (this.hoverTile) {
        this.hoverTile = null;
        this.hideTileTooltip();
      }
    }
  }

  showTileTooltip(piece, clientX, clientY) {
    // 기존 툴팁 제거
    this.hideTileTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'piece-tooltip tile-tooltip';
    tooltip.id = 'tileTooltip';

    let tooltipHTML = `<div class="tooltip-title">${piece.name}</div>`;

    if (piece.type === 'enemy') {
      tooltipHTML += `
        <div class="tooltip-stat">HP: ${piece.hp}/${piece.maxHp}</div>
        <div class="tooltip-stat">공격력: ${piece.attack}</div>
      `;
      if (piece.description) tooltipHTML += `<div class="tooltip-description">${piece.description}</div>`;
    } else if (piece.type === 'item') {
      tooltipHTML += `
        <div class="tooltip-stat">공격력: +${piece.attack}</div>
        <div class="tooltip-stat">내구도: ${piece.durability}/${piece.maxDurability}</div>
      `;
      if (piece.description) tooltipHTML += `<div class="tooltip-description">${piece.description}</div>`;
    } else if (piece.type === 'event') {
      if (piece.description) tooltipHTML += `<div class="tooltip-description">${piece.description}</div>`;
    }

    tooltip.innerHTML = tooltipHTML;
    document.body.appendChild(tooltip);

    // 위치 계산
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = clientX + 15;
    let top = clientY + 15;

    // 오른쪽 경계 체크
    if (left + tooltipRect.width > window.innerWidth) {
      left = clientX - tooltipRect.width - 15;
    }

    // 하단 경계 체크
    if (top + tooltipRect.height > window.innerHeight) {
      top = clientY - tooltipRect.height - 15;
    }

    // 왼쪽 경계 체크
    if (left < 0) left = 10;

    // 상단 경계 체크
    if (top < 0) top = 10;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    this.tooltipVisible = true;
  }

  hideTileTooltip() {
    const tooltip = document.getElementById('tileTooltip');
    if (tooltip) {
      tooltip.remove();
      this.tooltipVisible = false;
    }
  }
}
