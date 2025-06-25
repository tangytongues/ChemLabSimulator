import { useState } from "react";

interface FlaskProps {
  contents: Array<{ color: string; level: number; name: string }>;
  temperature: number;
  isHeating: boolean;
  bubbles: Array<{ id: number; x: number; y: number; size: number; opacity: number }>;
  stirringAngle: number;
  isStirring: boolean;
  className?: string;
  onDrop?: () => void;
}

export default function FlaskComponent({ 
  contents, 
  temperature, 
  isHeating, 
  bubbles, 
  stirringAngle, 
  isStirring,
  className = "",
  onDrop 
}: FlaskProps) {
  const [isHovered, setIsHovered] = useState(false);

  const totalLevel = contents.reduce((sum, content) => sum + content.level, 0);
  const maxLevel = 80; // Maximum fill percentage

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Flask SVG */}
      <svg
        width="200"
        height="300"
        viewBox="0 0 200 300"
        className="drop-shadow-lg"
      >
        {/* Flask shadow */}
        <ellipse
          cx="100"
          cy="285"
          rx="45"
          ry="8"
          fill="rgba(0,0,0,0.1)"
        />
        
        {/* Flask body */}
        <path
          d="M 60 120 L 60 240 Q 60 260 80 260 L 120 260 Q 140 260 140 240 L 140 120 Z"
          fill="rgba(220, 240, 255, 0.1)"
          stroke="#2563eb"
          strokeWidth="3"
          className="transition-all duration-300"
        />
        
        {/* Flask neck */}
        <rect
          x="85"
          y="20"
          width="30"
          height="100"
          fill="rgba(220, 240, 255, 0.05)"
          stroke="#2563eb"
          strokeWidth="3"
          rx="2"
        />
        
        {/* Flask mouth */}
        <rect
          x="80"
          y="15"
          width="40"
          height="10"
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          rx="5"
        />
        
        {/* Measurement marks */}
        {[25, 50, 75].map((mark, index) => (
          <g key={index}>
            <line
              x1="140"
              y1={240 - (mark * 1.2)}
              x2="150"
              y2={240 - (mark * 1.2)}
              stroke="#64748b"
              strokeWidth="1"
            />
            <text
              x="155"
              y={240 - (mark * 1.2) + 3}
              fontSize="8"
              fill="#64748b"
              className="font-mono"
            >
              {mark}ml
            </text>
          </g>
        ))}
        
        {/* Liquid contents */}
        {contents.map((content, index) => {
          const previousLevels = contents.slice(0, index).reduce((sum, c) => sum + c.level, 0);
          const liquidHeight = Math.min(content.level, maxLevel - previousLevels);
          const yPosition = 240 - ((previousLevels + liquidHeight) * 1.2);
          
          return (
            <rect
              key={index}
              x="63"
              y={yPosition}
              width="74"
              height={liquidHeight * 1.2}
              fill={content.color}
              opacity="0.8"
              className="transition-all duration-500"
            />
          );
        })}
        
        {/* Liquid surface with animation */}
        {totalLevel > 0 && (
          <ellipse
            cx="100"
            cy={240 - (totalLevel * 1.2)}
            rx="37"
            ry="3"
            fill={contents[contents.length - 1]?.color || "#3b82f6"}
            opacity="0.6"
            className={isStirring ? "animate-pulse" : ""}
          />
        )}
        
        {/* Bubbles */}
        {bubbles.map(bubble => (
          <circle
            key={bubble.id}
            cx={60 + (bubble.x / 100) * 80}
            cy={240 - (bubble.y / 100) * 120}
            r={bubble.size / 2}
            fill="rgba(255, 255, 255, 0.8)"
            opacity={bubble.opacity}
            className="animate-pulse"
          />
        ))}
        
        {/* Stirring rod */}
        {isStirring && (
          <g transform={`translate(100, 180) rotate(${stirringAngle})`}>
            <line
              x1="0"
              y1="-40"
              x2="0"
              y2="40"
              stroke="#64748b"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            <circle
              cx="0"
              cy="35"
              r="3"
              fill="#64748b"
            />
          </g>
        )}
        
        {/* Heat waves */}
        {isHeating && (
          <g className="animate-pulse">
            {[0, 1, 2].map(i => (
              <path
                key={i}
                d={`M ${85 + i * 15} 265 Q ${90 + i * 15} 270 ${85 + i * 15} 275 Q ${80 + i * 15} 280 ${85 + i * 15} 285`}
                stroke="#ef4444"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                className="animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </g>
        )}
        
        {/* Temperature indicator */}
        {temperature > 25 && (
          <g>
            <rect
              x="10"
              y="50"
              width="30"
              height="15"
              rx="7"
              fill={temperature > 60 ? "#ef4444" : "#f59e0b"}
              opacity="0.9"
            />
            <text
              x="25"
              y="60"
              textAnchor="middle"
              fontSize="10"
              fill="white"
              className="font-bold"
            >
              {Math.round(temperature)}°C
            </text>
          </g>
        )}
        
        {/* Glow effect when hovered */}
        {isHovered && (
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        )}
      </svg>
      
      {/* Drop zone indicator */}
      {isHovered && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 bg-opacity-20 flex items-center justify-center">
          <div className="text-blue-600 font-medium text-sm bg-white px-2 py-1 rounded shadow">
            Drop chemicals here
          </div>
        </div>
      )}
    </div>
  );
}