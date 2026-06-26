import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * NocturneCore — A dynamic, interactive 3D ASCII mainframe core visualization.
 * Uses 3D projection, depth buffering, and interactive mouse-tracking to render
 * a spinning, glowing mainframe node that glitches on click.
 */
export default function NocturneCore() {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [shakeActive, setShakeActive] = useState(false);

  // Buffer dimensions
  const WIDTH = 56;
  const HEIGHT = 26;

  // 1. Generate 3D points on a sphere (Fibonacci lattice)
  const corePoints = useMemo(() => {
    const points = [];
    const count = 220; // Resolution of the sphere core
    const radius = 7.5;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden spiral angle (~2.3999 rad)

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // from 1 to -1
      const r = Math.sqrt(1 - y * y); // radius at y slice
      const theta = goldenAngle * i;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      // Core glyph elements: 1s, 0s, and connection nodes
      const char = Math.random() > 0.65 ? '1' : Math.random() > 0.45 ? '0' : Math.random() > 0.35 ? '+' : ' ';
      if (char !== ' ') {
        points.push({ x: x * radius, y: y * radius, z: z * radius, char, type: 'core' });
      }
    }
    return points;
  }, []);

  // 2. Generate 3D points for Orbiting Rings
  const ringPoints = useMemo(() => {
    const points = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;

      // Ring 1: Horizontal XZ ring wrapping the core
      const x1 = Math.cos(angle) * 12;
      const y1 = 0;
      const z1 = Math.sin(angle) * 12;
      const char1 = i % 6 === 0 ? '■' : i % 2 === 0 ? '[' : ']';
      points.push({ x: x1, y: y1, z: z1, char: char1, type: 'ring1' });

      // Ring 2: Tilted YZ/XZ ring
      const x2 = Math.cos(angle) * 13.5;
      const y2 = Math.sin(angle) * 13.5 * 0.65;
      const z2 = Math.sin(angle) * 13.5 * 0.65;
      const char2 = i % 4 === 0 ? '+' : i % 2 === 0 ? '/' : '\\';
      points.push({ x: x2, y: y2, z: z2, char: char2, type: 'ring2' });
    }
    return points;
  }, []);

  // 3. Dynamic Orbiting Shards (Text indicators floating in space)
  const shardList = useRef([
    { text: 'SYS_ONLINE', angle: 0, speed: 0.015, height: -3, radius: 15 },
    { text: 'SEC_LEVEL_0', angle: Math.PI * 0.5, speed: 0.012, height: 4, radius: 15.5 },
    { text: 'CORE_SYNC', angle: Math.PI, speed: 0.018, height: -1, radius: 16 },
    { text: 'PORT_4000_OK', angle: Math.PI * 1.5, speed: 0.010, height: 2, radius: 15.5 }
  ]);

  // Click handler to trigger glitch & shake
  const handleCoreClick = () => {
    if (glitchActive) return;
    setGlitchActive(true);
    setShakeActive(true);

    // Randomize log data/glitch triggers
    setTimeout(() => setShakeActive(false), 450);
    setTimeout(() => setGlitchActive(false), 900);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Map coords from -1 to 1
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseRef.current = { x, y };
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseRef.current = { x: 0, y: 0 };
  };

  // Main mathematical animation and projection loop
  useEffect(() => {
    let animFrameId;
    let yaw = 0;     // Y-axis rotation
    let pitch = 0;   // X-axis rotation
    let roll = 0;    // Z-axis rotation

    // Keep track of target angles (smooth interpolation)
    let currentXInterp = 0;
    let currentYInterp = 0;

    const render = () => {
      // Rotation velocities (spin faster on hover/glitch)
      const baseSpeed = glitchActive ? 0.05 : isHovered ? 0.025 : 0.007;
      yaw += baseSpeed;
      roll += baseSpeed * 0.5;

      // Mouse interactive tilt interpolation
      currentXInterp += (mouseRef.current.y * 0.6 - currentXInterp) * 0.1;
      currentYInterp += (mouseRef.current.x * 0.6 - currentYInterp) * 0.1;
      pitch = currentXInterp;

      // 3D projection setup
      const D = 40; // Camera distance
      const frameBuffer = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(' '));
      const zBuffer = Array(HEIGHT).fill(null).map(() => Array(WIDTH).fill(10000)); // Lower = closer

      // Rotation matrix helpers
      const cosX = Math.cos(pitch), sinX = Math.sin(pitch);
      const cosY = Math.cos(yaw + currentYInterp), sinY = Math.sin(yaw + currentYInterp);
      const cosZ = Math.cos(roll), sinZ = Math.sin(roll);

      const projectAndPlot = (points, charColorClass, overrideChar = null) => {
        for (const pt of points) {
          // 1. Rotate Y-axis (Yaw)
          let x1 = pt.x * cosY + pt.z * sinY;
          let z1 = -pt.x * sinY + pt.z * cosY;
          let y1 = pt.y;

          // 2. Rotate X-axis (Pitch)
          let y2 = y1 * cosX - z1 * sinX;
          let z2 = y1 * sinX + z1 * cosX;
          let x2 = x1;

          // 3. Rotate Z-axis (Roll)
          let x3 = x2 * cosZ - y2 * sinZ;
          let y3 = x2 * sinZ + y2 * cosZ;
          let z3 = z2;

          // 4. Perspective Projection
          const scale = D / (z3 + D);
          const px = x3 * scale;
          const py = y3 * scale;

          // 5. aspect-ratio adjust (horizontal stretch because monospace font characters are taller than wide)
          const col = Math.round(WIDTH / 2 + px * 1.8);
          const row = Math.round(HEIGHT / 2 + py);

          // 6. Draw with Z-buffering (depth check)
          if (col >= 0 && col < WIDTH && row >= 0 && row < HEIGHT) {
            if (z3 < zBuffer[row][col]) {
              zBuffer[row][col] = z3;
              frameBuffer[row][col] = overrideChar || pt.char;
            }
          }
        }
      };

      // 1. Project & Draw Core Sphere
      projectAndPlot(corePoints);

      // 2. Project & Draw Rings
      projectAndPlot(ringPoints);

      // 3. Project & Draw Orbiting Shards
      const activeShards = shardList.current.map((shard) => {
        // Increment angles
        shard.angle += shard.speed * (glitchActive ? 2.5 : isHovered ? 1.5 : 1);
        
        // Calculate points for the string
        const points = [];
        const text = shard.text;
        
        // Render characters of the shard string along a circular path segment
        for (let charIdx = 0; charIdx < text.length; charIdx++) {
          const charAngle = shard.angle + (charIdx * 0.08); // space character coordinates along radius
          const x = Math.cos(charAngle) * shard.radius;
          const z = Math.sin(charAngle) * shard.radius;
          points.push({
            x,
            y: shard.height,
            z,
            char: text[charIdx]
          });
        }
        return points;
      });

      activeShards.forEach((points) => {
        projectAndPlot(points);
      });

      // 4. Convert Buffer to ASCII block
      const asciiStr = frameBuffer.map(row => row.join('')).join('\n');
      
      // Update DOM directly for high-performance zero-react-lag updates
      const layers = containerRef.current?.querySelectorAll('.ao-ascii-text');
      if (layers) {
        layers.forEach(layer => {
          layer.textContent = asciiStr;
        });
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameId);
  }, [isHovered, glitchActive, corePoints, ringPoints]);

  return (
    <div
      ref={containerRef}
      onClick={handleCoreClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`ao-wrap select-none mx-auto ${shakeActive ? 'ao-shake' : ''} ${glitchActive ? 'ao-glitching' : ''}`}
      title="Click to trigger system glitch shake"
    >
      {/* Background Pulse Glow */}
      <div className="ao-halo" />

      {/* Base Layer */}
      <pre className="ao-layer ao-ascii ao-ascii-text" />

      {/* Orbiting Ring styling overlays */}
      <pre className="ao-layer ao-rings ao-ascii-text" />
      <pre className="ao-layer ao-particles ao-ascii-text" />

      {/* Offset color layers for mix-blend glitch split */}
      <pre className="ao-layer ao-glitch ao-glitch-red ao-ascii-text" />
      <pre className="ao-layer ao-glitch ao-glitch-cyan ao-ascii-text" />
    </div>
  );
}
