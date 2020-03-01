const ECS = require('@fritzy/ecs');

class Tiles extends ECS.System {

  constructor(ecs, level) {

    super(ecs);
    this.level = level;
  }

  update() {

    const newTiles = this.ecs.queryEntities({
      has: ['Tile', 'New'],
      persist: 'newTiles'
    });
    for (const entity of newTiles) {
      const tile = entity.Tile;
      const mapTile = this.level.map.setTile(tile.layer, tile.frame, tile.startX, tile.startY);
      if (mapTile.info.nextFrame) {
        entity.addTag('2Frame')
      }
      tile.tile = mapTile;
      entity.removeTag('New');
    }
    console.log(this.ecs.ticks);

  }
}

module.exports = Tiles;
