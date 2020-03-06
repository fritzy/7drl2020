const ECS = require('@fritzy/ecs');
class Camera extends ECS.System {

  constructor(ecs, level) {

    super(ecs);
    this.level = level;
    this.tween = level.tween;
  }

  update() {

    const camera = this.ecs.getEntity('camera');
    if (!camera.Camera.target) {
      const players = this.ecs.queryEntities({ has: ['Player'] });
      if (players.size > 0) {
        const player = [...players][0];
        camera.Camera.target = player;
        camera.Camera.targetPos = this.level.map.getPos(player.Tile.x, player.Tile.y);
      }
    }
    if (camera.Animation && camera.Camera.target) {
      const ttile = camera.Camera.target.Tile;
      const pos = this.level.map.getPos(ttile.x, ttile.y);
      if (camera.Animation.x !== pos.x
        || camera.Animation.y !== pos.y) {
        camera.Animation.tween.stop()
      }
    }

    if (camera.Camera.target && !camera.Animation && camera.Camera.target.Tile.sprite) {
      const ttile = camera.Camera.target.Tile;
      const pos = this.level.map.getPos(ttile.x, ttile.y);

      const sprite = camera.Camera.target.Tile.sprite;
      const container = this.level.map.container;
      const animation = camera.addComponent('Animation', {
        x: pos.x,
        y: pos.y
      });
      const tween = new this.tween.Tween(container.position)
        .to({ x: -pos.x * container.scale.x + 400, y: -pos.y * container.scale.y + 320}, 1000)
        .easing(this.tween.Easing.Sinusoidal.Out)
        .onStop(() => {
          camera.removeComponent(animation);
        })
        .onComplete(() => {
          camera.removeComponent(animation);
        })
        .start();
      camera.Animation.tween = tween;

    }

  }

}

module.exports = Camera;
