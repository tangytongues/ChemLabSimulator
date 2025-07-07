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
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "chemical",
      JSON.stringify({
        id,
        name,
        formula,
        color,
        concentration,
        volume: volume || 25,
      }),
    );
    e.dataTransfer.effectAllowed = "copy";

    // Add visual feedback during drag
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = "rotate(5deg) scale(1.1)";
    dragImage.style.opacity = "0.8";
    dragImage.style.border = "2px solid #7C3AED";
    dragImage.style.borderRadius = "8px";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 50);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Reset any drag styling
    e.currentTarget.classList.remove("dragging");
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(id)}
      className={`p-4 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 border-2 transform hover:scale-105 ${
        selected
          ? "border-purple-500 bg-purple-50 shadow-lg scale-105"
          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-md transition-all duration-200"
            style={{ backgroundColor: color }}
          >
            {/* Liquid animation effect */}
            <div
              className="absolute inset-1 rounded-full opacity-60 animate-pulse"
              style={{ backgroundColor: color }}
            ></div>
          </div>

          {/* Chemical drop animation when selected */}
          {selected && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full border-2 border-purple-500 flex items-center justify-center animate-bounce">
              <div
                className="w-2 h-2 rounded-full"
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

      {/* Drag instruction */}
      <div
        className={`text-xs text-center mt-2 transition-opacity ${selected ? "opacity-100" : "opacity-0"}`}
      >
        <span className="text-purple-600 font-medium">Drag to equipment →</span>
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
