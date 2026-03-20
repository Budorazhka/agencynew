export default function IconCards({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cardGold" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f0d780" />
          <stop offset="55%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#7a5a1a" />
        </radialGradient>
      </defs>
      {/* Book / cards base */}
      <rect x="12" y="28" width="76" height="54" rx="6" fill="url(#cardGold)" />
      <rect x="16" y="32" width="68" height="46" rx="4" fill="#f5f0e0" />
      {/* Ace of spades */}
      <text x="50" y="62" textAnchor="middle" fontSize="28" fill="#1a1a1a" fontWeight="bold">♠</text>
      <text x="20" y="46" textAnchor="middle" fontSize="12" fill="#1a1a1a" fontWeight="bold">A</text>
      <text x="80" y="72" textAnchor="middle" fontSize="12" fill="#1a1a1a" fontWeight="bold" transform="rotate(180 80 72)">A</text>
      {/* Gold spine */}
      <rect x="47" y="32" width="6" height="46" fill="url(#cardGold)" />
      {/* Cover pages sticking up */}
      <rect x="20" y="20" width="28" height="14" rx="3" fill="#c9a84c" transform="rotate(-8 20 20)" />
      <rect x="52" y="20" width="28" height="14" rx="3" fill="#a07828" transform="rotate(8 80 20)" />
      {/* Shine */}
      <ellipse cx="38" cy="36" rx="10" ry="4" fill="rgba(255,255,255,0.2)" transform="rotate(-10 38 36)" />
    </svg>
  )
}
