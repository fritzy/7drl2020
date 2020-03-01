module.exports = {

  Game: {
    properties: {
      game: '',
      tilemap: '',
      dt: 0,
      du: 0
    }
  },

  Tile: {
    properties: {
      startX: 0,
      startY: 0,
      x: '<Pointer tile.x>',
      y: '<Pointer tile.y>',
      offX: '<Pointer tile.offX>',
      offY: '<Pointer tile.offY>',
      layer: '',
      sprite: null,
      tile: null,
      frame: ''
    }
  },

  Move: {
    properties: {
      x: 0,
      y: 0
    }
  },

  Map: {
    properties: {
      x: '<Pointer container.x>',
      y: '<Pointer container.y>',
      tileWidth: 16,
      tileHeight: 16,
      width: 100,
      height: 100,
      zoom: 2,
      container: null,
      tileByMap: {},
      tileInfo: {}
    }
  },

  TileInfo: {
  },

  MapLayer: {
    properties: {
      tiles: '<EntityObject>',
      name: 'floor',
      container: null,
    },
    multiset: true,
    mapBy: 'name'
  },

  Animation: {
  }

};
