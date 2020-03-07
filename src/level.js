const Pixi = require('pixi.js');
const Scene = require('./scene');
const TileMap = require('./tilemap')(Pixi);
const ECS = require('@fritzy/ecs');
const Input = require('./input');
const Components = require('./components/index');
const Tags = require('./components/tags');
const TileSystem = require('./systems/tiles');
const SwitchFrameSystem = require('./systems/switchframes');
const ActionSystem = require('./systems/actions');
const DormGen = require('./gen/dorm');
const Camera = require('./systems/camera');
const TimerSystem = require('./systems/timer');
const VisibleSystem = require('./systems/visible');
const LightSystem = require('./systems/light');
const ConsoleSystem = require('./systems/console');
let Tween;
const Filters = require('pixi-filters');
class Level extends Scene.Scene {

  constructor(game) {

    super(game);
    this.ecs = new ECS.ECS();
    this.input = new Input();
    for (const cname of Object.keys(Components)) {
      this.ecs.registerComponent(cname, Components[cname]);
    }
    this.ecs.registerTags(Tags);
    this.ecs.addSystem('2frame', new SwitchFrameSystem(this.ecs, this));
    this.ecs.addSystem('actions', new ActionSystem(this.ecs, this));
    this.ecs.addSystem('actions', new TimerSystem(this.ecs, this));
    this.ecs.addSystem('visible', new LightSystem(this.ecs, this));
    this.ecs.addSystem('visible', new VisibleSystem(this.ecs, this));
    this.tween = null;
    /*
    this.filters = [new Filters.CRTFilter({
      lineWidth: 2,
      noiseSize: 1,
      noise: .4
    })];
    */
  }

  async standUp() {

    const tweenModule = await import('@tweenjs/tween.js');
    Tween = this.tween = tweenModule.default;

    const game = this.ecs.createEntity({
      id: 'game',
      Game: {
        game: this
      }
    });
    const map = this.ecs.createEntity({
      id: 'map',
      tags: ['New'],
      Map: {
      },
      MapLayer: {
        'floor': {},
        'wall': {},
        'deco': {},
        'char': {}
      }
    });
    this.ecs.addSystem('tiles', new TileSystem(this.ecs, this, map));
    this.ecs.addSystem('animation', new Camera(this.ecs, this));

	this.ecs.createEntity({
      id: 'camera',
      Camera: {
      }
	});

    this.map = new TileMap.TileMap(this, map);
    this.map.setScale(2);
    this.ui = new Pixi.Container();

    //this.addChild(this.map);
    this.addChild(this.ui);

    this.cursor = new Pixi.Graphics();
    this.cursor.lineStyle(1, 0xffffff, 1);
    this.cursor.moveTo(-4, -8);
    this.cursor.lineTo(-8, -8);
    this.cursor.lineTo(-8, -4);
    this.cursor.moveTo(-4, 8);
    this.cursor.lineTo(-8, 8);
    this.cursor.lineTo(-8, 4);
    this.cursor.moveTo(4, -8);
    this.cursor.lineTo(8, -8);
    this.cursor.lineTo(8, -4);
    this.cursor.moveTo(4, 8);
    this.cursor.lineTo(8, 8);
    this.cursor.lineTo(8, 4);
    this.cursor.scale.set(2, 2);

    this.lastFrame = 0;

    //this.cursor.position.set(200, 200);

    this.tileInfo = {
      frame: 'floor-0s',
      pos: null
    };

    this.mouseInfo = {
      x: null,
      y: null,
      button1: false,
      button2: false
    };

    this.map.addResources(Pixi.Loader.shared.resources['assets/floor.json'].data.frames);
    this.map.addResources(Pixi.Loader.shared.resources['assets/wall.json'].data.frames);
    //this.map.addResources(Pixi.Loader.shared.resources['player0'].data.frames);
    //this.map.addResources(Pixi.Loader.shared.resources['player1'].data.frames);
    this.map.addResources(Pixi.Loader.shared.resources['pit0'].data.frames);
    //this.map.addResources(Pixi.Loader.shared.resources['pit1'].data.frames);
    this.map.addResources(Pixi.Loader.shared.resources['door0'].data.frames);
    this.map.addResources(Pixi.Loader.shared.resources['door1'].data.frames);
    this.map.addResources(Pixi.Loader.shared.resources['deco0'].data.frames);
    this.map.addResources(Pixi.Loader.shared.resources['humanoid0'].data.frames);
    this.map.addResources(Pixi.Loader.shared.resources['humanoid1'].data.frames);
    const chars = ['player', 'aquatic', 'avian', 'cat', 'dog', 'elemental', 'humanoid', 'misc', 'pest', 'plant', 'quadraped', 'reptile', 'rodent', 'slime', 'undead'];

    for (const char of chars) {
      this.map.addResources(Pixi.Loader.shared.resources[`${char}0`].data.frames);
      this.map.addResources(Pixi.Loader.shared.resources[`${char}1`].data.frames);
    }

    this.ui.addChild(this.cursor);

    const canvas = this.game.renderer.view;
    canvas.addEventListener('mousemove', (e) => {

      this.updateMouse(e);
      if (this.mouseInfo.button1) {
        this.map.moveBy(e.movementX, e.movementY);
      } else if (this.mouseInfo.button2) {
        this.map.moveBy(e.movementX, e.movementY);
      }
    });

    canvas.addEventListener('mousedown', (e) => {

      if (e.button === 0) {
        this.mouseInfo.button1 = true;
      }
      else {
        this.mouseInfo.button2 = true;
      }

      e.preventDefault();
    });

    canvas.addEventListener('mouseup', (e) => {

      if (e.button === 0) {
        this.mouseInfo.button1 = false;
      }
      else {
        this.mouseInfo.button2 = false;
      }
    });

    canvas.addEventListener('wheel', (e) => {
      return;

      if (e.deltaY > 0 && this.map.scale.x < 5) {
        this.map.zoom(.5, this.tileInfo.pos.cx, this.tileInfo.pos.cy);
        this.cursor.scale.x += .5;
        this.cursor.scale.y += .5;
        this.updateMouse(e);
      } else if (e.deltaY < 1 && this.map.scale.x > 1) {
        this.map.zoom(-.5, this.tileInfo.pos.cx, this.tileInfo.pos.cy);
        this.cursor.scale.x -= .5;
        this.cursor.scale.y -= .5;
        this.updateMouse(e);
      }
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    const dormgen = new DormGen(this.ecs, {
      width: 30,
      height: 30,
      extraDoors: 10,
      deleteWalls: 7
    });
    dormgen.work()
    this.ecs.runSystemGroup('tiles');
    this.ecs.runSystemGroup('visible');
    this.log('Rise-Up v0.1');
    this.log('By Nathan Fritz');
    this.log('@fritzy');
    this.log('--------------');

    this.ecs.addSystem('console', new ConsoleSystem(this.ecs, this));
    this.ecs.runSystemGroup('console');

  }

  updateMouse(e) {

    this.tileInfo.pos = this.map.getTile(e.offsetX, e.offsetY);
    this.cursor.position.set(this.tileInfo.pos.cx + (8 * this.map.container.scale.x), this.tileInfo.pos.cy + (8 * this.map.container.scale.y));
  }

  tearDown() {
  }

  log(text) {
    this.ecs.createEntity({
      tags: ['New'],
      Text: {
        text: text
      }
    });
  }

  update(dt, df, time) {

    //this.filters[0].time += dt / 40;
    Tween.update(time);
    this.lastFrame += dt;
    if (this.lastFrame >= 500) {
      this.lastFrame -= 500;
      if (this.lastFrame > 500) {
        this.lastFrame = 0;
      }
      this.ecs.runSystemGroup('tiles');
      this.ecs.runSystemGroup('2frame');
    }
    if (this.input.buffer.length > 0) {
      const key = this.input.buffer.pop();
      const playerEntities = this.ecs.queryEntities({ has: ['Player', 'Tile'] });
      const player = [...playerEntities][0];
      if (player) {
        switch (key) {
          case 'KeyH':
          case 'KeyA':
          case 'ArrowLeft':
          case 'Numpad4':
            player.addComponent('Move', {x: -1});
            break;
          case 'KeyL':
          case 'Numpad6':
          case 'ArrowRight':
          case 'KeyD':
            player.addComponent('Move', {x: 1});
            break;
          case 'KeyK':
          case 'Numpad8':
          case 'ArrowUp':
          case 'KeyW':
            player.addComponent('Move', {y: -1});
            break;
          case 'KeyJ':
          case 'Numpad2':
          case 'ArrowDown':
          case 'KeyS':
            player.addComponent('Move', {y: 1});
            break;
        }
        this.ecs.runSystemGroup('actions');
        this.ecs.runSystemGroup('visible');
        this.ecs.runSystemGroup('console');
        this.ecs.tick();
      }
    }
    this.ecs.runSystemGroup('animation');
  }
}

module.exports = Level;
