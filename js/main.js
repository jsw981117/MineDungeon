let game;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  game = new Game();
  game.init(canvas);

  setupSettingsButton();
});

function setupSettingsButton() {
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showSettingsPopup();
    });
  }
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

// 능력치 증가 보상 팝업 (레벨업)
function showStatRewardPopup(choices) {
  const popup = document.getElementById('popup');
  const content = document.querySelector('.popup-content');

  if (!popup || !content) return;

  let buttonsHTML = '';
  choices.forEach((choice, index) => {
    buttonsHTML += `<button class="popup-button reward-button" onclick="selectStatReward(${index})">${choice.text}</button>`;
  });

  content.innerHTML = `
    <div class="popup-title">레벨업!</div>
    <div class="popup-text">능력치를 선택하세요</div>
    <div class="popup-buttons reward-buttons">
      ${buttonsHTML}
    </div>
  `;

  popup.classList.add('active');

  // 선택지 저장 (선택 시 사용)
  popup.dataset.choices = JSON.stringify(choices);
}

function selectStatReward(index) {
  const popup = document.getElementById('popup');
  const choices = JSON.parse(popup.dataset.choices);
  const choice = choices[index];

  // 능력치 적용
  if (choice.stat === 'hp') {
    game.player.maxHp += choice.value;
    game.player.hp += choice.value;
  } else if (choice.stat === 'mp') {
    game.player.maxMp += choice.value;
    game.player.mp += choice.value;
  } else if (choice.stat === 'attack') {
    game.player.attack += choice.value;
  } else if (choice.stat === 'magic') {
    game.player.magic += choice.value;
  } else if (choice.stat === 'defense') {
    game.player.defense += choice.value;
  } else if (choice.stat === 'critRate') {
    game.player.critRate += choice.value;
  } else if (choice.stat === 'critDamage') {
    game.player.critDamage += choice.value;
  } else if (choice.stat === 'evasion') {
    game.player.evasion += choice.value;
  }

  // 영구 스탯에 기록
  game.player.increasePermanent(choice.stat, choice.value);

  game.uiManager.updateStats();
  closePopup();
}

// 아티팩트/아이템 보상 팝업 (보물상자/층 완료)
function showItemRewardPopup(choices, callback) {
  const popup = document.getElementById('popup');
  const content = document.querySelector('.popup-content');

  if (!popup || !content) return;

  let buttonsHTML = '';
  choices.forEach((choice, index) => {
    const typeName = choice.type === 'artifact' ? '[아티팩트]' : '[아이템]';
    buttonsHTML += `<button class="popup-button reward-button" onclick="selectItemReward(${index})">${typeName} ${choice.name}</button>`;
  });

  content.innerHTML = `
    <div class="popup-title">보상 선택</div>
    <div class="popup-text">아이템 또는 아티팩트를 선택하세요</div>
    <div class="popup-buttons reward-buttons">
      ${buttonsHTML}
    </div>
  `;

  popup.classList.add('active');
  popup.dataset.choices = JSON.stringify(choices);
  popup.dataset.callback = callback ? 'true' : 'false';
}

function selectItemReward(index) {
  const popup = document.getElementById('popup');
  const choices = JSON.parse(popup.dataset.choices);
  const hasCallback = popup.dataset.callback === 'true';
  const choice = choices[index];

  if (choice.type === 'item') {
    // 덱에 아이템 추가
    game.deck.addItem(new Item(choice));
  } else if (choice.type === 'artifact') {
    // 아티팩트 추가 (추후 구현)
    console.log('아티팩트 획득:', choice.name);
  }

  closePopup();

  // 콜백이 있으면 실행 (층 완료 시 적 추가 팝업으로 이어짐)
  if (hasCallback) {
    game.showEnemyAddReward();
  }
}

// 적 추가 보상 팝업 (층 완료)
function showEnemyRewardPopup(choices) {
  const popup = document.getElementById('popup');
  const content = document.querySelector('.popup-content');

  if (!popup || !content) return;

  let buttonsHTML = '';
  choices.forEach((choice, index) => {
    buttonsHTML += `<button class="popup-button reward-button" onclick="selectEnemyReward(${index})">${choice.name} (HP:${choice.hp})</button>`;
  });

  content.innerHTML = `
    <div class="popup-title">덱 강화</div>
    <div class="popup-text">덱에 추가할 적을 선택하세요</div>
    <div class="popup-buttons reward-buttons">
      ${buttonsHTML}
    </div>
  `;

  popup.classList.add('active');
  popup.dataset.choices = JSON.stringify(choices);
}

function selectEnemyReward(index) {
  const popup = document.getElementById('popup');
  const choices = JSON.parse(popup.dataset.choices);
  const choice = choices[index];

  // 덱에 적 추가
  game.deck.addEnemy(new Enemy(choice));

  closePopup();

  // 층 완료 보상인 경우 다음 층으로 이동
  if (game.isFloorClear) {
    game.isFloorClear = false;
    game.nextFloor();
  }
}
