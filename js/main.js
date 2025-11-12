let game;

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  game = new Game();
  game.init(canvas);

  setupSettingsButton();
  setupDeckButton();
});

function setupSettingsButton() {
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showSettingsPopup();
    });
  }
}

function setupDeckButton() {
  const deckBtn = document.getElementById('deckBtn');
  if (deckBtn) {
    deckBtn.addEventListener('click', () => {
      showDeckPopup();
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

// 덱 확인 팝업
function showDeckPopup() {
  const popup = document.getElementById('popup');
  const content = document.querySelector('.popup-content');

  if (!popup || !content) return;

  const enemies = game.deck.getAllEnemies();
  const items = game.deck.getAllItems();

  let enemiesHTML = '<div class="deck-section"><div class="deck-section-title">몬스터 피스</div><div class="deck-list">';
  if (enemies.length === 0) {
    enemiesHTML += '<div class="deck-empty">없음</div>';
  } else {
    enemies.forEach((enemy, index) => {
      enemiesHTML += `
        <div class="deck-item enemy-item" onclick="showPieceTooltip(event, 'enemy', ${index})">
          <div class="deck-item-name">${enemy.name}</div>
          <div class="deck-item-hp">HP: ${enemy.hp}/${enemy.maxHp}</div>
          <div class="deck-item-durability">내구도: ${enemy.durability}</div>
        </div>
      `;
    });
  }
  enemiesHTML += '</div></div>';

  let itemsHTML = '<div class="deck-section"><div class="deck-section-title">아이템 피스</div><div class="deck-list">';
  if (items.length === 0) {
    itemsHTML += '<div class="deck-empty">없음</div>';
  } else {
    items.forEach((item, index) => {
      // 타겟팅이 필요한 아이템인지 확인
      const needsTargeting = ['bow_attack', 'staff_attack', 'bomb_attack', 'poison_apply_3', 'burn_apply_4', 'freeze_apply'].includes(item.effect);

      itemsHTML += `
        <div class="deck-item item-item" onclick="showPieceTooltip(event, 'item', ${index})">
          <div class="deck-item-name">${item.name}</div>
          <div class="deck-item-durability">내구도: ${item.durability}</div>
          ${needsTargeting ? `<button class="use-item-btn" onclick="useItemFromDeck(event, ${index})">사용</button>` : ''}
        </div>
      `;
    });
  }
  itemsHTML += '</div></div>';

  content.innerHTML = `
    <div class="popup-title">덱 확인</div>
    ${enemiesHTML}
    ${itemsHTML}
    <div class="popup-buttons">
      <button class="popup-button" onclick="closePopup()">닫기</button>
    </div>
  `;

  popup.classList.add('active');
}

// 피스 정보 툴팁 표시
function showPieceTooltip(event, type, index) {
  event.stopPropagation();

  // 기존 툴팁 제거
  const existingTooltip = document.querySelector('.piece-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
    return; // 같은 피스를 다시 클릭하면 토글
  }

  let piece;
  if (type === 'enemy') {
    piece = game.deck.getAllEnemies()[index];
  } else if (type === 'item') {
    piece = game.deck.getAllItems()[index];
  }

  if (!piece) return;

  // 툴팁 생성
  const tooltip = document.createElement('div');
  tooltip.className = 'piece-tooltip';

  let tooltipHTML = `<div class="tooltip-title">${piece.name}</div>`;

  if (type === 'enemy') {
    tooltipHTML += `
      <div class="tooltip-stat">HP: ${piece.hp}/${piece.maxHp}</div>
      <div class="tooltip-stat">공격력: ${piece.attack}</div>
      <div class="tooltip-stat">방어력: ${piece.defense}</div>
      <div class="tooltip-stat">내구도: ${piece.durability}</div>
    `;
    if (piece.critRate > 0) tooltipHTML += `<div class="tooltip-stat">치명타율: ${piece.critRate}%</div>`;
    if (piece.evasion > 0) tooltipHTML += `<div class="tooltip-stat">회피율: ${piece.evasion}%</div>`;
    if (piece.description) tooltipHTML += `<div class="tooltip-description">${piece.description}</div>`;
    if (piece.effect) tooltipHTML += `<div class="tooltip-effect">효과: ${piece.effect}</div>`;
  } else if (type === 'item') {
    tooltipHTML += `
      <div class="tooltip-stat">내구도: ${piece.durability}</div>
    `;
    if (piece.description) tooltipHTML += `<div class="tooltip-description">${piece.description}</div>`;
    if (piece.effect) tooltipHTML += `<div class="tooltip-effect">효과: ${piece.effect}</div>`;
  }

  tooltip.innerHTML = tooltipHTML;
  document.body.appendChild(tooltip);

  // 위치 계산 (클릭한 요소 근처)
  const target = event.currentTarget;
  const targetRect = target.getBoundingClientRect();

  // 툴팁을 일단 화면에 추가해서 크기 계산
  const tooltipRect = tooltip.getBoundingClientRect();

  // 기본 위치: 클릭한 요소 오른쪽
  let left = targetRect.right + 10;
  let top = targetRect.top;

  // 오른쪽 경계 체크
  if (left + tooltipRect.width > window.innerWidth) {
    // 왼쪽에 표시
    left = targetRect.left - tooltipRect.width - 10;
  }

  // 왼쪽 경계 체크
  if (left < 0) {
    // 요소 아래에 표시
    left = targetRect.left;
    top = targetRect.bottom + 10;
  }

  // 하단 경계 체크
  if (top + tooltipRect.height > window.innerHeight) {
    top = window.innerHeight - tooltipRect.height - 10;
  }

  // 상단 경계 체크
  if (top < 0) {
    top = 10;
  }

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}

// 팝업 닫을 때 툴팁도 제거
document.addEventListener('click', (e) => {
  if (!e.target.closest('.deck-item') && !e.target.closest('.piece-tooltip')) {
    const tooltip = document.querySelector('.piece-tooltip');
    if (tooltip) tooltip.remove();
  }
});

// 덱에서 아이템 사용
function useItemFromDeck(event, index) {
  event.stopPropagation();

  const item = game.deck.getAllItems()[index];
  if (!item) return;

  // 타겟팅 타입 결정
  let targetingType = 'single';
  if (item.effect === 'staff_attack') {
    targetingType = 'row'; // 또는 'col' - 일단 row로
  } else if (item.effect === 'bomb_attack') {
    targetingType = 'area';
  }

  // 타겟팅 모드 시작
  game.startTargeting(item, targetingType);

  // 팝업 닫기
  closePopup();
}

// 이벤트 선택지 팝업
function showEventChoicesPopup(event) {
  const popup = document.getElementById('popup');
  const content = document.querySelector('.popup-content');

  if (!popup || !content) return;

  let buttonsHTML = '';
  event.choices.forEach((choice, index) => {
    buttonsHTML += `<button class="popup-button reward-button" onclick="selectEventChoice('${event.id}', ${index})">${choice.text}</button>`;
  });

  content.innerHTML = `
    <div class="popup-title">${event.name}</div>
    <div class="popup-text">${event.description || ''}</div>
    <div class="popup-buttons reward-buttons">
      ${buttonsHTML}
    </div>
  `;

  popup.classList.add('active');

  // 이벤트 정보 저장
  popup.dataset.eventId = event.id;
}

// 이벤트 선택지 선택
function selectEventChoice(eventId, choiceIndex) {
  // 보드에서 해당 이벤트 찾기
  const tiles = game.board.getTiles();
  const eventTile = tiles.find(t => t.hasPiece() && t.piece.type === 'event' && t.piece.id === eventId);

  if (eventTile && eventTile.piece) {
    const event = eventTile.piece;
    event.selectChoice(choiceIndex, game.player, game);

    // 이벤트 제거
    eventTile.removePiece();
    game.uiManager.render();
  }

  closePopup();
}
