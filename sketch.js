let angleValue = 45;
let velocityValue = 50;
let selectedObject = "car";
let objectImages = {};
let g = 9.8;
let startX, startY;
let trajectoryPoints = [];
let isMoving = false;
let stars = [];
const STAR_COUNT = 200;
let LAYER_LIMITS;
let orbitsBeforeLanding = 6;
let resetButton;

let moonX, moonY;
let moonGravityRadius = 100;
let inMoonGravity = false;
let orbitAngle = 0;
let orbitRadius = 0;
let orbitCounter = 0;
let landingPhase = false;
let landingSpeed = 0.3;
let issIcon; // Holds the image for the ISS icon
let moonImg;
let explosionSound;
let hasExploded = false;
let goButton;

let objectButtons = [];
let presetDropdown;
let fireParticles = [];
let launcherY, launcherTargetY;
let launcherVisible = false;
let redBlink = false;
let greenBlink = false;
let launchButton;
let showLaunchButton = false;
let launcherState = "hidden";  // "hidden", "rising", "ready"
let vehicleOnLauncher = false;
// ✅ Presets: only 1 per vehicle
let presetsByVehicle = {
  car: [
    { label: "0° and 60 km/h", angle: 0, speed: 16.67 },
    { label: "0° and 100 km/h", angle: 0, speed: 27.78 },
    { label: "0° and 150 km/h", angle: 0, speed: 41.67 },
    { label: "10° and 200 km/h", angle: 20, speed: 55.56 }
  ],
  plane: [
    { label: "0° and 1000 km/h", angle: 0, speed: 700 },
    { label: "10° and 250 km/h", angle: 10, speed: 100 },
  { label: "15° and 400 km/h", angle: 20, speed: 300 },
  { label: "20° and 500 km/h", angle: 25, speed: 300 },
  
  
],
  rocket: [
    { label: "80° and 3000 km/h", angle: 80, speed: 333.33 },
    { label: "85° and 8000 km/h", angle: 85, speed: 555.42 },
    { label: "90° and 10000 km/h", angle: 90, speed: 777.78 },
    { label: "75° and 12000 km/h", angle: 75, speed: 1120 }
  ],
  iss: [
  { label: "90° and 28440 km/h", angle: 90, speed: 790 },
  { label: "75° and 30600 km/h", angle: 75, speed: 850 },
  { label: "60° and 34200 km/h", angle: 60, speed: 950 },
  { label: "45° and 36000 km/h", angle: 45, speed: 1000 }
]

};


function preload() {
  moonImg = loadImage("moon1-removebg-preview (1)-1.png");
  objectImages["iss"] = loadImage("ISS-removebg-preview.png");
  objectImages["car"] = loadImage("car-removebg-preview.png");
  objectImages["plane"] = loadImage("aeroplane-removebg-preview.png");
  objectImages["rocket"] = loadImage("rocket-removebg-preview.png");
  explosionSound = loadSound("explosion-42132.mp3");
  issIcon = loadImage("iss_icon_64x64 (1).ico");
}

function setup() {
  createCanvas(windowWidth, windowHeight );
  startX = 50;
  startY = height - 100;

 LAYER_LIMITS = {
  ground: height,
  troposphere: height * (1 - 0.05),
  stratosphere: height * (1 - 0.35),
  mesosphere: height * (1 - 0.55),
  thermosphere: height * (1 - 0.70),
  exosphere: height * (1 - 0.85)
};
LAYER_LIMITS.space = height * (1 - 0.40);  // Match the new Space layer starting Y


  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({ x: random(width), y: random(0, startY - 200) });
  }

  launcherY = height + 100; // start hidden
  launcherTargetY = height - 80;

  createButtons();
  initializeBall();
}
function disableCanvasZooming() {
  document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
  });

  document.addEventListener('gesturechange', function(e) {
    e.preventDefault();
  });

  document.addEventListener('gestureend', function(e) {
    e.preventDefault();
  });
}

disableCanvasZooming();
function disablePageZooming() {
  // Block Ctrl + Plus/Minus
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_' || e.keyCode === 187 || e.keyCode === 189)) {
      e.preventDefault();
    }
  });

  // Block Ctrl + Mouse Wheel
  document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });
}

disablePageZooming();

function createButtons() {
  for (let btn of objectButtons) btn.remove();
  objectButtons = [];

  if (presetDropdown) presetDropdown.remove();

  let objectX = windowWidth - 160;
  let objectStartY = height * 0.3;
  let spacing = 60;

  const iconMap = {
    "🚗": "car",
    "✈️": "plane",
    "🚀": "rocket",
    "🛰️": "iss"
  };

  for (let [icon, obj] of Object.entries(iconMap)) {
  let btn = createButton('');
  btn.position(objectX, objectStartY);
  btn.size(140, 50);
  btn.style('background-color', '#ffffff');
  btn.style('color', '#000000');
  btn.style('font-size', '18px');
  btn.style('display', 'flex');
  btn.style('align-items', 'center');
  btn.style('justify-content', 'left');
  btn.style('gap', '10px');
  btn.style('padding-left', '10px');
  btn.style('font-weight', 'bold');
  btn.html(`<span style="font-size:30px;">${icon}</span><span style="font-size:14px;">${obj.toUpperCase()}</span>`);
  btn.attribute('data-object', obj);

  btn.mousePressed(() => {
    userStartAudio();
    selectedObject = obj;

    isMoving = false;
    inMoonGravity = false;
    orbitCounter = 0;
    landingPhase = false;
    fireParticles = [];
    trajectoryPoints = [];
    hasExploded = false;
    redBlink = true;
    greenBlink = false;
    vehicleOnLauncher = false;

    if (selectedObject === "rocket" || selectedObject === "iss") {
      launcherY = height + 100;
      launcherVisible = true;
      launcherState = "rising";
      showLaunchButton = false;
      launchButton.hide();
      goButton.hide();
    } else {
      launcherVisible = false;
      launcherState = "hidden";
      vehicleOnLauncher = false;
      launchButton.hide();
      initializeBall();
      ball.x = startX;
      ball.y = startY;
      goButton.hide();
    }

    createDropdown();
  });

  objectButtons.push(btn);
  objectStartY += spacing;
}



  createDropdown();

  if (!resetButton) {
  resetButton = createButton("🔁");
  resetButton.size(60, 40);
  resetButton.style('font-size', '18px');
  resetButton.style('background-color', '#ffcccc');
  resetButton.style('font-weight', 'bold');
  resetButton.mousePressed(resetSimulation);
}
resetButton.position(objectX, objectStartY + 50);


  launchButton = createButton("Launch");
  launchButton.position(objectX, objectStartY + 100);
  launchButton.size(100, 40);
  launchButton.style('font-size', '18px');
  launchButton.style('background-color', '#ccffcc');
  launchButton.hide();
  launchButton.mousePressed(() => {
    if (!isMoving && greenBlink && vehicleOnLauncher) {
      let angle = radians(angleValue);
      ball.vx = velocityValue * cos(angle);
      ball.vy = -velocityValue * sin(angle);
      isMoving = true;
      vehicleOnLauncher = false;
      showLaunchButton = false;
      launchButton.hide();
    }
  });

  goButton = createButton("Go");
  goButton.position(objectX, objectStartY + 100);
  goButton.size(100, 40);
  goButton.style('font-size', '18px');
  goButton.style('background-color', '#ccf');
  goButton.hide();
  goButton.mousePressed(() => {
    if (!isMoving && (selectedObject === "car" || selectedObject === "plane")) {
      let angle = radians(angleValue);
      ball.vx = velocityValue * cos(angle);
      ball.vy = -velocityValue * sin(angle);
      isMoving = true;
      goButton.hide();
    }
  });
}

function createDropdown() {
  if (presetDropdown) presetDropdown.remove();

  presetDropdown = createSelect();
  presetDropdown.position(windowWidth - 180, height * 0.3 + 4 * 60 + 10);
  presetDropdown.size(160, 35);
  presetDropdown.style('font-size', '16px');
  presetDropdown.option("Angle and Speed");

  let currentPresets = presetsByVehicle[selectedObject];
  currentPresets.forEach((p, index) => {
    presetDropdown.option(p.label, index);
  });

  presetDropdown.changed(() => {
    userStartAudio();
    let selectedIndex = presetDropdown.value();
    let preset = presetsByVehicle[selectedObject][selectedIndex];

    if (preset) {
      angleValue = preset.angle;
      velocityValue = preset.speed;

      isMoving = false;
      inMoonGravity = false;
      orbitCounter = 0;
      landingPhase = false;
      fireParticles = [];
      trajectoryPoints = [];
      hasExploded = false;

      initializeBall();

      if (selectedObject === "rocket" || selectedObject === "iss") {
        ball.x = startX;
        ball.y = launcherY;
        redBlink = false;
        greenBlink = true;
        vehicleOnLauncher = true;
        showLaunchButton = true;
        launchButton.show();
        goButton.hide();
      } else {
        ball.x = startX;
        ball.y = startY;
        ball.vx = 0;
        ball.vy = 0;
        goButton.show();
        launchButton.hide();
      }
    }
  });
}

function handleLauncherSequence() {
  if (launcherState === "rising") {
    launcherY -= 2;
    if (launcherY <= launcherTargetY) {
      launcherY = launcherTargetY;
      launcherState = "ready";

      // Place vehicle ON launcher (no motion yet)
      initializeBall();
      ball.x = startX;
      ball.y = launcherY-20;
      ball.vx = 0;
      ball.vy = 0;
      vehicleOnLauncher = true;
    }
  }
}


function drawLauncher() {
  if (!launcherVisible) return;

  let towerHeight = 40;
  let padOffset = 30;

  // Launcher tower
  fill(100);
  rect(startX - 15, launcherY, 30, towerHeight);

  // Base pad
  fill(80);
  rect(startX - 25, launcherY + padOffset, 50, 8);

  // 🚨 Blinking light at center of launcher (below the vehicle)
  if (frameCount % 30 < 15) {
    fill(redBlink ? "red" : greenBlink ? "lime" : "gray");
    ellipse(startX, launcherY + padOffset + 4, 10);
  }
}



function highlightSelectedIcon() {
  for (let btn of objectButtons) {
    btn.style('background-color', '');
    btn.style('font-weight', '');
  }
}



function createIconButtonWithPosition(icon, x, y, onClick) {
  const iconToObjectMap = {
    "🚗": "car",
    "✈️": "plane",
    "🚀": "rocket",
    "🛰️": "iss"
  };

  let btn = createButton(icon);
  btn.position(x, y);
  btn.size(100, 45);
  btn.style('font-size', '30px');
  btn.style('text-align', 'center');
  btn.style('line-height', '40px');

  btn.mousePressed(() => {
    selectedObject = iconToObjectMap[icon];

    // Reset all simulation states
    isMoving = false;
    inMoonGravity = false;
    orbitCounter = 0;
    landingPhase = false;
    fireParticles = [];
    trajectoryPoints = [];
    hasExploded = false;

    // Reinitialize ball at start
    initializeBall();

    // Start motion with current angle and velocity
    let angle = radians(angleValue);
    let velocity = velocityValue;
    ball.vx = velocity * cos(angle);
    ball.vy = -velocity * sin(angle);
    isMoving = true;
  });

  return btn;
}



function createButtonWithPosition(label, x, y, onClick) {
  let btn = createButton(label);
  btn.position(x, y);
  btn.size(120, 35);
  btn.style('font-size', '16px');
  btn.mousePressed(onClick);
  return btn;
}

let ball;
function initializeBall() {
  if (isMoving) return;
  ball = { x: startX, y: startY, vx: 0, vy: 0, ax: 0, ay: g };
  fireParticles = [];
  trajectoryPoints = [];
  isMoving = false;
  inMoonGravity = false;
  landingPhase = false;
}

function draw() {
  background(0);
  drawAtmosphericLayers();
  noStroke();
  fill(139, 69, 19);
  rect(0, height - 100, width, 100);
  drawStars();
  drawMoon();

  let angle = radians(angleValue);
  let velocity = velocityValue;

  // 🔥 Removed auto-launch block
  // if (!isMoving && trajectoryPoints.length === 0) {
  //   ball.vx = velocity * cos(angle);
  //   ball.vy = -velocity * sin(angle);
  //   isMoving = true;
  // }

  if (isMoving) {
    trajectoryPoints.push({ x: ball.x, y: ball.y });

    if (selectedObject === "rocket" || selectedObject === "iss") {
      handleRocketAndISSPhysics();
    } else {
      handleCarPlanePhysics();
    }
  }

  drawObject();
  drawTrajectory();
  drawFire();
  handleLauncherSequence();
  drawLauncher();


}

function handleRocketAndISSPhysics() {
   let thermosphereY = LAYER_LIMITS.thermosphere;

  if (selectedObject === "iss") {
    if (ball.y > thermosphereY) {
      // Going up
      ball.vy += ball.ay * 0.1;
      ball.y += ball.vy * 0.1;
      ball.x += ball.vx * 0.1;

      // Clamp to thermosphere height
      if (ball.y <= thermosphereY) {
        ball.y = thermosphereY;
        ball.vy = 0;
        ball.ay = 0;

        // Now decide what to do based on velocity
        if (velocityValue >= 790) {
          ball.vx = velocityValue * cos(radians(90)) * 0.1;
          ball.vy = 0;
          isMoving = true;
        } else {
          // Too slow → begin falling
          ball.vx = 0;
          ball.vy = 0;
          ball.ay = g * 0.3;
        }
      }
    }

    else {
      // Post-thermosphere phase
      if (velocityValue >= 790) {
        // Orbit (horizontal)
        ball.x += 2; // keep moving right
        ball.y = thermosphereY;
        if (ball.x >= width) isMoving = false;
      } else {
        // Fall back due to gravity
        ball.vy += ball.ay * 0.1;
        ball.y += ball.vy * 0.1;

        if (ball.y >= startY) {
          ball.y = startY;
          createExplosion(ball.x, ball.y);
          hasExploded = true;
          isMoving = false;
          explosionSound.play();
        }
      }
    }

    return;
  }
  // Rocket physics (unchanged)
  else if (selectedObject === "rocket") {
  let distToMoon = dist(ball.x, ball.y, moonX, moonY);

  // Moon gravity capture
  if (distToMoon < moonGravityRadius && !inMoonGravity && velocityValue >= 850) {
    inMoonGravity = true;
    orbitRadius = distToMoon;
    orbitAngle = atan2(ball.y - moonY, ball.x - moonX);
    orbitCounter = 0;
    landingPhase = false;
  }

  // Moon orbit
  if (inMoonGravity && !landingPhase) {
    orbitAngle += 0.03;
    orbitCounter += 0.03;
    if (orbitCounter > 3 * TWO_PI) orbitRadius -= 0.15;

    ball.x = moonX + orbitRadius * cos(orbitAngle);
    ball.y = moonY + orbitRadius * sin(orbitAngle);

    if (orbitRadius <= 60) landingPhase = true;
    return;
  }

  // Moon landing
  else if (landingPhase) {
    if (orbitRadius > 40) {
      orbitRadius -= landingSpeed;
      ball.x = moonX + orbitRadius * cos(orbitAngle);
      ball.y = moonY + orbitRadius * sin(orbitAngle);
    } else {
      inMoonGravity = false;
      isMoving = false;
      ball.vx = 0;
      ball.vy = 0;
      ball.x = moonX + 40 * cos(orbitAngle);
      ball.y = moonY + 40 * sin(orbitAngle);
    }
    return;
  }

  // If rocket is above thermosphere and not reaching Moon
  if (ball.y < LAYER_LIMITS.thermosphere && velocityValue < 850) {
    // Simulate drift
    ball.vx *= 0.995; // lose a bit of speed
    ball.vy += g * 0.02;
    ball.y += ball.vy * 0.1;
    ball.x += ball.vx * 0.1;

    // If falls back to Earth
    if (ball.y >= startY && !hasExploded) {
      ball.y = startY;
      createExplosion(ball.x, ball.y);
      hasExploded = true;
      isMoving = false;
      explosionSound.play();
    }

    return;
  }

  // Normal rocket ascent
  ball.x += ball.vx * 0.1;
  ball.vy += ball.ay * 0.1;
  ball.y += ball.vy * 0.1;

  // Stop applying upward acceleration after exosphere
  if (ball.y < LAYER_LIMITS.exosphere) {
    ball.vy = 0;
    ball.ay = 0;
  }

  // Crash fallback
  if (ball.y >= startY && !hasExploded) {
    ball.y = startY;
    createExplosion(ball.x, ball.y);
    hasExploded = true;
    isMoving = false;
    explosionSound.play();
  }
  }
}


function handleCarPlanePhysics() {
  if (selectedObject === "car") {
    // If car is at 0° angle: straight horizontal motion only
    if (angleValue === 0) {
      ball.vx = velocityValue;
      ball.vy = 0;
      ball.ay = 0;
      ball.y = startY;  // stay on ground
      ball.x += ball.vx;

      if (ball.x >= width) {
        ball.x = width;
        isMoving = false;
      }
      return;
    }

    // Apply gravity for parabolic motion
    ball.vy += ball.ay * 0.1;
    let nextY = ball.y + ball.vy * 0.1;

    // Max height per speed
    let maxHeight;
    if (velocityValue === 22.2) {
      maxHeight = LAYER_LIMITS.troposphere;
    } else if (velocityValue === 194.4) {
      maxHeight = LAYER_LIMITS.stratosphere;
    } else if (velocityValue === 250) {
      maxHeight = LAYER_LIMITS.mesosphere;
    } else if (velocityValue === 300) {
      maxHeight = LAYER_LIMITS.thermosphere;
    }

    // Clamp at layer limit and reflect if going higher
    if (ball.vy < 0 && nextY < maxHeight) {
      ball.y = maxHeight;
      ball.vy *= -1;
    } else {
      ball.y = nextY;
    }

    // Horizontal motion
    ball.x += ball.vx * 0.1;

    // Landing
    if (ball.y >= startY) {
      ball.y = startY;
      isMoving = false;
      hasExploded = true;
      startFire(ball.x, ball.y);
      if (explosionSound && !explosionSound.isPlaying()) explosionSound.play();
    }
  }

  // Plane logic (unchanged)
  else if (selectedObject === "plane") {
    if (angleValue === 0) {
      ball.vx = 10;
      ball.vy = 0;
      ball.ay = 0;
      ball.x += ball.vx;
      if (ball.x >= width) {
        ball.x = width;
        isMoving = false;
      }
    } else {
      ball.x += ball.vx * 0.1;
      ball.vy += ball.ay * 0.1;
      ball.y += ball.vy * 0.1;

      if (ball.y < height * 0.55) {
        ball.vy = 0;
        ball.ay = 0;
        ball.vx = 10;
      }

      if (ball.y > startY) {
        ball.y = startY;
        isMoving = false;
        hasExploded = true;
        startFire(ball.x, ball.y);
        if (explosionSound && !explosionSound.isPlaying()) explosionSound.play();
      }
    }
  }
}



function drawObject() {
  if (hasExploded) return;

  // Only skip drawing if rocket/iss not launched
  if (!vehicleOnLauncher && !isMoving && (selectedObject === "rocket" || selectedObject === "iss")) return;

  imageMode(CENTER);
  let img = objectImages[selectedObject];
  let imgWidth = 80, imgHeight = 80;

  if (selectedObject === "rocket") {
    imgWidth = 60;
    imgHeight = 60;
  } else if (selectedObject === "iss") {
    imgWidth = 100;
    imgHeight = 50;
  }

  image(img, ball.x, ball.y, imgWidth, imgHeight);
}


function drawFire() {
  noStroke();
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    let p = fireParticles[i];
    if (p.type === "ion") {
      fill(150, 220, 255, p.alpha); // ISS: soft blue
    } else {
      fill(255, 180, 50, p.alpha); // Rocket: mild orange
    }
    ellipse(p.x, p.y, p.r);
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 2;
    if (p.alpha <= 0) fireParticles.splice(i, 1);
  }

  // 🚀 Rocket: small concentrated flame, ONLY if not in Moon orbit/landing
  if (isMoving && selectedObject === "rocket" && !inMoonGravity && !landingPhase) {
    for (let i = 0; i < 2; i++) {
      fireParticles.push({
        x: ball.x + random(-1, 1),
        y: ball.y + 20,
        vx: random(-0.2, 0.2),
        vy: random(0.5, 1.0),
        alpha: 150,
        r: random(3, 5),
        type: "rocket"
      });
    }
  }

  // 🛰️ ISS: faint ion specks, same rule
  if (isMoving && selectedObject === "iss" && !inMoonGravity && !landingPhase) {
    if (frameCount % 4 === 0) {
      fireParticles.push({
        x: ball.x,
        y: ball.y + 15,
        vx: 0,
        vy: 0.3,
        alpha: 80,
        r: random(1.5, 2.5),
        type: "ion"
      });
    }
  }
}


function startFire(x, y) {
  if (y < LAYER_LIMITS.mesosphere) return; // No crash fire in high altitude
  for (let i = 0; i < 100; i++) {
    fireParticles.push({
      x: x,
      y: y,
      vx: random(-1, 1),
      vy: random(-3, -1),
      alpha: 255,
      r: random(20, 40)
    });
  }
}


function drawTrajectory() {
  noFill();
  stroke(150);
  beginShape();
  for (let point of trajectoryPoints) vertex(point.x, point.y);
  endShape();
}

function resetSimulation() {
  isMoving = false;
  inMoonGravity = false;
  orbitCounter = 0;
  landingPhase = false;
  fireParticles = [];
  trajectoryPoints = [];
  hasExploded = false;
  vehicleOnLauncher = false;
  launcherVisible = false;
  redBlink = false;
  greenBlink = false;
  launcherState = "hidden";
  showLaunchButton = false;
  launchButton.hide();

  let defaultPreset = presetsByVehicle[selectedObject][0];
  angleValue = defaultPreset.angle;
  velocityValue = defaultPreset.speed;

  initializeBall();
}



function drawStars() {
  fill(255);
  noStroke();
  for (let star of stars) ellipse(star.x, star.y, 2, 2);
}

function drawAtmosphericLayers() {
  let layerColors = [
    { name: "Ground", colorBottom: color(139, 69, 19), colorTop: color(139, 69, 19), heightRatio: 0.05 },
    { name: "Troposphere", colorBottom: color(180, 220, 255), colorTop: color(100, 180, 255), heightRatio: 0.30 },
    { name: "Stratosphere", colorBottom: color(100, 180, 255), colorTop: color(80, 130, 200), heightRatio: 0.20 },
    { name: "Mesosphere", colorBottom: color(80, 130, 200), colorTop: color(120, 100, 200), heightRatio: 0.15 },
    { name: "Thermosphere", colorBottom: color(120, 100, 200), colorTop: color(20, 40, 80), heightRatio: 0.15 },
    { name: "Exosphere", colorBottom: color(20, 40, 80), colorTop: color(0, 0, 0), heightRatio: 0.10 },
    { name: "Space", colorBottom: color(0, 0, 0), colorTop: color(0), heightRatio: 0.05 }
  ];

  let yStart = height;
  for (let layer of layerColors) {
    let layerHeight = height * layer.heightRatio;
    let gradient = drawingContext.createLinearGradient(0, yStart - layerHeight, 0, yStart);
    gradient.addColorStop(0, layer.colorTop.toString());
    gradient.addColorStop(1, layer.colorBottom.toString());
    drawingContext.fillStyle = gradient;
    noStroke();
    rect(0, yStart - layerHeight, width, layerHeight);
    fill(255);
    textSize(16);
    text(layer.name, 20, yStart - layerHeight + 20);
    yStart -= layerHeight;
  }
}

function drawMoon() {
  moonX = width / 1.3;
  moonY = height * 0.07;
  let moonSize = 150;
  imageMode(CENTER);
  image(moonImg, moonX, moonY, moonSize, moonSize);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  startY = height - 100;
  createButtons();
}
function createExplosion(x, y) {
  for (let i = 0; i < 100; i++) {
    fireParticles.push({
      x: x,
      y: y,
      vx: random(-2, 2),
      vy: random(-3, -1),
      alpha: 255,
      r: random(20, 40),
      type: "explosion"
    });
  }
}
// Prevent zoom with Ctrl + Plus/Minus or Mouse Wheel
window.addEventListener('keydown', function (e) {
  if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_' || e.keyCode === 187 || e.keyCode === 189)) {
    e.preventDefault();
  }
});

// Prevent zoom with Ctrl + Mouse Scroll
window.addEventListener('wheel', function (e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// Optional: Prevent zoom on pinch gesture for mobile
document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});
document.addEventListener('gesturechange', function (e) {
  e.preventDefault();_
});
document.addEventListener('gestureend', function (e) {
  e.preventDefault();
});

// Optional: Prevent double-tap zoom on mobile
document.addEventListener('touchstart', function preventZoom(e) {
  if (e.touches.length > 1) e.preventDefault();
}, { passive: false });
// Full Zoom Lock: Keyboard + Mouse + Touch
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && (
      e.key === '+' || e.key === '-' || e.key === '=' ||
      e.key === '_' || e.key === '0' || e.keyCode === 187 || e.keyCode === 189
    )) {
    e.preventDefault();
  }
});

document.addEventListener('wheel', function (e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// Mobile: Prevent pinch zoom
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());

// Prevent zoom with multiple touches
document.addEventListener('touchstart', function (e) {
  if (e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

