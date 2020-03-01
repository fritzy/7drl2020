class Input {

  constructor() {

    this.keys = new Set();
    this.buffer = [];
    window.addEventListener('keydown', this.keyDown.bind(this));
    window.addEventListener('keyup', this.keyUp.bind(this));
  }

  keyDown(e) {

    this.keys.add(e.code);
    this.buffer.push(e.code);
  }

  keyUp(e) {
    this.keys.delete(e.code);
  }
}

module.exports = Input;
