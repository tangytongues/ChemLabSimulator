import React, { useState, useCallback } from "react";
import { Equipment, equipmentList } from "./Equipment";
import { WorkBench } from "./WorkBench";
import { Chemical, chemicalsList } from "./Chemical";
import { Controls } from "./Controls";
import { ResultsPanel } from "./ResultsPanel";
import { FlaskConical, Atom, BookOpen } from "lucide-react";
import type { ExperimentStep } from "@shared/schema";

interface EquipmentPosition {
  id: string;
  x: number;
  y: number;
  chemicals: Array<{
    id: string;
    name: string;
    color: string;
    amount: number;
    concentration: string;
  }>;
}

interface Result {
  id: string;
  type: "success" | "warning" | "error" | "reaction";
  title: string;
  description: string;
  timestamp: string;
  calculation?: {
    volumeAdded?: number;
    totalVolume?: number;
    concentration?: string;
    molarity?: number;
    moles?: number;
    reaction?: string;
    yield?: number;
    ph?: number;
    balancedEquation?: string;
    reactionType?: string;
    products?: string[];
    mechanism?: string[];
    thermodynamics?: {
      deltaH?: number;
      deltaG?: number;
      equilibriumConstant?: number;
    };
  };
}

interface VirtualLabProps {
  step: ExperimentStep;
  onStepComplete: () => void;
  isActive: boolean;
  stepNumber: number;
  totalSteps: number;
}

function VirtualLabApp({
  step,
  onStepComplete,
  isActive,
  stepNumber,
  totalSteps,
}: VirtualLabProps) {
  const [equipmentPositions, setEquipmentPositions] = useState<
    EquipmentPosition[]
  >([]);
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  const handleEquipmentDrop = useCallback(
    (id: string, x: number, y: number) => {
      setEquipmentPositions((prev) => {
        const existing = prev.find((pos) => pos.id === id);
        if (existing) {
          return prev.map((pos) => (pos.id === id ? { ...pos, x, y } : pos));
        }
        return [...prev, { id, x, y, chemicals: [] }];
      });
    },
    [],
  );

  const calculateChemicalProperties = (
    chemical: any,
    amount: number,
    totalVolume: number,
  ) => {
    const concentrations: { [key: string]: number } = {
      hcl: 0.1, // 0.1 M HCl
      naoh: 0.1, // 0.1 M NaOH
      phenol: 0, // Indicator (no molarity)
    };

    const molarity = concentrations[chemical.id] || 0;
    const volumeInL = amount / 1000; // Convert mL to L
    const moles = molarity * volumeInL;

    // Calculate pH for acids and bases
    let ph = 7; // neutral
    if (chemical.id === "hcl") {
      ph = -Math.log10(molarity * (amount / totalVolume)); // Acidic
    } else if (chemical.id === "naoh") {
      const poh = -Math.log10(molarity * (amount / totalVolume));
      ph = 14 - poh; // Basic
    }

    return {
      molarity: molarity * (amount / totalVolume),
      moles,
      ph: Math.max(0, Math.min(14, ph)),
    };
  };

  const handleChemicalSelect = (id: string) => {
    setSelectedChemical(selectedChemical === id ? null : id);
  };

  const handleChemicalDrop = (
    chemicalId: string,
    equipmentId: string,
    amount: number,
  ) => {
    const chemical = chemicalsList.find((c) => c.id === chemicalId);
    if (!chemical) return;

    setEquipmentPositions((prev) =>
      prev.map((pos) => {
        if (pos.id === equipmentId) {
          const newChemicals = [
            ...pos.chemicals,
            {
              id: chemicalId,
              name: chemical.name,
              color: chemical.color,
              amount,
              concentration: chemical.concentration,
            },
          ];

          // Calculate reaction if chemicals are mixed
          if (newChemicals.length >= 2) {
            const totalVolume = newChemicals.reduce(
              (sum, c) => sum + c.amount,
              0,
            );
            handleReaction(newChemicals, totalVolume);
          }

          return { ...pos, chemicals: newChemicals };
        }
        return pos;
      }),
    );

    setSelectedChemical(null);
  };

  const handleReaction = (chemicals: any[], totalVolume: number) => {
    // Simplified reaction detection
    const hasAcid = chemicals.some((c) => c.id === "hcl");
    const hasBase = chemicals.some((c) => c.id === "naoh");
    const hasIndicator = chemicals.some((c) => c.id === "phenol");

    if (hasAcid && hasBase) {
      const result: Result = {
        id: Date.now().toString(),
        type: "reaction",
        title: "Acid-Base Neutralization Detected",
        description: "HCl + NaOH → NaCl + H₂O",
        timestamp: new Date().toLocaleTimeString(),
        calculation: {
          reaction: "HCl + NaOH → NaCl + H₂O",
          reactionType: "Acid-Base Neutralization",
          balancedEquation: "HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)",
          products: ["Sodium Chloride (NaCl)", "Water (H₂O)"],
          yield: 95,
        },
      };

      setResults((prev) => [...prev, result]);
    }
  };

  const handleStartExperiment = () => {
    setIsRunning(true);
    onStepComplete();
  };

  const handleClearResults = () => {
    setResults([]);
  };

  return (
    <div
      className="w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden flex flex-col"
      style={{ minHeight: "75vh" }}
    >
      {/* Equipment Bar - Top Horizontal */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800 text-sm flex items-center">
            <Atom className="w-4 h-4 mr-2 text-blue-600" />
            Laboratory Equipment
          </h4>
          <div className="flex items-center space-x-2">
            <Controls
              isRunning={isRunning}
              onStart={handleStartExperiment}
              onStop={() => setIsRunning(false)}
              onReset={() => {
                setEquipmentPositions([]);
                setResults([]);
                setIsRunning(false);
              }}
            />
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-2 overflow-x-auto pb-2">
          {equipmentList.map((equipment) => (
            <div key={equipment.id} className="flex-shrink-0">
              <Equipment
                id={equipment.id}
                name={equipment.name}
                icon={equipment.icon}
                onDrag={handleEquipmentDrop}
                position={null}
                chemicals={[]}
                onChemicalDrop={handleChemicalDrop}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Work Area - Expanded */}
      <div className="flex-1 flex flex-col">
        {/* Lab Work Surface */}
        <div className="flex-1 p-6">
          <WorkBench
            onDrop={handleEquipmentDrop}
            selectedChemical={selectedChemical}
            isRunning={isRunning}
          >
            {equipmentPositions.map((pos) => {
              const equipment = equipmentList.find((eq) => eq.id === pos.id);
              return equipment ? (
                <Equipment
                  key={pos.id}
                  id={pos.id}
                  name={equipment.name}
                  icon={equipment.icon}
                  onDrag={handleEquipmentDrop}
                  position={pos}
                  chemicals={pos.chemicals}
                  onChemicalDrop={handleChemicalDrop}
                />
              ) : null;
            })}
          </WorkBench>
        </div>

        {/* Results Panel - When present */}
        {results.length > 0 && (
          <div className="border-t border-gray-200 bg-white/90 backdrop-blur-sm">
            <ResultsPanel results={results} onClear={handleClearResults} />
          </div>
        )}
      </div>

      {/* Reagents Bar - Bottom Horizontal */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3">
        <h4 className="font-semibold text-gray-800 text-sm flex items-center mb-2">
          <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
          Chemical Reagents
        </h4>
        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {chemicalsList.map((chemical) => (
            <div key={chemical.id} className="flex-shrink-0">
              <Chemical
                id={chemical.id}
                name={chemical.name}
                formula={chemical.formula}
                color={chemical.color}
                concentration={chemical.concentration}
                volume={chemical.volume}
                onSelect={handleChemicalSelect}
                selected={selectedChemical === chemical.id}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualLabApp;
