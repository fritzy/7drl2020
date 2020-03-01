module.exports = {

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
      x: 0,
      y: 0,
      container: null,
      tileByMap: {}
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
