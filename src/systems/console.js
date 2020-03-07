const ECS = require('@fritzy/ecs');
const Pixi = require('pixi.js');
const charWidth = {
  M: 6,
  V: 4,
  W: 6,
  H: 4,
  I: 3,
  f: 3,
  i: 2,
  I: 2,
  K: 3,
  N: 5,
  h: 4,
  k: 3,
  m: 6,
  v: 4,
  w: 6,
  ':': 2,
  ',': 4,
  '.': 2,
  '"': 5,
  "'": 3,
  '*': 6,
  '^': 6,
  '<': 5,
  '>': 5,
  '#': 5,
  o: 4,
  k: 4,
  e: 4,
  s: 4,
  t: 4,
  l: 2
};

class ConsoleSystem extends ECS.System {

  constructor(ecs, level) {

    super(ecs);
    this.level = level;
    this.tween = level.tween;
    this.container = new Pixi.Container();
    this.container.scale.set(2, 2);
    this.level.addChild(this.container);
    this.console = this.ecs.createEntity({
      Console: {
      }
    });
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890\'"!.,%#/\\-><^*?:;'.split('');
    this.charTexture = {};
    for (const char of chars) {
      this.charTexture[char] = Pixi.Texture.from(`cdogs_font_${char.charCodeAt(0)}`)
    }
  }

  update() {

    const entities = this.ecs.queryEntities({
      has: ['New', 'Text']
    });
    const space = 3;
    const width = 4;

    const maxWidth = 150;
    let linebreak = false;
    for (const entity of entities) {
      let txt = entity.Text.text;
      const renderTexture = Pixi.RenderTexture.create(7 * txt.length, 8);
      const lineContainer = new Pixi.Container();
      let x = 0;
      const words = txt.split(' ');
      let wc = 0;
      for (const word of words) {
        for (const c of word) {
          x += charWidth[c] || width;
        }
        if (x > maxWidth) {
          linebreak = true;
          entity.Text.text = txt = words.slice(0, wc).join(' ');
          this.ecs.createEntity({
            tags: ['New'],
            Text: {
              text: '  ' + words.slice(wc, words.length).join(' ')
            }
          });
          break;
        }
        x += space;
        wc++;
      }
      x = 0;
      for (const c of txt) {
        if (c === ' ') {
          x += space;
          continue;
        }
        const sprite = new Pixi.Sprite(this.charTexture[c].clone());
        sprite.position.set(x, 0);
        lineContainer.addChild(sprite);
        //this.container.addChild(this.charSprites[c]);
        x += charWidth[c] || width;
      }
      this.level.game.renderer.render(lineContainer, renderTexture);
      entity.Text.sprite = new Pixi.Sprite(renderTexture);
      this.container.addChild(entity.Text.sprite);
      this.console.Console.texts.add(entity);
      entity.removeTag('New');
    };
    let y = 8;
    while (this.console.Console.texts.size > 36) {
      const entities = [...this.console.Console.texts];
      const entity = entities[0];
      entity.Text.sprite.destroy();
      this.console.Console.texts.delete(entity);
      entity.destroy();
    }
    for (const entity of this.console.Console.texts) {
      entity.Text.sprite.position.y = y;
      y += 8;
    }
    if (linebreak) {
      this.update();
    }
  }
}

module.exports = ConsoleSystem;

