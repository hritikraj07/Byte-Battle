export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  angle: number;
  distance: number;
}

export function createParticles(count: number, width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  const colors = ['#00F0FF', '#A855F7', '#FF2E97', '#38BDF8'];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: 1.2 + Math.random() * 2.2,
      color: colors[i % colors.length],
      alpha: 0.3 + Math.random() * 0.7,
      angle: Math.random() * Math.PI * 2,
      distance: 50 + Math.random() * 250,
    });
  }
  return particles;
}

export function renderQuantum(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
  focalX: number,
  focalY: number,
  speed: number
) {
  for (const p of particles) {
    const dx = focalX - p.x;
    const dy = focalY - p.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 10) {
      const force = (120 / Math.max(50, dist)) * 0.04 * speed;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }

    p.vx *= 0.98;
    p.vy *= 0.98;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fill();
  }

  // Draw connecting constellation lines
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)';
  ctx.lineWidth = 0.75;
  for (let i = 0; i < particles.length; i += 2) {
    for (let j = i + 1; j < Math.min(i + 4, particles.length); j++) {
      const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
      if (d < 85) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

export function renderNebula(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  time: number
) {
  const horizonY = height * 0.55;

  // Draw Neon Celestial Core
  ctx.save();
  const grad = ctx.createRadialGradient(centerX, horizonY - 40, 10, centerX, horizonY - 40, 140);
  grad.addColorStop(0, '#FFE45E');
  grad.addColorStop(0.5, '#FF2E97');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(centerX, horizonY - 40, 120, Math.PI, 0);
  ctx.fill();
  ctx.restore();

  // Moving Perspective Lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
  ctx.lineWidth = 1.5;
  for (let x = -width; x < width * 2; x += 90) {
    ctx.beginPath();
    ctx.moveTo(centerX, horizonY);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal Grid Lines moving forward
  const gridOffset = (time * 120) % 50;
  for (let y = horizonY; y < height; y += (y - horizonY) * 0.25 + 12) {
    const drawY = y + gridOffset * ((y - horizonY) / (height - horizonY));
    if (drawY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, drawY);
      ctx.lineTo(width, drawY);
      ctx.stroke();
    }
  }
}

export function renderSpire(
  ctx: CanvasRenderingContext2D,
  height: number,
  centerX: number,
  centerY: number,
  time: number
) {
  const spireW = 60;
  const topY = height * 0.15;
  const bottomY = height * 0.85;

  // Concentric Holographic Energy Rings
  for (let r = 80; r < 340; r += 60) {
    const pulseR = r + Math.sin(time * 2 + r) * 12;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 80, pulseR, pulseR * 0.35, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 46, 151, ${0.4 - r / 1000})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Central Obelisk
  ctx.save();
  ctx.fillStyle = '#0F0E26';
  ctx.strokeStyle = '#FF2E97';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#FF2E97';
  ctx.shadowBlur = 20;

  ctx.beginPath();
  ctx.moveTo(centerX, topY);
  ctx.lineTo(centerX + spireW, bottomY);
  ctx.lineTo(centerX - spireW, bottomY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
