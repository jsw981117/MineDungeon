class Event extends Piece {
  constructor(data) {
    super(data);
    this.choices = data.choices || [];
  }

  interact(player, game) {
    // 이벤트 UI 표시
    if (this.effect) {
      EffectHandler.apply(this.effect, this, { player, game, event: 'on_interact' });
    }

    // 선택지가 있으면 표시
    if (this.choices.length > 0) {
      game.showEventChoices(this);
      return false; // 선택 전까지 제거하지 않음
    }

    return true; // 즉시 제거
  }

  selectChoice(choiceIndex, player, game) {
    if (choiceIndex < 0 || choiceIndex >= this.choices.length) return;

    const choice = this.choices[choiceIndex];
    if (choice.effect) {
      EffectHandler.apply(choice.effect, this, { player, game });
    }
  }
}
