class Artifact {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.effect = data.effect;
    this.value = data.value;
  }

  apply(player, game) {
    if (this.effect) {
      EffectHandler.apply(this.effect, this, { player, game, value: this.value, event: 'passive' });
    }
  }
}
