const ECS = require('@fritzy/ecs');
const Pixi = require('pixi.js');

class Tiles extends ECS.System {

  constructor(ecs, level, map) {

    super(ecs);
    this.level = level;
    this.map = map;
    this.game = this.level.ecs.getEntity('game').Game;
  }

  update() {

    const newTiles = this.ecs.queryEntities({
      has: ['Tile', 'New'],
      persist: 'newTiles'
    });
    for (const entity of newTiles) {
      const tile = entity.Tile;
      this.level.map.setupTile(tile, false);
      if (this.game.tileInfo[tile.frame].nextFrame) {
        entity.addTag('2Frame')
      }
    }
    for (const entity of newTiles) {
      const tile = entity.Tile;
      tile.sprite.visible = false;
      const layer = this.level.map.mapEntity.MapLayer[tile.layer];
      this.level.map.updateBySet(layer, tile.x, tile.y, true);
      entity.removeTag('New');
    }


  }
}

module.exports = Tiles;
