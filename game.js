const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 6;
const BALL_SPEED = 5;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ball = {
  x: canvas.width / 2 - BALL_SIZE / 2,
  y: canvas.height / 2 - BALL_SIZE / 2,
  vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  vy: BALL_SPEED * (Math.random() * 2 - 1)
};

// Mouse control for player paddle
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp within canvas
  playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Draw everything
function draw() {
  // Background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Middle dashed line
  ctx.strokeStyle = '#fff';
  ctx.setLineDash([10, 20]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Left (player) paddle
  ctx.fillStyle = '#00ffea';
  ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
  // Right (AI) paddle
  ctx.fillStyle = '#ff0066';
  ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
  // Ball
  ctx.fillStyle = '#fff';
  ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
}

// Collision helpers
function rectIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Update game state
function update() {
  // Ball movement
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Top/bottom wall collision
  if (ball.y <= 0 || ball.y + BALL_SIZE >= canvas.height) {
    ball.vy *= -1;
    ball.y = Math.max(0, Math.min(canvas.height - BALL_SIZE, ball.y));
  }

  // Left paddle collision
  if (rectIntersect(
    ball.x, ball.y, BALL_SIZE, BALL_SIZE,
    PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT
  )) {
    ball.vx = Math.abs(ball.vx);
    // Add some vertical effect based on hit position
    ball.vy += ((ball.y + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2)) * 0.15;
  }

  // Right paddle collision
  if (rectIntersect(
    ball.x, ball.y, BALL_SIZE, BALL_SIZE,
    AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT
  )) {
    ball.vx = -Math.abs(ball.vx);
    ball.vy += ((ball.y + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2)) * 0.15;
  }

  // Score (ball out of bounds) - just reset for simplicity
  if (ball.x < 0 || ball.x > canvas.width) {
    // Reset ball to center
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
  }

  // AI paddle movement: follow the ball, but with a limit
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  let ballCenter = ball.y + BALL_SIZE / 2;
  if (aiCenter < ballCenter - 10) {
    aiY += PADDLE_SPEED;
  } else if (aiCenter > ballCenter + 10) {
    aiY -= PADDLE_SPEED;
  }
  // Clamp AI paddle
  aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Main loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();