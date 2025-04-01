// Battle of the Elements

/* Idea
  * Players navigate through four distinct elemental levels 
      (Water, Earth, Air, Space)
  * Avoid obstacles and destroy enemies to achieve high score
  * Audiovisualization element for more interaction
      (Obstacles spawned based on sound data)
  * Particle systems for improved graphics

// Inspirations
  * Asteriods -> obstacle avoidance/shooting at enemies
  * Geometry Dash -> musical element

// Creation process
  * Found several distinct copyright free songs (source: pixabay.com)
  * Created code to download song data into .csv files 
      (time, frequency, dominant frequency, amplitude, energy)
  * Examined song data to decide when and where to generate obstacles
      (lot of time and effort into experimentation)
  * Created general skeleton for basic Asteroid-inspired game 
      (shown in class during Week 11 – Informal project demos)
  * Improved graphics
  * Added additional types of vehicles to make more engaging
  * Created four distinct levels
  * Combined all four levels into one game
      (Added main menu for level selection, how to play, pause button, etc.)

// Key sections of your code
  * Global variables
  * Preload and setup
  * Main menu
  * How to play
  * Levels (water, earth, air, space)
  * Particle systems
  * Game mechanics
  * Input handling
*/

// Global variables
let gameState = "menu"; // "menu", "howToPlay", "water", "earth", "air", "space"
let score = 0;
let highScore = 0;
let progress = 0;
let isGameOver = false;
let isPaused = false;
let isLevelComplete = false;
let player;
let particleSystems = [];
let previousGameState = null;
let hasClicked = false; // Tracks if a click has been processed

// Songs and song data for each level
let waterSong, earthSong, airSong, spaceSong;
let waterSongData, earthSongData, airSongData, spaceSongData;
let dominantFrequencyData = [];
let energyData = [];
let timeData = [];
let currentSong;

// High scores
let waterHighScore = 0; // High score for Water level
let earthHighScore = 0; // High score for Earth level
let airHighScore = 0;   // High score for Air level
let spaceHighScore = 0; // High score for Space level

// Water level variables
let sharks = [];
let boats = [];
let boatMissiles = [];
let missiles = [];
let waterParticles = [];

// Earth level variables
let planes = [];
let bombs = [];
let bullets = [];
let lastPlaneTime = 0;

// Air level variables
let airPlanes = [];
let planeMissiles = [];
let birds = [];
let skyParticles = [];

// Space level variables
let obstacles = [];
let stars = [];
let meteors = [];
let spaceBullets = [];
let spaceParticles = [];
let lastObstacleTime = 0;

// Add loading counters
let filesLoaded = 0;
let totalFilesToLoad = 8; // 4 songs + 4 CSV files
let loading = true;

function preload() {
  // Load song data for each level
  waterSongData = loadTable('data/happy_data.csv', 'csv', 'header', () => filesLoaded++, () => { filesLoaded++; console.error("Failed to load happy_data.csv"); });
  earthSongData = loadTable('data/risk_data.csv', 'csv', 'header', () => filesLoaded++, () => { filesLoaded++; console.error("Failed to load risk_data.csv"); });
  airSongData = loadTable('data/power_data.csv', 'csv', 'header', () => filesLoaded++, () => { filesLoaded++; console.error("Failed to load power_data.csv"); });
  spaceSongData = loadTable('data/space_data.csv', 'csv', 'header', () => filesLoaded++, () => { filesLoaded++; console.error("Failed to load space_data.csv"); });

  // Load songs
  waterSong = loadSound('data/happy.mp3', () => filesLoaded++, () => { filesLoaded++; console.error("Failed to load happy.mp3"); });
  earthSong = loadSound('data/risk.mp3', () => filesLoaded++, () => { filesLoaded++; console.error("Failed to load risk.mp3"); });
  airSong = loadSound('data/power.mp3', () => filesLoaded++, () => { filesLoaded++; console.error("Failed to load power.mp3"); });
  spaceSong = loadSound('data/space.mp3', () => filesLoaded++, () => { filesLoaded++; console.error("Failed to load space.mp3"); });
}

// Add arrays to store data for each level
let waterDominantFrequencyData = [];
let waterEnergyData = [];
let waterTimeData = [];
let earthDominantFrequencyData = [];
let earthEnergyData = [];
let earthTimeData = [];
let airDominantFrequencyData = [];
let airEnergyData = [];
let airTimeData = [];
let spaceDominantFrequencyData = [];
let spaceEnergyData = [];
let spaceTimeData = [];

function setup() {
  createCanvas(800, 400);
  textAlign(CENTER, CENTER);

  // Extract data for Water Level
  if (waterSongData) {
    for (let i = 0; i < waterSongData.getRowCount(); i++) {
      waterDominantFrequencyData.push(waterSongData.getNum(i, 'DominantFrequency'));
      waterEnergyData.push(waterSongData.getNum(i, 'Energy'));
      waterTimeData.push(waterSongData.getNum(i, 'Time'));
    }
  } else {
    console.error("Water song data not loaded properly.");
    gameState = "error";
  }

  // Extract data for Earth Level
  if (earthSongData) {
    for (let i = 0; i < earthSongData.getRowCount(); i++) {
      earthDominantFrequencyData.push(earthSongData.getNum(i, 'DominantFrequency'));
      earthEnergyData.push(earthSongData.getNum(i, 'Energy'));
      earthTimeData.push(earthSongData.getNum(i, 'Time'));
    }
  } else {
    console.error("Earth song data not loaded properly.");
    gameState = "error";
  }

  // Extract data for Air Level
  if (airSongData) {
    for (let i = 0; i < airSongData.getRowCount(); i++) {
      airDominantFrequencyData.push(airSongData.getNum(i, 'DominantFrequency'));
      airEnergyData.push(airSongData.getNum(i, 'Energy'));
      airTimeData.push(airSongData.getNum(i, 'Time'));
    }
  } else {
    console.error("Air song data not loaded properly.");
    gameState = "error";
  }

  // Extract data for Space Level
  if (spaceSongData) {
    for (let i = 0; i < spaceSongData.getRowCount(); i++) {
      spaceDominantFrequencyData.push(spaceSongData.getNum(i, 'DominantFrequency'));
      spaceEnergyData.push(spaceSongData.getNum(i, 'Energy'));
      spaceTimeData.push(spaceSongData.getNum(i, 'Time'));
    }
  } else {
    console.error("Space song data not loaded properly.");
    gameState = "error";
  }
}

function draw() {
  // Check if still loading
  if (filesLoaded < totalFilesToLoad) {
    background(50);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('Loading...', width / 2, height / 2);
    return; // Exit draw() until loading is complete
  }

  // Once loading is complete, set the loading flag to false
  if (loading) {
    loading = false;
    console.log('All files loaded, starting game');
  }

  // Handle paused state
  if (gameState === "paused") {
    drawPauseMenu();
    return;
  }

  // Normal game drawing
  if (gameState === "error") {
    drawErrorState();
  } else if (gameState === "menu") {
    drawMainMenu();
  } else if (gameState === "howToPlay") {
    drawHowToPlay();
  } else if (gameState === "water") {
    drawWaterLevel();
  } else if (gameState === "earth") {
    drawEarthLevel();
  } else if (gameState === "air") {
    drawAirLevel();
  } else if (gameState === "space") {
    drawSpaceLevel();
  }
}

function drawPauseButton() {
  // Position the pause button in the top-right corner
  let btnX = width - 60;
  let btnY = 30;
  let btnWidth = 80;
  let btnHeight = 30;

  drawButton("Pause", btnX, btnY, btnWidth, btnHeight, [100, 100, 100, 220], () => {
    isPaused = true;
    gameState = "paused";
    if (currentSong) currentSong.pause();
  });
}

function startLevel(level) {
  resetLevel();
  gameState = level;
  previousGameState = level; // Store the current level as the previous state

  // Stop any currently playing song
  if (currentSong) {
    currentSong.stop();
  }

  // Set up the level and load the appropriate song and song data
  if (level === "water") {
    setupWaterLevel();
    currentSong = waterSong;
    dominantFrequencyData = waterDominantFrequencyData;
    energyData = waterEnergyData;
    timeData = waterTimeData;
  } else if (level === "earth") {
    setupEarthLevel();
    currentSong = earthSong;
    dominantFrequencyData = earthDominantFrequencyData;
    energyData = earthEnergyData;
    timeData = earthTimeData;
  } else if (level === "air") {
    setupAirLevel();
    currentSong = airSong;
    dominantFrequencyData = airDominantFrequencyData;
    energyData = airEnergyData;
    timeData = airTimeData;
  } else if (level === "space") {
    setupSpaceLevel();
    currentSong = spaceSong;
    dominantFrequencyData = spaceDominantFrequencyData;
    energyData = spaceEnergyData;
    timeData = spaceTimeData;
  }

  // Play the song if it exists and is loaded
  if (currentSong && currentSong.isLoaded()) {
    currentSong.play();
  } else {
    console.error(`Song for ${level} level failed to load or is not ready.`);
    gameState = "error";
  }

  // Verify that sound data is loaded
  if (dominantFrequencyData.length === 0 || energyData.length === 0 || timeData.length === 0) {
    console.error(`Sound data for ${level} level is empty.`);
    gameState = "error";
  }
}

function drawErrorState() {
  background(50);
  fill(255, 0, 0);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("Error Loading Resources", width / 2, height / 2 - 20);
  textSize(20);
  text("Please check the console for details", width / 2, height / 2 + 20);
}

function drawMainMenu() {
  // Gradient background (dark gray to black)
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(30, 30, 30), color(0, 0, 0), inter);
    stroke(c);
    line(0, y, width, y);
  }

  // Title with shadow effect
  textAlign(CENTER, CENTER);
  textSize(40);
  fill(0, 0, 0, 150);
  text("Battle of the Elements", width / 2 + 3, 50 + 3);
  fill(255, 255, 255);
  text("Battle of the Elements", width / 2, 50);

  // 2x2 grid layout for levels
  let buttonWidth = 200;
  let buttonHeight = 40;
  let padding = 20; // Padding between elements
  let highScoreOffsetY = 30; // Vertical offset for high score text below the button

  // Water Level (Top-Left)
  let x1 = width / 4; // Center of left column (800 / 4 = 200)
  let y1 = 120; // Top row
  drawEnhancedButton("Water", x1, y1, buttonWidth, buttonHeight, [0, 105, 148, 200], () => startLevel("water"));
  fill(200, 200, 200);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("High Score: " + waterHighScore, x1, y1 + buttonHeight / 2 + highScoreOffsetY);

  // Earth Level (Top-Right)
  let x2 = 3 * width / 4; // Center of right column (3 * 800 / 4 = 600)
  let y2 = 120; // Top row
  drawEnhancedButton("Earth", x2, y2, buttonWidth, buttonHeight, [100, 80, 60, 200], () => startLevel("earth"));
  fill(200, 200, 200);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("High Score: " + earthHighScore, x2, y2 + buttonHeight / 2 + highScoreOffsetY);

  // Air Level (Bottom-Left)
  let y3 = 260; // Bottom row
  drawEnhancedButton("Air", x1, y3, buttonWidth, buttonHeight, [135, 206, 235, 200], () => startLevel("air"));
  fill(200, 200, 200);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("High Score: " + airHighScore, x1, y3 + buttonHeight / 2 + highScoreOffsetY);

  // Space Level (Bottom-Right)
  drawEnhancedButton("Space", x2, y3, buttonWidth, buttonHeight, [30, 30, 50, 200], () => startLevel("space"));
  fill(200, 200, 200);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("High Score: " + spaceHighScore, x2, y3 + buttonHeight / 2 + highScoreOffsetY);

  // How to Play button at the bottom
  drawEnhancedButton("How to Play", width / 2, height - 40, 200, 40, [0, 255, 0, 200], () => gameState = "howToPlay");
}

// Function to draw buttons with shadows and hover animations
function drawEnhancedButton(label, x, y, btnWidth, btnHeight, baseFillColor, onClick) {
  let r = baseFillColor[0];
  let g = baseFillColor[1];
  let b = baseFillColor[2];
  let a = baseFillColor.length > 3 ? baseFillColor[3] : 255;

  // Hover detection
  let isHovering = mouseX > x - btnWidth / 2 && mouseX < x + btnWidth / 2 &&
                   mouseY > y - btnHeight / 2 && mouseY < y + btnHeight / 2;

  // Animate scale on hover
  let scale = isHovering ? 1.05 : 1; // Slightly scale up on hover
  let scaledWidth = btnWidth * scale;
  let scaledHeight = btnHeight * scale;

  // Shadow
  fill(0, 0, 0, 100);
  noStroke();
  rectMode(CENTER);
  rect(x + 3, y + 3, scaledWidth, scaledHeight, 10);

  // Button fill with hover effect
  if (isHovering) {
    fill(r, g, b, 255);
    stroke(255, 255, 0); // Yellow border on hover
    strokeWeight(3);
  } else {
    fill(r, g, b, a);
    stroke(255);
    strokeWeight(2);
  }

  // Draw the button
  rect(x, y, scaledWidth, scaledHeight, 10);
  noStroke();

  // Label
  fill(255);
  textSize(btnHeight / 2);
  textAlign(CENTER, CENTER);
  text(label, x, y);
  rectMode(CORNER);

  // Handle click
  if (mouseIsPressed && isHovering && !hasClicked) {
    hasClicked = true;
    onClick();
  }
}

function drawButton(label, x, y, btnWidth, btnHeight, baseFillColor, onClick) {
  // Default button dimensions if not provided
  btnWidth = btnWidth || 200;
  btnHeight = btnHeight || 40;

  // Ensure baseFillColor is an array [r, g, b, a]
  let r = baseFillColor[0];
  let g = baseFillColor[1];
  let b = baseFillColor[2];
  let a = baseFillColor.length > 3 ? baseFillColor[3] : 255;

  // Hover effect: brighten the button when mouse is over
  let isHovering = mouseX > x - btnWidth / 2 && mouseX < x + btnWidth / 2 &&
                   mouseY > y - btnHeight / 2 && mouseY < y + btnHeight / 2;
  if (isHovering) {
    fill(r, g, b, 255); // Increase opacity on hover
    stroke(255, 255, 0); // Yellow border on hover
    strokeWeight(3);
  } else {
    fill(r, g, b, a); // Use original opacity
    stroke(255); // White border normally
    strokeWeight(2);
  }

  // Draw the button
  rectMode(CENTER);
  rect(x, y, btnWidth, btnHeight, 10);
  noStroke();

  // Draw the label with size proportional to button height
  fill(255);
  textSize(btnHeight / 2); // Text size is half the button height
  textAlign(CENTER, CENTER);
  text(label, x, y);
  rectMode(CORNER);

  // Check for click with debounce
  if (mouseIsPressed && isHovering && !hasClicked) {
    hasClicked = true; // Mark that a click has been processed
    onClick();
  }
}

function mouseReleased() {
  hasClicked = false; // Reset the click flag when the mouse is released
}

function drawHowToPlay() {
  // Gradient background (lighter gray to dark gray)
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(70, 70, 70), color(30, 30, 30), inter);
    stroke(c);
    line(0, y, width, y);
  }

  // Title with shadow
  textSize(36);
  fill(0, 0, 0, 150); // Shadow
  text("How to Play", width / 2 + 2, 30 + 2);
  fill(255); // Main text
  text("How to Play", width / 2, 30);

  textSize(14);
  textAlign(LEFT, TOP);

  // Define the layout for the four squares with borders
  let squareWidth = width / 2 - 20; // 400 - 20 for padding
  let squareHeight = (height - 100) / 2; // (400 - 100) / 2 for padding and title
  let padding = 10;

  // Water Level Square (Top-Left)
  drawLevelSquare(10, 50, squareWidth, squareHeight, [0, 105, 148], "Water Level (Submarine):", [
    "- Arrow keys to move",
    "- Spacebar to shoot missiles",
    "- Avoid sharks and enemy boats",
    "- Score: Sharks (5 pts), Boats (10 pts),",
    "  Boat Missiles (5 pts)"
  ]);

  // Earth Level Square (Top-Right)
  drawLevelSquare(width / 2 + 10, 50, squareWidth, squareHeight, [100, 80, 60], "Earth Level (Tank):", [
    "- Up/Down arrows to move forward/backward",
    "- Left/Right arrows to rotate cannon",
    "- Spacebar to shoot bullets",
    "- Avoid planes and bombs",
    "- Score: Planes (10 pts), Bombs (5 pts)"
  ]);

  // Air Level Square (Bottom-Left)
  drawLevelSquare(10, 50 + squareHeight + 10, squareWidth, squareHeight, [135, 206, 235], "Air Level (Fighter Jet):", [
    "- Arrow keys to move",
    "- Spacebar to shoot missiles",
    "- Avoid enemy planes and birds",
    "- Score: Planes (10 pts), Plane Missiles (5 pts), Birds (20 pts)"
  ]);

  // Space Level Square (Bottom-Right)
  drawLevelSquare(width / 2 + 10, 50 + squareHeight + 10, squareWidth, squareHeight, [30, 30, 50], "Space Level (Spaceship):", [
    "- Left/Right arrows to rotate",
    "- Up arrow to accelerate, Down to decelerate",
    "- Spacebar to shoot lasers",
    "- Avoid planets, meteors, and stars",
    "- Score: Planets (10 pts), Meteors (2 x 10 pts), Stars (5 pts)"
  ]);

  textAlign(CENTER, CENTER);
  // Back button with enhanced styling
  let backDestination = isPaused ? "paused" : "menu";
  drawEnhancedButton("Back", width / 2, height - 30, 150, 30, [100, 100, 100, 220], () => {
    gameState = backDestination;
  });
  noStroke();
}

// Function to draw level instruction squares with borders and better text formatting
function drawLevelSquare(x, y, w, h, bgColor, title, instructions) {
  // Shadow
  fill(0, 0, 0, 100);
  rect(x + 3, y + 3, w, h, 10);

  // Background with border
  fill(bgColor);
  stroke(255, 255, 255, 150); // White border with slight transparency
  strokeWeight(2);
  rect(x, y, w, h, 10);
  noStroke();

  // Title (bold effect by drawing twice)
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(title, x + 10, y + 10); // Slightly indented

  // Instructions
  textSize(12);
  let textY = y + 35;
  for (let line of instructions) {
    text(line, x + 10, textY);
    textY += 18; // Adjust line spacing
  }
}

function drawPauseMenu() {
  // Draw the current level's background (frozen)
  if (gameState === "paused") {
    if (previousGameState === "water") {
      background(135, 206, 235);
      fill(0, 105, 148);
      rect(0, height / 2, width, height / 2);
      for (let particle of waterParticles) {
        fill(0, 120, 168, particle.opacity);
        ellipse(particle.x, particle.y, particle.size, particle.size);
      }
      if (player) player.display();
      drawMissiles();
      drawSharks();
      drawBoats();
      drawBoatMissiles();
    } else if (previousGameState === "earth") {
      background(100, 80, 60);
      fill(80, 60, 40);
      rect(0, height - 50, width, 50);
      if (player) player.display();
      drawBullets();
      drawPlanes();
    } else if (previousGameState === "air") {
      background(135, 206, 235);
      for (let cloud of skyParticles) {
        push();
        translate(cloud.x, cloud.y);
        noStroke();
        for (let particle of cloud.particles) {
          fill(particle.color, particle.color, particle.color, particle.opacity);
          ellipse(particle.offsetX, particle.offsetY, particle.size, particle.size);
        }
        pop();
      }
      if (player) player.display();
      drawAirMissiles();
      drawAirPlanes();
      drawPlaneMissiles();
      drawBirds();
    } else if (previousGameState === "space") {
      background(0);
      drawSpaceParticles();
      if (player) player.display();
      drawSpaceBullets();
      drawObstacles();
      drawMeteors();
      drawStars();
    }
    updateParticleSystems();
    displayScore();
    displayHighScore();
    displayProgressBar();
  }

  // Semi-transparent overlay
  fill(0, 200);
  rect(0, 0, width, height);

  // Paused title
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("Paused", width / 2, height / 2 - 120);

  // Buttons
  let btnWidth = 200;
  let btnHeight = 40;
  let btnSpacing = 60;

  // Resume button
  drawButton("Resume", width / 2, height / 2 - 40, btnWidth, btnHeight, [100, 100, 100, 220], () => {
    isPaused = false;
    gameState = previousGameState;
    if (currentSong) currentSong.play();
  });

  // How to Play button
  drawButton("How to Play", width / 2, height / 2 + 20, btnWidth, btnHeight, [100, 100, 100, 220], () => {
    gameState = "howToPlay";
  });

  // Retry Level button
  drawButton("Retry Level", width / 2, height / 2 + 80, btnWidth, btnHeight, [100, 100, 100, 220], () => {
    isPaused = false;
    startLevel(previousGameState);
  });

  // Main Menu button
  drawButton("Main Menu", width / 2, height / 2 + 140, btnWidth, btnHeight, [100, 100, 100, 220], () => {
    isPaused = false;
    gameState = "menu";
    if (currentSong) currentSong.stop();
  });

  noStroke();
}

// Reset level state
function resetLevel() {
  isGameOver = false;
  isLevelComplete = false;
  score = 0;
  progress = 0;
  particleSystems = [];
  player = null;

  // Clear level-specific arrays
  sharks = [];
  boats = [];
  boatMissiles = [];
  missiles = [];
  waterParticles = [];

  planes = [];
  bombs = [];
  bullets = [];
  lastPlaneTime = 0;

  airPlanes = [];
  planeMissiles = [];
  birds = [];
  skyParticles = [];

  obstacles = [];
  stars = [];
  meteors = [];
  spaceBullets = [];
  spaceParticles = [];
  lastObstacleTime = 0;

  loop();
}

// Water Level
function setupWaterLevel() {
  player = createWaterPlayer();
  for (let i = 0; i < 200; i++) {
    waterParticles.push({
      x: random(0, width),
      y: random(height / 2, height),
      size: random(2, 5),
      speed: random(0.5, 1.5),
      opacity: random(50, 150),
    });
  }
}

function drawWaterLevel() {
  background(135, 206, 235);
  fill(0, 105, 148);
  rect(0, height / 2, width, height / 2);

  for (let particle of waterParticles) {
    particle.x -= particle.speed;
    if (particle.x < 0) {
      particle.x = width;
      particle.y = random(height / 2, height);
    }
    fill(0, 120, 168, particle.opacity);
    ellipse(particle.x, particle.y, particle.size, particle.size);
  }

  updateParticleSystems();

  if (isLevelComplete) {
    displayLevelEnd("Level Complete!");
    return;
  }

  if (isGameOver) {
    displayLevelEnd("Game Over");
    return;
  }

  if (player) player.update();
  updateMissiles();
  checkSharks();
  checkBoats();

  if (player) player.display();
  drawMissiles();
  drawSharks();
  drawBoats();
  drawBoatMissiles();

  displayScore();
  displayHighScore();
  displayProgressBar();
  handleContinuousKeys();

  // Draw pause button last to ensure it’s on top
  drawPauseButton();
}

function createWaterPlayer() {
  return {
    x: 50,
    y: height / 2,
    width: 70,
    height: 30,
    speedX: 0,
    speedY: 0,
    maxSpeed: 4,
    acceleration: 0.2,
    friction: 0.96,
    lastParticleTime: 0,
    update: function () {
      this.speedX *= this.friction;
      this.speedY *= this.friction;
      if (Math.abs(this.speedX) < 0.01) this.speedX = 0;
      if (Math.abs(this.speedY) < 0.01) this.speedY = 0;

      this.x += this.speedX;
      this.y += this.speedY;
      this.x = constrain(this.x, 0, width - this.width);
      this.y = constrain(this.y, height / 2, height - this.height / 2);

      let now = millis();
      if ((this.speedX !== 0 || this.speedY !== 0) && now - this.lastParticleTime > 100) {
        let color = this.y > height / 2 ? [200, 200, 255, 150] : [150, 150, 150, 150];
        particleSystems.push(new ParticleSystem(this.x, this.y + this.height / 2, color, 3, 8));
        particleSystems[particleSystems.length - 1].addParticles(5);
        this.lastParticleTime = now;
      }

      for (let shark of sharks) {
        if (this.collidesWith(shark.x, shark.y, shark.size)) {
          isGameOver = true;
          currentSong.stop();
          updateHighScore();
          return;
        }
      }
      for (let boat of boats) {
        if (this.collidesWith(boat.x, boat.y, boat.width)) {
          isGameOver = true;
          currentSong.stop();
          updateHighScore();
          return;
        }
      }
      for (let missile of boatMissiles) {
        if (this.collidesWith(missile.x, missile.y, 10)) {
          isGameOver = true;
          currentSong.stop();
          updateHighScore();
          return;
        }
      }

      progress = map(currentSong.currentTime(), 0, currentSong.duration(), 0, 1);
      if (progress >= 0.99) {
        isLevelComplete = true;
        updateHighScore();
      }
    },
    display: function () {
      push();
      translate(this.x + this.width / 2, this.y);
      fill(40, 40, 40);
      beginShape();
      vertex(-this.width / 2 + 10, -this.height / 2);
      vertex(this.width / 2 - 10, -this.height / 2);
      vertex(this.width / 2, 0);
      vertex(this.width / 2 - 10, this.height / 2);
      vertex(-this.width / 2 + 10, this.height / 2);
      vertex(-this.width / 2, this.height / 4);
      endShape(CLOSE);
      fill(255, 204, 0);
      rect(-this.width / 2 + 5, -this.height / 2 - 5, this.width - 10, 5);
      rect(-this.width / 2 + 5, this.height / 2, this.width - 10, 5);
      fill(255, 204, 0);
      ellipse(-15, 0, 14, 14);
      ellipse(0, 0, 14, 14);
      ellipse(15, 0, 14, 14);
      fill(0, 100, 255);
      ellipse(-15, 0, 10, 10);
      ellipse(0, 0, 10, 10);
      ellipse(15, 0, 10, 10);
      fill(40, 40, 40);
      rect(-10, -this.height - 15, 20, 20, 5);
      fill(60, 60, 60);
      rect(0, -this.height - 25, 5, 15);
      fill(255, 204, 0);
      ellipse(-this.width / 2 + 5, this.height / 4, 12, 12);
      stroke(60, 60, 60);
      strokeWeight(2);
      line(-this.width / 2 + 5, this.height / 4 - 6, -this.width / 2 + 5, this.height / 4 + 6);
      line(-this.width / 2 - 1, this.height / 4, -this.width / 2 + 11, this.height / 4);
      noStroke();
      pop();
    },
    moveRight: function () { this.speedX = min(this.speedX + this.acceleration, this.maxSpeed); },
    moveLeft: function () { this.speedX = max(this.speedX - this.acceleration, -this.maxSpeed); },
    moveUp: function () { this.speedY = max(this.speedY - this.acceleration, -this.maxSpeed); },
    moveDown: function () { this.speedY = min(this.speedY + this.acceleration, this.maxSpeed); },
    shoot: function () {
      missiles.push({ x: this.x + this.width, y: this.y, speed: 8, lastParticleTime: 0 });
    },
    collidesWith: function (objX, objY, objSize) {
      return dist(this.x + this.width / 2, this.y, objX, objY) < this.width / 2 + objSize / 2;
    },
  };
}

function updateMissiles() {
  for (let i = missiles.length - 1; i >= 0; i--) {
    let missile = missiles[i];
    missile.x += missile.speed;

    let now = millis();
    if (now - missile.lastParticleTime > 50) {
      particleSystems.push(new ParticleSystem(missile.x - 10, missile.y, [255, 100, 0, 150], 3, 8));
      particleSystems[particleSystems.length - 1].addParticles(3);
      missile.lastParticleTime = now;
    }

    for (let j = sharks.length - 1; j >= 0; j--) {
      let shark = sharks[j];
      if (dist(missile.x, missile.y, shark.x, shark.y) < 5 + shark.size / 2) {
        score += 5;
        updateHighScore();
        sharks.splice(j, 1);
        particleSystems.push(new ParticleSystem(missile.x, missile.y, [255, 0, 0, 200], 3, 8));
        particleSystems[particleSystems.length - 1].addParticles(10);
        missiles.splice(i, 1);
        break;
      }
    }

    for (let j = boats.length - 1; j >= 0; j--) {
      if (i < 0) break;
      let boat = boats[j];
      if (dist(missile.x, missile.y, boat.x, boat.y) < 5 + boat.width / 2) {
        score += 10;
        updateHighScore();
        boats.splice(j, 1);
        particleSystems.push(new ParticleSystem(missile.x, missile.y, [255, 165, 0, 200], 3, 8));
        particleSystems[particleSystems.length - 1].addParticles(15);
        missiles.splice(i, 1);
        break;
      }
    }

    for (let j = boatMissiles.length - 1; j >= 0; j--) {
      if (i < 0) break;
      let boatMissile = boatMissiles[j];
      if (dist(missile.x, missile.y, boatMissile.x, boatMissile.y) < 5 + 5) {
        score += 5;
        updateHighScore();
        boatMissiles.splice(j, 1);
        particleSystems.push(new ParticleSystem(missile.x, missile.y, [255, 100, 0, 200], 3, 8));
        particleSystems[particleSystems.length - 1].addParticles(8);
        missiles.splice(i, 1);
        break;
      }
    }

    if (i >= 0 && missile.x > width) {
      missiles.splice(i, 1);
    }
  }
}

function drawMissiles() {
  for (let missile of missiles) {
    push();
    translate(missile.x, missile.y);
    fill(200, 50, 50);
    beginShape();
    vertex(-10, -3);
    vertex(10, -2);
    vertex(10, 2);
    vertex(-10, 3);
    endShape(CLOSE);
    fill(150, 150, 150);
    triangle(-10, -3, -15, -5, -15, -1);
    triangle(-10, 3, -15, 5, -15, 1);
    fill(255, 100, 0, 150);
    ellipse(-10, 0, 8, 4);
    pop();
  }
}

function checkSharks() {
  let currentIndex = Math.floor(map(currentSong.currentTime(), 0, currentSong.duration(), 0, dominantFrequencyData.length - 1));
  if (currentIndex > 0 && dominantFrequencyData[currentIndex] - dominantFrequencyData[currentIndex - 1] > 600) {
    sharks.push({ x: width, y: random(height / 2, height), size: 50, speed: 2 });
  }

  for (let shark of sharks) {
    shark.x -= shark.speed;
    if (player && shark.x > player.x) {
      shark.y += sin(frameCount * 0.05) * 0.5;
    }
  }
  sharks = sharks.filter(shark => shark.x + shark.size / 2 > 0);
}

function drawSharks() {
  for (let shark of sharks) {
    push();
    translate(shark.x, shark.y);
    fill(90, 110, 140);
    beginShape();
    vertex(-shark.size / 3.5, -shark.size / 5);
    vertex(0, -shark.size / 4);
    vertex(shark.size / 3, -shark.size / 5);
    vertex(shark.size / 2, -shark.size / 10);
    vertex(shark.size / 2, shark.size / 10);
    vertex(shark.size / 3, shark.size / 5);
    vertex(0, shark.size / 3);
    vertex(-shark.size / 3.5, shark.size / 4);
    endShape(CLOSE);
    fill(255, 255, 255);
    beginShape();
    vertex(-shark.size / 3.5, shark.size / 4);
    vertex(0, shark.size / 3);
    vertex(shark.size / 3, shark.size / 5);
    vertex(shark.size / 2, shark.size / 10);
    vertex(shark.size / 2, 0);
    endShape();
    let mouthOpen = abs(sin(frameCount * 0.15)) * (shark.size / 15);
    let upperJawY = -shark.size / 80 - mouthOpen;
    let lowerJawY = shark.size / 20 + mouthOpen;
    fill(90, 110, 140);
    beginShape();
    vertex(-shark.size / 3.5, -shark.size / 5);
    vertex(-shark.size / 2.5, -shark.size / 5);
    vertex(-shark.size / 1.2, upperJawY);
    vertex(-shark.size / 2.2, -shark.size / 80);
    vertex(-shark.size / 2.2, shark.size / 80);
    vertex(-shark.size / 1.2, lowerJawY);
    vertex(-shark.size / 2.5, shark.size / 4);
    vertex(-shark.size / 3.5, shark.size / 4);
    endShape(CLOSE);
    fill(255);
    triangle(-shark.size / 1.2, upperJawY, -shark.size / 1.2 + 3, upperJawY, -shark.size / 1.2 + 1.5, upperJawY + shark.size / 40);
    triangle(-shark.size / 1.2 + 3, upperJawY, -shark.size / 1.2 + 6, upperJawY, -shark.size / 1.2 + 4.5, upperJawY + shark.size / 40);
    triangle(-shark.size / 1.2 + 6, upperJawY, -shark.size / 1.2 + 9, upperJawY, -shark.size / 1.2 + 7.5, upperJawY + shark.size / 40);
    triangle(-shark.size / 1.2 + 9, upperJawY, -shark.size / 1.2 + 12, upperJawY, -shark.size / 1.2 + 10.5, upperJawY + shark.size / 40);
    triangle(-shark.size / 1.2, lowerJawY, -shark.size / 1.2 + 3, lowerJawY, -shark.size / 1.2 + 1.5, lowerJawY - shark.size / 40);
    triangle(-shark.size / 1.2 + 3, lowerJawY, -shark.size / 1.2 + 6, lowerJawY, -shark.size / 1.2 + 4.5, lowerJawY - shark.size / 40);
    triangle(-shark.size / 1.2 + 6, lowerJawY, -shark.size / 1.2 + 9, lowerJawY, -shark.size / 1.2 + 7.5, lowerJawY - shark.size / 40);
    triangle(-shark.size / 1.2 + 9, lowerJawY, -shark.size / 1.2 + 12, lowerJawY, -shark.size / 1.2 + 10.5, lowerJawY - shark.size / 40);
    fill(90, 110, 140);
    beginShape();
    vertex(-shark.size / 8, -shark.size / 4);
    vertex(shark.size / 8, -shark.size / 1.5);
    vertex(shark.size / 4, -shark.size / 4);
    endShape(CLOSE);
    beginShape();
    vertex(shark.size / 3, -shark.size / 5);
    vertex(shark.size / 2.5, -shark.size / 3);
    vertex(shark.size / 2, -shark.size / 5);
    endShape(CLOSE);
    beginShape();
    vertex(-shark.size / 4, 0);
    vertex(0, shark.size / 2);
    vertex(shark.size / 8, shark.size / 8);
    endShape(CLOSE);
    beginShape();
    vertex(shark.size / 2, -shark.size / 10);
    vertex(shark.size / 1.5, -shark.size / 2.5);
    vertex(shark.size / 1.8, 0);
    vertex(shark.size / 1.5, shark.size / 3);
    vertex(shark.size / 2, shark.size / 10);
    endShape();
    fill(0);
    ellipse(-shark.size / 2.5 + 5, -shark.size / 8, 6, 6);
    fill(255);
    ellipse(-shark.size / 2.5 + 6, -shark.size / 8 - 1, 2, 2);
    stroke(80, 90, 100);
    strokeWeight(1);
    for (let i = 0; i < 5; i++) {
      let xOffset = -shark.size / 3 + (i * shark.size / 15);
      arc(xOffset, 0, shark.size / 15, shark.size / 8, PI / 2, 3 * PI / 2);
    }
    noStroke();
    pop();
  }
}

function checkBoats() {
  let currentIndex = Math.floor(map(currentSong.currentTime(), 0, currentSong.duration(), 0, energyData.length - 1));
  if (energyData[currentIndex] > 8000 && random() < 0.02) {
    boats.push({ x: width, y: height / 2, width: 100, height: 20, speed: 1, missileFired: false });
  }

  for (let boat of boats) {
    boat.x -= boat.speed;
    if (!boat.missileFired && boat.x < width - 100) {
      boatMissiles.push({ x: boat.x - boat.width / 2, y: boat.y, speed: 3, lastParticleTime: 0 });
      boat.missileFired = true;
    }
  }

  for (let missile of boatMissiles) {
    missile.x -= missile.speed;
    let now = millis();
    if (now - missile.lastParticleTime > 50) {
      particleSystems.push(new ParticleSystem(missile.x + 10, missile.y, [255, 100, 0, 150], 3, 8));
      particleSystems[particleSystems.length - 1].addParticles(3);
      missile.lastParticleTime = now;
    }
  }

  boats = boats.filter(boat => boat.x + boat.width / 2 > 0);
  boatMissiles = boatMissiles.filter(missile => missile.x > 0);
}

function drawBoats() {
  for (let boat of boats) {
    push();
    translate(boat.x, boat.y);
    fill(180, 180, 180);
    beginShape();
    vertex(-boat.width / 2, boat.height / 2);
    vertex(-boat.width / 2 + 5, -boat.height / 2);
    vertex(boat.width / 2 - 5, -boat.height / 2);
    vertex(boat.width / 2, 0);
    endShape(CLOSE);
    fill(200, 0, 0);
    rect(-boat.width / 2, boat.height / 4, boat.width, boat.height / 4);
    fill(150, 150, 150);
    rect(-boat.width / 2 + 5, -boat.height / 2, boat.width - 10, boat.height / 4);
    fill(160, 160, 160);
    beginShape();
    vertex(-boat.width / 4, -boat.height / 2);
    vertex(-boat.width / 4, -boat.height - 5);
    vertex(boat.width / 4, -boat.height - 5);
    vertex(boat.width / 4, -boat.height / 2);
    endShape(CLOSE);
    fill(0);
    rect(-boat.width / 4 + 5, -boat.height - 3, 5, 3);
    rect(-boat.width / 4 + 15, -boat.height - 3, 5, 3);
    rect(boat.width / 4 - 15, -boat.height - 3, 5, 3);
    stroke(0);
    strokeWeight(1);
    line(0, -boat.height - 5, 0, -boat.height - 15);
    line(0, -boat.height - 10, 5, -boat.height - 12);
    fill(0);
    ellipse(0, -boat.height - 15, 4, 4);
    fill(100, 100, 100);
    rect(-boat.width / 2 + 10, -boat.height / 2 - 5, 10, 3);
    rect(-boat.width / 2 + 15, -boat.height / 2 - 7, 10, 3);
    stroke(100, 100, 100);
    strokeWeight(1);
    line(-boat.width / 2 + 5, -boat.height / 2 + 2, boat.width / 2 - 5, -boat.height / 2 + 2);
    for (let i = 0; i < 5; i++) {
      let x = -boat.width / 2 + 5 + (i * boat.width / 5);
      line(x, -boat.height / 2 + 2, x, -boat.height / 2 + 5);
    }
    noStroke();
    pop();
  }
}

function drawBoatMissiles() {
  for (let missile of boatMissiles) {
    push();
    translate(missile.x, missile.y);
    fill(255, 140, 0);
    beginShape();
    vertex(10, -3);
    vertex(-10, -2);
    vertex(-10, 2);
    vertex(10, 3);
    endShape(CLOSE);
    fill(200, 200, 200);
    triangle(10, -3, 15, -5, 15, -1);
    triangle(10, 3, 15, 5, 15, 1);
    fill(255, 100, 0, 150);
    ellipse(10, 0, 8, 4);
    pop();
  }
}

// Earth Level
function setupEarthLevel() {
  player = createEarthPlayer();
}

function drawEarthLevel() {
  background(100, 80, 60);
  fill(80, 60, 40);
  rect(0, height - 50, width, 50);

  updateParticleSystems();

  if (isLevelComplete) {
    displayLevelEnd("Level Complete!");
    return;
  }

  if (isGameOver) {
    displayLevelEnd("Game Over");
    return;
  }

  if (player) player.update();
  updateBullets();
  checkPlanes();

  if (player) player.display();
  drawBullets();
  drawPlanes();

  displayScore();
  displayHighScore();
  displayProgressBar();
  handleContinuousKeys();

  // Draw pause button last to ensure it’s on top
  drawPauseButton();
}

function createEarthPlayer() {
  return {
    x: 50,
    y: height - 50,
    size: 60,
    angle: 0,
    cannonAngle: 0,
    cannonLength: 40,
    speed: 0,
    rotationSpeed: 0.1,
    cannonSpeed: 0.1,
    acceleration: 0.1,
    deceleration: 0.05,
    maxSpeed: 4,
    friction: 0.96,
    health: 5,
    lastParticleTime: 0,
    lastShotTime: 0,
    update: function () {
      this.speed *= this.friction;
      if (Math.abs(this.speed) < 0.01) this.speed = 0;
      this.x += this.speed;
      this.x = constrain(this.x, 0, width - this.size / 2);

      for (let i = bombs.length - 1; i >= 0; i--) {
        let bomb = bombs[i];
        if (dist(this.x, this.y, bomb.x, bomb.y) < this.size / 2 + 15) {
          particleSystems.push(new ParticleSystem(bomb.x, bomb.y, [255, 165, 0], 5, 10));
          particleSystems[particleSystems.length - 1].addParticles(20);
          bombs.splice(i, 1);
          isGameOver = true;
          currentSong.stop();
          updateHighScore();
          return;
        }
      }

      progress = map(currentSong.currentTime(), 0, currentSong.duration(), 0, 1);
      if (progress >= 0.99) {
        isLevelComplete = true;
        updateHighScore();
      }
    },
    display: function () {
      push();
      translate(this.x, this.y);
      fill(80, 100, 60);
      beginShape();
      vertex(-this.size / 2, 0);
      vertex(-this.size / 2 + 10, -this.size / 2);
      vertex(this.size / 2 - 10, -this.size / 2);
      vertex(this.size / 2, 0);
      endShape(CLOSE);
      fill(50);
      rect(-this.size / 2 - 5, -this.size / 4, this.size + 10, this.size / 4);
      fill(40);
      for (let i = -this.size / 2 + 10; i < this.size / 2 - 10; i += 15) {
        ellipse(i, -this.size / 8, 12, 12);
      }
      fill(70, 90, 50);
      arc(0, -this.size / 2, this.size / 2, this.size / 2, PI, TWO_PI);
      rect(-5, -this.size / 2 - 10, 10, 10);
      fill(60);
      rect(this.size / 2 - 10, -this.size / 2, 10, 5);
      push();
      translate(0, -this.size / 2);
      rotate(this.cannonAngle);
      fill(70, 90, 50);
      rect(-2, -this.cannonLength - 5, 4, this.cannonLength + 5);
      pop();

      if (this.speed !== 0) {
        let now = millis();
        let emissionInterval = map(abs(this.speed), 0, this.maxSpeed, 500, 50);
        if (now - this.lastParticleTime > emissionInterval) {
          let numParticles = floor(map(abs(this.speed), 0, this.maxSpeed, 1, 5));
          particleSystems.push(new ParticleSystem(this.x - this.size / 2 * Math.sign(this.speed), this.y, [100, 100, 100], 5, 10));
          particleSystems[particleSystems.length - 1].addParticles(numParticles);
          this.lastParticleTime = now;
        }
      }
      pop();
    },

    moveForward: function () { this.speed = min(this.speed + this.acceleration, this.maxSpeed); },
    moveBackward: function () { this.speed = max(this.speed - this.acceleration, -this.maxSpeed); },
    rotateCannonLeft: function () { this.cannonAngle = constrain(this.cannonAngle - this.cannonSpeed, -PI / 4, PI / 4); },
    rotateCannonRight: function () { this.cannonAngle = constrain(this.cannonAngle + this.cannonSpeed, -PI / 4, PI / 4); },
    shoot: function () {
      let now = millis();
      if (now - this.lastShotTime > 500) {
        let cannonBaseY = this.y - this.size / 2;
        let adjustedAngle = this.cannonAngle - PI / 2;
        let cannonTipX = this.x + cos(adjustedAngle) * (this.cannonLength + 5);
        let cannonTipY = cannonBaseY + sin(adjustedAngle) * (this.cannonLength + 5);
        bullets.push({ x: cannonTipX, y: cannonTipY, angle: adjustedAngle, speed: 8 });
        this.lastShotTime = now;
      }
    },
  };
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.x += cos(bullet.angle) * bullet.speed;
    bullet.y += sin(bullet.angle) * bullet.speed;

    for (let j = planes.length - 1; j >= 0; j--) {
      let plane = planes[j];
      let planeSize = 80;
      if (dist(bullet.x, bullet.y, plane.x, plane.y) < 10 + planeSize / 2) {
        score += 10;
        updateHighScore();
        planes.splice(j, 1);
        particleSystems.push(new ParticleSystem(bullet.x, bullet.y, [255, 165, 0, 200], 5, 10));
        particleSystems[particleSystems.length - 1].addParticles(15);
        bullets.splice(i, 1);
        break;
      }
    }

    for (let j = bombs.length - 1; j >= 0; j--) {
      if (i < 0) break;
      let bomb = bombs[j];
      let bombSize = 16;
      if (dist(bullet.x, bullet.y, bomb.x, bomb.y) < 10 + bombSize / 2) {
        score += 5;
        updateHighScore();
        bombs.splice(j, 1);
        particleSystems.push(new ParticleSystem(bullet.x, bullet.y, [255, 100, 0, 200], 5, 10));
        particleSystems[particleSystems.length - 1].addParticles(10);
        bullets.splice(i, 1);
        break;
      }
    }

    if (i >= 0 && (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y < -50)) {
      bullets.splice(i, 1);
    }
  }
}

function drawBullets() {
  fill(150, 150, 150);
  for (let bullet of bullets) {
    push();
    translate(bullet.x, bullet.y);
    rotate(bullet.angle);
    ellipse(0, 0, 12, 6);
    pop();
  }
}

function checkPlanes() {
  let currentIndex = Math.floor(map(currentSong.currentTime(), 0, currentSong.duration(), 0, dominantFrequencyData.length - 1));
  if (currentIndex > 0 && dominantFrequencyData[currentIndex] - dominantFrequencyData[currentIndex - 1] > 25) {
    planes.push({ x: width, y: random(0, height / 4), speed: 3 });
    lastPlaneTime = millis();
  }

  for (let i = planes.length - 1; i >= 0; i--) {
    let plane = planes[i];
    plane.x -= plane.speed;

    if (energyData[currentIndex] > 5000 && random() < 0.01) {
      bombs.push({ x: plane.x, y: plane.y, speed: 2, angle: PI / 2 });
    }

    if (plane.x < 0) {
      planes.splice(i, 1);
    }
  }

  for (let i = bombs.length - 1; i >= 0; i--) {
    let bomb = bombs[i];
    bomb.x += cos(bomb.angle) * bomb.speed;
    bomb.y += sin(bomb.angle) * bomb.speed;

    if (bomb.y + 10 >= height - 50) {
      particleSystems.push(new ParticleSystem(bomb.x, height - 50, [255, 165, 0], 5, 10));
      particleSystems[particleSystems.length - 1].addParticles(30);
      bombs.splice(i, 1);
    } else if (bomb.x < 0 || bomb.y > height) {
      bombs.splice(i, 1);
    }
  }
}

function drawPlanes() {
  for (let plane of planes) {
    push();
    translate(plane.x, plane.y);
    fill(100);
    beginShape();
    vertex(-40, 0);
    vertex(-20, -20);
    vertex(30, -15);
    vertex(40, 0);
    endShape(CLOSE);
    fill(120);
    beginShape();
    vertex(-20, -20);
    vertex(-10, -30);
    vertex(10, -25);
    vertex(0, -15);
    endShape(CLOSE);
    fill(80);
    beginShape();
    vertex(-30, 0);
    vertex(-40, -15);
    vertex(-30, -10);
    endShape(CLOSE);
    fill(60);
    rect(30, -5, 15, 5);
    fill(200, 100, 100, 150);
    ellipse(45, -2.5, 10, 5);
    fill(150);
    arc(-5, -15, 15, 15, PI, TWO_PI);
    pop();
  }

  for (let bomb of bombs) {
    push();
    translate(bomb.x, bomb.y);
    fill(60);
    rect(-8, -15, 16, 30, 5);
    fill(255, 0, 0);
    ellipse(0, -15, 10, 10);
    fill(50);
    triangle(-8, 15, 0, 25, 8, 15);
    pop();
  }
}

// Air Level
function setupAirLevel() {
  player = createAirPlayer();
  initializeSkyParticles();
}

function drawAirLevel() {
  background(135, 206, 235);

  for (let cloud of skyParticles) {
    cloud.x -= cloud.speed;
    if (cloud.x < -cloud.radius) {
      cloud.x = width + cloud.radius;
      cloud.y = random(0, height);
    }
    push();
    translate(cloud.x, cloud.y);
    noStroke();
    for (let particle of cloud.particles) {
      particle.offsetX += particle.drift;
      particle.offsetY += particle.drift * 0.1;
      let particleDist = sqrt(particle.offsetX * particle.offsetX + particle.offsetY * particle.offsetY);
      if (particleDist > cloud.radius) {
        let angle = atan2(particle.offsetY, particle.offsetX);
        particle.offsetX = cos(angle) * cloud.radius;
        particle.offsetY = sin(angle) * cloud.radius * 0.5;
      }
      fill(particle.color, particle.color, particle.color, particle.opacity);
      ellipse(particle.offsetX, particle.offsetY, particle.size, particle.size);
    }
    pop();
  }

  updateParticleSystems();

  if (isLevelComplete) {
    displayLevelEnd("Level Complete!");
    return;
  }

  if (isGameOver) {
    displayLevelEnd("Game Over");
    return;
  }

  if (player) player.update();
  updateAirMissiles();
  checkAirPlanes();
  checkBirds();

  if (player) player.display();
  drawAirMissiles();
  drawAirPlanes();
  drawPlaneMissiles();
  drawBirds();

  displayScore();
  displayHighScore();
  displayProgressBar();
  handleContinuousKeys();

  // Draw pause button last to ensure it’s on top
  drawPauseButton();
}

function initializeSkyParticles() {
  skyParticles = [];
  for (let i = 0; i < 20; i++) {
    let cloud = {
      x: random(0, width),
      y: random(0, height),
      speed: random(0.2, 0.5),
      particles: [],
      radius: random(30, 60),
    };
    let numParticles = Math.floor(random(30, 80));
    for (let j = 0; j < numParticles; j++) {
      let angle = random(0, TWO_PI);
      let particleDist = random(0, cloud.radius) * sqrt(random(0, 1));
      let offsetX = cos(angle) * particleDist;
      let offsetY = sin(angle) * particleDist * 0.5;
      cloud.particles.push({
        offsetX: offsetX,
        offsetY: offsetY,
        size: random(3, 15),
        opacity: random(40, 160),
        color: random(210, 255),
        drift: random(-0.02, 0.02),
      });
    }
    skyParticles.push(cloud);
  }
}

function createAirPlayer() {
  return {
    x: 50,
    y: height / 2,
    width: 50,
    height: 20,
    speedX: 0,
    speedY: 0,
    maxSpeed: 5,
    acceleration: 0.3,
    friction: 0.96,
    lastParticleTime: 0,
    update: function () {
      this.speedX *= this.friction;
      this.speedY *= this.friction;
      if (Math.abs(this.speedX) < 0.01) this.speedX = 0;
      if (Math.abs(this.speedY) < 0.01) this.speedY = 0;

      this.x += this.speedX;
      this.y += this.speedY;
      this.x = constrain(this.x, 0, width - this.width);
      this.y = constrain(this.y, this.height / 2, height - this.height / 2);

      let now = millis();
      if (now - this.lastParticleTime > 50) {
        particleSystems.push(new ParticleSystem(this.x, this.y, [255, 150, 0, 150], 3, 8));
        particleSystems[particleSystems.length - 1].addParticles(3);
        this.lastParticleTime = now;
      }

      for (let plane of airPlanes) {
        if (this.collidesWith(plane.x, plane.y, plane.width)) {
          isGameOver = true;
          currentSong.stop();
          updateHighScore();
          return;
        }
      }

      for (let missile of planeMissiles) {
        if (this.collidesWith(missile.x, missile.y, 10)) {
          isGameOver = true;
          currentSong.stop();
          updateHighScore();
          return;
        }
      }

      for (let bird of birds) {
        if (this.collidesWith(bird.x, bird.y, bird.size)) {
          isGameOver = true;
          currentSong.stop();
          updateHighScore();
          return;
        }
      }

      progress = map(currentSong.currentTime(), 0, currentSong.duration(), 0, 1);
      if (progress >= 0.99) {
        isLevelComplete = true;
        updateHighScore();
      }
    },
    display: function () {
      push();
      translate(this.x + this.width / 2, this.y);
      fill(150, 150, 150);
      beginShape();
      vertex(-this.width / 2, 0);
      vertex(-this.width / 2 + 5, -this.height / 2);
      vertex(this.width / 2 - 5, -this.height / 3);
      vertex(this.width / 2, 0);
      vertex(this.width / 2 - 5, this.height / 3);
      vertex(-this.width / 2 + 5, this.height / 2);
      endShape(CLOSE);
      fill(120, 120, 120);
      beginShape();
      vertex(-this.width / 2 + 5, this.height / 2);
      vertex(this.width / 2 - 5, this.height / 3);
      vertex(this.width / 2 - 5, 0);
      vertex(-this.width / 2, 0);
      endShape(CLOSE);
      stroke(100);
      strokeWeight(1);
      line(-this.width / 3, -this.height / 2, -this.width / 3, this.height / 2);
      line(-this.width / 3, 0, this.width / 2 - 5, 0);
      line(0, -this.height / 3, 0, this.height / 3);
      noStroke();
      fill(0, 0, 0, 200);
      arc(0, -this.height / 3, 15, 10, PI, TWO_PI, CHORD);
      fill(255, 255, 255, 100);
      arc(0, -this.height / 3, 12, 8, PI, TWO_PI, CHORD);
      fill(255, 0, 0);
      ellipse(0, -this.height / 3, 5, 5);
      fill(140, 140, 140);
      beginShape();
      vertex(-this.width / 3, 0);
      vertex(-this.width / 2 + 5, -this.height);
      vertex(this.width / 4, -this.height / 3);
      endShape(CLOSE);
      beginShape();
      vertex(-this.width / 3, 0);
      vertex(-this.width / 2 + 5, this.height);
      vertex(this.width / 4, this.height / 3);
      endShape(CLOSE);
      stroke(100);
      line(-this.width / 3, -this.height / 3, -this.width / 2 + 5, -this.height);
      line(-this.width / 3, this.height / 3, -this.width / 2 + 5, this.height);
      noStroke();
      fill(130, 130, 130);
      beginShape();
      vertex(-this.width / 2 + 5, -this.height / 3);
      vertex(-this.width / 2 + 10, -this.height - 5);
      vertex(-this.width / 2 + 15, -this.height / 3);
      endShape(CLOSE);
      beginShape();
      vertex(-this.width / 2 + 5, 0);
      vertex(-this.width / 2 + 15, -this.height / 2);
      vertex(-this.width / 2 + 20, 0);
      endShape(CLOSE);
      beginShape();
      vertex(-this.width / 2 + 5, 0);
      vertex(-this.width / 2 + 15, this.height / 2);
      vertex(-this.width / 2 + 20, 0);
      endShape(CLOSE);
      fill(50, 50, 50);
      ellipse(-this.width / 2, 0, 10, 6);
      fill(255, 150, 0, 150);
      ellipse(-this.width / 2 - 5, 0, 12, 8);
      fill(255, 200, 0, 100);
      ellipse(-this.width / 2 - 8, 0, 15, 10);
      fill(255, 0, 0);
      rect(this.width / 2 - 10, -this.height / 3, 5, this.height / 1.5);
      fill(0);
      textSize(8);
      textAlign(CENTER, CENTER);
      text("01", -this.width / 4, this.height / 3);
      pop();
    },
    moveRight: function () { this.speedX = min(this.speedX + this.acceleration, this.maxSpeed); },
    moveLeft: function () { this.speedX = max(this.speedX - this.acceleration, -this.maxSpeed); },
    moveUp: function () { this.speedY = max(this.speedY - this.acceleration, -this.maxSpeed); },
    moveDown: function () { this.speedY = min(this.speedY + this.acceleration, this.maxSpeed); },
    shoot: function () {
      missiles.push({ x: this.x + this.width, y: this.y, speed: 8, lastParticleTime: 0 });
    },
    collidesWith: function (objX, objY, objSize) {
      return dist(this.x + this.width / 2, this.y, objX, objY) < this.width / 2 + objSize / 2;
    },
  };
}

function updateAirMissiles() {
  for (let i = missiles.length - 1; i >= 0; i--) {
    let missile = missiles[i];
    missile.x += missile.speed;

    let now = millis();
    if (now - missile.lastParticleTime > 50) {
      particleSystems.push(new ParticleSystem(missile.x - 10, missile.y, [255, 100, 0, 150], 3, 8));
      particleSystems[particleSystems.length - 1].addParticles(3);
      missile.lastParticleTime = now;
    }

    for (let j = airPlanes.length - 1; j >= 0; j--) {
      let plane = airPlanes[j];
      if (dist(missile.x, missile.y, plane.x, plane.y) < 5 + plane.width / 2) {
        score += 10;
        updateHighScore();
        airPlanes.splice(j, 1);
        particleSystems.push(new ParticleSystem(missile.x, missile.y, [255, 165, 0, 200], 3, 8));
        particleSystems[particleSystems.length - 1].addParticles(15);
        missiles.splice(i, 1);
        break;
      }
    }

    for (let j = planeMissiles.length - 1; j >= 0; j--) {
      if (i < 0) break;
      let planeMissile = planeMissiles[j];
      if (dist(missile.x, missile.y, planeMissile.x, planeMissile.y) < 5 + 5) {
        score += 5;
        updateHighScore();
        planeMissiles.splice(j, 1);
        particleSystems.push(new ParticleSystem(missile.x, missile.y, [255, 100, 0, 200], 3, 8));
        particleSystems[particleSystems.length - 1].addParticles(8);
        missiles.splice(i, 1);
        break;
      }
    }

    for (let j = birds.length - 1; j >= 0; j--) {
      if (i < 0) break;
      let bird = birds[j];
      if (dist(missile.x, missile.y, bird.x, bird.y) < 5 + bird.size / 2) {
        score += 20;
        updateHighScore();
        birds.splice(j, 1);
        particleSystems.push(new ParticleSystem(missile.x, missile.y, [139, 69, 19, 200], 3, 8));
        particleSystems[particleSystems.length - 1].addParticles(10);
        missiles.splice(i, 1);
        break;
      }
    }

    if (i >= 0 && missile.x > width) {
      missiles.splice(i, 1);
    }
  }
}

function drawAirMissiles() {
  for (let missile of missiles) {
    push();
    translate(missile.x, missile.y);
    fill(200, 50, 50);
    beginShape();
    vertex(-10, -3);
    vertex(10, -2);
    vertex(10, 2);
    vertex(-10, 3);
    endShape(CLOSE);
    fill(150, 150, 150);
    triangle(-10, -3, -15, -5, -15, -1);
    triangle(-10, 3, -15, 5, -15, 1);
    fill(255, 100, 0, 150);
    ellipse(-10, 0, 8, 4);
    pop();
  }
}

function checkAirPlanes() {
  let currentIndex = Math.floor(map(currentSong.currentTime(), 0, currentSong.duration(), 0, dominantFrequencyData.length - 1));
  if (currentIndex > 0 && dominantFrequencyData[currentIndex] - dominantFrequencyData[currentIndex - 1] > 50) {
    airPlanes.push({ x: width, y: random(0, height), width: 80, speed: 2, missileFired: false });
  }

  for (let plane of airPlanes) {
    plane.x -= plane.speed;
    if (player && plane.x > player.x) {
      plane.y += sin(frameCount * 0.05) * 0.5;
    }

    let energyIndex = Math.floor(map(currentSong.currentTime(), 0, currentSong.duration(), 0, energyData.length - 1));
    if (!plane.missileFired && energyData[energyIndex] > 2500) {
      planeMissiles.push({ x: plane.x - 40, y: plane.y, speed: 3, lastParticleTime: 0 });
      plane.missileFired = true;
    }
  }

  for (let missile of planeMissiles) {
    missile.x -= missile.speed;
    let now = millis();
    if (now - missile.lastParticleTime > 50) {
      particleSystems.push(new ParticleSystem(missile.x + 10, missile.y, [255, 100, 0, 150], 3, 8));
      particleSystems[particleSystems.length - 1].addParticles(3);
      missile.lastParticleTime = now;
    }
  }

  airPlanes = airPlanes.filter(plane => plane.x + plane.width / 2 > 0);
  planeMissiles = planeMissiles.filter(missile => missile.x > 0);
}

function drawAirPlanes() {
  for (let plane of airPlanes) {
    push();
    translate(plane.x, plane.y);
    fill(100);
    beginShape();
    vertex(-40, 0);
    vertex(-20, -20);
    vertex(30, -15);
    vertex(40, 0);
    endShape(CLOSE);
    fill(120);
    beginShape();
    vertex(-20, -20);
    vertex(-10, -30);
    vertex(10, -25);
    vertex(0, -15);
    endShape(CLOSE);
    fill(80);
    beginShape();
    vertex(-30, 0);
    vertex(-40, -15);
    vertex(-30, -10);
    endShape(CLOSE);
    fill(60);
    rect(30, -5, 15, 5);
    fill(200, 100, 100, 150);
    ellipse(45, -2.5, 10, 5);
    fill(150);
    arc(-5, -15, 15, 15, PI, TWO_PI);
    pop();
  }
}

function drawPlaneMissiles() {
  for (let missile of planeMissiles) {
    push();
    translate(missile.x, missile.y);
    fill(255, 140, 0);
    beginShape();
    vertex(10, -3);
    vertex(-10, -2);
    vertex(-10, 2);
    vertex(10, 3);
    endShape(CLOSE);
    fill(200, 200, 200);
    triangle(10, -3, 15, -5, 15, -1);
    triangle(10, 3, 15, 5, 15, 1);
    fill(255, 100, 0, 150);
    ellipse(10, 0, 8, 4);
    pop();
  }
}

function checkBirds() {
  if (random() > 0.99 && progress < 1) {
    let x = width + 20;
    let y = random(height);
    let angle = random(3 * PI / 4, 5 * PI / 4);
    let speed = random(1.5, 3.5);
    birds.push({
      x: x,
      y: y,
      size: random(15, 25),
      speed: speed,
      angle: angle,
      wingAngle: 0,
      wingSpeed: random(0.1, 0.15),
      bobOffset: random(0, TWO_PI),
    });
  }

  for (let bird of birds) {
    bird.x += cos(bird.angle) * bird.speed;
    bird.y += sin(bird.angle) * bird.speed;
    bird.y += sin(frameCount * 0.05 + bird.bobOffset) * 0.3;
    bird.wingAngle += bird.wingSpeed;
  }

  birds = birds.filter(bird => bird.x > -50 && bird.x < width + 50 && bird.y > -50 && bird.y < height + 50);
}

function drawBirds() {
  for (let bird of birds) {
    push();
    translate(bird.x, bird.y + sin(frameCount * 0.1 + bird.bobOffset) * 3);
    fill(139, 69, 19);
    beginShape();
    vertex(bird.size / 2, 0);
    vertex(bird.size / 4, -bird.size / 4);
    vertex(-bird.size / 2, -bird.size / 6);
    vertex(-bird.size / 2, bird.size / 6);
    vertex(bird.size / 4, bird.size / 4);
    endShape(CLOSE);
    fill(120, 60, 16);
    ellipse(-bird.size / 2, -bird.size / 6, bird.size / 3, bird.size / 3);
    fill(255, 165, 0);
    beginShape();
    vertex(-bird.size / 2 - bird.size / 6, -bird.size / 12);
    vertex(-bird.size / 2 - bird.size / 3, 0);
    vertex(-bird.size / 2 - bird.size / 6, bird.size / 12);
    endShape(CLOSE);
    fill(255);
    ellipse(-bird.size / 2 - bird.size / 12, -bird.size / 6, bird.size / 6, bird.size / 6);
    fill(0);
    ellipse(-bird.size / 2 - bird.size / 12, -bird.size / 6, bird.size / 12, bird.size / 12);
    let wingFlap = sin(bird.wingAngle) * 0.6;
    push();
    translate(-bird.size / 8, 0);
    rotate(wingFlap);
    fill(160, 82, 45);
    beginShape();
    vertex(0, 0);
    vertex(bird.size * 0.9, -bird.size / 1.5);
    vertex(0, -bird.size / 2.5);
    endShape(CLOSE);
    fill(180, 100, 60);
    beginShape();
    vertex(0, 0);
    vertex(bird.size * 0.7, -bird.size / 2.5);
    vertex(0, -bird.size / 3);
    endShape(CLOSE);
    pop();
    push();
    translate(-bird.size / 8, 0);
    rotate(-wingFlap);
    fill(160, 82, 45);
    beginShape();
    vertex(0, 0);
    vertex(bird.size * 0.9, bird.size / 1.5);
    vertex(0, bird.size / 2.5);
    endShape(CLOSE);
    fill(180, 100, 60);
    beginShape();
    vertex(0, 0);
    vertex(bird.size * 0.7, bird.size / 2.5);
    vertex(0, bird.size / 3);
    endShape(CLOSE);
    pop();
    fill(139, 69, 19);
    beginShape();
    vertex(bird.size / 2, 0);
    vertex(bird.size * 0.7, -bird.size / 8);
    vertex(bird.size * 0.7, bird.size / 8);
    endShape(CLOSE);
    stroke(120, 60, 16);
    strokeWeight(1);
    line(bird.size / 2, 0, bird.size * 0.7, -bird.size / 8);
    line(bird.size / 2, 0, bird.size * 0.7, bird.size / 8);
    noStroke();
    pop();
  }
}

// Space Level
function setupSpaceLevel() {
  player = createSpacePlayer();
  for (let i = 0; i < 200; i++) {
    spaceParticles.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      alpha: random(100, 200),
      speed: random(0.1, 0.5)
    });
  }
}

function drawSpaceLevel() {
  background(0);
  drawSpaceParticles();
  updateParticleSystems();

  if (isLevelComplete) {
    displayLevelEnd("Level Complete!");
    return;
  }

  if (isGameOver) {
    displayLevelEnd("Game Over");
    return;
  }

  if (player) player.update();
  updateSpaceBullets();
  checkObstacles();
  checkMeteors();

  if (player) player.display();
  drawSpaceBullets();
  drawObstacles();
  drawMeteors();

  if (!isGameOver && !isLevelComplete) {
    checkStars();
    drawStars();
  }

  displayScore();
  displayHighScore();
  displayProgressBar();
  handleContinuousKeys();

  // Draw pause button last to ensure it’s on top
  drawPauseButton();
}

function drawSpaceParticles() {
  for (let particle of spaceParticles) {
    fill(255, 255, 255, particle.alpha);
    noStroke();
    ellipse(particle.x, particle.y, particle.size);
    particle.x -= particle.speed;
    if (particle.x < 0) {
      particle.x = width;
      particle.y = random(height);
    }
  }
}

function createSpacePlayer() {
  return {
    x: 50,
    y: height / 2,
    size: 40,
    angle: 0,
    speed: 0,
    rotationSpeed: 0.1,
    acceleration: 0.2,
    deceleration: 0.05,
    maxSpeed: 5,
    friction: 0.98,
    lastParticleTime: 0,
    update: function () {
      this.speed *= this.friction;
      if (Math.abs(this.speed) < 0.01) this.speed = 0;
      this.x += cos(this.angle) * this.speed;
      this.y += sin(this.angle) * this.speed;
      this.x = constrain(this.x, 0, width);
      this.y = constrain(this.y, 0, height);

      for (let obstacle of obstacles) {
        if (dist(this.x, this.y, obstacle.x, obstacle.y) < this.size / 2 + obstacle.size / 2) {
          isGameOver = true;
          currentSong.stop();
          updateHighScore();
          particleSystems.push(new ParticleSystem(this.x, this.y, [255, 0, 0], 5, 10));
          particleSystems[particleSystems.length - 1].addParticles(50);
        }
      }

      for (let meteor of meteors) {
        if (dist(this.x, this.y, meteor.x, meteor.y) < this.size / 2 + meteor.size / 2) {
          isGameOver = true;
          currentSong.stop();
          updateHighScore();
          particleSystems.push(new ParticleSystem(this.x, this.y, [255, 165, 0], 5, 10));
          particleSystems[particleSystems.length - 1].addParticles(50);
        }
      }

      for (let star of stars) {
        if (dist(this.x, this.y, star.x, star.y) < this.size / 2 + star.size / 2) {
          isGameOver = true;
          currentSong.stop();
          updateHighScore();
          particleSystems.push(new ParticleSystem(star.x, star.y, [255, 255, 0], 5, 10));
          particleSystems[particleSystems.length - 1].addParticles(20);
        }
      }

      progress = map(currentSong.currentTime(), 0, currentSong.duration(), 0, 1);
      if (progress >= 0.99) {
        isLevelComplete = true;
        updateHighScore();
      }
    },
    display: function () {
      push();
      translate(this.x, this.y);
      rotate(this.angle);
      fill(180, 180, 180);
      beginShape();
      vertex(this.size / 2, 0);
      vertex(-this.size / 2, this.size / 3);
      vertex(-this.size / 1.5, 0);
      vertex(-this.size / 2, -this.size / 3);
      endShape(CLOSE);
      fill(150, 150, 150);
      rect(-this.size / 2, -this.size / 6, this.size / 3, this.size / 3, 2);
      rect(0, -this.size / 6, this.size / 3, this.size / 3, 2);
      fill(120, 120, 120);
      beginShape();
      vertex(-this.size / 2, this.size / 3);
      vertex(-this.size / 4, this.size / 1.5);
      vertex(-this.size / 3, this.size / 3);
      endShape(CLOSE);
      beginShape();
      vertex(-this.size / 2, -this.size / 3);
      vertex(-this.size / 4, -this.size / 1.5);
      vertex(-this.size / 3, -this.size / 3);
      endShape(CLOSE);
      fill(0, 191, 255, 150);
      ellipse(this.size / 3, 0, this.size / 5, this.size / 5);
      fill(100, 100, 100);
      ellipse(-this.size / 1.5, this.size / 6, this.size / 10, this.size / 10);
      ellipse(-this.size / 1.5, -this.size / 6, this.size / 10, this.size / 10);
      if (this.speed > 0) {
        let now = millis();
        let emissionInterval = map(this.speed, 0, this.maxSpeed, 500, 50);
        if (now - this.lastParticleTime > emissionInterval) {
          let numParticles = floor(map(this.speed, 0, this.maxSpeed, 1, 5));
          particleSystems.push(new ParticleSystem(
            this.x - cos(this.angle) * this.size / 1.5,
            this.y - sin(this.angle) * this.size / 1.5,
            [255, 165, 0], 5, 10
          ));
          particleSystems[particleSystems.length - 1].addParticles(numParticles);
          this.lastParticleTime = now;
        }
      }
      pop();
    },
    rotateLeft: function () { this.angle -= this.rotationSpeed; },
    rotateRight: function () { this.angle += this.rotationSpeed; },
    accelerate: function () { this.speed = min(this.speed + this.acceleration, this.maxSpeed); },
    decelerate: function () { if (this.speed > 0) this.speed = max(this.speed - this.deceleration, 0); },
    shoot: function () {
      let apexX = this.x + cos(this.angle) * (this.size);
      let apexY = this.y + sin(this.angle) * (this.size);
      spaceBullets.push({ x: apexX, y: apexY, angle: this.angle, speed: 10 });
    },
  };
}

function updateSpaceBullets() {
  for (let i = spaceBullets.length - 1; i >= 0; i--) {
    let bullet = spaceBullets[i];
    bullet.x += cos(bullet.angle) * bullet.speed;
    bullet.y += sin(bullet.angle) * bullet.speed;

    // Check collision with obstacles (planets)
    for (let j = obstacles.length - 1; j >= 0; j--) {
      let obstacle = obstacles[j];
      if (dist(bullet.x, bullet.y, obstacle.x, obstacle.y) < 5 + obstacle.size / 2) {
        score += 10;
        updateHighScore();
        obstacles.splice(j, 1);
        particleSystems.push(new ParticleSystem(bullet.x, bullet.y, [255, 0, 0, 200], 5, 10));
        particleSystems[particleSystems.length - 1].addParticles(20);
        spaceBullets.splice(i, 1);
        break;
      }
    }

    // Check collision with meteors
    for (let j = meteors.length - 1; j >= 0; j--) {
      if (i < 0) break;
      let meteor = meteors[j];
      if (dist(bullet.x, bullet.y, meteor.x, meteor.y) < 5 + meteor.size / 2) {
        meteor.hits--;
        if (meteor.hits <= 0) {
          score += 20;
          updateHighScore();
          meteors.splice(j, 1);
          particleSystems.push(new ParticleSystem(bullet.x, bullet.y, [255, 165, 0, 200], 5, 10));
          particleSystems[particleSystems.length - 1].addParticles(15);
        } else {
          meteor.speed = random(2, 4);
          meteor.angle = random(PI / 4, 3 * PI / 4);
        }
        spaceBullets.splice(i, 1);
        break;
      }
    }

    // Check collision with stars
    for (let j = stars.length - 1; j >= 0; j--) {
      if (i < 0) break;
      let star = stars[j];
      if (dist(bullet.x, bullet.y, star.x, star.y) < 5 + star.size / 2) {
        score += 5;
        updateHighScore();
        stars.splice(j, 1);
        particleSystems.push(new ParticleSystem(bullet.x, bullet.y, [255, 255, 0, 200], 5, 10));
        particleSystems[particleSystems.length - 1].addParticles(10);
        spaceBullets.splice(i, 1);
        break;
      }
    }

    // Remove bullets that go off-screen
    if (i >= 0 && (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height)) {
      spaceBullets.splice(i, 1);
    }
  }
}

function checkObstacles() {
  if (!currentSong || isGameOver || isLevelComplete) return;

  let currentIndex = Math.floor(
    map(currentSong.currentTime(), 0, currentSong.duration(), 0, spaceDominantFrequencyData.length - 1)
  );

  if (
    currentIndex > 0 &&
    spaceDominantFrequencyData[currentIndex] - spaceDominantFrequencyData[currentIndex - 1] > 200
  ) {
    obstacles.push({ x: width, y: random(height), size: random(30, 60) });
    lastObstacleTime = millis();
  }
}

function checkMeteors() {
  if (!currentSong || isGameOver || isLevelComplete) return;

  let currentIndex = Math.floor(
    map(currentSong.currentTime(), 0, currentSong.duration(), 0, spaceEnergyData.length - 1)
  );

  if (spaceEnergyData[currentIndex] > 4000) {
    if (random() < 0.02) {
      let angle = random(PI / 4, 3 * PI / 4);
      meteors.push({
        x: random(width),
        y: 0,
        size: random(40, 60),
        speed: random(2, 4),
        angle: angle,
        hits: 2,
      });
    }
  }

  for (let meteor of meteors) {
    meteor.x += cos(meteor.angle) * meteor.speed;
    meteor.y += sin(meteor.angle) * meteor.speed;
    particleSystems.push(new ParticleSystem(meteor.x, meteor.y, [255, 165, 0], 5, 10));
    particleSystems[particleSystems.length - 1].addParticles(5, random(5, 10));
  }

  meteors = meteors.filter((meteor) => meteor.y < height && meteor.x > 0 && meteor.x < width);
}

function checkStars() {
  if (isGameOver || isLevelComplete || progress >= 1) return;

  if (millis() - lastObstacleTime > 2000) {
    if (random() > 0.98) {
      stars.push({
        x: width,
        y: random(height),
        size: 20,
        spinSpeed: random(-0.05, 0.05),
        angle: 0,
        speed: random(1, 3)
      });
    }
  }
}

function drawSpaceBullets() {
  for (let bullet of spaceBullets) {
    push();
    translate(bullet.x, bullet.y);
    rotate(bullet.angle);
    fill(0, 255, 255);
    rect(-10, -2, 20, 4);
    fill(255, 255, 255, 150);
    ellipse(10, 0, 8, 4);
    pop();
  }
}

function drawObstacles() {
  for (let obstacle of obstacles) {
    drawPlanet(obstacle.x, obstacle.y, obstacle.size);
    obstacle.x -= 2;
  }
  obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.size / 2 > 0);
}

function drawMeteors() {
  for (let meteor of meteors) {
    // Skip invalid meteors
    if (!meteor || typeof meteor.size !== 'number') {
      console.warn("Invalid meteor detected:", meteor);
      continue;
    }
    push();
    translate(meteor.x, meteor.y);
    fill(100, 100, 100);
    beginShape();
    for (let i = 0; i < TWO_PI; i += TWO_PI / 8) {
      let radius = meteor.size / 2 + random(-5, 5);
      vertex(cos(i) * radius, sin(i) * radius);
    }
    endShape(CLOSE);
    fill(70, 70, 70);
    ellipse(-meteor.size / 6, -meteor.size / 6, meteor.size / 4, meteor.size / 4);
    ellipse(meteor.size / 6, meteor.size / 6, meteor.size / 5, meteor.size / 5);
    pop();
  }
}

function drawStar(x, y, size, angle) {
  push();
  translate(x, y);
  rotate(angle); // Use the star's angle for spinning

  // Gradient glow effect
  for (let r = size * 1.5; r > 0; r -= 2) {
    let alpha = map(r, 0, size * 1.5, 0, 100);
    fill(255, 255, 0, alpha);
    ellipse(0, 0, r, r);
  }

  // Star shape
  fill(255, 255, 0);
  beginShape();
  for (let i = 0; i < 5; i++) {
    let outerAngle = TWO_PI * i / 5;
    let innerAngle = outerAngle + TWO_PI / 10;
    vertex(cos(outerAngle) * size / 2, sin(outerAngle) * size / 2);
    vertex(cos(innerAngle) * size / 4, sin(innerAngle) * size / 4);
  }
  endShape(CLOSE);
  pop();
}

function drawStars() {
  for (let star of stars) {
    star.angle += star.spinSpeed; // Update angle for spinning
    star.x -= star.speed; // Move left
    drawStar(star.x, star.y, star.size, star.angle);
  }
  stars = stars.filter((star) => star.x + star.size / 2 > 0);
}

function drawPlanet(x, y, size) {
  push();
  translate(x, y);
  fill(255, 0, 0);
  ellipse(0, 0, size, size);
  fill(200, 0, 0);
  ellipse(-size / 4, -size / 4, size / 4, size / 4);
  ellipse(size / 4, size / 4, size / 4, size / 4);
  pop();
}

function updateParticleSystems() {
  for (let i = particleSystems.length - 1; i >= 0; i--) {
    let ps = particleSystems[i];
    ps.update();
    ps.display();
    if (ps.isDead()) {
      particleSystems.splice(i, 1);
    }
  }
}

class ParticleSystem {
  constructor(x, y, color, minSize, maxSize) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.particles = [];
  }

  addParticles(num, fixedSize = null) {
    for (let i = 0; i < num; i++) {
      let size = fixedSize !== null ? fixedSize : null;
      this.particles.push(new Particle(this.x, this.y, this.color, this.minSize, this.maxSize, size));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.update();
      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  display() {
    for (let p of this.particles) {
      p.display();
    }
  }

  isDead() {
    return this.particles.length === 0;
  }
}
class Particle {
  constructor(x, y, color, minSize, maxSize, fixedSize = null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = fixedSize !== null ? fixedSize : random(minSize, maxSize);
    this.life = 255;
    this.velocity = { x: random(-2, 2), y: random(-2, 2) };
    this.alpha = color[3] || 255;
    this.fadeRate = 5;
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.x *= 0.95; // Keep some friction for smoothness
    this.velocity.y *= 0.95;
    this.alpha -= this.fadeRate;
    this.life -= 5;
  }

  display() {
    noStroke();
    fill(this.color[0], this.color[1], this.color[2], this.alpha);
    ellipse(this.x, this.y, this.size, this.size);
  }

  isDead() {
    return this.life <= 0 || this.alpha <= 0;
  }
}

function displayScore() {
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Score: " + score, 10, 10);
}

function displayHighScore() {
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  let currentHighScore = 0;
  if (gameState === "water") {
    currentHighScore = waterHighScore;
  } else if (gameState === "earth") {
    currentHighScore = earthHighScore;
  } else if (gameState === "air") {
    currentHighScore = airHighScore;
  } else if (gameState === "space") {
    currentHighScore = spaceHighScore;
  }
  text("High Score: " + currentHighScore, 10, 31);
}

function displayProgressBar() {
  let barWidth = 200;
  let barHeight = 10;
  let barX = (width - barWidth) / 2;
  let barY = height - 20;

  noFill();
  stroke(255);
  strokeWeight(2);
  rect(barX, barY, barWidth, barHeight);
  noStroke();
  fill(0, 255, 0);
  rect(barX, barY, barWidth * progress, barHeight);
}

function displayLevelEnd(message) {
  // Semi-transparent black overlay
  fill(0, 200);
  rect(0, 0, width, height);

  // Display the message centered
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  text(message, width / 2, height / 2 - 80);

  // Retry Level button
  drawButton("Retry Level", width / 2 - 120, height / 2 + 20, 200, 40, [100, 100, 100, 220], () => {
    let currentLevel = gameState;
    startLevel(currentLevel);
  });

  // Main Menu button
  drawButton("Main Menu", width / 2 + 120, height / 2 + 20, 200, 40, [100, 100, 100, 220], () => {
    gameState = "menu";
    if (currentSong) currentSong.stop();
  });

  noStroke(); // Reset stroke for other drawings
}

function updateHighScore() {
  if (gameState === "water" && score > waterHighScore) {
    waterHighScore = score;
  } else if (gameState === "earth" && score > earthHighScore) {
    earthHighScore = score;
  } else if (gameState === "air" && score > airHighScore) {
    airHighScore = score;
  } else if (gameState === "space" && score > spaceHighScore) {
    spaceHighScore = score;
  }
}

function handleContinuousKeys() {
  if (!player || isGameOver || isLevelComplete) return;

  if (gameState === "water" || gameState === "air") {
    if (keyIsDown(LEFT_ARROW)) player.moveLeft();
    if (keyIsDown(RIGHT_ARROW)) player.moveRight();
    if (keyIsDown(UP_ARROW)) player.moveUp();
    if (keyIsDown(DOWN_ARROW)) player.moveDown();
  } else if (gameState === "earth") {
    if (keyIsDown(LEFT_ARROW)) player.rotateCannonLeft();
    if (keyIsDown(RIGHT_ARROW)) player.rotateCannonRight();
    if (keyIsDown(UP_ARROW)) player.moveForward();
    if (keyIsDown(DOWN_ARROW)) player.moveBackward();
  } else if (gameState === "space") {
    if (keyIsDown(LEFT_ARROW)) player.rotateLeft();
    if (keyIsDown(RIGHT_ARROW)) player.rotateRight();
    if (keyIsDown(UP_ARROW)) player.accelerate();
    if (keyIsDown(DOWN_ARROW)) player.decelerate();
  }
}

function keyPressed() {
  if (keyCode === 80) { // 'P' key for pause
    if (gameState === "water" || gameState === "earth" || gameState === "air" || gameState === "space") {
      isPaused = true;
      gameState = "paused";
      if (currentSong) currentSong.pause();
    } else if (gameState === "paused") {
      isPaused = false;
      gameState = previousGameState;
      if (currentSong) currentSong.play();
    }
  }

  if (!player || isGameOver || isLevelComplete || isPaused) return;

  if (keyCode === 32) { // Spacebar
    player.shoot();
  }
}

function keyReleased() {
}