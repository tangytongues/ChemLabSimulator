import React, { useState, useEffect } from "react";
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
  onRemove?: (id: string) => void;
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
  onRemove,
  isHeating = false,
  actualTemperature = 25,
  targetTemperature = 25,
  heatingTime = 0,
  onStartHeating,
  onStopHeating,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("equipment", id);
    setShowContextMenu(false);
  };

  const handleDoubleClick = () => {
    if (isOnWorkbench && onRemove) {
      onRemove(id);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    if (isOnWorkbench) {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  const handleRemoveClick = () => {
    if (onRemove) {
      onRemove(id);
    }
    setShowContextMenu(false);
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showContextMenu]);

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
    // Use realistic images when equipment is on the workbench
    if (isOnWorkbench) {
      if (id === "erlenmeyer_flask" || id === "flask") {
        return (
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fd30aba391b974a07b1dc4ee95e17e59e%2F5a2c42e1b48244e886bf6dca231660fb?format=webp&width=800"
              alt="Erlenmeyer Flask"
              className="w-20 h-24 object-contain drop-shadow-lg"
              style={{
                filter: isHeating ? "brightness(1.1) saturate(1.2)" : "none",
              }}
            />

            {/* Solution overlay on the realistic flask */}
            {chemicals.length > 0 && (
              <div
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-b-full transition-all duration-700 ease-out"
                style={{
                  backgroundColor: getMixedColor(),
                  width: "60%",
                  height: `${Math.min(40, getSolutionHeight() * 0.4)}px`,
                  opacity: 0.8,
                  boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {/* Surface shimmer */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white opacity-40 rounded-full"></div>

                {/* Bubbling animation */}
                {(chemicals.length > 1 || isHeating) && (
                  <div className="absolute inset-0">
                    {[...Array(isHeating ? 8 : 4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-80"
                        style={{
                          left: `${20 + (i % 3) * 20}%`,
                          bottom: `${5 + (i % 2) * 10}px`,
                          animationName: "bounce",
                          animationDuration: isHeating ? "0.8s" : "1.2s",
                          animationIterationCount: "infinite",
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Temperature indicator when heating */}
            {isHeating && (
              <div className="absolute -left-6 top-4 w-2 h-8 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-red-500 transition-all duration-500 rounded-full"
                  style={{
                    height: `${Math.min(100, ((actualTemperature - 25) / 60) * 100)}%`,
                  }}
                ></div>
                <div className="absolute -left-6 top-0 text-[8px] text-gray-600 font-mono">
                  {Math.round(actualTemperature)}°C
                </div>
              </div>
            )}
          </div>
        );
      }

      if (id === "graduated_cylinder") {
        return (
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fd30aba391b974a07b1dc4ee95e17e59e%2F60a43d2a9504457b8647e336617950c9?format=webp&width=800"
              alt="Graduated Cylinder"
              className="w-12 h-24 object-contain drop-shadow-lg"
            />

            {/* Solution in graduated cylinder */}
            {chemicals.length > 0 && (
              <div
                className="absolute bottom-1 left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-out"
                style={{
                  backgroundColor: getMixedColor(),
                  width: "80%",
                  height: `${Math.min(80, getSolutionHeight() * 0.8)}px`,
                  opacity: 0.85,
                  borderRadius: "0 0 4px 4px",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white opacity-30 rounded-full"></div>
              </div>
            )}
          </div>
        );
      }

      if (id === "thermometer") {
        return (
          <div className="relative">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fd30aba391b974a07b1dc4ee95e17e59e%2Ff88985d180ee4381acf1ac1886943b8b?format=webp&width=800"
              alt="Thermometer"
              className="w-6 h-20 object-contain drop-shadow-lg"
            />

            {/* Temperature reading overlay */}
            <div className="absolute -right-8 top-2 bg-black text-green-400 px-1 py-0.5 rounded text-[8px] font-mono">
              {Math.round(actualTemperature)}°C
            </div>
          </div>
        );
      }

      if (id === "beaker") {
        // For beaker, we'll use a stylized version since no image was provided
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-400 rounded-b-lg shadow-lg relative overflow-hidden">
              <div className="absolute top-1 left-1 w-2 h-8 bg-white opacity-50 rounded-full"></div>

              {/* Solution in beaker */}
              {chemicals.length > 0 && (
                <div
                  className="absolute bottom-1 left-1 right-1 rounded-b-lg transition-all duration-700 ease-out"
                  style={{
                    backgroundColor: getMixedColor(),
                    height: `${Math.min(50, getSolutionHeight() * 0.6)}px`,
                    opacity: 0.8,
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-30 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    if (id === "water_bath" && isOnWorkbench) {
      return (
        <div className="relative">
          {/* Realistic Water Bath with Enhanced Controls */}
          <div
            className={`cursor-pointer transition-all duration-300 ${
              isHeating ? "scale-105" : ""
            }`}
            onClick={isHeating ? onStopHeating : onStartHeating}
          >
            <div className="relative w-32 h-24 bg-gradient-to-b from-gray-300 to-gray-600 rounded-lg shadow-lg overflow-hidden">
              {/* Water bath container */}
              <div
                className={`absolute inset-2 rounded-md transition-all duration-500 ${
                  isHeating
                    ? "bg-gradient-to-b from-orange-200 to-orange-400"
                    : "bg-gradient-to-b from-blue-100 to-blue-300"
                }`}
              >
                {/* Water surface with realistic movement */}
                <div
                  className={`absolute top-1 left-1 right-1 h-3 rounded-t-md transition-colors duration-500 ${
                    isHeating ? "bg-orange-300" : "bg-blue-200"
                  }`}
                >
                  {/* Surface ripples */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                </div>

                {/* Bubbles when heating */}
                {isHeating && (
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                        style={{
                          left: `${20 + (i % 4) * 20}%`,
                          top: `${40 + Math.floor(i / 4) * 20}%`,
                          animationName: "bounce",
                          animationDuration: "1s",
                          animationIterationCount: "infinite",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Control panel */}
              <div className="absolute top-1 right-1 bg-black rounded px-1 py-0.5">
                <div className="text-[8px] text-green-400 font-mono">
                  {Math.round(actualTemperature)}°C
                </div>
              </div>

              {/* Heating indicator */}
              <div
                className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full transition-colors ${
                  isHeating ? "bg-red-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>

              {/* Steam effect when heating */}
              {isHeating && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-6 bg-white opacity-40 rounded-full"
                      style={{
                        left: `${-4 + i * 4}px`,
                        animationName: "pulse",
                        animationDuration: "2s",
                        animationIterationCount: "infinite",
                        animationDelay: `${i * 0.3}s`,
                        transform: `rotate(${-10 + i * 10}deg)`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

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
          {/* Realistic Burette */}
          <div className="relative w-8 h-32">
            {/* Main burette tube */}
            <div className="absolute inset-x-1 top-0 bottom-4 bg-gradient-to-b from-transparent to-gray-100 border-2 border-gray-400 rounded-b-lg overflow-hidden shadow-md">
              {/* Solution in burette with improved animation */}
              {chemicals.length > 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-700 ease-out"
                  style={{
                    backgroundColor: getMixedColor(),
                    height: `${getSolutionHeight()}%`,
                    opacity: 0.85,
                    backgroundImage: `linear-gradient(180deg, ${getMixedColor()}00 0%, ${getMixedColor()} 100%)`,
                  }}
                >
                  {/* Liquid surface with meniscus effect */}
                  <div className="absolute top-0 left-0 right-0 h-1">
                    <div className="w-full h-full bg-white opacity-40 rounded-full animate-pulse"></div>
                  </div>

                  {/* Liquid movement animation */}
                  <div className="absolute inset-0">
                    <div
                      className="absolute top-1 left-1 w-1 h-2 bg-white opacity-20 rounded-full"
                      style={{
                        animationName: "pulse",
                        animationDuration: "2s",
                        animationIterationCount: "infinite",
                        animationDelay: "0.3s",
                      }}
                    ></div>
                    <div
                      className="absolute top-2 right-1 w-1 h-1 bg-white opacity-30 rounded-full"
                      style={{
                        animationName: "pulse",
                        animationDuration: "2s",
                        animationIterationCount: "infinite",
                        animationDelay: "0.7s",
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Volume markings with better positioning */}
              <div className="absolute -right-10 inset-y-0 flex flex-col justify-between py-2">
                <div className="text-[8px] text-gray-600 font-mono">50</div>
                <div className="text-[8px] text-gray-600 font-mono">40</div>
                <div className="text-[8px] text-gray-600 font-mono">30</div>
                <div className="text-[8px] text-gray-600 font-mono">20</div>
                <div className="text-[8px] text-gray-600 font-mono">10</div>
                <div className="text-[8px] text-gray-600 font-mono">0</div>
              </div>

              {/* Scale lines */}
              <div className="absolute right-0 inset-y-0 flex flex-col justify-between py-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-2 h-px bg-gray-500"></div>
                ))}
              </div>
            </div>

            {/* Realistic burette tap */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-3 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-sm">
                <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full"></div>
              </div>
              {/* Tap handle */}
              <div className="absolute -right-2 top-1 w-3 h-1 bg-gray-500 rounded-sm"></div>
            </div>

            {/* Enhanced drop animation when chemicals are added */}
            {isDropping && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                {/* Multiple droplets for more realistic effect */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-2 rounded-full"
                    style={{
                      backgroundColor: getMixedColor(),
                      left: `${-2 + i}px`,
                      animationName: "bounce",
                      animationDuration: "0.8s",
                      animationIterationCount: "infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}

                {/* Splash effect */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                  <div className="w-4 h-px bg-blue-300 opacity-50 animate-ping"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (id === "erlenmeyer_flask" && isOnWorkbench) {
      const isBeingHeated = isHeating && actualTemperature > 30;

      return (
        <div className="relative">
          {/* Realistic Erlenmeyer Flask with 3D appearance */}
          <div className="relative w-24 h-32">
            {/* Flask body with realistic glass effect */}
            <div
              className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
                isBeingHeated ? "filter brightness-110 saturate-110" : ""
              }`}
            >
              {/* Main flask body */}
              <div
                className="relative w-20 h-20 bg-gradient-to-br from-white via-gray-50 to-gray-100
                            rounded-full border-2 border-gray-300 shadow-lg overflow-hidden"
              >
                {/* Glass reflection effect */}
                <div
                  className="absolute top-2 left-2 w-3 h-6 bg-gradient-to-br from-white to-transparent
                              opacity-60 rounded-full transform rotate-12"
                ></div>

                {/* Solution in flask with improved physics */}
                {chemicals.length > 0 && (
                  <div
                    className="absolute bottom-1 left-1 right-1 rounded-b-full transition-all duration-700 ease-out"
                    style={{
                      backgroundColor: getMixedColor(),
                      height: `${Math.min(70, getSolutionHeight() * 0.8)}px`,
                      opacity: 0.9,
                      boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.1)`,
                    }}
                  >
                    {/* Solution surface with meniscus */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 rounded-full"></div>

                    {/* Enhanced bubbling animation for reactions */}
                    {(chemicals.length > 1 || isBeingHeated) && (
                      <div className="absolute inset-0">
                        {[...Array(isBeingHeated ? 12 : 6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                            style={{
                              left: `${15 + (i % 4) * 15}%`,
                              bottom: `${10 + (i % 3) * 15}px`,
                              animationName: "bounce",
                              animationDuration: isBeingHeated ? "1s" : "1.5s",
                              animationIterationCount: "infinite",
                              animationDelay: `${i * 0.15}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Heat distortion effect when heating */}
                    {isBeingHeated && (
                      <div className="absolute inset-0">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-6 h-px bg-white opacity-30"
                            style={{
                              left: `${10 + i * 15}%`,
                              top: `${20 + i * 10}%`,
                              animationName: "pulse",
                              animationDuration: "2s",
                              animationIterationCount: "infinite",
                              animationDelay: `${i * 0.3}s`,
                              transform: `rotate(${-5 + i * 3}deg)`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Heating glow effect on flask body */}
                {isBeingHeated && (
                  <div className="absolute inset-0 rounded-full bg-orange-300 opacity-20 animate-pulse"></div>
                )}
              </div>

              {/* Flask neck */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8
                            w-6 h-10 bg-gradient-to-b from-gray-100 to-gray-200
                            border-2 border-gray-300 rounded-t-lg shadow-sm"
              >
                {/* Glass reflection on neck */}
                <div className="absolute top-1 left-1 w-1 h-6 bg-white opacity-50 rounded-full"></div>

                {/* Steam/vapor when heating */}
                {isBeingHeated && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-px h-8 bg-white opacity-40"
                        style={{
                          left: `${-2 + i * 2}px`,
                          animationName: "pulse",
                          animationDuration: "2s",
                          animationIterationCount: "infinite",
                          animationDelay: `${i * 0.3}s`,
                          transform: `rotate(${-5 + i * 5}deg)`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Flask opening */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8
                            w-8 h-2 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full border border-gray-400"
              ></div>
            </div>

            {/* Volume markings */}
            <div className="absolute right-0 top-8 space-y-3 text-[8px] text-gray-600 font-mono">
              <div className="flex items-center">
                <div className="w-2 h-px bg-gray-400 mr-1"></div>
                <span>125</span>
              </div>
              <div className="flex items-center">
                <div className="w-1 h-px bg-gray-400 mr-1"></div>
                <span>100</span>
              </div>
              <div className="flex items-center">
                <div className="w-1 h-px bg-gray-400 mr-1"></div>
                <span>50</span>
              </div>
            </div>

            {/* Temperature indicator when heating */}
            {isBeingHeated && (
              <div className="absolute left-0 top-8 w-3 h-12 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-red-500 transition-all duration-500 rounded-full"
                  style={{
                    height: `${Math.min(100, ((actualTemperature - 25) / 60) * 100)}%`,
                  }}
                ></div>
                <div className="absolute -left-8 top-0 text-[8px] text-gray-600 font-mono">
                  {Math.round(actualTemperature)}°C
                </div>
              </div>
            )}
          </div>

          {/* Enhanced chemical composition display */}
          {chemicals.length > 0 && (
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-xs shadow-lg">
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

          {/* Smooth drop success animation */}
          {isDropping && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div
                className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium
                            animate-bounce shadow-lg border border-green-600"
              >
                ✓ Added!
              </div>
            </div>
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
                          className="absolute w-1 h-1 bg-white opacity-70 rounded-full"
                          style={{
                            left: `${15 + i * 20}%`,
                            bottom: `${5 + (i % 2) * 15}px`,
                            animationName: "bounce",
                            animationDuration: "1.5s",
                            animationIterationCount: "infinite",
                            animationDelay: `${i * 0.3}s`,
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
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={isContainer ? handleChemicalDragOver : undefined}
        onDragLeave={isContainer ? handleChemicalDragLeave : undefined}
        onDrop={isContainer ? handleChemicalDrop : undefined}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleRightClick}
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
        title={
          isOnWorkbench
            ? "Double-click or right-click to remove"
            : "Drag to workbench"
        }
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

        {/* Remove button for workbench items */}
        {isOnWorkbench && (
          <button
            onClick={handleRemoveClick}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold transition-colors flex items-center justify-center shadow-md"
            title="Remove from workbench"
          >
            ×
          </button>
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && isOnWorkbench && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: contextMenuPos.x,
            top: contextMenuPos.y,
          }}
        >
          <button
            onClick={handleRemoveClick}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Remove from workbench
          </button>
        </div>
      )}
    </>
  );
};

export const equipmentList = [
  {
    id: "beaker",
    name: "Beaker",
    icon: (
      <div className="w-9 h-9 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-400 rounded-b-lg shadow-md relative overflow-hidden">
        <div className="absolute top-1 left-1 w-1 h-4 bg-white opacity-50 rounded-full"></div>
        <div className="absolute bottom-0 left-1 right-1 h-2 bg-blue-200 opacity-60 rounded-b-lg"></div>
      </div>
    ),
  },
  {
    id: "flask",
    name: "Erlenmeyer Flask",
    icon: (
      <div className="w-9 h-9 relative">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full border-2 border-gray-400 shadow-md">
          <div className="absolute top-1 left-1 w-1 h-2 bg-white opacity-50 rounded-full"></div>
        </div>
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-400 rounded-t-lg"></div>
      </div>
    ),
  },
  {
    id: "burette",
    name: "Burette",
    icon: (
      <div className="w-9 h-9 flex items-center justify-center">
        <div className="w-2 h-8 bg-gradient-to-b from-transparent to-gray-200 border-2 border-gray-400 rounded-b-lg shadow-md relative">
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-blue-200 opacity-60 rounded-b-lg"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-500 rounded-full"></div>
        </div>
      </div>
    ),
  },
  {
    id: "thermometer",
    name: "Thermometer",
    icon: (
      <div className="w-9 h-9 flex items-center justify-center">
        <div className="w-1 h-7 bg-gray-300 border border-gray-400 rounded-full relative shadow-sm">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full -mb-0.5"></div>
          <div className="absolute bottom-3 left-0 right-0 h-2 bg-red-400 rounded-full"></div>
        </div>
      </div>
    ),
  },
];
