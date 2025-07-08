import React, { useState } from "react";
import {
  Beaker,
  FlaskConical,
  TestTube,
  Droplet,
  Thermometer,
} from "lucide-react";

interface EquipmentProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  onDrag: (id: string, x: number, y: number) => void;
  position: { x: number; y: number } | null;
  chemicals?: Array<{
    id: string;
    name: string;
    color: string;
    amount: number;
    concentration: string;
  }>;
  onChemicalDrop?: (
    chemicalId: string,
    equipmentId: string,
    amount: number,
  ) => void;
  isHeating?: boolean;
  actualTemperature?: number;
  targetTemperature?: number;
  heatingTime?: number;
  onStartHeating?: () => void;
  onStopHeating?: () => void;
}

export const Equipment: React.FC<EquipmentProps> = ({
  id,
  name,
  icon,
  onDrag,
  position,
  chemicals = [],
  onChemicalDrop,
  isHeating = false,
  actualTemperature = 25,
  targetTemperature = 25,
  heatingTime = 0,
  onStartHeating,
  onStopHeating,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("equipment", id);
  };

  const handleChemicalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleChemicalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleChemicalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsDropping(true);

    const chemicalData = e.dataTransfer.getData("chemical");
    if (chemicalData && onChemicalDrop) {
      const chemical = JSON.parse(chemicalData);
      onChemicalDrop(chemical.id, id, chemical.volume || 25);

      // Show success feedback
      console.log(
        `Added ${chemical.volume || 25}mL of ${chemical.name} to ${name}`,
      );

      // Reset dropping animation after a delay
      setTimeout(() => setIsDropping(false), 2000);
    }
  };

  const isOnWorkbench = position && (position.x !== 0 || position.y !== 0);
  const isContainer = [
    "beaker",
    "flask",
    "burette",
    "erlenmeyer_flask",
    "conical_flask",
    "test_tubes",
    "beakers",
  ].includes(id);

  // Calculate mixed color from all chemicals
  const getMixedColor = () => {
    if (chemicals.length === 0) return "transparent";
    if (chemicals.length === 1) return chemicals[0].color;

    // Enhanced color mixing for chemical reactions
    const chemicalIds = chemicals.map((c) => c.id).sort();

    // Specific reaction colors
    if (chemicalIds.includes("hcl") && chemicalIds.includes("naoh")) {
      if (chemicalIds.includes("phenol")) {
        return "#FFB6C1"; // Pink when phenolphthalein is added to basic solution
      }
      return "#E8F5E8"; // Light green for neutralization
    }

    if (chemicalIds.includes("phenol") && chemicalIds.includes("naoh")) {
      return "#FF69B4"; // Bright pink
    }

    // Default color mixing
    let r = 0,
      g = 0,
      b = 0,
      totalAmount = 0;

    chemicals.forEach((chemical) => {
      const color = chemical.color;
      const amount = chemical.amount;

      const hex = color.replace("#", "");
      const rVal = parseInt(hex.substr(0, 2), 16);
      const gVal = parseInt(hex.substr(2, 2), 16);
      const bVal = parseInt(hex.substr(4, 2), 16);

      r += rVal * amount;
      g += gVal * amount;
      b += bVal * amount;
      totalAmount += amount;
    });

    if (totalAmount === 0) return "transparent";

    r = Math.round(r / totalAmount);
    g = Math.round(g / totalAmount);
    b = Math.round(b / totalAmount);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const getSolutionHeight = () => {
    const totalVolume = chemicals.reduce(
      (sum, chemical) => sum + chemical.amount,
      0,
    );
    return Math.min(85, (totalVolume / 100) * 85);
  };

  const getEquipmentSpecificRendering = () => {
    if (id === "water_bath" && isOnWorkbench) {
      return (
        <div className="relative">
          {/* Enhanced Water Bath with Heating Controls */}
          <div
            className={`cursor-pointer transition-all duration-300 ${
              isHeating ? "scale-105" : ""
            }`}
            onClick={isHeating ? onStopHeating : onStartHeating}
          >
            <svg
              width="120"
              height="80"
              viewBox="0 0 120 80"
              className="drop-shadow-lg"
            >
              {/* Water bath container */}
              <rect
                x="10"
                y="25"
                width="100"
                height="40"
                rx="5"
                fill={
                  isHeating
                    ? "rgba(249, 115, 22, 0.2)"
                    : "rgba(59, 130, 246, 0.1)"
                }
                stroke={isHeating ? "#f97316" : "#2563eb"}
                strokeWidth="3"
              />

              {/* Water in bath with bubbles when heating */}
              <rect
                x="15"
                y="30"
                width="90"
                height="30"
                rx="3"
                fill={isHeating ? "#fbbf24" : "#93c5fd"}
                opacity="0.7"
              />

              {/* Heating element at bottom */}
              <rect
                x="25"
                y="60"
                width="70"
                height="3"
                rx="1.5"
                fill={isHeating ? "#dc2626" : "#6b7280"}
                className={isHeating ? "animate-pulse" : ""}
              />

              {/* Temperature probe */}
              <rect x="95" y="20" width="2" height="30" fill="#374151" />
              <circle cx="96" cy="55" r="3" fill="#dc2626" />

              {/* Steam/bubbles when heating */}
              {isHeating && (
                <g>
                  {[...Array(8)].map((_, i) => (
                    <circle
                      key={i}
                      cx={20 + i * 10}
                      cy={35 + (i % 2) * 5}
                      r="1.5"
                      fill="rgba(255, 255, 255, 0.8)"
                      className="animate-bounce"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: "1s",
                      }}
                    />
                  ))}
                  {/* Steam vapors */}
                  <path
                    d="M30 25 Q35 20 40 25 T50 25"
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                  />
                  <path
                    d="M60 25 Q65 20 70 25 T80 25"
                    stroke="rgba(255, 255, 255, 0.6)"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />
                </g>
              )}

              {/* Control panel */}
              <rect x="75" y="5" width="35" height="15" rx="2" fill="#1f2937" />
              <rect x="78" y="8" width="12" height="9" rx="1" fill="#000000" />
              <text
                x="82"
                y="15"
                fontSize="6"
                fill="#22c55e"
                fontFamily="monospace"
              >
                {Math.round(actualTemperature)}°C
              </text>
              <circle
                cx="100"
                cy="12"
                r="3"
                fill={isHeating ? "#ef4444" : "#6b7280"}
                className={isHeating ? "animate-pulse" : ""}
              />
            </svg>

            {/* Control buttons */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isHeating ? onStopHeating?.() : onStartHeating?.();
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      isHeating
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {isHeating ? "Stop" : "Heat"}
                  </button>
                  <div className="text-xs text-gray-600">
                    Target: {targetTemperature}°C
                  </div>
                  {isHeating && (
                    <div className="text-xs text-blue-600">
                      {Math.floor(heatingTime / 60)}:
                      {String(heatingTime % 60).padStart(2, "0")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            {!isHeating && (
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 text-center">
                Click to start heating
              </div>
            )}
          </div>
        </div>
      );
    }

    if (id === "burette" && isOnWorkbench) {
      return (
        <div className="relative">
          {/* Burette specific rendering */}
          <div className="w-6 h-20 bg-gradient-to-b from-transparent to-blue-100 border-2 border-blue-400 rounded-b-lg relative">
            {/* Solution in burette */}
            {chemicals.length > 0 && (
              <div
                className="absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-500"
                style={{
                  backgroundColor: getMixedColor(),
                  height: `${getSolutionHeight()}%`,
                  opacity: 0.8,
                }}
              >
                {/* Liquid surface animation */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-30 animate-pulse"></div>
              </div>
            )}

            {/* Volume markings */}
            <div className="absolute -right-8 top-2 text-xs text-gray-600">
              50
            </div>
            <div className="absolute -right-8 top-8 text-xs text-gray-600">
              40
            </div>
            <div className="absolute -right-8 top-14 text-xs text-gray-600">
              30
            </div>

            {/* Burette tap */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            </div>
          </div>

          {/* Drop animation when chemicals are added */}
          {isDropping && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
          )}
        </div>
      );
    }

    if (id === "erlenmeyer_flask" && isOnWorkbench) {
      const isBeingHeated = isHeating && actualTemperature > 30;

      return (
        <div className="relative">
          {/* Enhanced Erlenmeyer Flask Illustration */}
          <svg
            width="100"
            height="120"
            viewBox="0 0 100 120"
            className="drop-shadow-lg"
          >
            {/* Flask body with glass shine effect */}
            <defs>
              <linearGradient
                id="glassGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
              </linearGradient>
              <linearGradient
                id="heatingGlow"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(249, 115, 22, 0.2)" />
                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.1)" />
              </linearGradient>
            </defs>

            {/* Flask body */}
            <path
              d="M30 25 L30 40 L15 85 L85 85 L70 40 L70 25 Z"
              fill={isBeingHeated ? "url(#heatingGlow)" : "url(#glassGradient)"}
              stroke={isBeingHeated ? "#f97316" : "#2563eb"}
              strokeWidth="2.5"
              className={isBeingHeated ? "animate-pulse" : ""}
            />

            {/* Flask neck */}
            <rect
              x="40"
              y="12"
              width="20"
              height="18"
              fill={
                isBeingHeated
                  ? "rgba(249, 115, 22, 0.1)"
                  : "rgba(59, 130, 246, 0.1)"
              }
              stroke={isBeingHeated ? "#f97316" : "#2563eb"}
              strokeWidth="2.5"
              rx="3"
            />

            {/* Flask opening */}
            <ellipse
              cx="50"
              cy="12"
              rx="12"
              ry="3"
              fill="none"
              stroke={isBeingHeated ? "#f97316" : "#2563eb"}
              strokeWidth="2.5"
            />

            {/* Solution in flask with enhanced visual */}
            {chemicals.length > 0 && (
              <g>
                {/* Main solution */}
                <path
                  d={`M${20 + chemicals.length * 1.5} ${85 - getSolutionHeight() * 0.5} L${80 - chemicals.length * 1.5} ${85 - getSolutionHeight() * 0.5} L85 85 L15 85 Z`}
                  fill={getMixedColor()}
                  opacity="0.9"
                  className="transition-all duration-500"
                />

                {/* Solution surface with reflection */}
                <ellipse
                  cx="50"
                  cy={85 - getSolutionHeight() * 0.5}
                  rx={32 - chemicals.length * 1.5}
                  ry="2"
                  fill="rgba(255, 255, 255, 0.4)"
                  className="animate-pulse"
                />

                {/* Heat distortion effect when heating */}
                {isBeingHeated && (
                  <g>
                    <path
                      d="M25 75 Q30 70 35 75 T45 75"
                      stroke="rgba(255, 255, 255, 0.6)"
                      strokeWidth="1"
                      fill="none"
                      className="animate-bounce"
                    />
                    <path
                      d="M55 75 Q60 70 65 75 T75 75"
                      stroke="rgba(255, 255, 255, 0.6)"
                      strokeWidth="1"
                      fill="none"
                      className="animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </g>
                )}
              </g>
            )}

            {/* Volume markings */}
            <g stroke="#6b7280" strokeWidth="1" fill="#6b7280">
              <line x1="87" y1="55" x2="92" y2="55" />
              <text x="94" y="58" fontSize="7" fontWeight="bold">
                125mL
              </text>
              <line x1="87" y1="65" x2="90" y2="65" />
              <text x="94" y="68" fontSize="6">
                100mL
              </text>
              <line x1="87" y1="75" x2="90" y2="75" />
              <text x="94" y="78" fontSize="6">
                50mL
              </text>
            </g>

            {/* Enhanced bubbling animation for reactions */}
            {(chemicals.length > 1 || isBeingHeated) && (
              <g>
                {[...Array(isBeingHeated ? 12 : 6)].map((_, i) => (
                  <circle
                    key={i}
                    cx={25 + (i % 6) * 9}
                    cy={80 - (i % 3) * 8 - Math.floor(i / 6) * 5}
                    r={isBeingHeated ? "2" : "1.5"}
                    fill="rgba(255, 255, 255, 0.8)"
                    className="animate-bounce"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: isBeingHeated ? "1s" : "1.5s",
                    }}
                  />
                ))}

                {/* Steam/vapor when heating */}
                {isBeingHeated && (
                  <g>
                    <path
                      d="M45 12 Q50 5 55 12"
                      stroke="rgba(255, 255, 255, 0.7)"
                      strokeWidth="2"
                      fill="none"
                      className="animate-pulse"
                    />
                    <path
                      d="M42 10 Q47 3 52 10"
                      stroke="rgba(255, 255, 255, 0.5)"
                      strokeWidth="1.5"
                      fill="none"
                      className="animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    />
                    <path
                      d="M48 8 Q53 1 58 8"
                      stroke="rgba(255, 255, 255, 0.5)"
                      strokeWidth="1.5"
                      fill="none"
                      className="animate-pulse"
                      style={{ animationDelay: "1s" }}
                    />
                  </g>
                )}
              </g>
            )}

            {/* Glass shine highlight */}
            <path
              d="M35 30 L38 32 L38 50 L35 52"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="2"
              fill="none"
            />

            {/* Temperature indicator when heating */}
            {isBeingHeated && (
              <g>
                <rect
                  x="5"
                  y="45"
                  width="8"
                  height="25"
                  rx="4"
                  fill="#374151"
                />
                <rect
                  x="6"
                  y="46"
                  width="6"
                  height="23"
                  rx="3"
                  fill="#000000"
                />
                <rect
                  x="7"
                  y={69 - (actualTemperature - 25) * 0.4}
                  width="4"
                  height={(actualTemperature - 25) * 0.4}
                  fill="#ef4444"
                  className="transition-all duration-500"
                />
                <text
                  x="2"
                  y="42"
                  fontSize="6"
                  fill="#374151"
                  fontWeight="bold"
                >
                  {Math.round(actualTemperature)}°C
                </text>
              </g>
            )}

            {/* Flask label */}
            <text
              x="50"
              y="105"
              textAnchor="middle"
              fontSize="9"
              fill="#374151"
              fontWeight="bold"
            >
              125mL Erlenmeyer Flask
            </text>
          </svg>

          {/* Enhanced chemical composition display */}
          {chemicals.length > 0 && (
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-xs shadow-lg">
              <div className="text-gray-800 font-medium text-center">
                {chemicals.map((c) => c.name.split(" ")[0]).join(" + ")}
              </div>
              <div className="text-gray-600 text-center">
                {chemicals.reduce((sum, c) => sum + c.amount, 0).toFixed(1)} mL
                total
              </div>
              {isBeingHeated && (
                <div className="text-orange-600 text-center font-medium">
                  🔥 Heating: {Math.round(actualTemperature)}°C
                </div>
              )}
              {/* Color indicator */}
              <div
                className="w-full h-2 rounded-full mt-1"
                style={{ backgroundColor: getMixedColor() }}
              ></div>
            </div>
          )}

          {/* Drop success animation */}
          {isDropping && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                ✓ Added!
              </div>
            </div>
          )}

          {/* Heating glow effect */}
          {isBeingHeated && (
            <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 animate-pulse blur-sm"></div>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        {icon}

        {/* Solution visualization for other containers */}
        {isContainer &&
          chemicals.length > 0 &&
          isOnWorkbench &&
          id !== "erlenmeyer_flask" && (
            <div className="absolute inset-0 flex items-end justify-center">
              <div
                className="rounded-b-lg transition-all duration-500 opacity-80"
                style={{
                  backgroundColor: getMixedColor(),
                  height: `${getSolutionHeight()}%`,
                  width: id === "beaker" ? "70%" : "60%",
                  minHeight: "8px",
                }}
              >
                {/* Enhanced liquid effects */}
                <div className="relative w-full h-full overflow-hidden rounded-b-lg">
                  {/* Surface shimmer */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-40 animate-pulse"></div>

                  {/* Bubbling animation for reactions */}
                  {chemicals.length > 1 && (
                    <div className="absolute inset-0">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white opacity-70 rounded-full animate-bounce"
                          style={{
                            left: `${15 + i * 20}%`,
                            bottom: `${5 + (i % 2) * 15}px`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: "1.5s",
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Color change animation */}
                  {chemicals.some((c) => c.id === "phenol") &&
                    chemicals.some((c) => c.id === "naoh") && (
                      <div className="absolute inset-0 bg-pink-300 opacity-50 animate-pulse rounded-b-lg"></div>
                    )}
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={isContainer ? handleChemicalDragOver : undefined}
      onDragLeave={isContainer ? handleChemicalDragLeave : undefined}
      onDrop={isContainer ? handleChemicalDrop : undefined}
      className={`flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing border-2 relative ${
        isOnWorkbench
          ? "border-blue-400 bg-blue-50"
          : "border-gray-200 hover:border-blue-400"
      } ${isContainer && isDragOver ? "border-green-500 bg-green-50 scale-105" : ""} ${
        isDropping ? "animate-pulse" : ""
      }`}
      style={{
        position: isOnWorkbench ? "absolute" : "relative",
        left: isOnWorkbench && position ? position.x : "auto",
        top: isOnWorkbench && position ? position.y : "auto",
        zIndex: isOnWorkbench ? 10 : "auto",
        transform: isOnWorkbench ? "translate(-50%, -50%)" : "none",
      }}
    >
      {/* Enhanced drop zone indicator */}
      {isContainer && isOnWorkbench && (
        <div
          className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isDragOver ? "bg-green-500 scale-125 shadow-lg" : "bg-blue-500"
          }`}
        >
          <Droplet size={14} className="text-white" />
          {isDragOver && (
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
          )}
        </div>
      )}

      {/* Drop hint text */}
      {isContainer && isOnWorkbench && isDragOver && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-medium animate-bounce whitespace-nowrap shadow-lg">
          Drop chemical here!
        </div>
      )}

      {/* Drag over animation */}
      {isDragOver && (
        <div className="absolute inset-0 border-4 border-green-400 rounded-lg animate-pulse bg-green-100 opacity-50"></div>
      )}

      <div
        className={`mb-3 transition-all duration-200 relative ${
          isOnWorkbench ? "text-blue-700" : "text-blue-600"
        } ${isDragOver ? "scale-110" : ""}`}
      >
        {getEquipmentSpecificRendering()}
      </div>

      <span
        className={`text-sm font-semibold text-center transition-colors ${
          isOnWorkbench ? "text-blue-800" : "text-gray-700"
        } ${isDragOver ? "text-green-700" : ""}`}
      >
        {name}
      </span>

      {/* Enhanced chemical composition display */}
      {chemicals.length > 0 && isOnWorkbench && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-xs shadow-lg min-w-max">
          <div className="text-gray-800 font-medium">
            {chemicals
              .map((chemical) => chemical.name.split(" ")[0])
              .join(" + ")}
          </div>
          <div className="text-gray-600 text-center">
            {chemicals
              .reduce((sum, chemical) => sum + chemical.amount, 0)
              .toFixed(1)}{" "}
            mL
          </div>
          {/* Color indicator */}
          <div
            className="w-full h-1 rounded-full mt-1"
            style={{ backgroundColor: getMixedColor() }}
          ></div>
        </div>
      )}

      {/* Drop success animation */}
      {isDropping && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-bounce">
            Added!
          </div>
        </div>
      )}
    </div>
  );
};

export const equipmentList = [
  { id: "beaker", name: "Beaker", icon: <Beaker size={36} /> },
  { id: "flask", name: "Erlenmeyer Flask", icon: <FlaskConical size={36} /> },
  { id: "burette", name: "Burette", icon: <TestTube size={36} /> },
  { id: "thermometer", name: "Thermometer", icon: <Thermometer size={36} /> },
];
