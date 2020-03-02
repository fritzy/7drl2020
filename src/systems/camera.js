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
        camera.Camera.target = [...players][0];
      }
    }
    if (camera.Animation && camera.Camera.target) {
      if (camera.Animation.x !== camera.Camera.target.Tile.sprite.position.x
        || camera.Animation.y !== camera.Camera.target.Tile.sprite.position.y) {
        camera.Animation.tween.stop()
      }
    }
    if (camera.Camera.target && !camera.Animation && camera.Camera.target.Tile.sprite) {
      const sprite = camera.Camera.target.Tile.sprite;
      const container = this.level.map.container;
      camera.addComponent('Animation', {
        x: sprite.x,
        y: sprite.y
      });
      const tween = new this.tween.Tween(container.position)
        .to({ x: -sprite.position.x * container.scale.x + 400, y: -sprite.position.y * container.scale.y + 320}, 1000)
        .easing(this.tween.Easing.Exponential.Out)
        .onStop(() => {
          camera.removeComponent(camera.Animation);
        })
        .onComplete(() => {
          camera.removeComponent(camera.Animation);
        })
        .start();
      camera.Animation.tween = tween;

    }

  }

}

module.exports = Camera;
