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
      if (move.x > 0 && tile.tile.sprite.scale.x > 0) {
        tile.tile.sprite.scale.x *= -1;
        tile.tile.sprite.anchor.set(.5, 0);
        tile.offX = 8;
      } else if (move.x < 0 && tile.tile.sprite.scale.x < 0) {
        tile.tile.sprite.scale.x *= -1;
        tile.tile.sprite.anchor.set(.5, 0);
        tile.offX = 8;
      }
      tile.tile.layer.moveTile(tile.tile, tile.x + move.x, tile.y + move.y);
      entity.removeComponent(move);
    }

  }
}

module.exports = Actions;
