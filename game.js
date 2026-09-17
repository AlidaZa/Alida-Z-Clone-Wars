window.CLONE_WARS_GAME = true;

const DEFAULTS = {
  title: 'Flap Clone',
  fix: 'none',
  canvasWidth: 360,
  canvasHeight: 640,
  gravity: 1400,
  flapStrength: 420,
  birdSize: 34,
  pipeWidth: 64,
  pipeGap: 150,
  pipeSpacing: 260,
  pipeSpeed: 150,
  groundHeight: 80,
  modes: {
    easy: { pipeGap: 190, pipeSpeed: 110 },
    normal: { pipeGap: 150, pipeSpeed: 150 }
  }
};
const CONFIG = Object.assign({}, DEFAULTS, window.GAME_CONFIG || {});

const ART_NAMES = ['drawBackground', 'drawGround', 'drawBird', 'drawPipe'];
const SOUND_NAMES = ['flap', 'score', 'crash'];
const missing = [];
if (!window.GAME_CONFIG) missing.push('settings');
else for (const key of Object.keys(DEFAULTS)) { if (!(key in window.GAME_CONFIG)) missing.push(key); }
if (!window.SPRITES) missing.push('art');
else for (const name of ART_NAMES) { if (typeof window.SPRITES[name] !== 'function') missing.push(name); }
if (!window.SOUNDS) missing.push('sound');
else for (const name of SOUND_NAMES) { if (typeof window.SOUNDS[name] !== 'function') missing.push(name); }
document.getElementById('missing-label').textContent = missing.length ? 'placeholder: ' + missing.join(', ') + ' missing' : '';

function placeholderBackground(ctx, width, height, time) {
  ctx.save();
  ctx.fillStyle = '#8ecae6';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
function placeholderGround(ctx, width, height, groundHeight, offset) {
  ctx.save();
  ctx.fillStyle = '#8b7355';
  ctx.fillRect(0, height - groundHeight, width, groundHeight);
  ctx.restore();
}
function placeholderBird(ctx, x, y, size, velocity) {
  ctx.save();
  ctx.fillStyle = '#f5c542';
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  ctx.restore();
}
function placeholderPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) {
  ctx.save();
  ctx.fillStyle = '#5b8c5a';
  ctx.fillRect(x, 0, pipeWidth, gapTop);
  ctx.fillRect(x, gapBottom, pipeWidth, height - gapBottom);
  ctx.restore();
}
const drawBackground = (window.SPRITES && typeof window.SPRITES.drawBackground === 'function') ? window.SPRITES.drawBackground : placeholderBackground;
const drawGround = (window.SPRITES && typeof window.SPRITES.drawGround === 'function') ? window.SPRITES.drawGround : placeholderGround;
const drawBird = (window.SPRITES && typeof window.SPRITES.drawBird === 'function') ? window.SPRITES.drawBird : placeholderBird;
const drawPipe = (window.SPRITES && typeof window.SPRITES.drawPipe === 'function') ? window.SPRITES.drawPipe : placeholderPipe;

let muted = false;
function play(name) {
  if (muted) return;
  const sound = window.SOUNDS && window.SOUNDS[name];
  if (typeof sound === 'function') { try { sound(); } catch (error) {} }
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.canvasWidth;
canvas.height = CONFIG.canvasHeight;
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const fixButtons = document.getElementById('fix-buttons');
const sr = document.getElementById('sr');

let state = 'ready';
let y = CONFIG.canvasHeight / 2;
let velocity = 0;
const birdX = CONFIG.canvasWidth / 4;
let pipes = [];
let pipesMade = 0;
let groundOffset = 0;
let lastGapTop = CONFIG.canvasHeight / 2 - CONFIG.pipeGap / 2;
let score = 0;
let bestScore = 0;
let secondsSinceCrash = 0;
let currentMode = 'normal';
let checkpoint = 0;
let previousTime = null;

try { bestScore = parseInt(localStorage.getItem('cloneWarsBest'), 10) || 0; } catch (error) {}

function soundLine() {
  return muted ? 'Press M to turn sound on.' : 'Press M to turn sound off.';
}

function showReady() {
  overlay.hidden = false;
  overlayTitle.textContent = CONFIG.title;
  overlayText.textContent = ['Press Space, click or tap to start.', soundLine()].join('\n');
  fixButtons.textContent = '';
  if (CONFIG.fix === 'easy-mode') {
    const easy = document.createElement('button');
    const normal = document.createElement('button');
    easy.type = 'button';
    normal.type = 'button';
    easy.textContent = 'Easy';
    normal.textContent = 'Normal';
    easy.setAttribute('aria-pressed', currentMode === 'easy' ? 'true' : 'false');
    normal.setAttribute('aria-pressed', currentMode === 'normal' ? 'true' : 'false');
    easy.addEventListener('click', () => { currentMode = 'easy'; showReady(); });
    normal.addEventListener('click', () => { currentMode = 'normal'; showReady(); });
    fixButtons.appendChild(easy);
    fixButtons.appendChild(normal);
  }
}

function showGameOver() {
  overlay.hidden = false;
  overlayTitle.textContent = 'Game over';
  overlayText.textContent = ['Score ' + score + '   ·   Best ' + bestScore, 'Press Space, click or tap to play again.', soundLine()].join('\n');
  fixButtons.textContent = '';
  sr.textContent = 'Game over. Score ' + score + '. Best ' + bestScore + '.';
}

function startGame() {
  state = 'playing';
  y = CONFIG.canvasHeight / 2;
  velocity = -CONFIG.flapStrength;
  pipes = [];
  pipesMade = 0;
  groundOffset = 0;
  lastGapTop = CONFIG.canvasHeight / 2 - CONFIG.pipeGap / 2;
  score = checkpoint;
  secondsSinceCrash = 0;
  previousTime = null;
  overlay.hidden = true;
  play('flap');
}

function press() {
  if (state === 'ready') startGame();
  else if (state === 'playing') { velocity = -CONFIG.flapStrength; play('flap'); }
  else if (state === 'gameover' && secondsSinceCrash >= 0.4) startGame();
}

window.addEventListener('keydown', (event) => {
  if (event.target && event.target.closest && event.target.closest('button')) return;
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    press();
  } else if (event.code === 'KeyM') {
    muted = !muted;
    if (state === 'ready') showReady();
    if (state === 'gameover') showGameOver();
  }
});
window.addEventListener('pointerdown', (event) => {
  if (event.target && event.target.closest && event.target.closest('button')) return;
  press();
});

function addPipe(pipeGap) {
  const gap = pipeGap;
  const lowest = CONFIG.canvasHeight - CONFIG.groundHeight - 60 - gap;
  const gapTop = Math.max(60, Math.min(lowest, lastGapTop + (Math.random() * 360 - 180)));
  const gapBottom = gapTop + gap;
  lastGapTop = gapTop;
  pipes.push({ x: CONFIG.canvasWidth, gapTop: gapTop, gapBottom: gapBottom, scored: false });
  pipesMade += 1;
}

function crash() {
  if (state !== 'playing') return;
  state = 'gameover';
  secondsSinceCrash = 0;
  if (score > bestScore) bestScore = score;
  try { localStorage.setItem('cloneWarsBest', String(bestScore)); } catch (error) {}
  play('crash');
  showGameOver();
}

function overlaps(aLeft, aTop, aRight, aBottom, bLeft, bTop, bRight, bBottom) {
  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

function frame(now) {
  let seconds = previousTime === null ? 0 : (now - previousTime) / 1000;
  previousTime = now;
  seconds = Math.min(0.05, Math.max(0, seconds));

  ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
  drawBackground(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight, now / 1000);

  if (state === 'playing') {
    velocity += CONFIG.gravity * seconds;
    y += velocity * seconds;
    const mode = CONFIG.fix === 'easy-mode' ? CONFIG.modes[currentMode] : CONFIG;
    const pipeGap = mode.pipeGap;
    const pipeSpeed = mode.pipeSpeed * (CONFIG.fix === 'gentle-start' && score < 3 ? 0.75 : 1);
    groundOffset += pipeSpeed * seconds;

    if (pipes.length === 0) addPipe(pipeGap);
    else if (pipes[pipes.length - 1].x <= CONFIG.canvasWidth - CONFIG.pipeSpacing) addPipe(pipeGap);

    for (const pipe of pipes) {
      pipe.x -= pipeSpeed * seconds;
      if (!pipe.scored && pipe.x + CONFIG.pipeWidth < birdX) { pipe.scored = true; score += 1; play('score'); }
    }
    pipes = pipes.filter((pipe) => pipe.x + CONFIG.pipeWidth > 0);

    const birdSize = CONFIG.birdSize;
    const birdLeft = birdX - birdSize / 2;
    const birdRight = birdX + birdSize / 2;
    const birdTop = y - birdSize / 2;
    const birdBottom = y + birdSize / 2;
    const groundTop = CONFIG.canvasHeight - CONFIG.groundHeight;
    if (birdTop <= 0 || birdBottom >= groundTop) crash();
    for (const pipe of pipes) {
      if (overlaps(birdLeft, birdTop, birdRight, birdBottom, pipe.x, 0, pipe.x + CONFIG.pipeWidth, pipe.gapTop) ||
          overlaps(birdLeft, birdTop, birdRight, birdBottom, pipe.x, pipe.gapBottom, pipe.x + CONFIG.pipeWidth, groundTop)) {
        crash();
        break;
      }
    }
  } else if (state === 'gameover') {
    secondsSinceCrash += seconds;
  }

  drawGround(ctx, CONFIG.canvasWidth, CONFIG.canvasHeight, CONFIG.groundHeight, groundOffset);
  for (const pipe of pipes) drawPipe(ctx, pipe.x, pipe.gapTop, pipe.gapBottom, CONFIG.pipeWidth, CONFIG.canvasHeight - CONFIG.groundHeight);
  drawBird(ctx, birdX, y, CONFIG.birdSize, velocity);

  if (state === 'playing') {
    ctx.save();
    ctx.font = '800 42px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#18212b';
    ctx.strokeText(String(score), CONFIG.canvasWidth / 2, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(score), CONFIG.canvasWidth / 2, 18);
    ctx.restore();
  }

  requestAnimationFrame(frame);
}

showReady();
requestAnimationFrame(frame);
