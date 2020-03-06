const ECS = require('@fritzy/ecs');
const ROT = require('rot-js');
const Color = require('color');

class VisibleSystem extends ECS.System {

  constructor(ecs, level) {

    super(ecs);
    this.level = level;
  }

  update() {

    const entities = this.ecs.queryEntities({
      has: ['Player']
    });
    if (entities.size > 0) {
      const player = [...entities][0];

      console.log(ROT.FOV);
      const fov = new ROT.FOV.RecursiveShadowcasting(this.passable.bind(this));
      fov.compute(player.Tile.x, player.Tile.y, 4, (x, y, r, v) => {
        const tiles = this.level.map.getTilesAt(x, y);
        for (const tile of tiles) {
          const entity = tile.entity;
          entity.addTag('Seen');
          if (entity.Visible) {
            entity.Visible.seenTick = this.ecs.ticks;
          } else {
            entity.addComponent('Visible', { seenTick: this.ecs.ticks });
          }
          entity.Tile.sprite.visible = true;
          const color = Color('#d1daff');
          const d = this.level.tween.Easing.Quartic.In(r / 6) *.75;
          entity.Tile.sprite.tint = color.darken(1 - v + d).rgbNumber();
        }
      });
      const visE = this.ecs.queryEntities({ has: ['Visible', 'Tile'] });
      for (const entity of visE) {
        if (entity.Visible.seenTick !== this.ecs.ticks) {
          entity.removeComponent(entity.Visible);
          //entity.Tile.sprite.visible = false;
          const color = Color('#d1daff').darken(.75).rgbNumber();
          entity.Tile.sprite.tint = color;
        }
      }

    }
  }

  passable(x, y) {

    const tile = this.level.map.getTileInfo('wall', x, y);
    if (!tile) return true;
    if (tile.entity.tags.has('Impassable')) return false;
  }

}

module.exports = VisibleSystem;
