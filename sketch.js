let symbolSize = 20;
let streams = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // Create streams for each column
  let x = 0;
  for (let i = 0; i < width / symbolSize; i++) {
    let stream = new Stream();
    stream.generateSymbols(x, random(-1000, 0));
    streams.push(stream);
    x += symbolSize;
  }

  textSize(symbolSize);
}

function draw() {
  background(0, 150); // Semi-transparent background for fade effect
  streams.forEach((stream) => stream.render());
}

class MatrixSymbol {
  constructor(x, y, speed, first) {
    this.x = x;
    this.y = y;
    this.value = '';
    this.speed = speed;
    this.switchInterval = round(random(2, 20));
    this.first = first;
  }

  setToRandomSymbol() {
    if (frameCount % this.switchInterval === 0) {
      this.value = String.fromCharCode(0x30A0 + round(random(0, 96))); // Katakana characters
    }
  }

  rain() {
    this.y = (this.y >= height) ? 0 : this.y + this.speed;
  }
}

class Stream {
  constructor() {
    this.symbols = [];
    this.totalSymbols = round(random(5, 30));
    this.speed = random(2, 10);
  }

  generateSymbols(x, y) {
    let first = round(random(0, 4)) === 1; // Randomly make the first symbol bright
    for (let i = 0; i < this.totalSymbols; i++) {
      let symbol = new MatrixSymbol(x, y, this.speed, first);
      symbol.setToRandomSymbol();
      this.symbols.push(symbol);
      y -= symbolSize; // Position the next symbol above
      first = false; // Only the first symbol in the stream is bright
    }
  }

  render() {
    this.symbols.forEach((symbol) => {
      if (symbol.first) {
        fill(140, 255, 170); // Bright green for the first symbol
      } else {
        fill(0, 255, 70); // Regular green for other symbols
      }
      text(symbol.value, symbol.x, symbol.y);
      symbol.rain();
      symbol.setToRandomSymbol();
    });
  }
}
