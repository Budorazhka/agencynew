export default function IconPokerChip({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="chipGold" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f0d780" />
          <stop offset="55%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#7a5a1a" />
        </radialGradient>
        <radialGradient id="chipDark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e3a28" />
          <stop offset="100%" stopColor="#0a1a10" />
        </radialGradient>
      </defs>
      {/* Chip body */}
      <circle cx="50" cy="50" r="42" fill="url(#chipGold)" />
      <circle cx="50" cy="50" r="35" fill="url(#chipDark)" />
      {/* Notches */}
      {[0,60,120,180,240,300].map((deg, i) => (
        <rect key={i}
          x="47" y="9"
          width="6" height="10"
          rx="2"
          fill="#c9a84c"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      {/* Person silhouette */}
      <circle cx="50" cy="38" r="9" fill="#c9a84c" />
      <path d="M30 64 Q30 52 50 52 Q70 52 70 64" fill="#c9a84c" />
      {/* Shine */}
      <ellipse cx="42" cy="28" rx="7" ry="4" fill="rgba(255,255,255,0.2)" transform="rotate(-20 42 28)" />
    </svg>
  )
}
