import { useState } from "react";

interface BurnerProps {
  isOn: boolean;
  intensity: number; // 0-100
  onToggle?: () => void;
  onIntensityChange?: (intensity: number) => void;
  className?: string;
}

export default function BurnerComponent({ 
  isOn, 
  intensity, 
  onToggle, 
  onIntensityChange,
  className = "" 
}: BurnerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const flameColors = [
    "#3b82f6", // Blue (hottest)
    "#06b6d4", // Cyan
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#ef4444"  // Red (coolest)
  ];

  const getFlameColor = (level: number) => {
    const index = Math.floor((level / 100) * (flameColors.length - 1));
    return flameColors[Math.min(index, flameColors.length - 1)];
  };

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggle}
    >
      <svg width="150" height="200" viewBox="0 0 150 200" className="drop-shadow-lg">
        {/* Base shadow */}
        <ellipse
          cx="75"
          cy="190"
          rx="40"
          ry="5"
          fill="rgba(0,0,0,0.2)"
        />
        
        {/* Burner base */}
        <rect
          x="25"
          y="160"
          width="100"
          height="30"
          rx="5"
          fill="#4b5563"
          stroke="#374151"
          strokeWidth="2"
        />
        
        {/* Control knob */}
        <circle
          cx="135"
          cy="175"
          r="12"
          fill="#6b7280"
          stroke="#374151"
          strokeWidth="2"
          className="cursor-pointer"
        />
        
        {/* Knob indicator */}
        <line
          x1="135"
          y1="170"
          x2="135"
          y2="165"
          stroke="#374151"
          strokeWidth="2"
          transform={`rotate(${(intensity / 100) * 270 - 135} 135 175)`}
        />
        
        {/* Gas jets */}
        {[30, 45, 60, 75, 90, 105, 120].map((x, index) => (
          <circle
            key={index}
            cx={x}
            cy="160"
            r="2"
            fill="#374151"
          />
        ))}
        
        {/* Flame ring (when on) */}
        {isOn && (
          <g>
            {/* Main flame ring */}
            {[30, 45, 60, 75, 90, 105, 120].map((x, index) => {
              const flameHeight = 20 + (intensity / 100) * 40;
              const flameWidth = 4 + (intensity / 100) * 6;
              const flickerOffset = Math.sin(Date.now() / 100 + index) * 2;
              
              return (
                <g key={index}>
                  {/* Outer flame */}
                  <ellipse
                    cx={x}
                    cy={160 - flameHeight / 2 + flickerOffset}
                    rx={flameWidth / 2}
                    ry={flameHeight / 2}
                    fill={getFlameColor(intensity)}
                    opacity="0.8"
                    className="animate-pulse"
                  />
                  
                  {/* Inner flame */}
                  <ellipse
                    cx={x}
                    cy={160 - flameHeight / 3 + flickerOffset}
                    rx={flameWidth / 3}
                    ry={flameHeight / 3}
                    fill="#3b82f6"
                    opacity="0.9"
                    className="animate-pulse"
                  />
                </g>
              );
            })}
            
            {/* Heat waves */}
            <g className="opacity-30">
              {[0, 1, 2, 3].map(i => (
                <path
                  key={i}
                  d={`M ${60 + i * 10} ${140 - intensity / 5} Q ${65 + i * 10} ${135 - intensity / 5} ${60 + i * 10} ${130 - intensity / 5} Q ${55 + i * 10} ${125 - intensity / 5} ${60 + i * 10} ${120 - intensity / 5}`}
                  stroke="rgba(255, 100, 100, 0.5)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </g>
          </g>
        )}
        
        {/* Status indicator */}
        <circle
          cx="20"
          cy="175"
          r="4"
          fill={isOn ? "#10b981" : "#6b7280"}
          className="animate-pulse"
        />
        
        {/* Brand label */}
        <text
          x="75"
          y="185"
          textAnchor="middle"
          fontSize="8"
          fill="#9ca3af"
          className="font-bold"
        >
          BUNSEN
        </text>
      </svg>
      
      {/* Intensity slider (appears on hover) */}
      {isHovered && isOn && (
        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg p-2 border">
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => onIntensityChange?.(parseInt(e.target.value))}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #ef4444 100%)`
            }}
          />
          <div className="text-xs text-center mt-1 text-gray-600">
            {intensity}%
          </div>
        </div>
      )}
      
      {/* Control tooltip */}
      {isHovered && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">
          {isOn ? `${intensity}% intensity` : "Click to ignite"}
        </div>
      )}
    </div>
  );
}