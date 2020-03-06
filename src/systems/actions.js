const ECS = require('@fritzy/ecs');
const Pixi = require('pixi.js');

class Actions extends ECS.System {

  constructor(ecs, level) {

    super(ecs);
    this.level = level;
    this.tween = level.tween;
  }

  update() {

    const newTiles = this.ecs.queryEntities({
      has: ['Move', 'Tile'],
    });
    const map = this.ecs.getEntity('map');
    for (const entity of newTiles) {
      const tile = entity.Tile;
      const move = entity.Move;
      if (move.x > 0 && tile.facing === 'left') {
        tile.facing = 'right';
        this.level.map.updateSpriteFrame(tile, tile.frame);
      } else if (move.x < 0 && tile.facing === 'right') {
        tile.facing = 'left';
        this.level.map.updateSpriteFrame(tile, tile.frame);
      }
      const newX = tile.x + move.x;
      const newY = tile.y + move.y;
      const target = `${newX}-${newY}`;
      const targetWall = map.MapLayer['wall'].tiles[target];
      const targetChar = map.MapLayer['char'].tiles[target];
      const layer = map.MapLayer[tile.layer];
      if (targetWall && targetWall.Door && targetWall.Door.closed) {
        targetWall.addTag('ActionOpen');
      }
      if (
        (targetWall === undefined || !targetWall.tags.has('Impassable'))
        && (targetChar === undefined || !targetChar.tags.has('Impassable'))
      ) {
        tile.offX = -move.x * 16;
        tile.offY = -move.y * 16;

        if (entity.Animation) {
          for (const anim of entity.Animation) {
            anim.tween.stop();
          }
        }

        const tween = new this.level.tween.Tween(tile)
          .to({ offX: tile.offX / 2, offY: tile.offY / 2 - 8}, 75)
          .onUpdate(() => {
            this.level.map.updateSpritePos(tile);
          });
        const tween2 = new this.level.tween.Tween(tile)
          .to({ offX: 0, offY: 0}, 75)
          .onUpdate(() => {
            this.level.map.updateSpritePos(tile);
          });

        const tween3 = new this.level.tween.Tween(tile.sprite.scale)
          .to({ y: .8, x: 1.3 }, 25);
        const tween4 = new this.level.tween.Tween(tile.sprite.scale)
          .to({ y: 1, x: 1 }, 125);
        tween3.chain(tween4);
        tween3.start();

        const anim1 = entity.addComponent('Animation', { tween: tween });
        const anim2 = entity.addComponent('Animation', { tween: tween2 });
        const anim3 = entity.addComponent('Animation', { tween: tween3 });
        const anim4 = entity.addComponent('Animation', { tween: tween4 });

        tween.onStop(() => {
          entity.removeComponent(anim1);
        });
        tween.onComplete(() => {
          entity.removeComponent(anim1);
        });
        tween2.onStop(() => {
          entity.removeComponent(anim2);
        });
        tween2.onComplete(() => {
          entity.removeComponent(anim2);
        });
        tween3.onStop(() => {
          entity.removeComponent(anim3);
        });
        tween3.onComplete(() => {
          entity.removeComponent(anim3);
        });
        tween4.onStop(() => {
          entity.removeComponent(anim4);
        });
        tween4.onComplete(() => {
          entity.removeComponent(anim4);
        });

        tween.chain(tween2);
        tween.start()


        this.level.map.moveTile(layer, tile, tile.x + move.x, tile.y + move.y);
      }
      entity.removeComponent(move);
    }
    const doors = this.ecs.queryEntities({
      has: ['ActionOpen', 'Tile', 'Door'],
    });
    for (const door of doors) {
      const frame = door.Tile.frame.replace('closed', 'open');
      this.level.map.updateSpriteFrame(door.Tile, frame);
      door.removeTag('ActionOpen');
      door.removeTag('Impassable');
      door.Door.closed = false;
    }

  }
}

module.exports = Actions;
