class Settings {
  constructor() {
    this.textScale = parseFloat(localStorage.getItem('textScale')) || 1;
    this.buttonScale = parseFloat(localStorage.getItem('buttonScale')) || 1;
    this.orientation = localStorage.getItem('orientation') || 'portrait';
    this.apply();
  }

  apply() {
    document.documentElement.style.setProperty('--text-scale', this.textScale);
    document.documentElement.style.setProperty('--button-scale', this.buttonScale);

    // orientation 클래스 적용
    document.body.classList.remove('portrait', 'landscape');
    document.body.classList.add(this.orientation);
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

  setOrientation(value) {
    this.orientation = value;
    localStorage.setItem('orientation', this.orientation);
    this.apply();
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
}
