// frontend/src/components/ui/DogLogo.tsx
interface DogLogoProps { size?: number; className?: string }

export function DogLogo({ size = 40, className = '' }: DogLogoProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 58 58"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
    >
      {/* Hard Hat */}
      <ellipse cx="29" cy="22" rx="20" ry="4" fill="#f0a500"/>
      <path d="M10 22 Q10 7 29 7 Q48 7 48 22 Z" fill="#f5b820"/>
      <path d="M16 18 Q20 9 29 8 Q24 10 19 18 Z" fill="rgba(255,255,255,.25)"/>
      <path d="M10 22 Q29 25 48 22" stroke="#d4900a" strokeWidth="2" fill="none"/>
      <rect x="27" y="9" width="4" height="10" rx="2" fill="rgba(0,0,0,.14)"/>
      <text x="29" y="19" textAnchor="middle" fontSize="7" fontWeight="900" fill="#3a2200" fontFamily="sans-serif">DC</text>
      {/* Pointy Pinscher ears */}
      <polygon points="14,28 10,10 20,22" fill="#111111"/>
      <polygon points="14.5,27 11.5,13 18.5,22" fill="#5a1a0a"/>
      <polygon points="44,28 48,10 38,22" fill="#111111"/>
      <polygon points="43.5,27 46.5,13 39.5,22" fill="#5a1a0a"/>
      {/* Head */}
      <ellipse cx="29" cy="34" rx="13" ry="13" fill="#111111"/>
      {/* Tan markings */}
      <ellipse cx="23" cy="26" rx="2.2" ry="1.8" fill="#b85c1a"/>
      <ellipse cx="35" cy="26" rx="2.2" ry="1.8" fill="#b85c1a"/>
      <ellipse cx="21" cy="34" rx="3.5" ry="4" fill="#8b3a10"/>
      <ellipse cx="37" cy="34" rx="3.5" ry="4" fill="#8b3a10"/>
      {/* Snout */}
      <ellipse cx="29" cy="40" rx="7" ry="5.5" fill="#7a3210"/>
      <ellipse cx="29" cy="38.5" rx="4" ry="3" fill="#111111"/>
      <ellipse cx="29" cy="37.5" rx="3.2" ry="2" fill="#0a0a0a"/>
      <line x1="29" y1="39.5" x2="29" y2="42" stroke="#0a0a0a" strokeWidth="1.2"/>
      <path d="M24.5 42 Q29 45.5 33.5 42" stroke="#0a0a0a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="29" cy="44.5" rx="3" ry="2.2" fill="#e0406a"/>
      {/* Eyes */}
      <ellipse cx="23" cy="31" rx="3.8" ry="3.5" fill="white"/>
      <ellipse cx="35" cy="31" rx="3.8" ry="3.5" fill="white"/>
      <circle cx="23.5" cy="31.2" r="2.6" fill="#2a1005"/>
      <circle cx="35.5" cy="31.2" r="2.6" fill="#2a1005"/>
      <circle cx="23.8" cy="31.2" r="1.6" fill="#080808"/>
      <circle cx="35.8" cy="31.2" r="1.6" fill="#080808"/>
      <circle cx="24.6" cy="30.1" r=".65" fill="white"/>
      <circle cx="36.6" cy="30.1" r=".65" fill="white"/>
    </svg>
  )
}
