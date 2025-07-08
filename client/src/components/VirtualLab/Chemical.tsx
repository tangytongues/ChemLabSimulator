import React from "react";

interface ChemicalProps {
  id: string;
  name: string;
  formula: string;
  color: string;
  onSelect: (id: string) => void;
  selected: boolean;
  concentration?: string;
  volume?: number;
}

export const Chemical: React.FC<ChemicalProps> = ({
  id,
  name,
  formula,
  color,
  onSelect,
  selected,
  concentration,
  volume,
}) => {
  const [dragAmount, setDragAmount] = React.useState(volume || 25);
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "chemical",
      JSON.stringify({
        id,
        name,
        formula,
        color,
        concentration,
        volume: dragAmount,
      }),
    );
    e.dataTransfer.effectAllowed = "copy";

    // Add smooth visual feedback during drag
    const target = e.currentTarget as HTMLElement;
    target.style.transform = "scale(1.05) rotate(2deg)";
    target.style.opacity = "0.9";
    target.style.transition = "all 0.2s ease-out";

    // Create custom drag image with better styling
    setTimeout(() => {
      const dragImage = target.cloneNode(true) as HTMLElement;
      dragImage.style.transform = "rotate(3deg) scale(1.05)";
      dragImage.style.opacity = "0.85";
      dragImage.style.border = "2px solid #7C3AED";
      dragImage.style.borderRadius = "12px";
      dragImage.style.boxShadow = "0 8px 25px rgba(124, 58, 237, 0.3)";
      dragImage.style.position = "absolute";
      dragImage.style.top = "-1000px";
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 50, 50);

      // Clean up drag image safely
      requestAnimationFrame(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      });
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Smoothly reset drag styling
    const target = e.currentTarget as HTMLElement;
    target.style.transform = "scale(1) rotate(0deg)";
    target.style.opacity = "1";
    target.style.transition = "all 0.3s ease-out";

    // Remove any drag classes
    target.classList.remove("dragging");

    // Clean up any leftover styles after animation
    setTimeout(() => {
      target.style.transition = "";
    }, 300);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(id)}
      className={`p-4 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-300 ease-out border-2 transform hover:scale-[1.02] ${
        selected
          ? "border-purple-500 bg-purple-50 shadow-lg scale-[1.02] ring-2 ring-purple-300 ring-opacity-50"
          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-md transition-all duration-300 ease-out overflow-hidden"
            style={{ backgroundColor: color }}
          >
            {/* Improved liquid animation effect */}
            <div
              className="absolute inset-1 rounded-full opacity-50 transition-all duration-500"
              style={{
                backgroundColor: color,
                animation: selected ? "pulse 2s ease-in-out infinite" : "none",
              }}
            ></div>

            {/* Surface shimmer effect */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-white opacity-40 rounded-full transition-opacity duration-300"></div>

            {/* Gentle liquid movement */}
            <div
              className="absolute bottom-1 left-1 right-1 h-2 rounded-b-full opacity-30 transition-all duration-700"
              style={{
                backgroundColor: color,
                transform: selected ? "translateY(-1px)" : "translateY(0px)",
              }}
            ></div>
          </div>

          {/* Smooth chemical drop animation when selected */}
          {selected && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full border-2 border-purple-500 flex items-center justify-center transition-all duration-300 ease-out animate-bounce shadow-sm">
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ backgroundColor: color }}
              ></div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div
            className={`font-semibold text-lg ${selected ? "text-purple-900" : "text-gray-900"}`}
          >
            {name}
          </div>
          <div
            className={`text-sm font-mono ${selected ? "text-purple-700" : "text-gray-500"}`}
          >
            {formula}
          </div>
          {concentration && (
            <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">
              {concentration}
            </div>
          )}
        </div>

        {selected && (
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="text-xs text-purple-600 font-medium mt-1">
              SELECTED
            </div>
          </div>
        )}
      </div>

      {/* Volume indicator with animation */}
      {volume && (
        <div className="mt-3 bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${Math.min(100, (volume / 100) * 100)}%`,
              backgroundColor: color,
              boxShadow: `inset 0 1px 2px rgba(0,0,0,0.1)`,
            }}
          >
            <div className="h-full w-full bg-gradient-to-r from-transparent to-white opacity-30 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Volume Control */}
      {selected && (
        <div className="mt-3 bg-gray-50 rounded-lg p-2">
          <label className="text-xs text-gray-600 font-medium block mb-1">
            Amount (mL)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={dragAmount}
            onChange={(e) => setDragAmount(Number(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-purple-500 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Drag instruction with animation */}
      <div
        className={`text-xs text-center mt-2 transition-all ${selected ? "opacity-100 animate-pulse" : "opacity-0"}`}
      >
        <div className="flex items-center justify-center space-x-1">
          <span className="text-purple-600 font-medium">Drag to equipment</span>
          <span className="text-purple-500 animate-bounce">→</span>
        </div>
      </div>
    </div>
  );
};

export const chemicalsList = [
  {
    id: "hcl",
    name: "Hydrochloric Acid",
    formula: "HCl",
    color: "#FFE135",
    concentration: "0.1 M",
    volume: 25,
  },
  {
    id: "naoh",
    name: "Sodium Hydroxide",
    formula: "NaOH",
    color: "#87CEEB",
    concentration: "0.1 M",
    volume: 50,
  },
  {
    id: "phenol",
    name: "Phenolphthalein",
    formula: "C₂₀H₁₄O₄",
    color: "#FFB6C1",
    concentration: "Indicator",
    volume: 10,
  },
];
