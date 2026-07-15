import { useEffect, useRef } from 'react';

interface BackgroundNetworkProps {
  showNodes?: boolean;
  opacity?: number;
  speed?: number;
  density?: number;
}

export default function BackgroundNetwork({
  showNodes = true,
  opacity = 0.5,
  speed = 0.6,
  density = 70,
}: BackgroundNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef({ opacity, speed });

  // Sync opacity and speed refs dynamically to allow smooth sliders without animation reset
  useEffect(() => {
    settingsRef.current = { opacity, speed };
  }, [opacity, speed]);

  useEffect(() => {
    if (!showNodes) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth || 1200);
    let height = (canvas.height = window.innerHeight || 800);

    // Particle class definition
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }

    const particles: Particle[] = [];

    const initParticles = (w: number, h: number) => {
      particles.length = 0;
      const count = Math.max(30, Math.min(density, Math.floor((w * h) / 12000)));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.45, // Gentle slow drift
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 2.5 + 1.2, // Slightly larger, more tactile nodes
        });
      }
    };

    // Initialize particles with safeguards
    initParticles(width, height);

    // Keep track of mouse position
    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 140, // Mouse connection distance
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      const oldWidth = width;
      const oldHeight = height;
      width = canvas.width = window.innerWidth || 1200;
      height = canvas.height = window.innerHeight || 800;

      // Re-initialize particles if viewport size changed from zero or was extremely small,
      // or if particles array is somehow empty.
      if (oldWidth < 100 || oldHeight < 100 || particles.length === 0) {
        initParticles(width, height);
      } else {
        // Dynamically adjust out-of-bounds particles to keep them on screen
        particles.forEach(p => {
          if (p.x > width) p.x = Math.random() * width;
          if (p.y > height) p.y = Math.random() * height;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      particles.forEach((p) => {
        // Move according to speed setting
        p.x += p.vx * settingsRef.current.speed;
        p.y += p.vy * settingsRef.current.speed;

        // Interactive mouse interaction: gently push particles away from cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            const angle = Math.atan2(dy, dx);
            // Dynamic acceleration away from mouse, scaled by speed setting
            p.x += Math.cos(angle) * force * 1.2 * settingsRef.current.speed;
            p.y += Math.sin(angle) * force * 1.2 * settingsRef.current.speed;
          }
        }

        // Bounce off walls with margin to avoid sticking
        if (p.x < 0) {
          p.x = 0;
          p.vx = Math.abs(p.vx);
        } else if (p.x > width) {
          p.x = width;
          p.vx = -Math.abs(p.vx);
        }

        if (p.y < 0) {
          p.y = 0;
          p.vy = Math.abs(p.vy);
        } else if (p.y > height) {
          p.y = height;
          p.vy = -Math.abs(p.vy);
        }

        // Draw particle (Teal brand subtle dot)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // High visibility base opacity: 0.45, scaled by setting
        ctx.fillStyle = `rgba(14, 116, 144, ${0.45 * settingsRef.current.opacity})`;
        ctx.fill();
      });

      // Draw connection lines
      const maxDistance = 150;
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];

        // Draw lines to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            // Enhanced baseline alpha: 0.42, scaled by setting
            const baseAlpha = (1 - dist / maxDistance) * 0.42;
            const alpha = baseAlpha * settingsRef.current.opacity;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = `rgba(14, 116, 144, ${alpha})`;
            ctx.lineWidth = 1.05;
            ctx.stroke();
          }
        }

        // Draw line to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = pi.x - mouse.x;
          const dy = pi.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            // Stronger connection to mouse pointer, baseline 0.6
            const baseAlpha = (1 - dist / mouse.radius) * 0.6;
            const alpha = baseAlpha * settingsRef.current.opacity;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(14, 116, 144, ${alpha})`;
            ctx.lineWidth = 1.45;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [density, showNodes]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
