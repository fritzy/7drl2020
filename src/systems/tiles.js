const ECS = require('@fritzy/ecs');

class Tiles extends ECS.System {

  constructor(ecs, level, map) {

    super(ecs);
    this.level = level;
    this.map = map;
  }

  update() {

    const newTiles = this.ecs.queryEntities({
      has: ['Tile', 'New'],
      persist: 'newTiles'
    });
    //const map = this.ecs.getEntity('map');
    for (const entity of newTiles) {
      const tile = entity.Tile;
      const mapTile = this.level.map.setTile(tile.layer, tile.frame, tile.startX, tile.startY);
      if (mapTile.info.nextFrame) {
        entity.addTag('2Frame')
      }
      tile.tile = mapTile;
      entity.removeTag('New');
      this.map.MapLayer[tile.layer].tiles[`${tile.x}-${tile.y}`] = entity;
    }
    console.log(this.ecs.ticks);

  }
}

module.exports = Tiles;
