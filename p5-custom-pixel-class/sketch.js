// Assignment 6 Darren Chia
// Advanced version with HSB color mapping and image replacement
// My Changes: allowed changing of different camera modes through key presses, added a glitch mode by using altered offsets

// ColorPixel class - represents a single pixel with color analysis
class ColorPixel {
  constructor(gridX, gridY, pixelSize) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.pixelSize = pixelSize;
    this.hsbValue = 0;
    this.brightness = 0;
    this.x = 0;
    this.y = 0;
  }

  // Update from video capture at this pixel's grid position
  updateFromCapture(capture, appWidth, appHeight) {
    let captureX = floor((this.gridX / cols) * capture.width);
    let captureY = floor((this.gridY / rows) * capture.height);

    this.x = (this.gridX / cols) * appWidth;
    this.y = (this.gridY / rows) * appHeight;

    const offset = (captureY * capture.width + captureX) * 4;
    if (!capture.pixels || offset + 2 >= capture.pixels.length) return;

    const r = capture.pixels[offset + 0];
    const g = capture.pixels[offset + 1];
    const b = capture.pixels[offset + 2];

    this.brightness = (r + g + b) / 3;
    this.hsbValue = map(this.brightness, 0, 255, 0, 360);
  }

  displayAsImage() {
    // Map hue (0-360) to color images
    // Based on the HSB color wheel
    if (this.hsbValue >= 0 && this.hsbValue < 45) {
      image(red, this.x, this.y);
    } else if (this.hsbValue >= 45 && this.hsbValue < 90) {
      image(orange, this.x, this.y);
    } else if (this.hsbValue >= 90 && this.hsbValue < 135) {
      image(yellow, this.x, this.y);
    } else if (this.hsbValue >= 135 && this.hsbValue < 180) {
      image(green, this.x, this.y);
    } else if (this.hsbValue >= 180 && this.hsbValue < 225) {
      image(cyan, this.x, this.y);
    } else if (this.hsbValue >= 225 && this.hsbValue < 270) {
      image(blue, this.x, this.y);
    } else if (this.hsbValue >= 270 && this.hsbValue < 315) {
      image(pink, this.x, this.y);
    } else {
      image(purple, this.x, this.y);
    }
  }

  // Display as greyscale rectangle
  displayAsGreyscale() {
    fill(this.brightness);
    rect(this.x, this.y, this.pixelSize, this.pixelSize);
  }

  // Display as rainbow colored rectangle
  displayAsRainbow() {
    push();
    colorMode(HSB);
    fill(this.hsbValue, 100, 100);
    rect(this.x, this.y, this.pixelSize, this.pixelSize);
    pop();
  }

  // Changing the rgb offsets to give off glitch effect
  displayAsGlitch(capture) {
    let captureX = floor((this.gridX / cols) * capture.width);
    let captureY = floor((this.gridY / rows) * capture.height);
    if (captureX < 0 || captureY < 0 || captureX >= capture.width || captureY >= capture.height) return;

    const base = (captureY * capture.width + captureX) * 4;
    if (!capture.pixels || base + 19 >= capture.pixels.length) return;

    const r = capture.pixels[base + 16]; // 4 px to right
    const g = capture.pixels[base + 6];  // 1 px right + 2 bytes
    const b = capture.pixels[base + 2];  // current 

    fill(r || 0, g || 0, b || 0);
    rect(this.x, this.y, this.pixelSize, this.pixelSize);
  }
}

// -------- Globals --------
let capture;
let pixelGrid = [];
let red, green, blue, yellow, purple, orange, pink, cyan;

let scaleValue = 20;
let videoWidth = 1920, videoHeight = 1080;
let appWidth = 1280, appHeight = 720;

// Changed gridsize to 1 and pixelSize to 14 to make it look more detailed
let cols, rows;
let gridSize = 1;     // grid sampling density for tile modes (2 is fine)
let pixelSize = 14;

let displayMode = 1;  

function preload() {
  red    = loadImage("images/red.png");
  green  = loadImage("images/green.png");
  blue   = loadImage("images/blue.png");
  yellow = loadImage("images/yellow.png");
  purple = loadImage("images/purple.png");
  orange = loadImage("images/orange.png");
  pink   = loadImage("images/pink.png");
  cyan   = loadImage("images/cyan.png");
}

function setup() {
  createCanvas(appWidth, appHeight);

  capture = createCapture(VIDEO);
  capture.size(videoWidth / scaleValue, videoHeight / scaleValue);
  capture.hide();

  pixelDensity(1);     
  rectMode(CENTER);
  noStroke();

  /// Resize all images
  red.resize(pixelSize, pixelSize);
  green.resize(pixelSize, pixelSize);
  blue.resize(pixelSize, pixelSize);
  yellow.resize(pixelSize, pixelSize);
  purple.resize(pixelSize, pixelSize);
  orange.resize(pixelSize, pixelSize);
  pink.resize(pixelSize, pixelSize);
  cyan.resize(pixelSize, pixelSize);

  cols = floor(capture.width / gridSize);
  rows = floor(capture.height / gridSize);

   // Create grid of ColorPixel objects using nested loops
  for (let y = 0; y < rows; y++) {
    pixelGrid[y] = [];
    for (let x = 0; x < cols; x++) {
      pixelGrid[y][x] = new ColorPixel(x, y, pixelSize);
    }
  }
}

// Key controls
// Modes: 1=Normal, 2=Image grid, 3=Greyscale, 4=Rainbow, 5=Glitch 
function keyPressed() {
  if (key === '1') displayMode = 1;
  if (key === '2') displayMode = 2;
  if (key === '3') displayMode = 3;
  if (key === '4') displayMode = 4;
  if (key === '5') displayMode = 5; 
}

function draw() {
  background(255);
  capture.loadPixels();
   if (displayMode === 1) {
    // Normal webcam feed (mirrored), fills canvas
    image(capture, 0, 0, appWidth, appHeight);
    return;
  }

  // For grid modes (2..5), update & draw each cell
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const p = pixelGrid[y][x];
      p.updateFromCapture(capture, appWidth, appHeight);

      if      (displayMode === 2) p.displayAsImage();
      else if (displayMode === 3) p.displayAsGreyscale();
      else if (displayMode === 4) p.displayAsRainbow();
      else if (displayMode === 5) p.displayAsGlitch(capture); 
    }
  }
}