const ECS = require('@fritzy/ecs');
const ROT = require('rot-js');
const Color = require('color');

const dark = Color('#d1daff').darken(.75).rgbNumber();

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

      const fov = new ROT.FOV.RecursiveShadowcasting(this.passable.bind(this));
      fov.compute(player.Tile.x, player.Tile.y, 20, (x, y, r, v) => {
        const tiles = this.level.map.getTilesAt(x, y);
        for (const tile of tiles) {
          const entity = tile.entity;
          entity.addTag('Seen');
          /*
          entity.Tile.sprite.visible = true;
          const dark = Color('#d1daff').darken(.75).rgbNumber();
          entity.Tile.sprite.tint = dark;
          */
          if (entity.Visible) {
            entity.Visible.seenTick = this.ecs.ticks;
          } else {
            entity.addComponent('Visible', { seenTick: this.ecs.ticks });
          }
          if (entity.Light) {
            let color;
            for (const light of entity.Light) {
              if (entity.tags.has('Impassable') && !entity.Door) {
                const px = player.Tile.x;
                const ex = entity.Tile.x;
                const sx = light.source.Tile.x;
                const py = player.Tile.y;
                const ey = entity.Tile.y;
                const sy = light.source.Tile.y;
                if ((px < ex && ex < sx)
                  || (px > ex && ex > sx)
                  || (py < ey && ey < sy)
                  || (py > ey && ey > sy)) continue;
              }
              const c = Color(light.tint);
              if (color && color.hex() !== c.hex()) {
                color = color.mix(c);
              } else {
                color = c;
              }
            }
            if (color) {
              entity.Tile.sprite.visible = true;
              //const color = Color('#d1daff');
              const d = this.level.tween.Easing.Quartic.In(r / 6) *.75;
              entity.Tile.sprite.tint = color.rgbNumber();
            } else {
              if (entity.tags.has('Character')) entity.Tile.sprite.visible = false;
              entity.Tile.sprite.tint = dark;
            }
          } else {
            if (entity.tags.has('Character')) entity.Tile.sprite.visible = false;
            entity.Tile.sprite.tint = dark;
          }
        }
      });
      const visE = this.ecs.queryEntities({ has: ['Visible', 'Tile'] });
      for (const entity of visE) {
        if (entity.Visible.seenTick !== this.ecs.ticks) {
          entity.removeComponent(entity.Visible);
          if (entity.tags.has('Character')) entity.Tile.sprite.visible = false;
          //entity.Tile.sprite.visible = false;
          entity.Tile.sprite.tint = dark;
        }
      }

    }
  }

  passable(x, y) {

    const tile = this.level.map.getTileInfo('wall', x, y);
    if (!tile) return true;
    if (tile.entity.tags.has('Impassable')) return false;
    return true;
  }

}

module.exports = VisibleSystem;
