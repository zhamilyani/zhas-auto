import './style.css';

// Intersection Observer for fade-in animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

// Burger menu
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  nav.classList.toggle('open');
});

// Close mobile menu on link click
nav.querySelectorAll('.nav__link').forEach((link) => {
  link.addEventListener('click', () => {
    burger.classList.remove('active');
    nav.classList.remove('open');
  });
});

// Header shadow on scroll
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// === Fireworks on page load ===
(function fireworks() {
  const canvas = document.createElement('canvas');
  canvas.id = 'fireworks';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let W, H;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();

  const colors = ['#175cff', '#3b82f6', '#2563eb', '#1d4ed8', '#60a5fa', '#93c5fd', '#0ea5e9', '#38bdf8'];
  const particles = [];
  const rockets = [];
  const gravity = 0.06;
  const friction = 0.985;
  let startTime = performance.now();
  const DURATION = 4000;

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.color = color;
      this.size = (Math.random() * 2.5 + 1) * 15;
      this.trail = [];
    }
    update() {
      this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
      if (this.trail.length > 5) this.trail.shift();
      this.vx *= friction;
      this.vy *= friction;
      this.vy += gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.012;
    }
    draw() {
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        ctx.beginPath();
        ctx.arc(t.x, t.y, this.size * (i / this.trail.length) * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = t.alpha * (i / this.trail.length) * 0.3;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  class Rocket {
    constructor() {
      this.x = W * (0.15 + Math.random() * 0.7);
      this.y = H;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = -(Math.random() * 4 + 7);
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.trail = [];
      this.exploded = false;
    }
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 8) this.trail.shift();
      this.vy += gravity * 0.5;
      this.x += this.vx;
      this.y += this.vy;
      if (this.vy >= -1) this.explode();
    }
    explode() {
      this.exploded = true;
      const count = 60 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(this.x, this.y, this.color));
      }
    }
    draw() {
      for (let i = 0; i < this.trail.length; i++) {
        const t = this.trail[i];
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = (i / this.trail.length) * 0.4;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 1;
      ctx.fill();
    }
  }

  let lastRocket = 0;
  function loop(now) {
    const elapsed = now - startTime;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    if (elapsed < DURATION - 1000 && now - lastRocket > 200 + Math.random() * 300) {
      rockets.push(new Rocket());
      lastRocket = now;
    }

    for (let i = rockets.length - 1; i >= 0; i--) {
      rockets[i].update();
      if (rockets[i].exploded) { rockets.splice(i, 1); continue; }
      rockets[i].draw();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].alpha <= 0) { particles.splice(i, 1); continue; }
      particles[i].draw();
    }

    if (elapsed > DURATION && particles.length === 0 && rockets.length === 0) {
      canvas.remove();
      return;
    }

    if (elapsed > DURATION - 500) {
      canvas.style.opacity = Math.max(0, 1 - (elapsed - (DURATION - 500)) / 500);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
