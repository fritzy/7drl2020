const ECS = require('@fritzy/ecs');

class Actions extends ECS.System {

  constructor(ecs, level) {

    super(ecs);
    this.level = level;
  }

  update() {

    const newTiles = this.ecs.queryEntities({
      has: ['Move', 'Tile'],
    });
    for (const entity of newTiles) {
      const tile = entity.Tile;
      const move = entity.Move;
      tile.tile.layer.moveTile(tile.tile, tile.x + move.x, tile.y + move.y);
      entity.removeComponent(move);
    }

  }
}

module.exports = Actions;
