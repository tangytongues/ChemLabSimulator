import { useState } from "react";

interface TestTube {
  id: string;
  contents?: {
    color: string;
    level: number;
    name: string;
  };
  label?: string;
}

interface TestTubeRackProps {
  testTubes: TestTube[];
  onTubeSelect?: (tubeId: string) => void;
  className?: string;
}

export default function TestTubeRack({ testTubes, onTubeSelect, className = "" }: TestTubeRackProps) {
  const [selectedTube, setSelectedTube] = useState<string | null>(null);

  const handleTubeClick = (tubeId: string) => {
    setSelectedTube(tubeId);
    onTubeSelect?.(tubeId);
  };

  return (
    <div className={`relative ${className}`}>
      <svg width="300" height="200" viewBox="0 0 300 200" className="drop-shadow-md">
        {/* Rack base */}
        <rect
          x="20"
          y="150"
          width="260"
          height="30"
          rx="5"
          fill="#8b4513"
          stroke="#654321"
          strokeWidth="2"
        />
        
        {/* Rack support */}
        <rect
          x="30"
          y="140"
          width="240"
          height="20"
          rx="3"
          fill="#a0522d"
          stroke="#654321"
          strokeWidth="1"
        />
        
        {/* Test tube holes */}
        {testTubes.map((tube, index) => {
          const x = 50 + index * 40;
          const isSelected = selectedTube === tube.id;
          
          return (
            <g key={tube.id}>
              {/* Hole in rack */}
              <circle
                cx={x}
                cy="155"
                r="8"
                fill="#654321"
                stroke="#4a3319"
                strokeWidth="1"
              />
              
              {/* Test tube */}
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => handleTubeClick(tube.id)}
              >
                {/* Test tube body */}
                <rect
                  x={x - 6}
                  y="50"
                  width="12"
                  height="110"
                  rx="6"
                  fill="rgba(220, 240, 255, 0.1)"
                  stroke={isSelected ? "#3b82f6" : "#64748b"}
                  strokeWidth={isSelected ? "3" : "2"}
                  className="transition-all duration-200"
                />
                
                {/* Test tube rim */}
                <rect
                  x={x - 8}
                  y="45"
                  width="16"
                  height="8"
                  rx="2"
                  fill="none"
                  stroke={isSelected ? "#3b82f6" : "#64748b"}
                  strokeWidth={isSelected ? "3" : "2"}
                />
                
                {/* Contents */}
                {tube.contents && (
                  <rect
                    x={x - 5}
                    y={160 - tube.contents.level}
                    width="10"
                    height={tube.contents.level}
                    rx="5"
                    fill={tube.contents.color}
                    opacity="0.8"
                    className="transition-all duration-300"
                  />
                )}
                
                {/* Liquid surface */}
                {tube.contents && tube.contents.level > 0 && (
                  <ellipse
                    cx={x}
                    cy={160 - tube.contents.level}
                    rx="5"
                    ry="1"
                    fill={tube.contents.color}
                    opacity="0.6"
                  />
                )}
                
                {/* Label */}
                {tube.label && (
                  <text
                    x={x}
                    y="35"
                    textAnchor="middle"
                    fontSize="8"
                    fill="#374151"
                    className="font-medium"
                  >
                    {tube.label}
                  </text>
                )}
                
                {/* Selection glow */}
                {isSelected && (
                  <rect
                    x={x - 8}
                    y="43"
                    width="16"
                    height="120"
                    rx="8"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    opacity="0.5"
                    className="animate-pulse"
                  />
                )}
              </g>
            </g>
          );
        })}
        
        {/* Rack label */}
        <rect
          x="120"
          y="185"
          width="60"
          height="12"
          rx="6"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="1"
        />
        <text
          x="150"
          y="193"
          textAnchor="middle"
          fontSize="8"
          fill="#374151"
          className="font-medium"
        >
          Test Tubes
        </text>
      </svg>
    </div>
  );
}