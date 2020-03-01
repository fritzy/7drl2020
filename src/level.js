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

class Level extends Scene.Scene {

  constructor(game) {

    super(game);
    this.ecs = new ECS.ECS();
    this.input = new Input();
    for (const cname of Object.keys(Components)) {
      this.ecs.registerComponent(cname, Components[cname]);
    }
    this.ecs.registerTags(Tags);
    this.ecs.addSystem('tiles', new TileSystem(this.ecs, this));
    this.ecs.addSystem('2frame', new SwitchFrameSystem(this.ecs, this));
    this.ecs.addSystem('actions', new ActionSystem(this.ecs, this));
  }

  standUp() {

    this.ecs.createEntity({
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

    this.map = new TileMap.TileMap(this);
    this.map.setScale(2);
    this.ui = new Pixi.Container();

    this.addChild(this.map);
    this.addChild(this.ui);


    const floor = new TileMap.Layer('floor');
    const wall = new TileMap.Layer('wall');
    const deco1 = new TileMap.Layer('deco1');
    const deco2 = new TileMap.Layer('deco2');
    const char = new TileMap.Layer('char');

    this.map.addLayer(floor);
    this.map.addLayer(wall);
    this.map.addLayer(deco1);
    this.map.addLayer(deco2);
    this.map.addLayer(char);

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
    this.map.addResources(Pixi.Loader.shared.resources['player0'].data.frames);
    this.map.addResources(Pixi.Loader.shared.resources['player1'].data.frames);
    this.map.addResources(Pixi.Loader.shared.resources['pit0'].data.frames);
    this.ui.addChild(this.cursor);

    const canvas = this.game.renderer.view;
    canvas.addEventListener('mousemove', (e) => {

      this.updateMouse(e);
      if (this.mouseInfo.button1) {
        //this.setTile();
        this.map.moveBy(e.movementX, e.movementY);
      } else if (this.mouseInfo.button2) {
        this.map.moveBy(e.movementX, e.movementY);
      }
    });

    canvas.addEventListener('mousedown', (e) => {

      if (e.button === 0) {
        this.mouseInfo.button1 = true;
        //this.setTile();
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


    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 18; col++) {
        if (row === 0 || row === 24 || col === 0 || col === 17) {
          this.ecs.createEntity({
            tags: ['New'],
            Tile: {
              startX: row,
              startY: col,
              frame: 'wall-1mm',
              layer: 'wall'
            }
          });
          //this.map.setTile('wall', 'wall-1mm', row, col);
        } else {
          this.ecs.createEntity({
            tags: ['New'],
            Tile: {
              startX: row,
              startY: col,
              frame: 'floor-1s',
              layer: 'floor'
            }
          });
          //this.map.setTile('floor', 'floor-1s', row, col);
        }
      }
    }
    //this.playerTile = this.map.setTile('char',  'player0-1x3', 9, 9);
    this.ecs.createEntity({
      tags: ['New', 'Player'],
      Tile: {
        startX: 13,
        startY: 9,
        frame: 'player0-1x3',
        layer: 'char'
      }
    });

    /*
    for (let pools = 0; pools < 10; pools ++) {
      const w = Math.floor(Math.random() * 15 + 3);
      const h = Math.floor(Math.random() * 12 + 3);
      const x = Math.floor(Math.random() * 33 + 1);
      const y = Math.floor(Math.random() * 35 + 1);
      for (let row = x; row < x + w; row++) {
        for (let col = y; col < y + h; col++) {
          this.map.setTile('floor', 'pit0-10mm', row, col);
        }
      }
    }
    */

  }

  updateMouse(e) {
    this.tileInfo.pos = this.map.getTile(e.offsetX, e.offsetY);
    this.cursor.position.set(this.tileInfo.pos.cx + (8 * this.map.scale.x), this.tileInfo.pos.cy + (8 * this.map.scale.y));
  }

  setTile() {

    const pos = this.tileInfo.pos;
    this.map.setTile('floor', this.tileInfo.frame, pos.x, pos.y);
  }

  tearDown() {
  }

  update(dt, df, time) {

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
        this.ecs.tick();
      }
    }

  }
}

module.exports = Level;
