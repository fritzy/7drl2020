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
    const map = this.ecs.getEntity('map');
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
      const newX = tile.x + move.x;
      const newY = tile.y + move.y;
      const target = `${newX}-${newY}`;
      const targetWall = map.MapLayer['wall'].tiles[target];
      const targetChar = map.MapLayer['char'].tiles[target];
      if (
        (targetWall === undefined || !targetWall.tags.has('Impassable'))
        && (targetChar === undefined || !targetChar.tags.has('Impassable'))
      ) {
        tile.tile.layer.moveTile(tile.tile, tile.x + move.x, tile.y + move.y);
      }
      entity.removeComponent(move);
    }

  }
}

module.exports = Actions;
