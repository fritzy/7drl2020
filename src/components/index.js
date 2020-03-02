module.exports = {

  Game: {
    properties: {
      game: '',
      tileInfo: {},
      dt: 0,
      du: 0
    }
  },

  Tile: {
    properties: {
      x: 0,
      y: 0,
      offX: 0,
      offY: 0,
      group: '',
      set: '',
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
      scale: 1,
      offset: [0, 0],
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
