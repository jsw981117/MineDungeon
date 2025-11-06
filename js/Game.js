class Game {
  constructor() {
    this.player = new Player();
    this.board = new Board(8, 8);
    this.deck = new Deck();
    this.currentFloor = 1;
    this.uiManager = null;
    this.settings = new Settings();
  }

  init(canvas) {
    this.uiManager = new UIManager(canvas, this);
    this.initDeck();
    this.startFloor();
  }

  initDeck() {
    // 적 추가
    if (typeof ENEMIES_DATA !== 'undefined') {
      ENEMIES_DATA.forEach(data => {
        this.deck.addPiece(new Enemy(data));
      });
    }

    // 아이템 추가
    if (typeof ITEMS_DATA !== 'undefined') {
      ITEMS_DATA.forEach(data => {
        this.deck.addPiece(new Item(data));
      });
    }
  }

  startFloor() {
    const deckCopy = this.deck.clone();
    const floor = new Floor(this.currentFloor, this.board, deckCopy);
    floor.generate();
    this.uiManager.updateStats();
    this.uiManager.render();
  }

  nextFloor() {
    this.currentFloor++;
    this.startFloor();
  }

  onTileClick(x, y) {
    const tile = this.board.getTile(x, y);
    if (!tile) return;

    // 블럭 제거
    if (tile.hasBlock()) {
      tile.removeBlock();
      this.uiManager.render();
      return;
    }

    // 피스 상호작용
    if (tile.hasPiece()) {
      const piece = tile.piece;
      const shouldRemove = piece.interact(this.player, this);

      if (shouldRemove) {
        tile.removePiece();
      }

      this.uiManager.updateStats();
      this.uiManager.render();

      // 플레이어 사망 체크
      if (this.player.isDead()) {
        this.gameOver();
      }
    }
  }

  gameOver() {
    alert('Game Over!');
    this.currentFloor = 1;
    this.player = new Player();
    this.startFloor();
  }

  showEventChoices(event) {
    // 추후 팝업으로 구현
    console.log('Event:', event.name);
  }

  showShop() {
    // 추후 구현
    console.log('Shop opened');
  }
}
