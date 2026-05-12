'use client';

import { useState, useCallback } from 'react';

interface KleoLogoProps {
  size?: number;
  bgColor?: string;
  accentColor?: string;
  interactive?: boolean;
}

const SEGMENTS = [0, 45, 90, 135, 180, 225, 270, 315];

export default function KleoLogo({
  size = 80,
  bgColor = '#F2F1EE',
  accentColor = '#505A98',
  interactive = false,
}: KleoLogoProps) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleClick = useCallback(() => {
    if (!interactive) return;
    setClicked(true);
    setTimeout(() => setClicked(false), 700);
  }, [interactive]);

  const animDuration = clicked ? '0.35s' : hovered ? '1.4s' : '3s';

  return (
    <>
      <style>{`
        @keyframes segBreathe {
          0%, 100% { transform: scale(1); opacity: 0.82; }
          50%       { transform: scale(1.22); opacity: 1; }
        }
        @keyframes segBurst {
          0%   { transform: scale(1);    opacity: 1; }
          40%  { transform: scale(1.45); opacity: 1; }
          100% { transform: scale(1);    opacity: 0.82; }
        }
        @keyframes corePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.75; }
        }
      `}</style>

      <svg
        viewBox="0 0 240 240"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ cursor: interactive ? 'pointer' : 'default', display: 'block' }}
        onMouseEnter={() => interactive && setHovered(true)}
        onMouseLeave={() => interactive && setHovered(false)}
        onClick={handleClick}
      >
        {/* Outer segments — each animates from its own center */}
        {SEGMENTS.map((deg, i) => (
          <rect
            key={deg}
            x="106"
            y="64"
            width="28"
            height="22"
            rx="5"
            fill={accentColor}
            transform={`rotate(${deg} 120 120)`}
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animation: clicked
                ? `segBurst ${animDuration} ease-out forwards`
                : `segBreathe ${animDuration} ease-in-out ${i * (parseFloat(animDuration) / SEGMENTS.length * 0.15)}s infinite`,
              willChange: 'transform, opacity',
            }}
          />
        ))}

        {/* Concentric rings */}
        <circle cx="120" cy="120" r="52" fill={bgColor} />
        <circle
          cx="120" cy="120" r="42" fill={accentColor}
          style={{
            animation: `corePulse ${animDuration} ease-in-out infinite`,
            transformOrigin: 'center',
            transformBox: 'fill-box',
          }}
        />
        <circle cx="120" cy="120" r="24" fill={bgColor} />
        <circle cx="120" cy="120" r="10" fill={accentColor} />
        <circle cx="120" cy="120" r="4"  fill={bgColor} />
      </svg>
    </>
  );
}
