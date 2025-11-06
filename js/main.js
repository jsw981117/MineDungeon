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

  content.innerHTML = `
    <div class="popup-title">설정</div>
    <div class="popup-text">
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

  // 슬라이더 이벤트
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
