(function () {
  function outlineRect(ctx, x, y, width, height, fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#18212b';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
  }

  function drawBackground(ctx, width, height, time) {
    ctx.save();
    ctx.fillStyle = '#b9dff2';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#f6d98b';
    ctx.beginPath();
    ctx.arc(width - 55, 70, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6f9a63';
    ctx.beginPath();
    ctx.moveTo(0, height - 170);
    ctx.lineTo(70, height - 230);
    ctx.lineTo(145, height - 170);
    ctx.lineTo(220, height - 245);
    ctx.lineTo(width, height - 165);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8e1cf';
    ctx.fillRect(38, height - 250, 75, 115);
    ctx.strokeStyle = '#26313b';
    ctx.lineWidth = 3;
    ctx.strokeRect(38, height - 250, 75, 115);
    ctx.fillStyle = '#d9b66f';
    ctx.fillRect(150, height - 215, 115, 80);
    ctx.strokeStyle = '#26313b';
    ctx.strokeRect(150, height - 215, 115, 80);
    ctx.fillStyle = '#4e7d54';
    for (let i = 0; i < 7; i += 1) {
      const x = 15 + i * 58;
      ctx.beginPath();
      ctx.arc(x, height - 145, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGround(ctx, width, height, groundHeight, offset) {
    ctx.save();
    const top = height - groundHeight;
    ctx.fillStyle = '#d7c79b';
    ctx.fillRect(0, top, width, groundHeight);
    ctx.strokeStyle = '#26313b';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, top, width, groundHeight);
    ctx.strokeStyle = '#8f7b50';
    ctx.lineWidth = 2;
    for (let x = -40 - (offset % 40); x < width + 40; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, top + 10);
      ctx.lineTo(x + 20, top + 30);
      ctx.lineTo(x, top + 50);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBird(ctx, x, y, size, velocity) {
    ctx.save();
    const left = x - size / 2;
    const top = y - size / 2;
    const tilt = Math.max(-0.35, Math.min(0.35, velocity / 900));
    ctx.translate(x, y);
    ctx.rotate(tilt);
    outlineRect(ctx, -size * 0.45, -size * 0.38, size * 0.9, size * 0.72, '#7b1e24');
    ctx.fillStyle = '#f3f0df';
    ctx.fillRect(-size * 0.28, -size * 0.24, size * 0.45, size * 0.48);
    ctx.fillStyle = '#c58b55';
    ctx.fillRect(size * 0.38, -size * 0.08, size * 0.2, size * 0.14);
    ctx.fillStyle = '#18212b';
    ctx.beginPath();
    ctx.arc(size * 0.18, -size * 0.18, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) {
    ctx.save();
    outlineRect(ctx, x, 0, pipeWidth, gapTop, '#6d7f68');
    outlineRect(ctx, x, gapBottom, pipeWidth, height - gapBottom, '#6d7f68');
    ctx.fillStyle = '#9aac8b';
    ctx.fillRect(x + 8, 0, 10, gapTop);
    ctx.fillRect(x + 8, gapBottom, 10, height - gapBottom);
    ctx.restore();
  }

  window.SPRITES = { drawBackground, drawGround, drawBird, drawPipe };
})();
