/* =========================================================
   GLOBAL PARTICLE BACKGROUND
========================================================= */

const canvas = document.getElementById("globalCanvas");

const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;

let stars = [];
let particles = [];

let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;

const SPHERE_RADIUS = 245;
const FORMATION_TIME = 4800;
const SEGMENT_TIME = 3900;

function resizeCanvas() {
  width = window.innerWidth;

  height = window.innerHeight;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = width * dpr;

  canvas.height = height * dpr;

  canvas.style.width = width + "px";

  canvas.style.height = height + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

/* =========================================================
   STARS
========================================================= */

function createStars() {
  stars = [];

  for (let i = 0; i < 190; i++) {
    stars.push({
      x: Math.random(),

      y: Math.random(),

      size: Math.random() * 1.2 + 0.25,

      alpha: Math.random() * 0.38 + 0.08,

      phase: Math.random() * Math.PI * 2,

      speed: Math.random() * 0.0007 + 0.00025,
    });
  }
}

createStars();

function drawStars(time) {
  stars.forEach((star) => {
    const twinkle = 0.6 + Math.sin(time * star.speed + star.phase) * 0.4;

    ctx.beginPath();

    ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(
                    112,
                    169,
                    208,
                    ${star.alpha * twinkle}
                )`;

    ctx.fill();
  });
}

/* =========================================================
   PARTICLES
========================================================= */

function createParticles() {
  particles = [];

  const count = 1450;

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;

    const ring = Math.sqrt(1 - y * y);

    const theta = goldenAngle * i;

    const targetX = Math.cos(theta) * ring * SPHERE_RADIUS;

    const targetY = y * SPHERE_RADIUS;

    const targetZ = Math.sin(theta) * ring * SPHERE_RADIUS;

    const mode = Math.floor(Math.random() * 9);

    let scatterX = Math.random();

    let scatterY = Math.random();

    if (mode === 0) {
      scatterX = -0.15;
    } else if (mode === 1) {
      scatterX = 1.15;
    } else if (mode === 2) {
      scatterY = -0.15;
    } else if (mode === 3) {
      scatterY = 1.15;
    } else if (mode === 4) {
      scatterX = -0.12;
      scatterY = -0.12;
    } else if (mode === 5) {
      scatterX = 1.12;
      scatterY = -0.12;
    } else if (mode === 6) {
      scatterX = -0.12;
      scatterY = 1.12;
    } else if (mode === 7) {
      scatterX = 1.12;
      scatterY = 1.12;
    }

    particles.push({
      x: targetX,

      y: targetY,

      z: targetZ,

      scatterX: scatterX,

      scatterY: scatterY,

      size: Math.random() * 1.65 + 0.4,

      brightness: Math.random(),

      pulse: Math.random() * Math.PI * 2,
    });
  }
}

createParticles();

/* =========================================================
   HELPERS
========================================================= */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function formationEase(t) {
  t = clamp(t, 0, 1);

  return 1 - Math.pow(1 - t, 3);
}

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;

  const t3 = t2 * t;

  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/* =========================================================
   SPHERE PATH
========================================================= */

const movementPath = [
  { x: 0.5, y: 0.5 },

  { x: 0.78, y: 0.13 },

  { x: 1.03, y: 0.72 },

  { x: 0.79, y: 0.18 },

  { x: 0.61, y: 0.82 },

  { x: 0.43, y: 0.15 },

  { x: 0.25, y: 0.82 },

  { x: -0.04, y: 0.2 },

  { x: 0.18, y: 0.68 },

  { x: 0.35, y: 0.3 },

  { x: 0.53, y: 0.73 },

  { x: 0.71, y: 0.28 },

  { x: 0.88, y: 0.7 },

  { x: 1.04, y: 0.3 },

  { x: 0.56, y: -0.05 },

  { x: 0.16, y: 0.14 },

  { x: 0.84, y: 0.3 },

  { x: 0.18, y: 0.46 },

  { x: 0.82, y: 0.62 },

  { x: 0.19, y: 0.8 },

  { x: 0.78, y: 1.04 },

  { x: 0.31, y: 0.84 },

  { x: 0.7, y: 0.68 },

  { x: 0.3, y: 0.52 },

  { x: 0.7, y: 0.36 },

  { x: 0.3, y: 0.19 },

  { x: 0.62, y: -0.04 },

  { x: 0.38, y: 0.28 },

  { x: 0.32, y: 0.22 },
];

function getSpherePosition(motionTime) {
  const count = movementPath.length;

  const raw = (motionTime / SEGMENT_TIME) % count;

  const index = Math.floor(raw);

  const t = raw - index;

  const i0 = (index - 1 + count) % count;

  const i1 = index % count;

  const i2 = (index + 1) % count;

  const i3 = (index + 2) % count;

  const p0 = movementPath[i0];

  const p1 = movementPath[i1];

  const p2 = movementPath[i2];

  const p3 = movementPath[i3];

  return {
    x: catmullRom(p0.x, p1.x, p2.x, p3.x, t) * width,

    y: catmullRom(p0.y, p1.y, p2.y, p3.y, t) * height,
  };
}

/* =========================================================
   PARTICLE PROJECTION
========================================================= */

function projectParticle(particle, centerX, centerY, time) {
  const cosX = Math.cos(rotationX);

  const sinX = Math.sin(rotationX);

  const cosY = Math.cos(rotationY);

  const sinY = Math.sin(rotationY);

  const cosZ = Math.cos(rotationZ);

  const sinZ = Math.sin(rotationZ);

  let x = particle.x * cosY - particle.z * sinY;

  let z = particle.x * sinY + particle.z * cosY;

  let y = particle.y * cosX - z * sinX;

  z = particle.y * sinX + z * cosX;

  const rx = x * cosZ - y * sinZ;

  const ry = x * sinZ + y * cosZ;

  x = rx;
  y = ry;

  const depth = 860;

  const perspective = depth / (depth + z);

  const normalizedDepth = (z + SPHERE_RADIUS) / (SPHERE_RADIUS * 2);

  return {
    x: centerX + x * perspective,

    y: centerY + y * perspective,

    z: z,

    size: particle.size * perspective,

    alpha: clamp(0.3 + normalizedDepth * 0.64, 0.27, 0.9),

    brightness: particle.brightness,
  };
}

/* =========================================================
   SPHERE GLOW
========================================================= */

function drawSphereGlow(centerX, centerY) {
  const glow = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    455,
  );

  glow.addColorStop(0, "rgba(0,91,170,.19)");

  glow.addColorStop(0.3, "rgba(0,71,155,.09)");

  glow.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = glow;

  ctx.fillRect(0, 0, width, height);
}

/* =========================================================
   DRAW PARTICLE
========================================================= */

function drawParticle(point, strength = 1) {
  const alpha = point.alpha * strength;

  ctx.beginPath();

  ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);

  if (point.brightness > 0.88) {
    ctx.fillStyle = `rgba(
                121,
                205,
                232,
                ${alpha}
            )`;
  } else if (point.brightness > 0.58) {
    ctx.fillStyle = `rgba(
                28,
                151,
                211,
                ${alpha}
            )`;
  } else {
    ctx.fillStyle = `rgba(
                0,
                82,
                170,
                ${alpha}
            )`;
  }

  ctx.fill();
}

/* =========================================================
   BACKGROUND LOOP
========================================================= */

function animateBackground(time) {
  ctx.clearRect(0, 0, width, height);

  drawStars(time);

  rotationY += 0.00125;
  rotationX += 0.00044;
  rotationZ += 0.00024;

  if (time < FORMATION_TIME) {
    const centerX = width * 0.5;

    const centerY = height * 0.5;

    const progress = formationEase(time / FORMATION_TIME);

    drawSphereGlow(centerX, centerY);

    particles

      .map((particle) => {
        const target = projectParticle(particle, centerX, centerY, time);

        return {
          ...target,

          x: lerp(particle.scatterX * width, target.x, progress),

          y: lerp(particle.scatterY * height, target.y, progress),
        };
      })

      .sort((a, b) => a.z - b.z)

      .forEach((point) => {
        drawParticle(point, 0.45 + progress * 0.55);
      });
  } else {
    const position = getSpherePosition(time - FORMATION_TIME);

    drawSphereGlow(position.x, position.y);

    particles

      .map((particle) =>
        projectParticle(particle, position.x, position.y, time),
      )

      .sort((a, b) => a.z - b.z)

      .forEach(drawParticle);
  }

  requestAnimationFrame(animateBackground);
}

requestAnimationFrame(animateBackground);

/* =========================================================
   HERO INTRO
========================================================= */

function startHeroIntro() {
  const name = document.getElementById("animated-name");

  if (!name) {
    return;
  }

  const fullName = name.dataset.name;

  name.innerHTML = "";

  [...fullName].forEach((character) => {
    const element = document.createElement("span");

    if (character === " ") {
      element.className = "name-space";

      element.innerHTML = "&nbsp;";
    } else {
      element.className = "name-letter";

      element.textContent = character;
    }

    name.appendChild(element);
  });

  document.querySelector(".hero-label")?.classList.add("show");

  const letters = document.querySelectorAll(".name-letter");

  setTimeout(() => {
    letters.forEach((letter, index) => {
      setTimeout(() => {
        letter.classList.add("visible");
      }, index * 70);
    });
  }, 600);

  const finish = 600 + letters.length * 70;

  const sequence = [
    ".hero-summary",

    ".hero-roles",

    ".qualification",

    ".hero-resume",

    ".hero-footer",
  ];

  sequence.forEach((selector, index) => {
    setTimeout(
      () => {
        document.querySelector(selector)?.classList.add("show");
      },
      finish + 350 + index * 450,
    );
  });
}

window.addEventListener("load", startHeroIntro);

/* =========================================================
   CURSOR
========================================================= */

const cursorDot = document.getElementById("cursorDot");

const cursorHalo = document.getElementById("cursorHalo");

let mouseX = 0;
let mouseY = 0;

let haloX = 0;
let haloY = 0;

document.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") {
    return;
  }

  mouseX = event.clientX;

  mouseY = event.clientY;

  cursorDot.style.opacity = "1";

  cursorHalo.style.opacity = "1";

  cursorDot.style.transform = `translate3d(
                ${mouseX}px,
                ${mouseY}px,
                0
            )
            translate(
                -50%,
                -50%
            )`;
});

function animateCursor() {
  haloX += (mouseX - haloX) * 0.18;

  haloY += (mouseY - haloY) * 0.18;

  cursorHalo.style.transform = `translate3d(
            ${haloX}px,
            ${haloY}px,
            0
        )
        translate(
            -50%,
            -50%
        )`;

  requestAnimationFrame(animateCursor);
}

animateCursor();

/* =========================================================
   SKILLS CUBE
========================================================= */

const skillScene = document.getElementById("skillScene");

const skillObject = document.getElementById("skillObject");

let cubeRotationX = -13;
let cubeRotationY = 27;

let velocityX = 0;
let velocityY = 0;

let dragging = false;

let previousX = 0;
let previousY = 0;

function updateCube() {
  cubeRotationX = clamp(cubeRotationX, -80, 80);

  skillObject.style.transform = `rotateX(
            ${cubeRotationX}deg
        )
        rotateY(
            ${cubeRotationY}deg
        )`;
}

skillScene?.addEventListener("pointerdown", (event) => {
  dragging = true;

  previousX = event.clientX;

  previousY = event.clientY;

  velocityX = 0;
  velocityY = 0;

  skillScene.setPointerCapture(event.pointerId);

  cursorHalo.classList.add("cursor-drag");
});

skillScene?.addEventListener("pointermove", (event) => {
  if (!dragging) {
    return;
  }

  const dx = event.clientX - previousX;

  const dy = event.clientY - previousY;

  cubeRotationY += dx * 0.4;

  cubeRotationX -= dy * 0.3;

  velocityY = dx * 0.052;

  velocityX = -dy * 0.038;

  previousX = event.clientX;

  previousY = event.clientY;

  updateCube();
});

function endDrag(event) {
  dragging = false;

  if (skillScene && skillScene.hasPointerCapture(event.pointerId)) {
    skillScene.releasePointerCapture(event.pointerId);
  }

  cursorHalo.classList.remove("cursor-drag");
}

skillScene?.addEventListener("pointerup", endDrag);

skillScene?.addEventListener("pointercancel", endDrag);

function animateCube() {
  if (!dragging) {
    cubeRotationY += velocityY;

    cubeRotationX += velocityX;

    velocityY *= 0.945;
    velocityX *= 0.925;

    updateCube();
  }

  requestAnimationFrame(animateCube);
}

animateCube();

/* =========================================================
   EXPERIENCE REVEAL
========================================================= */

const experienceObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.15,
  },
);

document
  .querySelectorAll(".experience-reveal")
  .forEach((item) => experienceObserver.observe(item));

/* =========================================================
   PROJECT REVEAL + FLIP
========================================================= */

const projectObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.1,
  },
);

document.querySelectorAll(".project-card").forEach((card) => {
  projectObserver.observe(card);

  card.addEventListener("click", (event) => {
    if (event.target.closest(".github-link")) {
      return;
    }

    if (window.matchMedia("(hover:none)").matches) {
      card.classList.toggle("flipped");
    }
  });
});

/* =========================================================
   CONTACT MESSAGE

   Opens visitor's email application.
========================================================= */

const contactForm = document.getElementById("contactForm");

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("contactName").value.trim();

  const email = document.getElementById("contactEmail").value.trim();

  const message = document.getElementById("contactMessage").value.trim();

  const subject = encodeURIComponent(`Portfolio message from ${name}`);

  const body = encodeURIComponent(
    `Hello Shobhitha,

My name is ${name}.

Email: ${email}

Message:
${message}

Regards,
${name}`,
  );

  window.location.href = `mailto:spanduspandu1828@gmail.com?subject=${subject}&body=${body}`;
});

/* =========================================================
   CONTACT CURSOR
========================================================= */

document
  .querySelectorAll(
    ".contact-info-card, .social-link, .message-button, .resume-button",
  )
  .forEach((item) => {
    item.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") {
        cursorHalo.classList.add("cursor-contact");
      }
    });

    item.addEventListener("pointerleave", () => {
      cursorHalo.classList.remove("cursor-contact");
    });
  });
