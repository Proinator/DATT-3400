let table;
let points = [];
let decadesColors = {};
let hoveredPoint = null;

function preload() {
  table = loadTable('data/imdb_kaggle.csv', 'csv', 'header');
}

function setup() {
  createCanvas(1200, 800);
  colorMode(HSB, 360, 100, 100); // Use HSB color mode for diverse hues
  background(0);

  // Assign unique colors to each decade
  let decades = Array.from(
    new Set(
      table.getColumn('year')
        .map(y => int(y))
        .filter(y => !isNaN(y))
        .map(y => Math.floor(y / 10) * 10)
    )
  ).sort();

  for (let i = 0; i < decades.length; i++) {
    decadesColors[decades[i]] = color((i * 360) / decades.length, 80, 100); // Unique HSB color
  }

  // Parse data and distribute points without overlap
  for (let i = 0; i < table.getRowCount(); i++) {
    let year = int(table.getString(i, 'year'));
    let rating = float(table.getString(i, 'rating'));
    let name = table.getString(i, 'name');

    if (isNaN(year) || isNaN(rating)) continue;

    let minSize = 5;  // Smallest size for lowest ratings
    let maxSize = 50; // Largest size for highest ratings
    let size = map(rating, 7.6, 9.3, minSize, maxSize); // Base size based on IMDb rating
    size += random([-0.1, 0.1]) * size; // Slight variation based on ±0.1 rating

    let position = findNonOverlappingPosition(size);
    points.push({
      x: position.x,
      y: position.y,
      size,
      color: decadesColors[Math.floor(year / 10) * 10], // Decade-based color
      name
    });
  }
}

function draw() {
  background(0);

  hoveredPoint = null; // Reset hovered point each frame

  for (let p of points) {
    // Draw gradient circle
    drawGradientCircle(p.x, p.y, p.size, p.color);

    // Check hover
    let d = dist(mouseX, mouseY, p.x, p.y);
    if (d < p.size / 2) { 
      hoveredPoint = p;
    }
  }

  // Show hovered movie name
  if (hoveredPoint) {
    fill(255);
    textSize(14);
    textAlign(CENTER);
    text(hoveredPoint.name, mouseX, mouseY - 10);
  }

  // Draw static legend for decades at the bottom
  drawLegend();
}

function drawLegend() {
  textSize(12);
  textAlign(LEFT);

  let x = 50;
  let y = height - 50;
  let gap = 105;

  for (let [decade, col] of Object.entries(decadesColors)) {
    // Draw gradient circle for the legend
    drawGradientCircle(x, y, 30, col);
    fill(255);
    noStroke();
    text(`${decade}s`, x + 30, y + 5); // Label the decade
    x += gap;
  }
}

function findNonOverlappingPosition(size) {
  let x, y, isOverlapping;
  do {
    x = random(50, width - 50);
    y = random(50, height - 100); // Avoid legend area
    isOverlapping = points.some(p => dist(x, y, p.x, p.y) < (p.size + size) / 2);
  } while (isOverlapping);
  return { x, y };
}

function drawGradientCircle(x, y, size, baseColor) {
  let ctx = drawingContext; // Access the canvas 2D context
  let gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
  let rgbColor = color(baseColor).levels; // Convert p5 color to RGB levels

  // Define gradient stops: opaque in the center, transparent at edges
  gradient.addColorStop(0, `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 1)`);
  gradient.addColorStop(1, `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 0)`);

  ctx.fillStyle = gradient; // Set gradient as the fill style
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, TWO_PI);
  ctx.closePath();
  ctx.fill();
}
