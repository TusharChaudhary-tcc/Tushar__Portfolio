import { useEffect, useRef } from 'react';

const TECHNOLOGIES = [
  { name: 'C++', colors: ['37, 99, 235'] },
  { name: 'JavaScript', colors: ['250, 204, 21'] },
  { name: 'Python', colors: ['59, 130, 246', '250, 204, 21'] },
  { name: 'React', colors: ['34, 211, 238'] },
  { name: 'Node.js', colors: ['74, 222, 128'] },
  { name: 'MongoDB', colors: ['52, 211, 153'] },
  { name: 'AWS', colors: ['251, 146, 60'] },
  { name: 'TypeScript', colors: ['59, 130, 246'] },
  { name: 'Express.js', colors: ['203, 213, 225'] },
  { name: 'Git & GitHub', colors: ['249, 115, 22', '226, 232, 240'] },
];

const FORMATION_DURATION = 1000;
const HOLD_DURATION = 1500;
const DISSOLVE_DURATION = 650;
const CYCLE_DURATION = FORMATION_DURATION + HOLD_DURATION + DISSOLVE_DURATION;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default function ParticleTechStack() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    const textCanvas = document.createElement('canvas');
    const textContext = textCanvas.getContext('2d', { willReadFrequently: true });
    if (!context || !textContext) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particles = [];
    const stars = [];
    const pointer = { x: -1000, y: -1000, active: false };
    let animationFrame;
    let resizeFrame;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let currentTechnology = 0;
    let cycleStartedAt = performance.now();
    let dissolveStarted = false;
    let isVisible = true;
    let disposed = false;

    const createParticle = () => ({
      x: width / 2,
      y: height / 2,
      tx: width / 2,
      ty: height / 2,
      vx: 0,
      vy: 0,
      size: 1,
      alpha: 0.86,
      color: '241, 245, 249',
    });

    const createTargets = (technology) => {
      const maxTextWidth = Math.max(1, width * 0.86);
      const maxTextHeight = Math.max(1, height * 0.42);
      const maxFontSize = clamp(Math.min(width * 0.16, height * 0.34), 28, 150);
      textCanvas.width = Math.max(1, Math.floor(width));
      textCanvas.height = Math.max(1, Math.floor(height));
      textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
      textContext.fillStyle = '#fff';
      textContext.textAlign = 'center';
      textContext.textBaseline = 'middle';
      textContext.font = `700 ${maxFontSize}px "Fira Code", monospace`;

      const measuredText = textContext.measureText(technology.name);
      const fittedFontSize = Math.min(
        maxFontSize,
        maxTextWidth / Math.max(measuredText.width / maxFontSize, 1),
        maxTextHeight / Math.max((measuredText.actualBoundingBoxAscent + measuredText.actualBoundingBoxDescent) / maxFontSize, 1),
      );
      textContext.font = `700 ${Math.max(28, fittedFontSize)}px "Fira Code", monospace`;
      textContext.fillText(technology.name, width / 2, height / 2);

      const image = textContext.getImageData(0, 0, textCanvas.width, textCanvas.height);
      const sampleStep = width < 600 ? 3 : 4;
      const targets = [];
      for (let y = 0; y < image.height; y += sampleStep) {
        for (let x = 0; x < image.width; x += sampleStep) {
          if (image.data[(y * image.width + x) * 4 + 3] > 150) {
            targets.push({ x, y });
          }
        }
      }

      if (targets.length) {
        const padding = Math.max(12, width * 0.06);
        let minX = targets[0].x;
        let maxX = targets[0].x;
        targets.forEach((target) => {
          minX = Math.min(minX, target.x);
          maxX = Math.max(maxX, target.x);
        });

        const targetWidth = maxX - minX;
        const availableWidth = Math.max(1, width - padding * 2);
        if (targetWidth > availableWidth) {
          const scale = availableWidth / targetWidth;
          const centerX = width / 2;
          targets.forEach((target) => {
            target.x = centerX + (target.x - centerX) * scale;
          });
        }
      }

      return targets;
    };

    const ensureParticleCount = (count) => {
      while (particles.length < count) particles.push(createParticle());
      if (particles.length > count) particles.length = count;
    };

    const assignTargets = (technology, snap = false) => {
      const targets = createTargets(technology);
      if (!targets.length) return;

      ensureParticleCount(targets.length);
      targets.forEach((target, index) => {
        const particle = particles[index];
        particle.tx = target.x;
        particle.ty = target.y;
        particle.color = technology.colors[index % technology.colors.length];
        if (snap) {
          particle.x = target.x;
          particle.y = target.y;
          particle.vx = 0;
          particle.vy = 0;
        }
      });
    };

    const scatterParticles = () => {
      particles.forEach((particle) => {
        particle.tx = Math.random() * width;
        particle.ty = Math.random() * height;
      });
    };

    const drawTrail = (timestamp) => {
      const time = timestamp * 0.00032;
      const gradient = context.createLinearGradient(0, 0, width, height);
      const shift = (Math.sin(time) + 1) / 2;
      gradient.addColorStop(0, `rgba(34, 211, 238, ${0.08 + shift * 0.04})`);
      gradient.addColorStop(0.28, `rgba(168, 85, 247, ${0.1 + shift * 0.04})`);
      gradient.addColorStop(0.55, `rgba(236, 72, 153, ${0.09 + shift * 0.04})`);
      gradient.addColorStop(0.78, `rgba(250, 204, 21, ${0.08 + shift * 0.04})`);
      gradient.addColorStop(1, 'rgba(34, 211, 238, 0.05)');

      context.save();
      context.globalCompositeOperation = 'screen';
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = gradient;
      context.shadowBlur = 22;
      context.shadowColor = 'rgba(168, 85, 247, 0.2)';
      context.lineWidth = Math.max(2, width * 0.008);
      context.beginPath();
      context.moveTo(-width * 0.08, height * (0.26 + Math.sin(time) * 0.04));
      context.bezierCurveTo(
        width * 0.22, height * (0.04 + Math.cos(time * 0.8) * 0.08),
        width * 0.38, height * (0.82 + Math.sin(time * 0.7) * 0.08),
        width * 0.62, height * (0.55 + Math.cos(time) * 0.08),
      );
      context.bezierCurveTo(
        width * 0.82, height * (0.28 + Math.sin(time * 0.6) * 0.1),
        width * 0.92, height * (0.88 + Math.cos(time * 0.7) * 0.05),
        width * 1.08, height * (0.66 + Math.sin(time) * 0.05),
      );
      context.stroke();
      context.restore();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars.length = 0;
      const starCount = width < 600 ? 45 : 90;
      for (let index = 0; index < starCount; index += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.2,
          alpha: Math.random() * 0.45 + 0.1,
        });
      }

      assignTargets(TECHNOLOGIES[currentTechnology], reducedMotion);
    };

    const scheduleResize = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(resize);
    };

    const setPointer = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.active = true;
    };

    const clearPointer = () => {
      pointer.active = false;
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const handleMouseMove = (event) => setPointer(event.clientX, event.clientY);
    const handleMouseLeave = clearPointer;
    const handleTouchMove = (event) => {
      const touch = event.touches[0];
      if (touch) setPointer(touch.clientX, touch.clientY);
    };
    const handleTouchEnd = clearPointer;
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible) {
        cycleStartedAt = performance.now();
        animationFrame = window.requestAnimationFrame(render);
      } else {
        window.cancelAnimationFrame(animationFrame);
      }
    };

    const render = (timestamp) => {
      if (!isVisible) return;

      context.clearRect(0, 0, width, height);
      drawTrail(timestamp);

      stars.forEach((star) => {
        context.fillStyle = `rgba(148, 163, 184, ${star.alpha})`;
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
      });

      const elapsed = timestamp - cycleStartedAt;
      if (!reducedMotion && elapsed >= FORMATION_DURATION + HOLD_DURATION && !dissolveStarted) {
        dissolveStarted = true;
        scatterParticles();
      }

      if (!reducedMotion && elapsed >= CYCLE_DURATION) {
        currentTechnology = (currentTechnology + 1) % TECHNOLOGIES.length;
        cycleStartedAt = timestamp;
        dissolveStarted = false;
        assignTargets(TECHNOLOGIES[currentTechnology]);
      }

      particles.forEach((particle) => {
        const dx = particle.tx - particle.x;
        const dy = particle.ty - particle.y;
        particle.vx += dx * 0.009;
        particle.vy += dy * 0.009;

        if (pointer.active) {
          const mouseDx = particle.x - pointer.x;
          const mouseDy = particle.y - pointer.y;
          const distanceSquared = mouseDx * mouseDx + mouseDy * mouseDy;
          if (distanceSquared < 14000) {
            const distance = Math.sqrt(distanceSquared) || 1;
            const force = (1 - distance / 118) * 1.8;
            particle.vx += (mouseDx / distance) * force;
            particle.vy += (mouseDy / distance) * force;
          }
        }

        particle.vx *= 0.86;
        particle.vy *= 0.86;
        particle.x += particle.vx;
        particle.y += particle.vy;

        context.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
        context.fillRect(particle.x, particle.y, particle.size, particle.size);
      });

      if (!reducedMotion) animationFrame = window.requestAnimationFrame(render);
    };

    window.addEventListener('resize', scheduleResize);
    const resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(canvas.parentElement || canvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const initialize = async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      if (disposed) return;
      resize();
      if (reducedMotion) {
        render(performance.now());
      } else {
        animationFrame = window.requestAnimationFrame(render);
      }
    };
    initialize();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener('resize', scheduleResize);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="particle-tech-stage">
      <canvas
        ref={canvasRef}
        className="particle-tech-canvas"
        aria-label="Interactive particle animation cycling through Tushar's technology stack"
      />
    </div>
  );
}
