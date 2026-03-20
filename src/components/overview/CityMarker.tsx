import { useState } from 'react'
import type { CityMapPoint } from '@/types/dashboard'

interface CityMarkerProps {
  city: CityMapPoint
}

export function CityMarker({ city }: CityMarkerProps) {
  const [hovered, setHovered] = useState(false)
  const [labelX, labelY] = city.labelOffset ?? [0, -18]

  return (
    <g className="cursor-pointer" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <circle cx={0} cy={0} r="12" fill="rgba(59,130,246,0.1)">
        <animate attributeName="r" values="8;18;8" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0;0.7" dur="2.5s" repeatCount="indefinite" />
      </circle>

      <circle
        cx={0}
        cy={0}
        r="8"
        fill="rgba(59,130,246,0.15)"
        stroke="rgba(59,130,246,0.35)"
        strokeWidth="1"
      />

      <circle
        cx={0}
        cy={0}
        r={hovered ? 6 : 4.5}
        fill="#3b82f6"
        style={{ transition: 'all 0.2s ease' }}
      />

      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fill="#1e293b"
        fontSize="11"
        fontWeight="600"
        fontFamily="'Montserrat', sans-serif"
      >
        {city.name}
      </text>

      {hovered && (
        <foreignObject x={-85} y={18} width="170" height="72">
          <div
            style={{
              background: 'white',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              padding: '10px 12px',
              fontSize: '11px',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 3 }}>{city.name}</div>
            <div style={{ color: '#64748b' }}>Партнеров: {city.partnersCount}</div>
            <div style={{ color: '#64748b' }}>Оборот: ${city.totalRevenue.toLocaleString('ru-RU')}</div>
          </div>
        </foreignObject>
      )}
    </g>
  )
}
