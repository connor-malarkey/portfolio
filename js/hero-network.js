/**
 * Background: realistic galaxy starfield — parallax + twinkle
 */
(function () {
  'use strict';

  var canvas, ctx, stars, animId;
  var W, H, dpr;
  var t = 0, lastTs = 0;
  var scrollY  = 0;
  var mouseX   = 0.5, mouseY  = 0.5;
  var tMouseX  = 0.5, tMouseY = 0.5;
  var resizeTimer;

  var shootingStars = [];
  var nextShoot = 4 + Math.random() * 5;

  function isMobile() { return W < 768; }
  function rnd()      { return Math.random(); }

  function makeStar() {
    var size = rnd();
    var radius, baseAlpha, r, g, b;

    if (size < 0.70) {
      /* tiny — the vast majority */
      radius    = 0.22 + rnd() * 0.40;
      baseAlpha = 0.12 + rnd() * 0.32;
      r = g = b = 255;
    } else if (size < 0.92) {
      /* small — some colour tint */
      radius    = 0.65 + rnd() * 0.60;
      baseAlpha = 0.32 + rnd() * 0.42;
      var hue = rnd();
      if      (hue < 0.35) { r = 210; g = 225; b = 255; }  /* blue-white  */
      else if (hue < 0.55) { r = 255; g = 248; b = 215; }  /* warm yellow */
      else                 { r = g = b = 255; }
    } else {
      /* bright — rare, with cross-spike */
      radius    = 1.25 + rnd() * 0.90;
      baseAlpha = 0.65 + rnd() * 0.30;
      r = g = b = 255;
    }

    return {
      x:        rnd(),
      y:        rnd(),
      radius:   radius,
      baseAlpha:baseAlpha,
      r: r, g: g, b: b,
      twinkles: rnd() < 0.30,
      tSpeed:   0.35 + rnd() * 1.1,
      tPhase:   rnd() * Math.PI * 2,
      depth:    0.18 + rnd() * 0.82,
    };
  }

  function makeStars() {
    var n = isMobile() ? 200 : 380;
    stars = [];
    for (var i = 0; i < n; i++) stars.push(makeStar());
  }

  function spawnShootingStar() {
    var angle = (25 + rnd() * 30) * Math.PI / 180;
    var speed = 420 + rnd() * 260;
    /* start from top or left edge */
    var fromLeft = rnd() < 0.5;
    var x = fromLeft ? rnd() * W * 0.6 : rnd() * W;
    var y = fromLeft ? rnd() * H * 0.4 : -10;
    shootingStars.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: 80 + rnd() * 80,
      life: 0,
      maxLife: 0.55 + rnd() * 0.35,
    });
  }

  function drawShootingStar(s, dt) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life += dt;

    var progress = s.life / s.maxLife;
    /* fade in first 15%, fade out last 25% */
    var alpha = progress < 0.15
      ? progress / 0.15
      : progress > 0.75
        ? (1 - progress) / 0.25
        : 1;
    alpha *= 0.72;

    var tailX = s.x - Math.cos(Math.atan2(s.vy, s.vx)) * s.length;
    var tailY = s.y - Math.sin(Math.atan2(s.vy, s.vx)) * s.length;

    var grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
    grad.addColorStop(0, 'rgba(255,255,255,0)');
    grad.addColorStop(1, 'rgba(255,255,255,' + alpha + ')');

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(s.x, s.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* tiny head glow */
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
    ctx.fill();
  }

  function drawStar(s) {
    var alpha = s.twinkles
      ? s.baseAlpha * (0.60 + 0.40 * Math.sin(t * s.tSpeed + s.tPhase))
      : s.baseAlpha;

    var px = s.x * W + (mouseX - 0.5) * s.depth * 20;
    var py = s.y * H + (mouseY - 0.5) * s.depth * 14
             - scrollY * s.depth * 0.022;

    /* cross-spike glow for the brightest stars */
    if (s.radius > 1.5) {
      var len = s.radius * 4;
      ctx.strokeStyle = 'rgba(' + s.r + ',' + s.g + ',' + s.b + ',' + (alpha * 0.22) + ')';
      ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(px - len, py); ctx.lineTo(px + len, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py - len); ctx.lineTo(px, py + len); ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(px, py, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + s.r + ',' + s.g + ',' + s.b + ',' + alpha + ')';
    ctx.fill();
  }

  function frame(ts) {
    var dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0;
    lastTs = ts;
    t += dt;

    mouseX += (tMouseX - mouseX) * 0.05;
    mouseY += (tMouseY - mouseY) * 0.05;

    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) drawStar(stars[i]);

    /* shooting stars */
    nextShoot -= dt;
    if (nextShoot <= 0) {
      spawnShootingStar();
      nextShoot = 4 + rnd() * 7;
    }
    for (var j = shootingStars.length - 1; j >= 0; j--) {
      drawShootingStar(shootingStars[j], dt);
      if (shootingStars[j].life >= shootingStars[j].maxLife) shootingStars.splice(j, 1);
    }

    animId = requestAnimationFrame(frame);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }

  function init() {
    canvas = document.getElementById('pageCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();
    makeStars();
    animId = requestAnimationFrame(frame);

    window.addEventListener('scroll', function () {
      scrollY = window.scrollY;
    }, { passive: true });

    window.addEventListener('mousemove', function (e) {
      tMouseX = e.clientX / W;
      tMouseY = e.clientY / H;
    }, { passive: true });

    window.addEventListener('resize', function () {
      resize();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(makeStars, 250);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        lastTs = 0;
        animId = requestAnimationFrame(frame);
      }
    });

    var heroContent = document.getElementById('heroContent');
    if (heroContent) {
      requestAnimationFrame(function () { heroContent.classList.add('ready'); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

