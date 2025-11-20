let game;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  game = new Game();
  game.initCanvas(canvas);

  setupSettingsButton();
  setupStatsButton();
});

function setupSettingsButton() {
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showSettingsPopup();
    });
  }
}

function setupStatsButton() {
  const statsBtn = document.getElementById('statsBtn');
  if (statsBtn) {
    statsBtn.addEventListener('click', () => {
      showStatsPopup();
    });
  }
}

function showStatsPopup() {
  const popup = document.getElementById('popup');
  const content = document.querySelector('.popup-content');

  if (!popup || !content) return;

  const player = game.player;

  content.innerHTML = `
    <div class="popup-title">플레이어 능력치</div>
    <div class="popup-text stats-popup">
      <div class="stats-section">
        <div class="stats-section-title">능력치</div>
        <div class="stat-item">HP: ${player.hp}</div>
        <div class="stat-item">공격력: ${player.getAttack()} (기본: ${player.attack})</div>
      </div>

      <div class="stats-section">
        <div class="stats-section-title">인벤토리</div>
        ${player.inventory.map((item, i) => {
          if (item) {
            const equipped = player.equippedSlot === i ? ' (장착 중)' : '';
            return `<div class="stat-item">[${i + 1}] ${item.name} (공격력 +${item.attack}, 내구도 ${item.durability})${equipped}</div>`;
          } else {
            return `<div class="stat-item">[${i + 1}] 비어있음</div>`;
          }
        }).join('')}
      </div>
    </div>
    <div class="popup-buttons">
      <button class="popup-button" onclick="closePopup()">닫기</button>
    </div>
  `;

  popup.classList.add('active');
}

function showSettingsPopup() {
  const popup = document.getElementById('popup');
  const content = document.querySelector('.popup-content');

  if (!popup || !content) return;

  const textScale = game.settings.getTextScale();
  const buttonScale = game.settings.getButtonScale();
  const orientation = game.settings.getOrientation();
  const holdDuration = game.settings.getHoldDuration();
  const dragStartDuration = game.settings.getDragStartDuration();
  const vibrationEnabled = game.settings.getVibrationEnabled();
  const vibrationIntensity = game.settings.getVibrationIntensity();

  const statsUIWidth = game.settings.getStatsUIWidth();
  const statsUIHeight = game.settings.getStatsUIHeight();
  const statsHpTextScale = game.settings.getStatsHpTextScale();
  const statsAttackTextScale = game.settings.getStatsAttackTextScale();

  const animationEnabled = game.settings.getAnimationEnabled();
  const animationInitialVelocityY = game.settings.getAnimationInitialVelocityY();
  const animationGravity = game.settings.getAnimationGravity();

  const boardSize = game.settings.getBoardSize();
  const enemyCount = game.settings.getEnemyCount();
  const itemCount = game.settings.getItemCount();
  const enemyBaseHp = game.settings.getEnemyBaseHp();
  const hpPerFloor = game.settings.getHpPerFloor();
  const attackPerFloors = game.settings.getAttackPerFloors();
  const playerInitialHp = game.settings.getPlayerInitialHp();
  const playerAttack = game.settings.getPlayerAttack();
  const items = game.settings.getItems();
  const startingItems = game.settings.getStartingItems();

  content.innerHTML = `
    <div class="popup-title">설정</div>
    <div class="popup-text" style="max-height: 60vh; overflow-y: auto;">

      <div class="settings-section">
        <h3>UI 설정</h3>
        <label>화면 방향:</label><br>
        <label><input type="radio" name="orientation" value="portrait" ${orientation === 'portrait' ? 'checked' : ''}> 세로 (9:16)</label><br>
        <label><input type="radio" name="orientation" value="landscape" ${orientation === 'landscape' ? 'checked' : ''}> 가로 (16:9)</label><br><br>

        <label>홀드 시간 (깃발 표시): <span id="holdDurationValue">${holdDuration.toFixed(1)}초</span></label><br>
        <input type="range" id="holdDurationSlider" min="0.1" max="2" step="0.1" value="${holdDuration}"><br><br>

        <label>드래그 시작 시간 (아이템 사용): <span id="dragStartDurationValue">${dragStartDuration.toFixed(1)}초</span></label><br>
        <input type="range" id="dragStartDurationSlider" min="0.1" max="2" step="0.1" value="${dragStartDuration}"><br><br>

        <label>텍스트 크기: <span id="textScaleValue">${textScale.toFixed(1)}</span></label><br>
        <input type="range" id="textScaleSlider" min="0.5" max="2" step="0.1" value="${textScale}"><br><br>

        <label>버튼 크기: <span id="buttonScaleValue">${buttonScale.toFixed(1)}</span></label><br>
        <input type="range" id="buttonScaleSlider" min="0.5" max="2" step="0.1" value="${buttonScale}"><br><br>

        <label><input type="checkbox" id="vibrationEnabledCheckbox" ${vibrationEnabled ? 'checked' : ''}> 진동 피드백 (깃발 표시 시)</label><br><br>

        <label>진동 세기: <span id="vibrationIntensityValue">${['꺼짐', '약함', '보통', '강함'][vibrationIntensity]}</span></label><br>
        <input type="range" id="vibrationIntensitySlider" min="0" max="3" step="1" value="${vibrationIntensity}" ${!vibrationEnabled ? 'disabled' : ''}><br><br>

        <h4>능력치 UI 설정</h4>
        <label>능력치 UI 넓이: <span id="statsUIWidthValue">${statsUIWidth.toFixed(1)}</span></label><br>
        <input type="range" id="statsUIWidthSlider" min="0.3" max="1.0" step="0.1" value="${statsUIWidth}"><br><br>

        <label>능력치 UI 높이: <span id="statsUIHeightValue">${statsUIHeight.toFixed(1)}</span></label><br>
        <input type="range" id="statsUIHeightSlider" min="0.3" max="1.0" step="0.1" value="${statsUIHeight}"><br><br>

        <label>HP 텍스트 크기: <span id="statsHpTextScaleValue">${statsHpTextScale.toFixed(1)}</span></label><br>
        <input type="range" id="statsHpTextScaleSlider" min="0.5" max="2.0" step="0.1" value="${statsHpTextScale}"><br><br>

        <label>공격력 텍스트 크기: <span id="statsAttackTextScaleValue">${statsAttackTextScale.toFixed(1)}</span></label><br>
        <input type="range" id="statsAttackTextScaleSlider" min="0.5" max="2.0" step="0.1" value="${statsAttackTextScale}"><br><br>

        <h4>애니메이션 설정</h4>
        <label><input type="checkbox" id="animationEnabledCheckbox" ${animationEnabled ? 'checked' : ''}> 사망 애니메이션 활성화</label><br><br>

        <label>초기 속도 (위로 튀는 힘): <span id="animationInitialVelocityYValue">${animationInitialVelocityY.toFixed(1)}</span></label><br>
        <input type="range" id="animationInitialVelocityYSlider" min="-20" max="-5" step="0.5" value="${animationInitialVelocityY}" ${!animationEnabled ? 'disabled' : ''}><br><br>

        <label>중력: <span id="animationGravityValue">${animationGravity.toFixed(1)}</span></label><br>
        <input type="range" id="animationGravitySlider" min="0.1" max="2.0" step="0.1" value="${animationGravity}" ${!animationEnabled ? 'disabled' : ''}>
      </div>

      <hr style="margin: 20px 0;">

      <div class="settings-section">
        <h3>게임 설정</h3>
        <label>보드 크기: <input type="number" id="boardSizeInput" min="5" max="30" value="${boardSize}" style="width: 60px;"></label><br><br>
        <label>적 개수: <input type="number" id="enemyCountInput" min="1" max="${boardSize * boardSize - 2}" value="${enemyCount}" style="width: 60px;"></label><br><br>
        <label>아이템 개수: <input type="number" id="itemCountInput" min="0" max="${boardSize * boardSize - 2}" value="${itemCount}" style="width: 60px;"></label><br><br>
        <label>적 기본 체력: <input type="number" id="enemyBaseHpInput" min="1" max="1000" value="${enemyBaseHp}" style="width: 60px;"></label><br><br>
        <label>층당 체력 증가: <input type="number" id="hpPerFloorInput" min="0" max="100" value="${hpPerFloor}" style="width: 60px;"></label><br><br>
        <label>공격력 증가 (N층마다): <input type="number" id="attackPerFloorsInput" min="1" max="10" value="${attackPerFloors}" style="width: 60px;"></label><br><br>
        <label>플레이어 초기 체력: <input type="number" id="playerInitialHpInput" min="1" max="1000" value="${playerInitialHp}" style="width: 60px;"></label><br><br>
        <label>플레이어 공격력: <input type="number" id="playerAttackInput" min="1" max="100" value="${playerAttack}" style="width: 60px;"></label>
      </div>

      <hr style="margin: 20px 0;">

      <div class="settings-section">
        <h3>아이템 관리</h3>
        <div id="itemsList" style="margin-bottom: 10px;">
          ${items.map((item, index) => `
            <div class="item-row" style="margin: 5px 0; padding: 5px; background: #f0f0f0; border-radius: 3px;">
              <span>${item.name} (공격력: ${item.attack}, 내구도: ${item.durability})</span>
              <button onclick="editItem(${index})" style="margin-left: 10px;">수정</button>
              <button onclick="deleteItem(${index})" style="margin-left: 5px;">삭제</button>
            </div>
          `).join('')}
        </div>
        <button id="addItemBtn" class="popup-button">아이템 추가</button>
      </div>

      <div id="itemFormContainer" style="display: none; margin-top: 10px; padding: 10px; background: #e8e8e8; border-radius: 5px;">
        <h4 id="itemFormTitle">새 아이템</h4>
        <label>이름: <input type="text" id="itemNameInput" style="width: 100px;"></label><br><br>
        <label>공격력: <input type="number" id="itemAttackInput" min="0" max="100" value="1" style="width: 60px;"></label><br><br>
        <label>내구도: <input type="number" id="itemDurabilityInput" min="1" max="100" value="1" style="width: 60px;"></label><br><br>
        <button id="saveItemBtn" class="popup-button">저장</button>
        <button id="cancelItemBtn" class="popup-button">취소</button>
      </div>

      <hr style="margin: 20px 0;">

      <div class="settings-section">
        <h3>시작 아이템 (최대 4개)</h3>
        <div id="startingItemsList" style="margin-bottom: 10px;">
          ${startingItems.map((itemId, index) => {
            const itemData = items.find(i => i.id === itemId);
            return `
              <div class="item-row" style="margin: 5px 0; padding: 5px; background: #e0f0ff; border-radius: 3px;">
                <span>${itemData ? itemData.name : itemId}</span>
                <button onclick="removeStartingItem(${index})" style="margin-left: 10px;">제거</button>
              </div>
            `;
          }).join('')}
        </div>
        <select id="startingItemSelect" style="margin-bottom: 10px;">
          ${items.map(item => `<option value="${item.id}">${item.name}</option>`).join('')}
        </select>
        <button id="addStartingItemBtn" class="popup-button">시작 아이템 추가</button>
      </div>
    </div>
    <div class="popup-buttons">
      <button class="popup-button" id="restartBtn">게임 재시작</button>
      <button class="popup-button" onclick="closePopup()">닫기</button>
    </div>
  `;

  popup.classList.add('active');

  // UI 설정 이벤트
  document.querySelectorAll('input[name="orientation"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      game.settings.setOrientation(e.target.value);
      game.uiManager.setupCanvas();
      game.uiManager.render();
    });
  });

  document.getElementById('holdDurationSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setHoldDuration(value);
    document.getElementById('holdDurationValue').textContent = value.toFixed(1) + '초';
  });

  document.getElementById('dragStartDurationSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setDragStartDuration(value);
    document.getElementById('dragStartDurationValue').textContent = value.toFixed(1) + '초';
  });

  document.getElementById('textScaleSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setTextScale(value);
    document.getElementById('textScaleValue').textContent = value.toFixed(1);
  });

  document.getElementById('buttonScaleSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setButtonScale(value);
    document.getElementById('buttonScaleValue').textContent = value.toFixed(1);
  });

  // 진동 설정 이벤트
  document.getElementById('vibrationEnabledCheckbox').addEventListener('change', (e) => {
    const enabled = e.target.checked;
    game.settings.setVibrationEnabled(enabled);
    const intensitySlider = document.getElementById('vibrationIntensitySlider');
    intensitySlider.disabled = !enabled;
  });

  document.getElementById('vibrationIntensitySlider').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    game.settings.setVibrationIntensity(value);
    const labels = ['꺼짐', '약함', '보통', '강함'];
    document.getElementById('vibrationIntensityValue').textContent = labels[value];
  });

  // 능력치 UI 설정 이벤트
  document.getElementById('statsUIWidthSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setStatsUIWidth(value);
    document.getElementById('statsUIWidthValue').textContent = value.toFixed(1);
    game.uiManager.setupCanvas();
    game.uiManager.render();
  });

  document.getElementById('statsUIHeightSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setStatsUIHeight(value);
    document.getElementById('statsUIHeightValue').textContent = value.toFixed(1);
    game.uiManager.setupCanvas();
    game.uiManager.render();
  });

  document.getElementById('statsHpTextScaleSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setStatsHpTextScale(value);
    document.getElementById('statsHpTextScaleValue').textContent = value.toFixed(1);
    game.uiManager.render();
  });

  document.getElementById('statsAttackTextScaleSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setStatsAttackTextScale(value);
    document.getElementById('statsAttackTextScaleValue').textContent = value.toFixed(1);
    game.uiManager.render();
  });

  // 애니메이션 설정 이벤트
  document.getElementById('animationEnabledCheckbox').addEventListener('change', (e) => {
    const enabled = e.target.checked;
    game.settings.setAnimationEnabled(enabled);
    document.getElementById('animationInitialVelocityYSlider').disabled = !enabled;
    document.getElementById('animationGravitySlider').disabled = !enabled;
  });

  document.getElementById('animationInitialVelocityYSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setAnimationInitialVelocityY(value);
    document.getElementById('animationInitialVelocityYValue').textContent = value.toFixed(1);
  });

  document.getElementById('animationGravitySlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setAnimationGravity(value);
    document.getElementById('animationGravityValue').textContent = value.toFixed(1);
  });

  // 게임 설정 이벤트
  document.getElementById('boardSizeInput').addEventListener('change', (e) => {
    game.settings.setBoardSize(parseInt(e.target.value));
  });

  document.getElementById('enemyCountInput').addEventListener('change', (e) => {
    game.settings.setEnemyCount(parseInt(e.target.value));
  });

  document.getElementById('itemCountInput').addEventListener('change', (e) => {
    game.settings.setItemCount(parseInt(e.target.value));
  });

  document.getElementById('enemyBaseHpInput').addEventListener('change', (e) => {
    game.settings.setEnemyBaseHp(parseInt(e.target.value));
  });

  document.getElementById('hpPerFloorInput').addEventListener('change', (e) => {
    game.settings.setHpPerFloor(parseInt(e.target.value));
  });

  document.getElementById('attackPerFloorsInput').addEventListener('change', (e) => {
    game.settings.setAttackPerFloors(parseInt(e.target.value));
  });

  document.getElementById('playerInitialHpInput').addEventListener('change', (e) => {
    game.settings.setPlayerInitialHp(parseInt(e.target.value));
  });

  document.getElementById('playerAttackInput').addEventListener('change', (e) => {
    game.settings.setPlayerAttack(parseInt(e.target.value));
  });

  // 아이템 추가 버튼
  document.getElementById('addItemBtn').addEventListener('click', () => {
    showItemForm();
  });

  // 시작 아이템 추가 버튼
  document.getElementById('addStartingItemBtn').addEventListener('click', () => {
    const select = document.getElementById('startingItemSelect');
    const itemId = select.value;
    const added = game.settings.addStartingItem(itemId);
    if (!added) {
      alert('시작 아이템은 최대 4개까지만 추가할 수 있습니다.');
    } else {
      showSettingsPopup(); // 새로고침
    }
  });

  // 재시작 버튼
  document.getElementById('restartBtn').addEventListener('click', () => {
    closePopup();
    game.restart();
  });
}

// 아이템 폼 표시
function showItemForm(editIndex = null) {
  const formContainer = document.getElementById('itemFormContainer');
  const formTitle = document.getElementById('itemFormTitle');
  const nameInput = document.getElementById('itemNameInput');
  const attackInput = document.getElementById('itemAttackInput');
  const durabilityInput = document.getElementById('itemDurabilityInput');

  if (editIndex !== null) {
    const items = game.settings.getItems();
    const item = items[editIndex];
    formTitle.textContent = '아이템 수정';
    nameInput.value = item.name;
    attackInput.value = item.attack;
    durabilityInput.value = item.durability;
  } else {
    formTitle.textContent = '새 아이템';
    nameInput.value = '';
    attackInput.value = '1';
    durabilityInput.value = '1';
  }

  formContainer.style.display = 'block';

  // 저장 버튼
  const saveBtn = document.getElementById('saveItemBtn');
  saveBtn.onclick = () => {
    const name = nameInput.value.trim();
    const attack = parseInt(attackInput.value);
    const durability = parseInt(durabilityInput.value);

    if (!name) {
      alert('아이템 이름을 입력하세요.');
      return;
    }

    const newItem = {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name: name,
      attack: attack,
      durability: durability
    };

    if (editIndex !== null) {
      game.settings.updateItem(editIndex, newItem);
    } else {
      game.settings.addItem(newItem);
    }

    formContainer.style.display = 'none';
    showSettingsPopup(); // 새로고침
  };

  // 취소 버튼
  document.getElementById('cancelItemBtn').onclick = () => {
    formContainer.style.display = 'none';
  };
}

// 아이템 수정
function editItem(index) {
  showItemForm(index);
}

// 아이템 삭제
function deleteItem(index) {
  if (confirm('이 아이템을 삭제하시겠습니까?')) {
    game.settings.removeItem(index);
    showSettingsPopup(); // 새로고침
  }
}

// 시작 아이템 제거
function removeStartingItem(index) {
  game.settings.removeStartingItem(index);
  showSettingsPopup(); // 새로고침
}

function closePopup() {
  const popup = document.getElementById('popup');
  if (popup) {
    popup.classList.remove('active');
  }
}
/* Force rebuild Wed Nov 19 14:27:15 UTC 2025 */
