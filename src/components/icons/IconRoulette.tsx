export default function IconRoulette({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="roulGold" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f0d780" />
          <stop offset="55%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#7a5a1a" />
        </radialGradient>
        <radialGradient id="roulDark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e3a28" />
          <stop offset="100%" stopColor="#0a1a10" />
        </radialGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="50" cy="55" r="38" fill="url(#roulGold)" />
      <circle cx="50" cy="55" r="32" fill="url(#roulDark)" />
      {/* Spokes */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line key={i}
          x1="50" y1="55"
          x2={50 + 30 * Math.cos((deg - 90) * Math.PI / 180)}
          y2={55 + 30 * Math.sin((deg - 90) * Math.PI / 180)}
          stroke="#c9a84c" strokeWidth="1.5" />
      ))}
      {/* Inner circle */}
      <circle cx="50" cy="55" r="10" fill="url(#roulGold)" />
      <circle cx="50" cy="55" r="6" fill="url(#roulDark)" />
      {/* Chips in front */}
      <ellipse cx="32" cy="72" rx="12" ry="6" fill="#c9a84c" stroke="#f0d780" strokeWidth="1" />
      <ellipse cx="32" cy="69" rx="12" ry="6" fill="#8b3a3a" stroke="#c9a84c" strokeWidth="1" />
      <ellipse cx="32" cy="66" rx="12" ry="6" fill="#c9a84c" stroke="#f0d780" strokeWidth="1" />
      <ellipse cx="46" cy="76" rx="10" ry="5" fill="#1a4f8a" stroke="#c9a84c" strokeWidth="1" />
      <ellipse cx="46" cy="73" rx="10" ry="5" fill="#c9a84c" stroke="#f0d780" strokeWidth="1" />
      {/* Ball */}
      <circle cx="68" cy="38" r="5" fill="white" />
      <circle cx="66" cy="36" r="1.5" fill="rgba(255,255,255,0.8)" />
    </svg>
  )
}
