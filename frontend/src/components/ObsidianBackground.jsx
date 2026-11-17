import { useEffect, useRef } from "react";

export default function ObsidianBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animId;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function handleResize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    const isMobile = width < 768;
    const particleCount = isMobile ? 18 : 34;
    const maxConnectDist = isMobile ? 80 : 120;

    // Obsidian Emerald palette particle colors
    const colors = [
      { r: 66, g: 214, b: 164 },   // #42D6A4 Emerald Accent
      { r: 161, g: 233, b: 201 },  // #A1E9C9 Soft Mint
      { r: 201, g: 169, b: 110 }   // #C9A96E Champagne Gold
    ];

    const particles = Array.from({ length: particleCount }, () => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.5 + 1.0,
        color,
        baseAlpha: Math.random() * 0.25 + 0.15
      };
    });

    let mouse = { x: -1000, y: -1000, radius: 100 };
    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    if (prefersReducedMotion) {
      // Draw static frame only
      drawStatic();
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseleave", onMouseLeave);
      };
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.baseAlpha})`;
        ctx.fill();
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles with subtle organic threads
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(66, 214, 164, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce gently off bounds
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse gentle repulsion
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < mouse.radius && mdist > 0) {
          const force = (1 - mdist / mouse.radius) * 0.4;
          p.x += (mdx / mdist) * force;
          p.y += (mdy / mdist) * force;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.baseAlpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="obsidian-bg-container" aria-hidden="true">
      {/* Layer 1: Ambient Drifting Radial Light Orbs */}
      <div className="obsidian-ambient-orb orb-emerald-1" />
      <div className="obsidian-ambient-orb orb-forest-2" />
      <div className="obsidian-ambient-orb orb-champagne-3" />

      {/* Layer 2: Geometric Coordinate Grid Overlay */}
      <div className="obsidian-grid-overlay" />

      {/* Layer 3: Organic Particle Network */}
      <canvas ref={canvasRef} className="obsidian-particle-canvas" />
    </div>
  );
}
