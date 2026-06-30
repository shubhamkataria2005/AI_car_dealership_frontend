// src/components/ui/HeroScene.jsx
// Cinematic hero background: particle constellation + SVG wireframes + perspective grid
import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import './HeroScene.css';

// ─── Particle canvas ─────────────────────────────────────────────────────────
const useParticles = (canvasRef) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    const mouse = { x: null, y: null };

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const onMouseMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onMouseLeave = () => { mouse.x = null; mouse.y = null; };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    const COUNT = window.innerWidth < 768 ? 45 : 90;
    const CONNECT_DIST = 140;

    const particles = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r:  Math.random() * 1.5 + 0.4,
      a:  Math.random() * 0.55 + 0.18,
      amber: Math.random() > 0.62,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update
      particles.forEach(p => {
        if (mouse.x !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            const f = ((110 - d) / 110) * 0.55;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        p.vx *= 0.982;
        p.vy *= 0.982;
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > 1.1) { p.vx = (p.vx / spd) * 1.1; p.vy = (p.vy / spd) * 1.1; }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0)             p.x += canvas.width;
        if (p.x > canvas.width)  p.x -= canvas.width;
        if (p.y < 0)             p.y += canvas.height;
        if (p.y > canvas.height) p.y -= canvas.height;
      });

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.14;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,122,26,${alpha})`;
            ctx.lineWidth = 0.55;
            ctx.stroke();
          }
        }
      }

      // Particles
      particles.forEach(p => {
        const rgb = p.amber ? '255,122,26' : '200,210,225';
        // Subtle glow for amber
        if (p.amber) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          g.addColorStop(0, `rgba(255,122,26,${p.a * 0.35})`);
          g.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.a})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [canvasRef]);
};

// ─── Component ───────────────────────────────────────────────────────────────
const HeroScene = () => {
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  return (
    <div className="hs-root" aria-hidden="true">

      {/* Particle field */}
      <canvas ref={canvasRef} className="hs-canvas" />

      {/* Perspective grid floor */}
      <div className="hs-grid" />

      {/* Large orbital ring — top right */}
      <motion.div
        className="hs-shape hs-s1"
        animate={{ rotate: 360 }}
        transition={{ duration: 42, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 220 220" fill="none">
          <circle cx="110" cy="110" r="104" stroke="rgba(255,122,26,0.22)" strokeWidth="0.7"/>
          <circle cx="110" cy="110" r="76"  stroke="rgba(255,122,26,0.13)" strokeWidth="0.5"/>
          <circle cx="110" cy="110" r="46"  stroke="rgba(255,122,26,0.07)" strokeWidth="0.5"/>
          <line x1="110" y1="6"   x2="110" y2="214" stroke="rgba(255,122,26,0.07)" strokeWidth="0.4"/>
          <line x1="6"   y1="110" x2="214" y2="110" stroke="rgba(255,122,26,0.07)" strokeWidth="0.4"/>
          <line x1="32"  y1="32"  x2="188" y2="188" stroke="rgba(255,122,26,0.05)" strokeWidth="0.4"/>
          <line x1="188" y1="32"  x2="32"  y2="188" stroke="rgba(255,122,26,0.05)" strokeWidth="0.4"/>
        </svg>
      </motion.div>

      {/* Hexagon — left mid */}
      <motion.div
        className="hs-shape hs-s2"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 180 180" fill="none">
          <polygon points="90,6 168,48 168,132 90,174 12,132 12,48"
            stroke="rgba(255,122,26,0.20)" strokeWidth="0.7" fill="none"/>
          <polygon points="90,28 148,62 148,118 90,152 32,118 32,62"
            stroke="rgba(255,122,26,0.10)" strokeWidth="0.5" fill="none"/>
          <polygon points="90,50 128,72 128,108 90,130 52,108 52,72"
            stroke="rgba(255,122,26,0.06)" strokeWidth="0.4" fill="none"/>
        </svg>
      </motion.div>

      {/* Rotating square + diamond — bottom centre-right */}
      <motion.div
        className="hs-shape hs-s3"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 140 140" fill="none">
          <rect x="6" y="6" width="128" height="128" stroke="rgba(255,180,74,0.18)" strokeWidth="0.6"/>
          <rect x="22" y="22" width="96" height="96" stroke="rgba(255,180,74,0.10)" strokeWidth="0.5"/>
          <rect x="6" y="6" width="128" height="128" stroke="rgba(255,122,26,0.08)" strokeWidth="0.4" transform="rotate(45 70 70)"/>
        </svg>
      </motion.div>

      {/* Dashed ring — small, upper left */}
      <motion.div
        className="hs-shape hs-s4"
        animate={{ rotate: -360 }}
        transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 110 110" fill="none">
          <circle cx="55" cy="55" r="50" stroke="rgba(255,122,26,0.18)" strokeWidth="0.6" strokeDasharray="5 7"/>
          <circle cx="55" cy="55" r="32" stroke="rgba(255,122,26,0.10)" strokeWidth="0.5" strokeDasharray="3 5"/>
          <circle cx="55" cy="55" r="14" stroke="rgba(255,122,26,0.06)" strokeWidth="0.4"/>
        </svg>
      </motion.div>

      {/* Tiny orbiter dot — animates around shape-1 */}
      <motion.div
        className="hs-orbiter"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />

      {/* Ambient radial glow */}
      <div className="hs-glow-a" />
      <div className="hs-glow-b" />

      {/* Vignette + bottom content fade */}
      <div className="hs-vignette" />
      <div className="hs-fade" />
    </div>
  );
};

export default HeroScene;
