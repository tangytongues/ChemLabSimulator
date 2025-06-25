interface GraduatedCylinderProps {
  capacity: number; // in mL
  contents?: {
    color: string;
    volume: number;
    name: string;
  };
  accuracy: "high" | "medium" | "low";
  label?: string;
  className?: string;
  onDrop?: () => void;
}

export default function GraduatedCylinder({ 
  capacity, 
  contents, 
  accuracy, 
  label,
  className = "",
  onDrop 
}: GraduatedCylinderProps) {
  const height = 180;
  const width = 40;
  const graduationInterval = accuracy === "high" ? 1 : accuracy === "medium" ? 5 : 10;
  
  return (
    <div 
      className={`relative ${className}`}
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <svg width={width + 40} height={height + 20} viewBox={`0 0 ${width + 40} ${height + 20}`} className="drop-shadow-md">
        {/* Cylinder body */}
        <rect
          x="10"
          y="20"
          width={width}
          height={height - 40}
          fill="rgba(220, 240, 255, 0.05)"
          stroke="#2563eb"
          strokeWidth="2"
          rx="2"
        />
        
        {/* Base */}
        <rect
          x="5"
          y={height - 25}
          width={width + 10}
          height="15"
          fill="rgba(220, 240, 255, 0.1)"
          stroke="#2563eb"
          strokeWidth="2"
          rx="3"
        />
        
        {/* Spout */}
        <rect
          x="8"
          y="15"
          width={width + 4}
          height="10"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          rx="5"
        />
        
        {/* Graduations */}
        {Array.from({ length: Math.floor(capacity / graduationInterval) + 1 }, (_, i) => {
          const volume = i * graduationInterval;
          const y = (height - 40) - ((volume / capacity) * (height - 60)) + 20;
          const isMainGraduation = volume % (graduationInterval * 5) === 0;
          
          return (
            <g key={i}>
              <line
                x1={isMainGraduation ? "5" : "8"}
                y1={y}
                x2="10"
                y2={y}
                stroke="#64748b"
                strokeWidth={isMainGraduation ? "1.5" : "1"}
              />
              {isMainGraduation && (
                <text
                  x="2"
                  y={y + 2}
                  fontSize="6"
                  fill="#64748b"
                  textAnchor="end"
                  className="font-mono"
                >
                  {volume}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Contents */}
        {contents && contents.volume > 0 && (
          <>
            <rect
              x="12"
              y={(height - 40) - ((contents.volume / capacity) * (height - 60)) + 20}
              width={width - 4}
              height={(contents.volume / capacity) * (height - 60)}
              fill={contents.color}
              opacity="0.8"
              className="transition-all duration-500"
            />
            
            {/* Meniscus */}
            <ellipse
              cx={width / 2 + 10}
              cy={(height - 40) - ((contents.volume / capacity) * (height - 60)) + 20}
              rx={(width - 4) / 2}
              ry="1"
              fill={contents.color}
              opacity="0.6"
            />
            
            {/* Volume reading */}
            <rect
              x={width + 15}
              y={(height - 40) - ((contents.volume / capacity) * (height - 60)) + 15}
              width="20"
              height="10"
              rx="2"
              fill="white"
              stroke="#d1d5db"
              strokeWidth="1"
            />
            <text
              x={width + 25}
              y={(height - 40) - ((contents.volume / capacity) * (height - 60)) + 22}
              textAnchor="middle"
              fontSize="6"
              fill="#374151"
              className="font-mono font-bold"
            >
              {contents.volume.toFixed(accuracy === "high" ? 1 : 0)}
            </text>
          </>
        )}
        
        {/* Capacity label */}
        <text
          x={width / 2 + 10}
          y="15"
          textAnchor="middle"
          fontSize="8"
          fill="#64748b"
          className="font-bold"
        >
          {capacity}mL
        </text>
        
        {/* Accuracy indicator */}
        <circle
          cx={width + 15}
          cy="30"
          r="3"
          fill={
            accuracy === "high" ? "#10b981" : 
            accuracy === "medium" ? "#f59e0b" : "#ef4444"
          }
        />
        
        {/* Label */}
        {label && (
          <text
            x={width / 2 + 10}
            y={height + 15}
            textAnchor="middle"
            fontSize="8"
            fill="#374151"
            className="font-medium"
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}