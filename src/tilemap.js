
module.exports = function (Pixi) {

  const defaultTileMapOptions = {
    tileWidth: 16,
    tileHeight: 16,
    width: 100,
    height: 100,
    zoom: 2
  };
  class TileMap {

    constructor(parent, mapEntity) {

      this.mapEntity = mapEntity;
      this.mapComp = mapEntity.Map;
      this.parent = parent;
      //this.parent.addChild(this);
      this.layers = {};
      this.tilesByMap = {};
      //this.tiles = {};
      this.gameComp = this.parent.ecs.getEntity('game').Game;

      this.mapEntity.Map.container = new Pixi.Container();
      this.parent.addChild(this.mapEntity.Map.container);
      this.container = this.mapEntity.Map.container;

      for (const lname of Object.keys(this.mapEntity.MapLayer)) {
        this.mapEntity.MapLayer[lname].container = new Pixi.Container();
        this.mapComp.container.addChild(this.mapEntity.MapLayer[lname].container);
      }
    }

    getTile(ix, iy) {

      let x = Math.floor((ix - this.container.position.x) / this.mapComp.tileWidth / this.container.scale.x);
      let y = Math.floor((iy - this.container.position.y) / this.mapComp.tileHeight / this.container.scale.y);
      let cx = x * (this.mapComp.tileWidth * this.container.scale.x) + this.container.position.x;
      let cy = y * (this.mapComp.tileHeight * this.container.scale.y) + this.container.position.y;
      return { x, y , cx, cy};
    }

    moveTo(x, y) {
    }

    moveBy(x, y) {

      this.container.position.x += x;
      this.container.position.y += y;
    }

    setScale(s) {
      this.container.scale.set(s, s);
    }

    zoom(s, x, y) {

      const worldPos = {x: (x - this.container.position.x) / this.container.scale.x, y: (y - this.container.position.y)/this.container.scale.y};
      const newScale = {x: this.container.scale.x + s, y: this.container.scale.y + s};

      const newScreenPos = {x: (worldPos.x ) * newScale.x + this.container.position.x, y: (worldPos.y) * newScale.y + this.container.position.y};

      this.container.position.x -= (newScreenPos.x-x) ;
      this.container.position.y -= (newScreenPos.y-y) ;
      this.container.scale.x = newScale.x;
      this.container.scale.y = newScale.y;
    }

    /*
    addLayer(layer) {

      this.layers[layer.name] = layer;
      this.addChild(layer);
      layer.setToMap(this);
    }
    */

    /*
    setTile(layer, frame, x, y) {

      const tile = new Tile(frame, x, y, this.tiles[frame], this.layers[layer]);
      this.layers[layer].setTile(tile, x, y);
      return tile;
    }
    */

    getTileInfo(layer, x, y) {

      return this.layers[layer].getTileInfo(x, y);
    }

    addResources(frames) {

      for (const name of Object.keys(frames)) {
        const frame = frames[name];
        frame.name = name;
        if (!this.mapComp.tileByMap.hasOwnProperty(frame.group)) {
          this.mapComp.tileByMap[frame.group] = {};
        }
        if (!this.mapComp.tileByMap[frame.group].hasOwnProperty(frame.set)) {
          this.mapComp.tileByMap[frame.group][frame.set] = {};
        }

        this.gameComp.tileInfo[name] = frame;

        if (frame.map) {
          let nmap = '';
          const imap = frame.map;
          if (imap.length === 4) {
            for (let c of imap) {
              nmap += '?' + c;
            }
            frame.map = nmap;
          }
        }
        this.mapComp.tileByMap[frame.group][frame.set][frame.map] = frame;
        this.mapComp.tileInfo[frame.name] = frame;
      }
    }

    setupTile(tile, update=true) {

      const coord = `${tile.x}-${tile.y}`;
      const layer = this.mapEntity.MapLayer[tile.layer];
      if (layer.tiles[coord]) {
        layer.tiles[coord].Tile.sprite.destroy();
      }
      tile.sprite = new Pixi.Sprite.from(tile.frame);
      layer.tiles[coord] = tile.entity;
      const info = this.mapComp.tileInfo[tile.frame];
      tile.set = info.set;
      tile.group = info.group;
      this.updateSpritePos(tile);
      layer.container.addChild(tile.sprite);
      layer.tiles[`${tile.x}-${tile.y}`] = tile.entity;
      if (update)
        this.updateBySet(layer, tile.x, tile.y, true);
      return tile;
    }

    moveTile(layer, tile, x, y) {

      const oldCoord = `${tile.x}-${tile.y}`;
      tile.x = x;
      tile.y = y;
      const coord = `${tile.x}-${tile.y}`;
      delete layer.tiles[oldCoord];
      if (layer.tiles.hasOwnProperty(coord)) {
        layer.tiles[coord].Tile.sprite.destroy();
      }
      layer.tiles[coord] = tile.entity;
      this.updateSpritePos(tile);
      this.updateBySet(layer, x, y, true);
    }

    getTileInfo(layer, x, y) {

      return layer.tiles[`${x}-${y}`].Tile;
    }

    has(layer, x, y) {

      return layer.tiles.hasOwnProperty(`${x}-${y}`);
    }

    isSet(layer, group, set, x, y, check) {

      const tileE = layer.tiles[`${x}-${y}`];
      if (!tileE) {
        return false;
      }
      const tile = tileE.Tile;
      return (group === tile.group && set === tile.set)
    }

    updateBySet(layer, x, y, force=false) {

      const coord = `${x}-${y}`;
      const tileE = layer.tiles[coord];
      if (!tileE) {
        return;
      }
      const tile = tileE.Tile;
      const info = this.mapComp.tileInfo[tile.frame];
      const set = info.set;
      const group = info.group;
      const keys = Object.keys(this.mapComp.tileByMap[group][set]);
      const n = [
        this.isSet(layer, group, set, x - 1, y - 1),
        this.isSet(layer, group, set, x, y - 1),
        this.isSet(layer, group, set, x + 1, y - 1),
        this.isSet(layer, group, set, x + 1, y),
        this.isSet(layer, group, set, x + 1, y + 1),
        this.isSet(layer, group, set, x, y + 1),
        this.isSet(layer, group, set, x - 1, y + 1),
        this.isSet(layer, group, set, x - 1, y),
      ];

      let updatedNeighbors = false;
      for (const key of keys) {
        const m = key.split('');
        let match = true;
        for (let i = 0; i < 8; i++) {
          if (!(m[i] === '?' || (n[i] && m[i] === '1') || (!n[i] && m[i] === '0'))) {
            match = false;
            break;
          }
        }
        if (match) {
          const newFrame = this.mapComp.tileByMap[group][set][key].name;
          if (newFrame !== tile.frame) {
            this.updateSpriteFrame(tile, newFrame);
            updatedNeighbors = true;
            this.updateNeighbors(layer, x, y);
          }
          break;
        }
      }
      if (force && !updatedNeighbors) {
        this.updateNeighbors(layer, x, y);
      }
    }

    updateNeighbors(layer, x, y) {
      this.updateBySet(layer, x - 1, y - 1);
      this.updateBySet(layer, x, y - 1);
      this.updateBySet(layer, x + 1, y - 1);
      this.updateBySet(layer, x - 1, y);
      this.updateBySet(layer, x + 1, y);
      this.updateBySet(layer, x - 1, y + 1);
      this.updateBySet(layer, x, y + 1);
      this.updateBySet(layer, x + 1, y + 1);
    }

    updateSpritePos(tile) {
      tile.sprite.position.x = this.mapComp.tileWidth * tile.x + tile.offX;
      tile.sprite.position.y = this.mapComp.tileHeight * tile.y + tile.offY;
    }

    getPos(x, y) {

      return { x: this.mapComp.tileWidth * x,
        y: this.mapComp.tileWidth * y };
    }

    updateSpriteFrame(tile, frame) {

      tile.frame = frame
      let texture = Pixi.Texture.from(frame);
      if (tile.facing === 'right') {
        texture = new Pixi.Texture(texture.baseTexture, texture.frame, texture.orig, texture.trim, 12)
      }
      tile.sprite.texture = texture;
    }
  }

  class Tile {

    constructor(frame, x, y, info, layer) {

      this.frame = frame;
      this.layer = layer;
      this.x = x;
      this.y = y;
      this.offX = 0;
      this.offY = 0;
      this.info = info;
      this.sprite = new Pixi.Sprite.from(frame);
    }

    reset(frame) {
      this.frame = frame;
      this.info = this.sprite.parent.parent.tiles[frame];
      this.sprite.texture = Pixi.Texture.from(frame);
    }

    updatePos() {

      this.sprite.position.x = this.layer.parent.mapComp.tileWidth * this.x + this.offX;
      this.sprite.position.y = this.layer.parent.mapComp.tileHeight * this.y + this.offY;
    }

    destroy() {

      this.sprite.destroy();
    }
  }

  return {
    Map,
    TileMap,
  };
}
