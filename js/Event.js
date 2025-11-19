class Event extends Piece {
  constructor(data) {
    super(data);
  }

  interact(player, game, tile = null) {
    // 계단: 다음 층으로
    if (this.id === 'stair') {
      game.nextFloor();
      return true; // 타일에서 제거
    }

    return true; // 즉시 제거
  }
}
