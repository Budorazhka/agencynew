export default function IconHouse({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="houseGold" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f0d780" />
          <stop offset="50%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#7a5a1a" />
        </radialGradient>
        <radialGradient id="houseDark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e4a28" />
          <stop offset="100%" stopColor="#0a2010" />
        </radialGradient>
      </defs>
      {/* Crown */}
      <path d="M50 6 L58 16 L68 10 L64 22 L36 22 L32 10 L42 16 Z" fill="url(#houseGold)" />
      {/* Roof */}
      <path d="M50 24 L82 52 L18 52 Z" fill="url(#houseGold)" />
      {/* Body */}
      <rect x="24" y="50" width="52" height="38" rx="2" fill="url(#houseGold)" />
      {/* Door */}
      <rect x="40" y="65" width="20" height="23" rx="3" fill="url(#houseDark)" />
      {/* Windows */}
      <rect x="28" y="57" width="13" height="10" rx="2" fill="url(#houseDark)" />
      <rect x="59" y="57" width="13" height="10" rx="2" fill="url(#houseDark)" />
      {/* Shine */}
      <ellipse cx="42" cy="32" rx="6" ry="3" fill="rgba(255,255,255,0.25)" transform="rotate(-30 42 32)" />
    </svg>
  )
}
