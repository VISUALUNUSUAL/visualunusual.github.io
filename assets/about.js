const textSketch = (p) => {
  let particles = [];
  let fontSize;
  let lineHeight;
  let xStart;
  let yStart;

  let attractMode = false;
  let pressStartTime = 0;
  let isPressing = false;
let maxLineWidth;

const message = `I am a Creative Director with a focus on interactive installations,
immersive environments, and digital storytelling for museums,
exhibitions, and public spaces.

With over 15 years in design and 6 years leading interactive media projects,
I specialize in developing concepts that blend technology, space
and narrative into cohesive experiences.
My work spans AR/VR applications,
projection mapping, sensor-based systems, and interactive touch-screen exhibits.

Beyond commercial projects, I explore new ideas through generative art,
working with Processing and WebGL technologies.
As a member of the Processing Foundation, I actively contribute
to expanding the dialogue between creativity and code.

I am open to new opportunities where immersive design, technology,
and storytelling meet to create memorable experiences.`;

  const rad = 24;

  
  // TODO: Redefine font sizes 
function setLayoutParams(p) {
  if (p.windowWidth < 600) {
    fontSize = 13;
    maxLineWidth = p.windowWidth - 40;
    xStart = 20;
    yStart = 100;
  } else if (p.windowWidth < 900) {
    fontSize = 15;
    maxLineWidth = p.windowWidth - 80;
    xStart = 40;
    yStart = 140;
  } else {
    fontSize = 18;
    maxLineWidth = p.windowWidth - p.windowWidth / 1.8;
    xStart = 60;
    yStart = 200;
  }

  lineHeight = fontSize * 1.6;
  p.textSize(fontSize);
}

  p.setup = function () {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent('text-layer');

    p.textFont('Arial');
    p.fill(255);
    p.noStroke();

    setLayoutParams(p);
    initParticles();
  };


  p.mouseReleased = function () {
    isPressing = false;
  };

  p.touchStarted = function () {
    const centerDist = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2);
    if (centerDist < 200) {
      pressStartTime = p.millis();
      isPressing = true;
    }
    return false; // чтобы не вызывал скролл
  };

  p.touchEnded = function () {
    isPressing = false;
  };

  p.draw = function () {
    p.clear();

    // проверяем долгое нажатие
    if (isPressing && p.millis() - pressStartTime > 3000 && !attractMode) {
      attractMode = true;
      // console.log("🎉 Attract mode activated!");
    }

    for (let particle of particles) {
      particle.update();
      particle.display();
    }
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    setLayoutParams(p);
    initParticles();
  };

  p.mousePressed = function () {
    const centerDist = p.dist(p.mouseX, p.mouseY, p.width / 2, p.height / 2);
    if (centerDist < 200) { // можно варьировать радиус
      pressStartTime = p.millis();
      isPressing = true;
    }
  };

  function initParticles() {
    particles = [];

    const lines = formatMessageByPixelWidth(message, maxLineWidth);

    let y = yStart;

    for (let line of lines) {
      for (let i = 0; i < line.length; i++) {
        let char = line[i];
        let charX = xStart + p.textWidth(line.substring(0, i));
        let charY = y;
        particles.push(new LetterParticle(charX, charY, char));
      }
      y += lineHeight;
    }
  }

  function formatMessageByPixelWidth(text, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = "";
    for (let word of words) {
      let testLine = currentLine ? currentLine + " " + word : word;
      if (p.textWidth(testLine) > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  class LetterParticle {
    constructor(x, y, char) {
      this.pos = p.createVector(x, y);
      this.vel = p.createVector();
      this.acc = p.createVector();
      this.char = char;
      this.frozen = false;
    }

    update() {
      let mouse = p.createVector(p.mouseX, p.mouseY);
      let dir;

      if (attractMode) {
        // ТЯНЕМСЯ к мыши
        dir = p5.Vector.sub(mouse, this.pos);
        let d = dir.mag();

        if (d < rad * 10) { // радиус притяжения побольше
          dir.setMag(p.map(d, 0, rad * 10, 5, 0.5));
          this.acc.add(dir);
          this.frozen = false;
        }
      } else {
        // ОТТАЛКИВАЕМСЯ от мыши
        dir = p5.Vector.sub(this.pos, mouse);
        let d = dir.mag();

        if (d < rad) {
          dir.setMag(p.map(d, 0, rad, 8, 0));
          this.acc.add(dir);
          this.frozen = false;
        }
      }

      if (!this.frozen) {
        this.vel.add(this.acc);
        this.vel.limit(10);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.vel.mult(0.94);

        if (this.vel.mag() < 0.05) {
          this.vel.set(0, 0);
          this.frozen = true;
        }
      }
    }

    display() {
      p.text(this.char, this.pos.x, this.pos.y);
    }
  }
};

new p5(textSketch);
