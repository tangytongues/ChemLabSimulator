import { useState } from "react";

interface BeakerProps {
  size: "small" | "medium" | "large";
  contents?: {
    color: string;
    level: number;
    name: string;
  };
  temperature?: number;
  isHeating?: boolean;
  label?: string;
  className?: string;
  onDrop?: () => void;
}

export default function BeakerComponent({ 
  size, 
  contents, 
  temperature = 22, 
  isHeating = false, 
  label,
  className = "",
  onDrop 
}: BeakerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const dimensions = {
    small: { width: 80, height: 100, viewBox: "0 0 80 100" },
    medium: { width: 120, height: 140, viewBox: "0 0 120 140" },
    large: { width: 160, height: 180, viewBox: "0 0 160 180" }
  };

  const dim = dimensions[size];
  const centerX = parseInt(dim.viewBox.split(' ')[2]) / 2;
  const maxLevel = parseInt(dim.viewBox.split(' ')[3]) * 0.7;

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <svg
        width={dim.width}
        height={dim.height}
        viewBox={dim.viewBox}
        className="drop-shadow-lg"
      >
        {/* Beaker shadow */}
        <ellipse
          cx={centerX}
          cy={parseInt(dim.viewBox.split(' ')[3]) - 5}
          rx={centerX * 0.8}
          ry="3"
          fill="rgba(0,0,0,0.1)"
        />
        
        {/* Beaker body */}
        <path
          d={`M ${centerX * 0.3} 20 L ${centerX * 0.3} ${maxLevel + 10} Q ${centerX * 0.3} ${maxLevel + 20} ${centerX * 0.5} ${maxLevel + 20} L ${centerX * 1.5} ${maxLevel + 20} Q ${centerX * 1.7} ${maxLevel + 20} ${centerX * 1.7} ${maxLevel + 10} L ${centerX * 1.7} 20 Z`}
          fill="rgba(220, 240, 255, 0.1)"
          stroke="#2563eb"
          strokeWidth="2"
          className="transition-all duration-300"
        />
        
        {/* Beaker rim */}
        <rect
          x={centerX * 0.2}
          y="15"
          width={centerX * 1.6}
          height="8"
          rx="4"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
        />
        
        {/* Spout */}
        <path
          d={`M ${centerX * 1.7} 18 Q ${centerX * 1.9} 16 ${centerX * 1.8} 22`}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
        />
        
        {/* Volume markings */}
        {size !== "small" && [25, 50, 75].map((mark, index) => {
          const y = maxLevel + 15 - (mark * 0.6);
          return (
            <g key={index}>
              <line
                x1={centerX * 1.7}
                y1={y}
                x2={centerX * 1.9}
                y2={y}
                stroke="#64748b"
                strokeWidth="1"
              />
              <text
                x={centerX * 2}
                y={y + 2}
                fontSize="6"
                fill="#64748b"
                className="font-mono"
              >
                {mark}ml
              </text>
            </g>
          );
        })}
        
        {/* Contents */}
        {contents && contents.level > 0 && (
          <>
            <rect
              x={centerX * 0.35}
              y={maxLevel + 15 - contents.level}
              width={centerX * 1.3}
              height={contents.level}
              fill={contents.color}
              opacity="0.8"
              className="transition-all duration-500"
            />
            
            {/* Liquid surface */}
            <ellipse
              cx={centerX}
              cy={maxLevel + 15 - contents.level}
              rx={centerX * 0.65}
              ry="2"
              fill={contents.color}
              opacity="0.6"
            />
          </>
        )}
        
        {/* Heat indicator */}
        {isHeating && (
          <g className="animate-pulse">
            {[0, 1, 2].map(i => (
              <path
                key={i}
                d={`M ${centerX * 0.6 + i * 8} ${maxLevel + 25} Q ${centerX * 0.6 + i * 8 + 3} ${maxLevel + 30} ${centerX * 0.6 + i * 8} ${maxLevel + 35}`}
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
        
        {/* Temperature display */}
        {temperature > 25 && (
          <g>
            <rect
              x="5"
              y="30"
              width="20"
              height="12"
              rx="6"
              fill={temperature > 60 ? "#ef4444" : "#f59e0b"}
              opacity="0.9"
            />
            <text
              x="15"
              y="38"
              textAnchor="middle"
              fontSize="8"
              fill="white"
              className="font-bold"
            >
              {Math.round(temperature)}°
            </text>
          </g>
        )}
        
        {/* Label */}
        {label && (
          <text
            x={centerX}
            y={parseInt(dim.viewBox.split(' ')[3]) - 15}
            textAnchor="middle"
            fontSize="10"
            fill="#374151"
            className="font-medium"
          >
            {label}
          </text>
        )}
      </svg>
      
      {/* Hover effect */}
      {isHovered && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 bg-opacity-20 flex items-center justify-center">
          <div className="text-blue-600 font-medium text-xs bg-white px-2 py-1 rounded shadow">
            {size} beaker
          </div>
        </div>
      )}
    </div>
  );
}