const Pixi = require('pixi.js');
const Scene = require('./scene');
const TileMap = require('./tilemap')(Pixi);

class MapEditor extends Scene.Scene {

  constructor(game) {

    super(game);
  }

  standUp() {

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
    this.map.addResources(Pixi.Loader.shared.resources['pit0'].data.frames);
    this.ui.addChild(this.cursor);

    const canvas = this.game.renderer.view;
    canvas.addEventListener('mousemove', (e) => {

      this.updateMouse(e);
      if (this.mouseInfo.button1) {
        this.setTile();
      } else if (this.mouseInfo.button2) {
        this.map.moveBy(e.movementX, e.movementY);
      }
    });

    canvas.addEventListener('mousedown', (e) => {

      if (e.button === 0) {
        this.mouseInfo.button1 = true;
        this.setTile();
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
      console.log(e.deltaY, this.map.scale.x);
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });


    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 18; col++) {
        if (row === 0 || row === 24 || col === 0 || col === 17) {
          this.map.setTile('wall', 'wall-1mm', row, col);
        } else {
          this.map.setTile('floor', 'floor-1s', row, col);
        }
      }
    }

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
  }

}

module.exports = MapEditor;
