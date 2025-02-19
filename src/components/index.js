module.exports = {

  Game: {
    properties: {
      game: '',
      tileInfo: {},
      dt: 0,
      du: 0
    }
  },

  LightSource: {
    properties: {
      color: '#ffffff',
      radius: 4,
      flicker: 0
    }
  },

  Light: {
    properties: {
      tint: '#FFFFFF',
      source: '<Entity>'
    },
    multiset: true
  },

  Door: {
    properties: {
      closed: true
    }
  },

  Visible: {
    properties: {
      seenTick: 0
    }
  },

  Tile: {
    properties: {
      x: 0,
      y: 0,
      facing: 'left',
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

  Timer: {
    properties: {
      turns: 0,
      component: {}
    },
    multiset: true
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

  Camera: {
    properties: {
      x: 0,
      y: 0,
      targetPos: {},
      target: '<Entity>'
    }
  },

  Animation: {
    properties: {
      tween: null,
      x: 0,
      y: 0
    },
    multiset: true
  },

  ActionMelee: {
    properties: {
      target: '<Entity>'
    }
  },

  Text: {
    properties: {
      text: '',
      sprite: null
    }
  },

  Console: {
    properties: {
      container: null,
      textarea: null,
      texts: '<EntitySet>',
      x: '<Pointer container.position.x>',
      y: '<Pointer container.position.y>'
    }
  },

  Attack: {
    properties: {
      hp: 3
    }
  },

  Health: {
    properties: {
      maxhp: 10,
      hp: 10
    }
  }

};
