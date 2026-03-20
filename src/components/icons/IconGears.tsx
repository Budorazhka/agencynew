export default function IconGears({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gearGold" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f0d780" />
          <stop offset="55%" stopColor="#c9a84c" />
          <stop offset="100%" stopColor="#7a5a1a" />
        </radialGradient>
        <radialGradient id="gearGold2" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e0c870" />
          <stop offset="55%" stopColor="#b09040" />
          <stop offset="100%" stopColor="#6a4a10" />
        </radialGradient>
      </defs>
      {/* Big gear */}
      {[0,36,72,108,144,180,216,252,288,324].map((deg, i) => (
        <rect key={i}
          x="33" y="10"
          width="10" height="15"
          rx="2"
          fill="url(#gearGold)"
          transform={`rotate(${deg} 38 48)`}
        />
      ))}
      <circle cx="38" cy="48" r="24" fill="url(#gearGold)" />
      <circle cx="38" cy="48" r="10" fill="#0d2818" />
      <circle cx="38" cy="48" r="5" fill="url(#gearGold)" />
      {/* Small gear */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <rect key={i}
          x="62" y="50"
          width="7" height="11"
          rx="2"
          fill="url(#gearGold2)"
          transform={`rotate(${deg} 65.5 75)`}
        />
      ))}
      <circle cx="65" cy="75" r="17" fill="url(#gearGold2)" />
      <circle cx="65" cy="75" r="7" fill="#0d2818" />
      <circle cx="65" cy="75" r="3" fill="url(#gearGold2)" />
      {/* Green gem on small gear */}
      <circle cx="65" cy="75" r="3" fill="#2a8a4a" />
      <circle cx="64" cy="74" r="1" fill="rgba(255,255,255,0.5)" />
    </svg>
  )
}
