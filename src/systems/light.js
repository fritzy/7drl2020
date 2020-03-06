const ECS = require('@fritzy/ecs');
const ROT = require('rot-js');
const Color = require('color');

class LightSystem extends ECS.System {

  constructor(ecs, level) {

    super(ecs);
    this.level = level;
  }

  update() {

    const entities = this.ecs.queryEntities({
      has: ['LightSource'],
      updatedValues: this.ecs.ticks
    });
    let idx = 0;
    for (const source of entities) {
      idx++;
      for (const light of this.ecs.getComponents('Light')) {
        const entity = light.entity
        if (light.source === source) {
          light.entity.removeComponent(light);
        }
        if (!entity.Light && entity.Tile) {
            const color = Color('#d1daff').darken(.75).rgbNumber();
            entity.Tile.sprite.tint = color;
            entity.removeTag('Flicker');
        }
      }
      const fov = new ROT.FOV.RecursiveShadowcasting(this.passable.bind(this));
      const used = new Set();
      fov.compute(source.Tile.x, source.Tile.y, source.LightSource.radius, (x, y, r, v) => {
        const coord = `${x}x${y}`;
        if (used.has(coord)) {
          return;
        }
        used.add(coord);
        const tiles = this.level.map.getTilesAt(x, y);
        for (const tile of tiles) {
          const entity = tile.entity;
          const color = Color(source.LightSource.color);
          const d = this.level.tween.Easing.Quartic.In(r / 6) *.75;
          entity.addComponent('Light', {
            tint: color.darken(1 - v + d).rgbNumber(),
            source: source
          });
          entity.addTag('Flicker');
        }
      });
    }
  }

  passable(x, y) {

    const tile = this.level.map.getTileInfo('wall', x, y);
    if (!tile) return true;
    if (tile.entity.tags.has('Impassable')) return false;
    return true;
  }
}

module.exports = LightSystem;
