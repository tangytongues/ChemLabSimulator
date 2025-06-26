import { useState } from "react";

interface StirringPlateProps {
  isOn: boolean;
  speed: number; // 0-100
  temperature: number;
  isHeating: boolean;
  onToggle?: () => void;
  onSpeedChange?: (speed: number) => void;
  onHeatToggle?: () => void;
  className?: string;
}

export default function StirringPlate({ 
  isOn, 
  speed, 
  temperature,
  isHeating,
  onToggle, 
  onSpeedChange,
  onHeatToggle,
  className = "" 
}: StirringPlateProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <svg width="200" height="150" viewBox="0 0 200 150" className="drop-shadow-lg">
        {/* Base shadow */}
        <ellipse
          cx="100"
          cy="140"
          rx="80"
          ry="8"
          fill="rgba(0,0,0,0.1)"
        />
        
        {/* Main body */}
        <rect
          x="20"
          y="80"
          width="160"
          height="50"
          rx="25"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
        />
        
        {/* Hot plate surface */}
        <circle
          cx="100"
          cy="70"
          r="35"
          fill={isHeating ? "#fee2e2" : "#f9fafb"}
          stroke={isHeating ? "#ef4444" : "#d1d5db"}
          strokeWidth="2"
          className="transition-all duration-300"
        />
        
        {/* Heating elements (visible when heating) */}
        {isHeating && (
          <g>
            {[0, 1, 2].map(ring => (
              <circle
                key={ring}
                cx="100"
                cy="70"
                r={15 + ring * 8}
                fill="none"
                stroke="#ef4444"
                strokeWidth="1"
                opacity={0.6 - ring * 0.2}
                className="animate-pulse"
              />
            ))}
          </g>
        )}
        
        {/* Stirring indicator */}
        {isOn && speed > 0 && (
          <g>
            <circle
              cx="100"
              cy="70"
              r="20"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4,4"
              className="animate-spin"
              style={{ animationDuration: `${2 - (speed/100)}s` }}
            />
            <circle
              cx="100"
              cy="70"
              r="3"
              fill="#3b82f6"
              className="animate-pulse"
            />
          </g>
        )}
        
        {/* Control panel */}
        <rect
          x="30"
          y="90"
          width="140"
          height="30"
          rx="5"
          fill="#374151"
          stroke="#1f2937"
          strokeWidth="1"
        />
        
        {/* Power button */}
        <circle
          cx="50"
          cy="105"
          r="8"
          fill={isOn ? "#10b981" : "#6b7280"}
          stroke="#374151"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onClick={onToggle}
        />
        
        {/* Speed control knob */}
        <circle
          cx="100"
          cy="105"
          r="10"
          fill="#6b7280"
          stroke="#374151"
          strokeWidth="1"
          className="cursor-pointer"
        />
        
        {/* Speed indicator line */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="95"
          stroke="#374151"
          strokeWidth="2"
          transform={`rotate(${(speed / 100) * 270 - 135} 100 105)`}
        />
        
        {/* Heat button */}
        <circle
          cx="150"
          cy="105"
          r="8"
          fill={isHeating ? "#ef4444" : "#6b7280"}
          stroke="#374151"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onClick={onHeatToggle}
        />
        
        {/* Labels */}
        <text x="50" y="125" textAnchor="middle" fontSize="8" fill="#6b7280">PWR</text>
        <text x="100" y="125" textAnchor="middle" fontSize="8" fill="#6b7280">SPEED</text>
        <text x="150" y="125" textAnchor="middle" fontSize="8" fill="#6b7280">HEAT</text>
        
        {/* Brand */}
        <text x="100" y="140" textAnchor="middle" fontSize="10" fill="#9ca3af" className="font-bold">
          MAGNETIC STIRRER
        </text>
        
        {/* Status LEDs */}
        <circle cx="160" cy="50" r="3" fill={isOn ? "#10b981" : "#6b7280"} className="animate-pulse" />
        <circle cx="170" cy="50" r="3" fill={isHeating ? "#ef4444" : "#6b7280"} className="animate-pulse" />
        
        {/* Temperature display */}
        {isHeating && (
          <g>
            <rect x="120" y="45" width="30" height="12" rx="6" fill="#1f2937" />
            <text x="135" y="53" textAnchor="middle" fontSize="8" fill="#10b981" className="font-mono">
              {Math.round(temperature)}°C
            </text>
          </g>
        )}
      </svg>
      
      {/* Control overlay */}
      {showControls && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-10 rounded-lg flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 border">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Stirring Speed: {speed}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={speed}
                  onChange={(e) => onSpeedChange?.(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={!isOn}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onToggle}
                  className={`px-3 py-1 text-xs rounded ${
                    isOn ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {isOn ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={onHeatToggle}
                  className={`px-3 py-1 text-xs rounded ${
                    isHeating ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {isHeating ? 'HEATING' : 'HEAT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}