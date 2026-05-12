interface KleoLogoProps {
  size?: number;
  animate?: boolean;
  bgColor?: string;
  accentColor?: string;
}

export default function KleoLogo({
  size = 80,
  animate = false,
  bgColor = '#F2F1EE',
  accentColor = '#505A98',
}: KleoLogoProps) {
  const segments = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div
      className={animate ? 'animate-breathe' : ''}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 240 240"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {segments.map((deg) => (
          <rect
            key={deg}
            x="106"
            y="64"
            width="28"
            height="22"
            rx="5"
            fill={accentColor}
            transform={`rotate(${deg} 120 120)`}
          />
        ))}
        <circle cx="120" cy="120" r="52" fill={bgColor} />
        <circle cx="120" cy="120" r="42" fill={accentColor} />
        <circle cx="120" cy="120" r="24" fill={bgColor} />
        <circle cx="120" cy="120" r="10" fill={accentColor} />
        <circle cx="120" cy="120" r="4" fill={bgColor} />
      </svg>
    </div>
  );
}
