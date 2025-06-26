import { useState, useEffect } from "react";

interface ThermometerProps {
  temperature: number;
  minTemp?: number;
  maxTemp?: number;
  unit?: "C" | "F";
  label?: string;
  className?: string;
}

export default function ThermometerComponent({ 
  temperature, 
  minTemp = 0, 
  maxTemp = 100, 
  unit = "C",
  label,
  className = "" 
}: ThermometerProps) {
  const [displayTemp, setDisplayTemp] = useState(temperature);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    // Simulate gradual temperature change
    const interval = setInterval(() => {
      setDisplayTemp(prev => {
        const diff = temperature - prev;
        if (Math.abs(diff) < 0.1) return temperature;
        return prev + diff * 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [temperature]);

  const tempPercentage = Math.min(Math.max((displayTemp - minTemp) / (maxTemp - minTemp), 0), 1);
  const bulbColor = displayTemp > 60 ? "#ef4444" : displayTemp > 30 ? "#f59e0b" : "#3b82f6";

  const handleClick = () => {
    setIsReading(true);
    setTimeout(() => setIsReading(false), 1000);
  };

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <svg width="60" height="200" viewBox="0 0 60 200" className="drop-shadow-md">
        {/* Thermometer body */}
        <rect
          x="25"
          y="20"
          width="10"
          height="140"
          rx="5"
          fill="rgba(255, 255, 255, 0.9)"
          stroke="#d1d5db"
          strokeWidth="2"
        />
        
        {/* Temperature scale */}
        {[0, 20, 40, 60, 80, 100].map((temp, index) => {
          const y = 150 - ((temp - minTemp) / (maxTemp - minTemp)) * 120;
          if (y < 20 || y > 160) return null;
          
          return (
            <g key={index}>
              <line
                x1="20"
                y1={y}
                x2="25"
                y2={y}
                stroke="#6b7280"
                strokeWidth="1"
              />
              <text
                x="18"
                y={y + 2}
                textAnchor="end"
                fontSize="8"
                fill="#6b7280"
                className="font-mono"
              >
                {temp}°
              </text>
            </g>
          );
        })}
        
        {/* Mercury/alcohol column */}
        <rect
          x="27"
          y={160 - (tempPercentage * 120)}
          width="6"
          height={tempPercentage * 120 + 20}
          rx="3"
          fill={bulbColor}
          className="transition-all duration-300"
        />
        
        {/* Thermometer bulb */}
        <circle
          cx="30"
          cy="170"
          r="10"
          fill={bulbColor}
          stroke="#d1d5db"
          strokeWidth="2"
          className={`transition-all duration-300 ${isReading ? 'animate-pulse' : ''}`}
        />
        
        {/* Digital display */}
        <rect
          x="5"
          y="5"
          width="50"
          height="20"
          rx="3"
          fill="#1f2937"
          stroke="#374151"
          strokeWidth="1"
        />
        
        <text
          x="30"
          y="17"
          textAnchor="middle"
          fontSize="10"
          fill="#10b981"
          className="font-mono font-bold"
        >
          {displayTemp.toFixed(1)}°{unit}
        </text>
        
        {/* Reading indicator */}
        {isReading && (
          <circle
            cx="45"
            cy="10"
            r="2"
            fill="#10b981"
            className="animate-ping"
          />
        )}
        
        {/* Label */}
        {label && (
          <text
            x="30"
            y="195"
            textAnchor="middle"
            fontSize="8"
            fill="#6b7280"
            className="font-medium"
          >
            {label}
          </text>
        )}
        
        {/* Temperature range indicator */}
        <rect
          x="38"
          y="20"
          width="3"
          height="140"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        
        {/* Current temperature marker */}
        <polygon
          points={`42,${160 - (tempPercentage * 120)} 48,${160 - (tempPercentage * 120) - 3} 48,${160 - (tempPercentage * 120) + 3}`}
          fill="#ef4444"
          stroke="#dc2626"
          strokeWidth="1"
          className="transition-all duration-300"
        />
      </svg>
      
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        Click to take reading
      </div>
    </div>
  );
}