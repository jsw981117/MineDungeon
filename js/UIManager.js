class UIManager {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.tileSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    // 줌/팬 관련
    this.scale = 1.0; // 줌 레벨
    this.panX = 0; // 팬 오프셋 X
    this.panY = 0; // 팬 오프셋 Y
    this.isPanning = false;
    this.lastPanX = 0;
    this.lastPanY = 0;

    // 터치 관련
    this.touchStartDist = 0;
    this.touchStartScale = 1.0;

    this.holdTimer = null;
    this.holdStartPos = null;
    this.hoverTile = null;
    this.tooltipVisible = false;
    this.inventoryHeight = 0;

    this.setupCanvas();
    this.setupEvents();
  }

  resetZoomAndPan() {
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const inventoryRatio = 0.15;
    this.inventoryHeight = containerHeight * inventoryRatio;
    const boardHeight = containerHeight * (1 - inventoryRatio);

    const boardSize = Math.min(containerWidth, boardHeight) * 0.9;

    this.canvas.width = containerWidth;
    this.canvas.height = containerHeight;

    const gridSize = this.game.board ? this.game.board.width : 16;
    this.tileSize = boardSize / gridSize;

    this.offsetX = (containerWidth - boardSize) / 2;
    this.offsetY = (boardHeight - boardSize) / 2;
  }

  setupEvents() {
    // 마우스 휠 (줌)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = -e.deltaY;
      const scaleChange = delta > 0 ? 1.1 : 0.9;

      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.zoom(scaleChange, mouseX, mouseY);
      this.render();
    }, { passive: false });

    // 마우스 이벤트
    this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e, e.clientX, e.clientY));
    this.canvas.addEventListener('mouseup', (e) => this.handlePointerUp(e, e.clientX, e.clientY));
    this.canvas.addEventListener('mousemove', (e) => {
      this.handlePointerMove(e, e.clientX, e.clientY);
      this.handleHover(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.cancelHold();
      this.isPanning = false;
      this.hideTileTooltip();
    });

    // 우클릭
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const coords = this.screenToBoard(e.clientX, e.clientY);
      if (coords) {
        this.game.onTileFlag(coords.tileX, coords.tileY);
        this.render();
      }
    });

    // 터치 이벤트
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        // 핀치 시작
        this.touchStartDist = this.getTouchDistance(e.touches);
        this.touchStartScale = this.scale;
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.handlePointerDown(e, touch.clientX, touch.clientY);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        // 핀치 줌
        const dist = this.getTouchDistance(e.touches);
        const scaleChange = dist / this.touchStartDist;
        this.scale = Math.max(0.5, Math.min(3.0, this.touchStartScale * scaleChange));
        this.render();
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.handlePointerMove(e, touch.clientX, touch.clientY);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (e.touches.length < 2) {
        this.touchStartDist = 0;
      }
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        this.handlePointerUp(e, touch.clientX, touch.clientY);
      }
    }, { passive: false });

    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.render();
    });
  }

  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  zoom(scaleChange, mouseX, mouseY) {
    const oldScale = this.scale;
    this.scale = Math.max(0.5, Math.min(3.0, this.scale * scaleChange));

    // 마우스 위치 기준으로 줌
    const scaleRatio = this.scale / oldScale;
    this.panX = mouseX - (mouseX - this.panX) * scaleRatio;
    this.panY = mouseY - (mouseY - this.panY) * scaleRatio;
  }

  screenToBoard(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    // 인벤토리 영역 체크
    if (canvasY >= this.canvas.height - this.inventoryHeight) {
      return null;
    }

    // 줌/팬 적용된 좌표로 변환
    const boardX = (canvasX - this.panX - this.offsetX) / this.scale;
    const boardY = (canvasY - this.panY - this.offsetY) / this.scale;

    const tileX = Math.floor(boardX / this.tileSize);
    const tileY = Math.floor(boardY / this.tileSize);

    return { tileX, tileY, boardX, boardY };
  }

  handlePointerDown(e, clientX, clientY) {
    if (e.button === 2) return;

    const rect = this.canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    // 인벤토리 클릭 체크
    if (canvasY >= this.canvas.height - this.inventoryHeight) {
      const slotIndex = this.getInventorySlotIndex(canvasX, canvasY);
      if (slotIndex !== -1) {
        this.game.onInventoryClick(slotIndex);
        return;
      }
    }

    // 팬 시작
    this.isPanning = true;
    this.lastPanX = clientX;
    this.lastPanY = clientY;

    const coords = this.screenToBoard(clientX, clientY);
    if (!coords) return;

    this.holdStartPos = { tileX: coords.tileX, tileY: coords.tileY, clientX, clientY };

    const tile = this.game.board.getTile(coords.tileX, coords.tileY);
    const holdDuration = this.game.settings.getHoldDuration() * 1000;

    this.holdTimer = setTimeout(() => {
      if (tile && tile.hasBlock()) {
        this.game.onTileFlag(coords.tileX, coords.tileY);
        this.render();
      } else if (tile && tile.explored && tile.hasPiece()) {
        this.showTileTooltip(tile.piece, clientX, clientY);
      }
      this.holdTimer = null;
    }, holdDuration);
  }

  handlePointerUp(e, clientX, clientY) {
    if (e.button === 2) return;

    this.isPanning = false;

    const coords = this.screenToBoard(clientX, clientY);

    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;

      // 팬 중이 아니었고 홀드가 아니었으면 클릭으로 처리
      const panDistance = Math.sqrt(
        Math.pow(clientX - this.lastPanX, 2) +
        Math.pow(clientY - this.lastPanY, 2)
      );

      if (panDistance < 5 && coords) {
        this.game.onTileClick(coords.tileX, coords.tileY);
      }
    }

    this.holdStartPos = null;
  }

  handlePointerMove(e, clientX, clientY) {
    if (this.isPanning && this.holdTimer === null) {
      // 드래그로 팬
      const dx = clientX - this.lastPanX;
      const dy = clientY - this.lastPanY;

      this.panX += dx;
      this.panY += dy;

      this.lastPanX = clientX;
      this.lastPanY = clientY;

      this.render();
      return;
    }

    if (!this.holdStartPos) return;

    const coords = this.screenToBoard(clientX, clientY);
    if (!coords) return;

    if (coords.tileX !== this.holdStartPos.tileX || coords.tileY !== this.holdStartPos.tileY) {
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

    // 줌/팬 적용
    this.ctx.translate(this.panX + this.offsetX, this.panY + this.offsetY);
    this.ctx.scale(this.scale, this.scale);

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

    this.ctx.fillStyle = '#ccc';
    this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1 / this.scale;
    this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);

    if (tile.hasBlock()) {
      this.ctx.fillStyle = '#555';
      this.ctx.fillRect(px, py, this.tileSize, this.tileSize);

      if (tile.block.isFlagged()) {
        this.ctx.font = `${this.tileSize * 0.5}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('💀', px + this.tileSize / 2, py + this.tileSize / 2);
      }
      return;
    }

    if (tile.explored) {
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

        if (piece.type === 'enemy') {
          this.ctx.fillStyle = '#000';
          this.ctx.font = `bold ${this.tileSize * 0.25}px Arial`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(piece.hp, px + this.tileSize / 2, py + this.tileSize / 2);

          this.ctx.fillStyle = '#f00';
          this.ctx.font = `bold ${this.tileSize * 0.2}px Arial`;
          this.ctx.textAlign = 'right';
          this.ctx.textBaseline = 'top';
          this.ctx.fillText(piece.attack, px + this.tileSize - 3, py + 3);
        } else {
          this.ctx.fillStyle = '#000';
          this.ctx.font = `${this.tileSize * 0.13}px Arial`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          const name = piece.name;
          const maxWidth = this.tileSize * 0.6;
          this.wrapText(name, px + this.tileSize / 2, py + this.tileSize / 2, maxWidth, this.tileSize * 0.15);
        }
      } else {
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

    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, this.canvas.height - this.inventoryHeight, this.canvas.width, this.inventoryHeight);

    for (let i = 0; i < 4; i++) {
      const x = startX + i * (slotSize + slotMargin) + slotMargin;
      const y = startY;

      const isEquipped = player.equippedSlot === i;
      this.ctx.fillStyle = isEquipped ? '#4a4' : '#555';
      this.ctx.fillRect(x, y, slotSize, slotSize);

      this.ctx.strokeStyle = isEquipped ? '#0f0' : '#fff';
      this.ctx.lineWidth = isEquipped ? 3 : 2;
      this.ctx.strokeRect(x, y, slotSize, slotSize);

      const item = player.inventory[i];
      if (item) {
        this.ctx.fillStyle = '#4af';
        this.ctx.beginPath();
        this.ctx.arc(x + slotSize / 2, y + slotSize / 3, slotSize / 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${slotSize * 0.12}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(item.name, x + slotSize / 2, y + slotSize * 0.55);

        this.ctx.fillStyle = '#f00';
        this.ctx.font = `bold ${slotSize * 0.15}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`+${item.attack}`, x + 3, y + 3);

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
    const coords = this.screenToBoard(clientX, clientY);
    if (!coords) {
      if (this.hoverTile) {
        this.hoverTile = null;
        this.hideTileTooltip();
      }
      return;
    }

    const tile = this.game.board.getTile(coords.tileX, coords.tileY);

    if (tile && tile.explored && tile.hasPiece() && !tile.hasBlock()) {
      if (!this.hoverTile || this.hoverTile.x !== coords.tileX || this.hoverTile.y !== coords.tileY) {
        this.hoverTile = { x: coords.tileX, y: coords.tileY };
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

    const tooltipRect = tooltip.getBoundingClientRect();
    let left = clientX + 15;
    let top = clientY + 15;

    if (left + tooltipRect.width > window.innerWidth) {
      left = clientX - tooltipRect.width - 15;
    }

    if (top + tooltipRect.height > window.innerHeight) {
      top = clientY - tooltipRect.height - 15;
    }

    if (left < 0) left = 10;
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
