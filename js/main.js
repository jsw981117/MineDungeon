let game;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  game = new Game();
  game.init(canvas);

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
        <div class="stat-item">HP: ${player.hp}/${player.maxHp}</div>
        <div class="stat-item">공격력: ${player.getAttack()} (기본: ${player.attack})</div>
      </div>

      <div class="stats-section">
        <div class="stats-section-title">인벤토리</div>
        ${player.inventory.map((item, i) => {
          if (item) {
            const equipped = player.equippedSlot === i ? ' (장착 중)' : '';
            return `<div class="stat-item">[${i + 1}] ${item.name} (공격력 +${item.attack}, 내구도 ${item.durability}/${item.maxDurability})${equipped}</div>`;
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

  content.innerHTML = `
    <div class="popup-title">설정</div>
    <div class="popup-text">
      <label>화면 방향:</label><br>
      <label><input type="radio" name="orientation" value="portrait" ${orientation === 'portrait' ? 'checked' : ''}> 세로 (9:16)</label><br>
      <label><input type="radio" name="orientation" value="landscape" ${orientation === 'landscape' ? 'checked' : ''}> 가로 (16:9)</label><br><br>

      <label>홀드 시간 (깃발 표시): <span id="holdDurationValue">${holdDuration.toFixed(1)}초</span></label><br>
      <input type="range" id="holdDurationSlider" min="0.1" max="2" step="0.1" value="${holdDuration}"><br><br>

      <label>텍스트 크기: <span id="textScaleValue">${textScale.toFixed(1)}</span></label><br>
      <input type="range" id="textScaleSlider" min="0.5" max="2" step="0.1" value="${textScale}"><br><br>

      <label>버튼 크기: <span id="buttonScaleValue">${buttonScale.toFixed(1)}</span></label><br>
      <input type="range" id="buttonScaleSlider" min="0.5" max="2" step="0.1" value="${buttonScale}">
    </div>
    <div class="popup-buttons">
      <button class="popup-button" onclick="closePopup()">닫기</button>
    </div>
  `;

  popup.classList.add('active');

  // 화면 방향 라디오 버튼 이벤트
  document.querySelectorAll('input[name="orientation"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      game.settings.setOrientation(e.target.value);
      game.uiManager.setupCanvas();
      game.uiManager.render();
    });
  });

  // 슬라이더 이벤트
  document.getElementById('holdDurationSlider').addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    game.settings.setHoldDuration(value);
    document.getElementById('holdDurationValue').textContent = value.toFixed(1) + '초';
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
}

function closePopup() {
  const popup = document.getElementById('popup');
  if (popup) {
    popup.classList.remove('active');
  }
}
