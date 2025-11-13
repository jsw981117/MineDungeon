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
    this.hoverTile = null; // 현재 hover 중인 타일
    this.hoverPiece = null; // 현재 hover 중인 피스
    this.effectRangeTiles = []; // 효과 범위 타일들
    this.tooltipVisible = false;
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

    // 보드 크기에 따라 동적으로 타일 크기 계산
    const gridSize = this.game.board ? this.game.board.width : 8;
    this.tileSize = boardSize / gridSize;
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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const tileX = Math.floor(x / this.tileSize);
      const tileY = Math.floor(y / this.tileSize);
      this.game.onTileFlag(tileX, tileY);
      this.render();
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
    const x = clientX - rect.left;
    const y = clientY - rect.top;
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
    const x = clientX - rect.left;
    const y = clientY - rect.top;
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
    const x = clientX - rect.left;
    const y = clientY - rect.top;
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

    // 효과 범위 하이라이트
    const isInRange = this.effectRangeTiles.some(t => t.x === x && t.y === y);
    if (isInRange) {
      this.ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
      this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
    }

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

        // 이름 전체 표시 (작은 폰트)
        this.ctx.fillStyle = '#000';
        this.ctx.font = `${this.tileSize * 0.13}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const name = piece.name;
        const maxWidth = this.tileSize * 0.6;
        this.wrapText(name, px + this.tileSize / 2, py + this.tileSize / 2, maxWidth, this.tileSize * 0.15);

        // 적이면 체력바 및 상태 효과 표시
        if (piece.type === 'enemy') {
          this.renderHealthBar(piece, px, py);
          this.renderStatusEffects(piece, px, py);
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

    const floorEl = document.getElementById('floorText');
    const hpEl = document.getElementById('hpText');
    const mpEl = document.getElementById('mpText');
    const expEl = document.getElementById('expText');
    const goldEl = document.getElementById('goldText');

    if (floorEl) floorEl.textContent = `Floor ${floor}`;
    if (hpEl) hpEl.textContent = `HP: ${player.getHp()}/${player.getMaxHp()}`;
    if (mpEl) mpEl.textContent = `MP: ${player.mp}/${player.maxMp}`;
    if (expEl) {
      const expPercent = Math.floor((player.exp / player.expToNext) * 100);
      expEl.textContent = `LV${player.level} [${expPercent}%]`;
    }
    if (goldEl) goldEl.textContent = `💰 ${player.gold}`;

    // 플레이어 상태 효과 표시
    const statusEl = document.getElementById('statusText');
    if (statusEl) {
      let statusText = '';
      if (player.statusEffects.poison) statusText += `🧪${player.statusEffects.poison} `;
      if (player.statusEffects.burn) statusText += `🔥${player.statusEffects.burn} `;
      if (player.statusEffects.freeze) statusText += '❄️ ';
      statusEl.textContent = statusText.trim();
    }
  }

  handleHover(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    const tile = this.game.board.getTile(tileX, tileY);

    // 탐색된 타일의 피스에만 툴팁 표시
    if (tile && tile.explored && tile.hasPiece() && !tile.hasBlock()) {
      if (!this.hoverTile || this.hoverTile.x !== tileX || this.hoverTile.y !== tileY) {
        this.hoverTile = { x: tileX, y: tileY };
        this.hoverPiece = tile.piece;
        this.effectRangeTiles = this.calculateEffectRange(tile.piece);
        this.showTileTooltip(tile.piece, clientX, clientY);
        this.render(); // 효과 범위 표시를 위해 다시 렌더링
      }
    } else {
      if (this.hoverTile) {
        this.hoverTile = null;
        this.hoverPiece = null;
        this.effectRangeTiles = [];
        this.hideTileTooltip();
        this.render(); // 효과 범위 제거를 위해 다시 렌더링
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
        <div class="tooltip-stat">방어력: ${piece.defense}</div>
      `;
      if (piece.critRate > 0) tooltipHTML += `<div class="tooltip-stat">치명타율: ${piece.critRate}%</div>`;
      if (piece.evasion > 0) tooltipHTML += `<div class="tooltip-stat">회피율: ${piece.evasion}%</div>`;
      if (piece.durability) tooltipHTML += `<div class="tooltip-stat">내구도: ${piece.durability}</div>`;
      if (piece.description) tooltipHTML += `<div class="tooltip-description">${piece.description}</div>`;
      if (piece.effect) tooltipHTML += `<div class="tooltip-effect">효과: ${piece.effect}</div>`;
    } else if (piece.type === 'item') {
      tooltipHTML += `
        <div class="tooltip-stat">내구도: ${piece.durability}</div>
      `;
      if (piece.description) tooltipHTML += `<div class="tooltip-description">${piece.description}</div>`;
      if (piece.effect) tooltipHTML += `<div class="tooltip-effect">효과: ${piece.effect}</div>`;
    } else if (piece.type === 'event') {
      if (piece.description) tooltipHTML += `<div class="tooltip-description">${piece.description}</div>`;
      if (piece.effect) tooltipHTML += `<div class="tooltip-effect">효과: ${piece.effect}</div>`;
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

  // 효과 범위 계산
  calculateEffectRange(piece) {
    if (!piece || !piece.effect) return [];

    const board = this.game.board;
    const tiles = [];

    switch (piece.effect) {
      case 'bow_attack':
      case 'poison_apply_3':
      case 'burn_apply_4':
      case 'freeze_apply':
        // 단일 타겟: 공개된 모든 적 타일
        board.getTiles().forEach(tile => {
          if (tile.explored && tile.hasPiece() && tile.piece.type === 'enemy') {
            tiles.push({ x: tile.x, y: tile.y });
          }
        });
        break;

      case 'staff_attack':
        // 행/열 전체: 공개된 적이 있는 모든 행과 열
        const enemyPositions = [];
        board.getTiles().forEach(tile => {
          if (tile.explored && tile.hasPiece() && tile.piece.type === 'enemy') {
            enemyPositions.push({ x: tile.x, y: tile.y });
          }
        });

        // 각 행의 적 수 계산
        const rowCounts = {};
        const colCounts = {};
        enemyPositions.forEach(pos => {
          rowCounts[pos.y] = (rowCounts[pos.y] || 0) + 1;
          colCounts[pos.x] = (colCounts[pos.x] || 0) + 1;
        });

        // 최대 적 수를 가진 행/열 찾기
        let maxCount = 0;
        let bestRows = [];
        let bestCols = [];

        Object.keys(rowCounts).forEach(row => {
          const count = rowCounts[row];
          if (count > maxCount) {
            maxCount = count;
            bestRows = [parseInt(row)];
          } else if (count === maxCount) {
            bestRows.push(parseInt(row));
          }
        });

        Object.keys(colCounts).forEach(col => {
          const count = colCounts[col];
          if (count > maxCount) {
            maxCount = count;
            bestRows = [];
            bestCols = [parseInt(col)];
          } else if (count === maxCount && bestRows.length === 0) {
            bestCols.push(parseInt(col));
          }
        });

        // 최적 행 하이라이트
        bestRows.forEach(row => {
          for (let x = 0; x < board.width; x++) {
            tiles.push({ x, y: row });
          }
        });

        // 최적 열 하이라이트
        bestCols.forEach(col => {
          for (let y = 0; y < board.height; y++) {
            tiles.push({ x: col, y });
          }
        });
        break;

      case 'bomb_attack':
        // 3x3 영역: 블록/아이템이 있는 모든 위치 주변 3x3
        let bestX = 0, bestY = 0, maxBlockCount = 0;

        // 최적 위치 찾기
        for (let y = 0; y < board.height; y++) {
          for (let x = 0; x < board.width; x++) {
            let count = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const tile = board.getTile(x + dx, y + dy);
                if (tile && (tile.hasBlock() || (tile.hasPiece() && tile.piece.type === 'item'))) {
                  count++;
                }
              }
            }
            if (count > maxBlockCount) {
              maxBlockCount = count;
              bestX = x;
              bestY = y;
            }
          }
        }

        // 최적 위치 주변 3x3 하이라이트
        if (maxBlockCount > 0) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const tx = bestX + dx;
              const ty = bestY + dy;
              if (tx >= 0 && tx < board.width && ty >= 0 && ty < board.height) {
                tiles.push({ x: tx, y: ty });
              }
            }
          }
        }
        break;

      case 'split_on_death':
        // 슬라임 분열: 주변 8칸
        if (this.hoverTile) {
          const cx = this.hoverTile.x;
          const cy = this.hoverTile.y;
          const directions = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0],           [1, 0],
            [-1, 1],  [0, 1],  [1, 1]
          ];
          directions.forEach(([dx, dy]) => {
            const tx = cx + dx;
            const ty = cy + dy;
            if (tx >= 0 && tx < board.width && ty >= 0 && ty < board.height) {
              tiles.push({ x: tx, y: ty });
            }
          });
        }
        break;

      case 'bomb_death':
        // 폭탄쥐 폭발: 주변 3x3
        if (this.hoverTile) {
          const cx = this.hoverTile.x;
          const cy = this.hoverTile.y;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const tx = cx + dx;
              const ty = cy + dy;
              if (tx >= 0 && tx < board.width && ty >= 0 && ty < board.height) {
                tiles.push({ x: tx, y: ty });
              }
            }
          }
        }
        break;

      case 'poison_attack':
      case 'burn_attack':
        // 적의 전투 효과: 플레이어 피해 (표시 안 함)
        break;

      default:
        // 기타 효과는 범위 표시 안 함
        break;
    }

    return tiles;
  }

  // 상태 효과 아이콘 표시
  renderStatusEffects(piece, px, py) {
    if (!piece.statusEffects) return;

    const iconSize = this.tileSize * 0.15;
    let iconX = px + this.tileSize - iconSize - 2;
    const iconY = py + 2;

    // 독
    if (piece.statusEffects.poison) {
      this.ctx.font = `${iconSize}px Arial`;
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(`🧪${piece.statusEffects.poison}`, iconX, iconY);
      iconX -= iconSize * 2;
    }

    // 화상
    if (piece.statusEffects.burn) {
      this.ctx.font = `${iconSize}px Arial`;
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(`🔥${piece.statusEffects.burn}`, iconX, iconY);
      iconX -= iconSize * 2;
    }

    // 빙결
    if (piece.statusEffects.freeze) {
      this.ctx.font = `${iconSize}px Arial`;
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText('❄️', iconX, iconY);
    }
  }
}
