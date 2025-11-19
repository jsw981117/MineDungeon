class Settings {
  constructor() {
    // UI 설정
    this.textScale = parseFloat(localStorage.getItem('textScale')) || 1;
    this.buttonScale = parseFloat(localStorage.getItem('buttonScale')) || 1;
    this.orientation = localStorage.getItem('orientation') || 'portrait';
    this.holdDuration = parseFloat(localStorage.getItem('holdDuration')) || 0.6;

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
    }
  }

  getDefaultItems() {
    return [
      { id: 'sword', name: '검', attack: 3, durability: 5 },
      { id: 'axe', name: '도끼', attack: 5, durability: 3 },
      { id: 'spear', name: '창', attack: 2, durability: 10 }
    ];
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
      items: this.items
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
}
