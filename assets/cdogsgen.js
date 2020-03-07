const frames = {
  frames: {
  },
  meta: {
    image: "cdogs_font_7x8.png"
  }
};

const punc = "!\"# % '() +,-./0123456789:; = ?";
const caps = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ \\'.split('');
const lows = 'abcdefghijklmnopqrstuvwxyz'.split('');

function setFrame(x, y, char) {
  if (char === ' ') return;
  const frame = {
    frame: {
      x: x,
      y: y,
      w: 7,
      h: 8
    },
    rotated: false,
    trimmed: false,
    spriteSourceSize: {
      x: 0,
      y: 0,
      w: 7,
      h: 8
    },
    sourceSize: {
      w: 7,
      h: 8
    }
  };
  frames.frames[`cdogs_font_${char.charCodeAt(0)}`] = frame;
}


let x = 7;
let y = 16;
for (const char of caps) {
  setFrame(x, y, char);
  x += 7;
}

x = 7;
y = 8;
for (const char of punc) {
  setFrame(x, y, char);
  x += 7;
}

x = 7;
y = 24;
for (const char of lows) {
  setFrame(x, y, char);
  x += 7;
}

setFrame(16*7, 0, '>')
setFrame(17*7, 0, '<')
setFrame(30*7, 0, '^')
setFrame(31*7, 0, '*')
console.log(JSON.stringify(frames, null, 2));
