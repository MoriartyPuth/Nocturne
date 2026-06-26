import { useEffect, useRef } from 'react';

export default function TerminalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const CHARS = "#!/bin/bash>nmap-sS-sV>sqlmap-u>curl-X>python3>msfvenom>ssh>nikto>hydra>john>wireshark>burpsuite>grep>chmod>netstat>tcpdump>git>docker>AUTH>SELECT>whoami>uname>sudo>exit>/|\\{}[]();";
    const FS = 14;

    let cols;
    let streams;

    const mkStream = (randomY) => {
      const len = 8 + Math.floor(Math.random() * 24);
      return {
        y: randomY ? Math.random() * 80 : -len - Math.random() * 60,
        speed: 0.4 + Math.random() * 1.6,
        len,
      };
    };

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / FS);
      streams = Array.from({ length: cols }, () => {
        const s = mkStream(false);
        s.y = Math.random() * (canvas.height / FS);
        return s;
      });
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(11, 15, 12, 0.14)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FS}px monospace`;

      for (let i = 0; i < cols; i++) {
        const s = streams[i];
        if (!s) continue;
        s.y += s.speed;

        for (let j = 0; j < s.len; j++) {
          const cy = (s.y - j) * FS;
          if (cy < -FS || cy > canvas.height + FS) continue;

          const idx = Math.floor(Math.abs(s.y - j) * 17) % CHARS.length;
          const char = CHARS[idx];

          if (j === 0) {
            ctx.fillStyle = '#4ade80'; // Bright head
          } else {
            ctx.fillStyle = `rgba(34, 197, 94, ${1 - j / s.len})`; // Fading tail
          }
          ctx.fillText(char, i * FS, cy);
        }

        if ((s.y - s.len) * FS > canvas.height) {
          streams[i] = mkStream(false);
        }
      }
    };

    init();
    const interval = setInterval(draw, 50);

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="matrix-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -7, opacity: 0.09 }}
    />
  );
}
