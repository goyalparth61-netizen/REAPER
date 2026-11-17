import { useEffect, useRef } from "react";

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.offsetWidth;
      height = canvas.parentElement.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);

    const isMobile = width < 768;
    const particleCount = isMobile ? 26 : 48;
    const maxDistance = isMobile ? 90 : 130;

    const colors = [
      { r: 73, g: 224, b: 193 },  // #49E0C1 Teal
      { r: 99, g: 141, b: 255 },  // #638DFF Electric Blue
      { r: 56, g: 249, b: 215 }   // #38F9D7 Vibrant Cyan
    ];

    // Node graph particles
    const particles = Array.from({ length: particleCount }, () => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        radius: Math.random() * 1.6 + 1.2,
        color,
        baseAlpha: Math.random() * 0.35 + 0.25,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      };
    });

    // Synapse energy pulses traveling between linked nodes
    const pulses = [];
    function spawnPulse(p1, p2, color) {
      if (pulses.length > 8) return; // limit active pulses for performance
      pulses.push({
        x1: p1.x, y1: p1.y,
        x2: p2.x, y2: p2.y,
        progress: 0,
        speed: 0.018 + Math.random() * 0.015,
        color
      });
    }

    let mouse = { x: -1000, y: -1000, radius: 130 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    if (prefersReducedMotion) {
      renderStatic();
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    function renderStatic() {
      ctx.clearRect(0, 0, width, height);
      drawGraph(0);
    }

    let lastPulseTime = 0;

    function drawGraph(time) {
      // Draw subtle connections between nodes
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(73, 224, 193, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();

            // Occasionally spawn a moving energy pulse
            if (time - lastPulseTime > 1200 && Math.random() < 0.02) {
              spawnPulse(particles[i], particles[j], particles[i].color);
              lastPulseTime = time;
            }
          }
        }
      }

      // Render & update energy pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulses.splice(i, 1);
          continue;
        }

        const px = pulse.x1 + (pulse.x2 - pulse.x1) * pulse.progress;
        const py = pulse.y1 + (pulse.y2 - pulse.y1) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pulse.color.r}, ${pulse.color.g}, ${pulse.color.b}, 0.85)`;
        ctx.shadowColor = `rgba(${pulse.color.r}, ${pulse.color.g}, ${pulse.color.b}, 0.9)`;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw particle nodes with soft pulsing glow
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.15;
        const currentAlpha = Math.max(0.1, p.baseAlpha + pulse);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;
        ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.6)`;
        ctx.shadowBlur = 9;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    let lastTime = performance.now();

    function animate(time) {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Particle physics & subtle cursor deflection
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * (dt * 60);
        p.y += p.vy * (dt * 60);

        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;

        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 0.45;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }
      }

      drawGraph(time);

      if (isVisible) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="particle-canvas-wrapper" aria-hidden="true">
      <canvas ref={canvasRef} className="particle-canvas" />
      {/* Layered Lighting & Perspective Grid */}
      <div className="ambient-perspective-grid" />
      <div className="ambient-aurora-glow" />
      <div className="ambient-light-beam left" />
      <div className="ambient-light-beam right" />
      <div className="ambient-radial-glow top" />
    </div>
  );
}
