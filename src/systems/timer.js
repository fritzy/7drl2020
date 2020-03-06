const ECS = require('@fritzy/ecs');

class Timer extends ECS.System {

  constructor(ecs, level) {

    super(ecs);
    this.level = level;
  }

  update() {

    const entities = this.ecs.queryEntities({
      has: ['Timer']
    });

    for (const entity of entities) {
      for (const timer of entity.Timer) {
        timer.turns--;
        if (timer.turns <= 0) {
          for (const name of Object.keys(timer.component)) {
            if (timer.component[name] === 'tag') {
              entity.addTag(name);
            } else {
              entity.addComponent(name, timer.component[name]);
            }
          }
          entity.removeComponent(timer);
        }
      }
    }
  }

}

module.exports = Timer;

