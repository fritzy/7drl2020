const PF = require('../path');

function getXY(coord) {
  const xy = coord.split('x');
  return { x: parseInt(xy[0], 10), y: parseInt(xy[1], 10) };
}

function makeCoord(x, y) {
  if (typeof x === 'object') {
    return `${x.x}x${x.y}`;
  }
  return `${x}x${y}`;
}

class Room {
  constructor() {
    this.floorTiles = new Set();
    this.wallTiles = new Set();
  }
}

const STEPS = ['split', 'map', 'delete'];

class DormGen {

  constructor(ecs, opts) {

    this.opts = opts;
    this.step = 0;
    this.ecs = ecs;
    this.width = opts.width;
    this.height = opts.height;
    this.tiles = [];
    //this.rooms = new Set([this.makeRoom(0, 0, width, height, false)]);
    this.doors = new Set();
    this.rooms = new Set();
    this.minSize = 5;
    this.outerSize = this.minSize + 2;
    this.done = false;
    this.walls = {};
    this.deletedWalls = 0;
    const room = this.makeRoom(0, 0, this.width, this.height, false);
    this.rooms.add(room);

    /*
    let room = this.makeRoom(0, 0, width, 10, false);
    this.rooms.add(room);
    room = this.makeRoom(0, 9, 10, height - 9, false);
    this.rooms.add(room);
    room = this.makeRoom(9, 9, 7, height - 23, true, 'hall');
    this.rooms.add(room);
    room = this.makeRoom(9, height - 15, width - 20, 7, true, 'hall');
    this.rooms.add(room);
    room = this.makeRoom(15, 9, width - 15, height - 23, false);
    this.rooms.add(room);
    room = this.makeRoom(9, height - 9, width - 20, 9, false);
    this.rooms.add(room);
    room = this.makeRoom(width - 12, height - 15, width - 20 - 18, 15, false);
    this.rooms.add(room);
    */
    //this.setWalls();
    //this.render();
  }

  makeRoom(x, y, w, h, l, t) {
    return {
      x,
      y,
      w,
      h,
      lock: !!l,
      floor: new Set(),
      wall: new Set(),
      type: t
    };
  }

  work() {

    while (this.step < 6) {
      switch(this.step) {
        case 0:
          this.splitRoom();
          //this.render()
          //this.step++;
          break;
        case 1:
          this.setWalls();
          //this.render()
          break;
        case 2:
          //this.deleteWallAt(`11x${this.height - 15}`);
          this.step++;
        case 3:
          this.deleteWall();
          //this.render()
          break;
        case 4:
          this.setDoors();
          this.step++;
          break;
        case 5:
          //this.setRugs();
          //this.makeRug(10, 10, 5, 31);
          //this.makeRug(16, 36, 22, 5);
          this.step++;
          break;
      }
    }
    this.render();
  }

  makeRug(x, y, w, h) {

    for (let px = x; px < x + w; px++) {
      for (let py = y; py < y + h; py++) {
        this.ecs.createEntity({
          tags: ['New'],
          Tile: {
            x: px,
            y: py,
            layer: 'deco',
            frame: 'deco0-rug-m'
          }
        });
      }
    }
  }

  setRugs() {

    this.ecs.createEntity({
      tags: ['New'],
      Tile: {
        x: 1,
        y: 1,
        layer: 'deco',
        frame: 'deco0-rug-m'
      }
    });
    this.ecs.createEntity({
      tags: ['New'],
      Tile: {
        x: 2,
        y: 1,
        layer: 'deco',
        frame: 'deco0-rug-m'
      }
    });
    this.ecs.createEntity({
      tags: ['New'],
      Tile: {
        x: 1,
        y: 2,
        layer: 'deco',
        frame: 'deco0-rug-m'
      }
    });
    this.ecs.createEntity({
      tags: ['New'],
      Tile: {
        x: 2,
        y: 2,
        layer: 'deco',
        frame: 'deco0-rug-m'
      }
    });

    for (const room of this.rooms) {
      if (room.type === 'hall') {
      }
    }
  }

  setDoors() {

    const tiles = [];
    const grid = new PF.Grid(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(0);
      }
      tiles.push(row);
    }
    for (const room of this.rooms) {
      for (const f of room.floor) {
        let [x, y] = f.split('x');
        x = parseInt(x, 10);
        y = parseInt(y, 10);
        tiles[y][x] = 1
      }
    }
    const pDoors = new Set();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (tiles[y][x] === 0) {
          if ((y > 0 && tiles[y-1][x] === 1 && y < this.width - 1 && tiles[y+1][x] === 1)
            || (x > 0 && tiles[y][x-1] === 1 && x < this.height - 1 && tiles[y][x+1] === 1)) {
            //wall, but door possible
            grid.setWalkableAt(x, y, true);
            grid.setCostAt(x, y, Math.floor(Math.random() * 10) + 5);
            pDoors.add(`${x}x${y}`);
          } else {
            // corner, no doors
            grid.setWalkableAt(x, y, false);
          }
        } else {
          grid.setWalkableAt(x, y, true);
          grid.setCostAt(x, y, 1);
        }
      }
    }
    const astar = new PF.AStarFinder();
    /*
    let sroom = null;
    for (const room of this.rooms) {
      if (room.lock) {
        sroom = room;
        break;
      }
    }
    */
    const sroom = [...this.rooms][Math.floor(Math.random() * this.rooms.size)];
    const sfloors = [...sroom.floor]
    const stile = sfloors[Math.floor(Math.random() * sfloors.length)];
    const scoord = stile.split('x');
    const startX = parseInt(scoord[0], 10);
    const startY = parseInt(scoord[1], 10);
    for (const eroom of this.rooms) {
      const efloors = [...eroom.floor]
      const etile = efloors[Math.floor(Math.random() * efloors.length)];
      const ecoord = etile.split('x');
      const endX = parseInt(ecoord[0], 10);
      const endY = parseInt(ecoord[1], 10);
      const path = astar.findPath(startX, startY, endX, endY, grid.clone());
      for (const coord of path) {
        if (tiles[coord[1]][coord[0]] === 0) {
          pDoors.delete(`${coord[0]}x${coord[1]}`);
          this.doors.add(`${coord[0]}x${coord[1]}`);
          grid.setCostAt(coord[0], coord[1], 2);
        }
      }
    }
    for (let idx = 0; idx < this.opts.extraDoors; idx++) {
      let added = false;
      do {
        const door = [...pDoors][Math.floor(Math.random() * pDoors.size)];
        const coord = door.split('x');
        const x = parseInt(coord[0], 10);
        const y = parseInt(coord[1], 10);
        if (
          this.doors.has(`${x-1}x${y}`)
          || this.doors.has(`${x+1}x${y}`)
          || this.doors.has(`${x}x${y-1}`)
          || this.doors.has(`${x}x${y+1}`)
        ) continue;
        added = true;
        this.doors.add(door)
        pDoors.delete(door);
      } while (!added)
    }
  }


  setWalls() {

    let count = 0;
    for (const room of this.rooms) {
      for (let x = room.x; x < room.x + room.w; x++) {
        for (let y = room.y; y < room.y + room.h; y++) {
          const tileS = `${x}x${y}`;
          count++;
          if (x === room.x || x === room.x + room.w - 1 || y === room.y || y === room.y + room.h - 1) {
            if (!this.walls.hasOwnProperty(tileS)) {
              this.walls[tileS] = new Set();
            }
            this.walls[tileS].add(room);
            room.wall.add(tileS);
          } else {
            room.floor.add(tileS);
          }
        }
      }
    }
    this.step++;
  }

  deleteWall() {

    const room = [...this.rooms][Math.floor(Math.random() * this.rooms.size)];
    const walls = [...room.wall];
    let wall, wallIdx;
    let count = 0;
    do {
      count++;
      if (walls.length === 0) break;
      wallIdx = walls[Math.floor(Math.random() * walls.length)];
      wall = this.walls[wallIdx];
      const wallarray = [...wall];
      if (wall.size == 2 && !wallarray[0].lock && !wallarray[1].lock) {
        break;
      }
      if (count > 50) {
        this.step++;
        return;
      }
    } while (true);
    this.deleteWallAt(wallIdx);
    this.deletedWalls++;
    if (this.deletedWalls > this.opts.deleteWalls) {
      this.step++;
    }
  }

  deleteWallAt(coord) {
    const wall = this.walls[coord];
    const rooms = [...wall];
    for (const wall of rooms[0].wall) {
      if (rooms[1].wall.has(wall) && this.walls[wall].size === 2) {
        const coord = wall.split('x');
        const x = parseInt(coord[0]);
        const y = parseInt(coord[1]);
        if (x !== 0 && x !== this.width - 1 && y !== 0 && y !== this.height - 1) {
          rooms[1].wall.delete(wall)
          this.walls[wall].delete(rooms[0]);
          this.walls[wall].delete(rooms[1]);
          rooms[0].wall.delete(wall)
          rooms[0].floor.add(wall);
          if (this.walls[wall].size === 0) {
            delete this.walls[wall];
          }
        }
      } else {
      }
    }
    for (const floor of rooms[1].floor) {
      rooms[0].floor.add(floor);
    }
    for (const wall of rooms[1].wall) {
      this.walls[wall].add(rooms[0]);
      rooms[0].wall.add(wall);
      this.walls[wall].delete(rooms[1]);
    }
    this.rooms.delete(rooms[1]);
    return rooms[0];
  }

  splitRoom() {

    //if (this.rooms.length > 100) return;
    const rooms = [...this.rooms].filter(r => (!r.lock && (r.w >= this.minSize * 2 || r.h >= this.minSize * 2)));
    if (rooms.length === 0) {
      this.step++;
      return;
    }
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    const ratio = room.w / room.h;
    let dir = Math.floor(Math.random() * 2);
    if (room.h < this.minSize * 2) {
      dir = 0;
    } else if (room.w < this.minSize * 2) {
      dir = 1;
    } else if (ratio > 3) {
      dir = 0;
    } else if (ratio < .333) {
      dir = 1;
    }
    if (dir === 0) {
      const split = Math.floor(Math.random() * (room.w - this.minSize * 2)) + this.minSize;
      const room2 = this.makeRoom(room.x + split - 1, room.y, room.w - split + 1, room.h);
      this.rooms.add(room2);
      room.w = split;
    } else if (dir === 1) {
      const split = Math.floor(Math.random() * (room.h - this.minSize * 2)) + this.minSize;
      const room2 = this.makeRoom(room.x, room.y + split - 1, room.w, room.h - split + 1);
      this.rooms.add(room2);
      room.h = split;
    }
  }

  render() {

    for (const tileS of Object.keys(this.walls)) {
      const coord = tileS.split('x');
      //this.display.draw(coord[0], coord[1], '#', 'white');
      if (this.doors.has(tileS)) {
        this.ecs.createEntity({
          tags: ['New'],
          Tile: {
            x: parseInt(coord[0], 10),
            y: parseInt(coord[1], 10),
            frame: 'floor-1s',
            layer: 'floor'
          }
        });
        this.ecs.createEntity({
          tags: ['New', 'Impassable'],
          Tile: {
            x: parseInt(coord[0], 10),
            y: parseInt(coord[1], 10),
            frame: 'door-wood-ns-closed',
            layer: 'wall'
          },
          Door: {
            closed: true
          }
        });
      } else {
        this.ecs.createEntity({
          tags: ['New', 'Impassable'],
          Tile: {
            x: parseInt(coord[0], 10),
            y: parseInt(coord[1], 10),
            frame: 'wall-1mm',
            layer: 'wall'
          }
        });
      }
    }
    const proom = Math.floor(this.rooms.size * Math.random());
    let ridx = 0;
    for (const room of this.rooms) {
      const pfloor = Math.floor(room.floor.size * Math.random());
      let fidx = 0;
      for (const floor of room.floor) {
        const fcoord = floor.split('x');
        //this.display.draw(fcoord[0], fcoord[1], '.', 'white', 'black');
        const entity = this.ecs.createEntity({
          tags: ['New'],
          Tile: {
            x: parseInt(fcoord[0], 10),
            y: parseInt(fcoord[1], 10),
            frame: 'floor-1s',
            layer: 'floor'
          }
        });
        if (Math.floor(Math.random() * 50)  === 1) {
          const colors = ['red', 'green','orange'];
          entity.addComponent('LightSource', {
            color: colors[Math.floor(Math.random() * 3)]
          });
        }
        if (ridx === proom && fidx === pfloor) {
          this.ecs.createEntity({
            tags: ['New', 'Player', 'Character'],
            Tile: {
              x: parseInt(fcoord[0], 10),
              y: parseInt(fcoord[1], 10),
              frame: 'player0-1x3',
              layer: 'char'
            },
            LightSource: {
              color: '#f7fae8',
              radius: 3
            }
          });
        } else {
          if (2 === Math.floor(Math.random() * 100)) {
            this.ecs.createEntity({
              tags: ['New', 'NPC', 'Character'],
              Tile: {
                x: parseInt(fcoord[0], 10),
                y: parseInt(fcoord[1], 10),
                frame: 'humanoid0-1x3',
                layer: 'char'
              },
              /*
              LightSource: {
                color: '#f7fae8',
                radius: 3
              }
              */
            });
          }
        }
        fidx++;
      }
      ridx++;
          /*
      if (room.lock) {
        for (const floor of room.floor) {
          const fcoord = floor.split('x');
          this.display.draw(fcoord[0], fcoord[1], '.', 'white', 'black');
        }
      } else {
        for (const floor of room.floor) {
          const fcoord = floor.split('x');
          this.display.draw(fcoord[0], fcoord[1], '.', 'red', 'black');
        }
      }
      */
    }
  }

  create(callback) {
  }

}

module.exports = DormGen;
