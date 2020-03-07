const ECS = require('@fritzy/ecs');
const ROT = require('rot-js');
const Color = require('color');
const dark = Color('#d1daff').darken(.75).rgbNumber();

class LightSystem extends ECS.System {

  constructor(ecs, level) {

    super(ecs);
    this.level = level;
    this.ecs.subscribe(this, 'Light');
    this.newLight = [];
    this.removeLight = [];
  }

  _sendChange(event) {
    if (event.op === 'addComponent') {
      this.newLight.push(event.component.entity);
    } else if (event.op === 'removeComponent') {
      this.removeLight.push(event.component.entity);
    }
  }

  update() {

    //console.log('create', this.newLight);
    //console.log('delete', this.removeLight.length);
    this.newLight = [];
    this.removeLight = [];

    const entities = this.ecs.queryEntities({
      has: ['LightSource'],
      updatedValues: this.ecs.ticks
    });
    const entities3 = this.ecs.queryEntities({
      has: ['UpdateLightSource'],
    });
    for (const entity of entities3) {
      entities.add(entity);
    }
    let idx = 0;
    for (const source of entities) {
      source.removeTag('UpdateLightSource');
      idx++;
      const removeMap = new Set();
      for (const light of this.ecs.getComponents('Light')) {
        const entity = light.entity
        if (light.source === source) {
          removeMap.add(`${light.entity.Tile.x}x${light.entity.Tile.y}`);
          //light.entity.removeComponent(light);
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
        if (removeMap.has(coord)) {
          removeMap.delete(coord);
          return;
        }
        const tiles = this.level.map.getTilesAt(x, y);
        for (const tile of tiles) {
          const entity = tile.entity;
          const color = Color(source.LightSource.color);
          const d = this.level.tween.Easing.Quartic.In(r / 6) *.75;
          entity.addComponent('Light', {
            tint: color.darken(1 - v + d).rgbNumber(),
            tint: color.rgbNumber(),
            source: source
          });
        }
      });
      for (const coord of removeMap) {
        const ca = coord.split('x');
        const x = parseInt(ca[0], 10);
        const y = parseInt(ca[1], 10);
        const tiles = this.level.map.getTilesAt(x, y);
        for (const tile of tiles) {
          if (tile.entity.Light) {
            for (const light of tile.entity.Light) {
              if (light.source === source) {
                light.entity.removeComponent(light);
              }
            }
            if (!tile.entity.Light) {
              tile.sprite.tint = dark;
              if (tile.entity.tags.has('NPC')) {
                tile.sprite.visible = false;
              }
            }
          }
        }
      }
    }
    const entities2 = this.ecs.queryEntities({
      has: ['UpdateLighting', 'Character']
    });
    for (const entity of entities2) {
      for (const light of entity.Light) {
        entity.removeComponent(light);
      }
      const tile = this.level.map.getTileInfo('floor', entity.Tile.x, entity.Tile.y);
      if (tile.entity.Light) {
        for (const light of tile.entity.Light) {
          entity.addComponent('Light', {
            tint: light.tint,
            source: light.source
          });
        }
      }
      entity.removeTag('UpdateLighting');
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
