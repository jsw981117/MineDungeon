class Settings {
  constructor() {
    this.textScale = parseFloat(localStorage.getItem('textScale')) || 1;
    this.buttonScale = parseFloat(localStorage.getItem('buttonScale')) || 1;
    this.apply();
  }

  apply() {
    document.documentElement.style.setProperty('--text-scale', this.textScale);
    document.documentElement.style.setProperty('--button-scale', this.buttonScale);
  }

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

  getTextScale() {
    return this.textScale;
  }

  getButtonScale() {
    return this.buttonScale;
  }
}
