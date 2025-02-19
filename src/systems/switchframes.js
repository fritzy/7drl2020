const ECS = require('@fritzy/ecs');

class SwitchFrames extends ECS.System {

  constructor(ecs, level) {

    super(ecs);
    this.level = level;
  }

  update() {

    const newTiles = this.ecs.queryEntities({
      has: ['Tile', '2Frame'],
      persist: '2frameTiles'
    });
    for (const entity of newTiles) {
      const tile = entity.Tile;
      const next = this.level.map.mapComp.tileInfo[tile.frame].nextFrame;
      this.level.map.updateSpriteFrame(tile, next);
    }

  }
}

module.exports = SwitchFrames;
