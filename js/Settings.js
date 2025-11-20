class Settings {
  constructor() {
    // UI 설정
    this.textScale = parseFloat(localStorage.getItem('textScale')) || 1;
    this.buttonScale = parseFloat(localStorage.getItem('buttonScale')) || 1;
    this.orientation = localStorage.getItem('orientation') || 'portrait';
    this.holdDuration = parseFloat(localStorage.getItem('holdDuration')) || 0.6;
    this.dragStartDuration = parseFloat(localStorage.getItem('dragStartDuration')) || 0.2;
    this.vibrationEnabled = localStorage.getItem('vibrationEnabled') !== 'false'; // 기본값: true
    this.vibrationIntensity = parseInt(localStorage.getItem('vibrationIntensity')) || 2; // 0-3, 기본값: 2 (보통)

    // 능력치 UI 설정
    this.statsUIWidth = parseFloat(localStorage.getItem('statsUIWidth')) || 0.5; // 인벤토리 넓이의 0.5배
    this.statsUIHeight = parseFloat(localStorage.getItem('statsUIHeight')) || 0.5; // 인벤토리 높이의 0.5배
    this.statsHpTextScale = parseFloat(localStorage.getItem('statsHpTextScale')) || 1.0;
    this.statsAttackTextScale = parseFloat(localStorage.getItem('statsAttackTextScale')) || 1.0;

    // 애니메이션 설정
    this.animationEnabled = localStorage.getItem('animationEnabled') !== 'false'; // 기본값: true
    this.animationInitialVelocityY = parseFloat(localStorage.getItem('animationInitialVelocityY')) || -10;
    this.animationGravity = parseFloat(localStorage.getItem('animationGravity')) || 0.5;

    // 게임 설정
    this.loadGameSettings();

    this.apply();
  }

  loadGameSettings() {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.boardSize = parsed.boardSize || 16;
      this.enemyCount = parsed.enemyCount || 40;
      this.itemCount = parsed.itemCount || 10;
      this.enemyBaseHp = parsed.enemyBaseHp || 3;
      this.hpPerFloor = parsed.hpPerFloor || 2;
      this.attackPerFloors = parsed.attackPerFloors || 2;
      this.playerInitialHp = parsed.playerInitialHp || 10;
      this.playerAttack = parsed.playerAttack || 1;
      this.items = parsed.items || this.getDefaultItems();
      this.startingItems = parsed.startingItems || this.getDefaultStartingItems();
    } else {
      // 기본값
      this.boardSize = 16;
      this.enemyCount = 40;
      this.itemCount = 10;
      this.enemyBaseHp = 3;
      this.hpPerFloor = 2;
      this.attackPerFloors = 2;
      this.playerInitialHp = 10;
      this.playerAttack = 1;
      this.items = this.getDefaultItems();
      this.startingItems = this.getDefaultStartingItems();
    }
  }

  getDefaultItems() {
    return [
      { id: 'sword', name: '검', attack: 3, durability: 5, usable: false, equippable: true },
      { id: 'axe', name: '도끼', attack: 5, durability: 3, usable: false, equippable: true },
      { id: 'spear', name: '창', attack: 2, durability: 10, usable: false, equippable: true },
      { id: 'health_potion', name: '회복 포션', attack: 0, durability: 1, usable: true, equippable: false, effect: 'heal', effectValue: 30 }
    ];
  }

  getDefaultStartingItems() {
    return ['sword', 'health_potion'];
  }

  saveGameSettings() {
    const settings = {
      boardSize: this.boardSize,
      enemyCount: this.enemyCount,
      itemCount: this.itemCount,
      enemyBaseHp: this.enemyBaseHp,
      hpPerFloor: this.hpPerFloor,
      attackPerFloors: this.attackPerFloors,
      playerInitialHp: this.playerInitialHp,
      playerAttack: this.playerAttack,
      items: this.items,
      startingItems: this.startingItems
    };
    localStorage.setItem('gameSettings', JSON.stringify(settings));
  }

  apply() {
    document.documentElement.style.setProperty('--text-scale', this.textScale);
    document.documentElement.style.setProperty('--button-scale', this.buttonScale);

    // orientation 클래스 적용
    document.body.classList.remove('portrait', 'landscape');
    document.body.classList.add(this.orientation);
  }

  // UI 설정
  setTextScale(value) {
    this.textScale = Math.max(0.5, Math.min(2, value));
    localStorage.setItem('textScale', this.textScale);
    this.apply();
  }

  setButtonScale(value) {
    this.buttonScale = Math.max(0.5, Math.min(2, value));
    localStorage.setItem('buttonScale', this.buttonScale);
    this.apply();
  }

  setOrientation(value) {
    this.orientation = value;
    localStorage.setItem('orientation', this.orientation);
    this.apply();
  }

  setHoldDuration(value) {
    this.holdDuration = Math.max(0.1, Math.min(2, value));
    localStorage.setItem('holdDuration', this.holdDuration);
  }

  setDragStartDuration(value) {
    this.dragStartDuration = Math.max(0.1, Math.min(2, value));
    localStorage.setItem('dragStartDuration', this.dragStartDuration);
  }

  getDragStartDuration() {
    return this.dragStartDuration;
  }

  getTextScale() {
    return this.textScale;
  }

  getButtonScale() {
    return this.buttonScale;
  }

  getOrientation() {
    return this.orientation;
  }

  getHoldDuration() {
    return this.holdDuration;
  }

  // 게임 설정
  setBoardSize(value) {
    this.boardSize = Math.max(5, Math.min(30, value));
    this.saveGameSettings();
  }

  setEnemyCount(value) {
    this.enemyCount = Math.max(1, Math.min(this.boardSize * this.boardSize - 2, value));
    this.saveGameSettings();
  }

  setItemCount(value) {
    this.itemCount = Math.max(0, Math.min(this.boardSize * this.boardSize - 2, value));
    this.saveGameSettings();
  }

  setEnemyBaseHp(value) {
    this.enemyBaseHp = Math.max(1, Math.min(1000, value));
    this.saveGameSettings();
  }

  setHpPerFloor(value) {
    this.hpPerFloor = Math.max(0, Math.min(100, value));
    this.saveGameSettings();
  }

  setAttackPerFloors(value) {
    this.attackPerFloors = Math.max(1, Math.min(10, value));
    this.saveGameSettings();
  }

  addItem(item) {
    this.items.push(item);
    this.saveGameSettings();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveGameSettings();
  }

  updateItem(index, item) {
    this.items[index] = item;
    this.saveGameSettings();
  }

  getItems() {
    return this.items;
  }

  getBoardSize() {
    return this.boardSize;
  }

  getEnemyCount() {
    return this.enemyCount;
  }

  getItemCount() {
    return this.itemCount;
  }

  getEnemyBaseHp() {
    return this.enemyBaseHp;
  }

  getHpPerFloor() {
    return this.hpPerFloor;
  }

  getAttackPerFloors() {
    return this.attackPerFloors;
  }

  setPlayerInitialHp(value) {
    this.playerInitialHp = Math.max(1, Math.min(1000, value));
    this.saveGameSettings();
  }

  setPlayerAttack(value) {
    this.playerAttack = Math.max(1, Math.min(100, value));
    this.saveGameSettings();
  }

  getPlayerInitialHp() {
    return this.playerInitialHp;
  }

  getPlayerAttack() {
    return this.playerAttack;
  }

  // 진동 설정
  setVibrationEnabled(value) {
    this.vibrationEnabled = value;
    localStorage.setItem('vibrationEnabled', value);
  }

  getVibrationEnabled() {
    return this.vibrationEnabled;
  }

  setVibrationIntensity(value) {
    this.vibrationIntensity = Math.max(0, Math.min(3, value));
    localStorage.setItem('vibrationIntensity', this.vibrationIntensity);
  }

  getVibrationIntensity() {
    return this.vibrationIntensity;
  }

  getVibrationDuration() {
    // 0: 꺼짐, 1: 약함(20ms), 2: 보통(50ms), 3: 강함(100ms)
    const durations = [0, 20, 50, 100];
    return durations[this.vibrationIntensity];
  }

  // 능력치 UI 설정
  setStatsUIWidth(value) {
    this.statsUIWidth = Math.max(0.3, Math.min(1.0, value));
    localStorage.setItem('statsUIWidth', this.statsUIWidth);
  }

  getStatsUIWidth() {
    return this.statsUIWidth;
  }

  setStatsUIHeight(value) {
    this.statsUIHeight = Math.max(0.3, Math.min(1.0, value));
    localStorage.setItem('statsUIHeight', this.statsUIHeight);
  }

  getStatsUIHeight() {
    return this.statsUIHeight;
  }

  setStatsHpTextScale(value) {
    this.statsHpTextScale = Math.max(0.5, Math.min(2.0, value));
    localStorage.setItem('statsHpTextScale', this.statsHpTextScale);
  }

  getStatsHpTextScale() {
    return this.statsHpTextScale;
  }

  setStatsAttackTextScale(value) {
    this.statsAttackTextScale = Math.max(0.5, Math.min(2.0, value));
    localStorage.setItem('statsAttackTextScale', this.statsAttackTextScale);
  }

  getStatsAttackTextScale() {
    return this.statsAttackTextScale;
  }

  // 애니메이션 설정
  setAnimationEnabled(value) {
    this.animationEnabled = value;
    localStorage.setItem('animationEnabled', value);
  }

  getAnimationEnabled() {
    return this.animationEnabled;
  }

  setAnimationInitialVelocityY(value) {
    this.animationInitialVelocityY = Math.max(-20, Math.min(-5, value));
    localStorage.setItem('animationInitialVelocityY', this.animationInitialVelocityY);
  }

  getAnimationInitialVelocityY() {
    return this.animationInitialVelocityY;
  }

  setAnimationGravity(value) {
    this.animationGravity = Math.max(0.1, Math.min(2.0, value));
    localStorage.setItem('animationGravity', this.animationGravity);
  }

  getAnimationGravity() {
    return this.animationGravity;
  }

  // 시작 아이템 설정
  getStartingItems() {
    return this.startingItems;
  }

  setStartingItems(items) {
    this.startingItems = items;
    this.saveGameSettings();
  }

  addStartingItem(itemId) {
    if (this.startingItems.length >= 4) return false; // 최대 4개
    this.startingItems.push(itemId);
    this.saveGameSettings();
    return true;
  }

  removeStartingItem(index) {
    this.startingItems.splice(index, 1);
    this.saveGameSettings();
  }
}
