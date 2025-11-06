class Event extends Piece {
  constructor(data) {
    super(data);
    this.choices = data.choices || [];
  }

  interact(player, game) {
    // 특수 이벤트 처리
    if (this.effect === 'next_floor') {
      // 계단: 층 완료 보상 → 다음 층 이동
      game.isFloorClear = true;
      game.showItemReward(true); // callback=true (적 추가 팝업 이어짐)
      return true; // 계단 제거
    }

    if (this.id === 'treasure') {
      // 보물상자: 아이템/아티팩트 선택
      game.showItemReward(false);
      return true; // 보물상자 제거
    }

    // 일반 효과 적용
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
