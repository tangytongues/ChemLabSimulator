import React, { useState, useCallback, useMemo } from "react";
import { Equipment } from "./Equipment";
import { WorkBench } from "./WorkBench";
import { Chemical } from "./Chemical";
import { Controls } from "./Controls";
import { ResultsPanel } from "./ResultsPanel";
import { ExperimentSteps } from "./ExperimentSteps";
import {
  FlaskConical,
  Atom,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  Beaker,
  TestTube,
  Thermometer,
  Droplets,
  Erlenmeyer,
} from "lucide-react";
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
  experimentTitle: string;
  allSteps: ExperimentStep[];
}

function VirtualLabApp({
  step,
  onStepComplete,
  isActive,
  stepNumber,
  totalSteps,
  experimentTitle,
  allSteps,
}: VirtualLabProps) {
  const [equipmentPositions, setEquipmentPositions] = useState<
    EquipmentPosition[]
  >([]);
  const [selectedChemical, setSelectedChemical] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [showSteps, setShowSteps] = useState(true);
  const [currentStep, setCurrentStep] = useState(stepNumber);
  const [measurements, setMeasurements] = useState({
    volume: 0,
    concentration: 0,
    ph: 7,
    molarity: 0,
    moles: 0,
    temperature: 25,
  });

  // Use dynamic experiment steps from allSteps prop
  const experimentSteps = allSteps.map((stepData, index) => ({
    id: stepData.id,
    title: stepData.title,
    description: stepData.description,
    duration: parseInt(stepData.duration?.replace(/\D/g, "") || "5"),
    status: (stepData.id === currentStep
      ? "active"
      : stepData.id < currentStep
        ? "completed"
        : "pending") as "active" | "completed" | "pending",
    requirements: stepData.safety
      ? [stepData.safety]
      : [`${stepData.title} requirements`],
  }));

  // Experiment-specific chemicals and equipment
  const experimentChemicals = useMemo(() => {
    if (experimentTitle.includes("Aspirin")) {
      return [
        {
          id: "salicylic_acid",
          name: "Salicylic Acid",
          formula: "C₇H₆O₃",
          color: "#FFFFFF",
          concentration: "2.0 g",
          volume: 25,
        },
        {
          id: "acetic_anhydride",
          name: "Acetic Anhydride",
          formula: "(CH₃CO)₂O",
          color: "#E6E6FA",
          concentration: "5 mL",
          volume: 50,
        },
        {
          id: "phosphoric_acid",
          name: "Phosphoric Acid",
          formula: "H₃PO₄",
          color: "#FFE4B5",
          concentration: "Catalyst",
          volume: 10,
        },
        {
          id: "distilled_water",
          name: "Distilled Water",
          formula: "H₂O",
          color: "#87CEEB",
          concentration: "Pure",
          volume: 100,
        },
      ];
    } else if (experimentTitle.includes("Acid-Base")) {
      return [
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
    } else if (experimentTitle.includes("Equilibrium")) {
      return [
        {
          id: "cocl2",
          name: "Cobalt(II) Chloride",
          formula: "CoCl₂",
          color: "#FFB6C1",
          concentration: "0.1 M",
          volume: 30,
        },
        {
          id: "hcl_conc",
          name: "Concentrated HCl",
          formula: "HCl",
          color: "#FFFF99",
          concentration: "12 M",
          volume: 20,
        },
        {
          id: "water",
          name: "Distilled Water",
          formula: "H₂O",
          color: "#87CEEB",
          concentration: "Pure",
          volume: 100,
        },
        {
          id: "ice",
          name: "Ice Bath",
          formula: "H₂O(s)",
          color: "#E0F6FF",
          concentration: "0°C",
          volume: 50,
        },
      ];
    }
    return [];
  }, [experimentTitle]);

  const experimentEquipment = useMemo(() => {
    if (experimentTitle.includes("Aspirin")) {
      return [
        {
          id: "erlenmeyer_flask",
          name: "125mL Erlenmeyer Flask",
          icon: <FlaskConical size={36} />,
        },
        {
          id: "thermometer",
          name: "Thermometer",
          icon: <Thermometer size={36} />,
        },
        {
          id: "graduated_cylinder",
          name: "Graduated Cylinder",
          icon: <TestTube size={36} />,
        },
        { id: "water_bath", name: "Water Bath", icon: <Beaker size={36} /> },
      ];
    } else if (experimentTitle.includes("Acid-Base")) {
      return [
        { id: "burette", name: "50mL Burette", icon: <TestTube size={36} /> },
        {
          id: "conical_flask",
          name: "250mL Conical Flask",
          icon: <FlaskConical size={36} />,
        },
        { id: "pipette", name: "25mL Pipette", icon: <Droplets size={36} /> },
        { id: "beaker", name: "Beaker", icon: <Beaker size={36} /> },
      ];
    } else if (experimentTitle.includes("Equilibrium")) {
      return [
        { id: "test_tubes", name: "Test Tubes", icon: <TestTube size={36} /> },
        { id: "beakers", name: "Beakers", icon: <Beaker size={36} /> },
        {
          id: "hot_water_bath",
          name: "Hot Water Bath",
          icon: <Thermometer size={36} />,
        },
        { id: "ice_bath", name: "Ice Bath", icon: <FlaskConical size={36} /> },
      ];
    }
    return [];
  }, [experimentTitle]);

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

            // Update measurements for experiments 2 and 3
            if (
              experimentTitle.includes("Acid-Base") ||
              experimentTitle.includes("Equilibrium")
            ) {
              const calculations = calculateChemicalProperties(
                newChemicals[0],
                newChemicals[0].amount,
                totalVolume,
              );
              setMeasurements((prev) => ({
                ...prev,
                volume: totalVolume,
                concentration: calculations.molarity,
                ph: calculations.ph,
                molarity: calculations.molarity,
                moles: calculations.moles,
              }));
            }
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

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  return (
    <div
      className="w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden flex"
      style={{ minHeight: "75vh" }}
    >
      {/* Step Procedure Side Panel */}
      <div
        className={`transition-all duration-300 ${showSteps ? "w-80" : "w-12"} flex-shrink-0`}
      >
        {showSteps ? (
          <div className="h-full bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center">
                <List className="w-4 h-4 mr-2" />
                <span className="font-semibold text-sm">Procedure</span>
              </div>
              <button
                onClick={() => setShowSteps(false)}
                className="text-white/80 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <ExperimentSteps
                currentStep={currentStep}
                steps={experimentSteps}
                onStepClick={handleStepClick}
              />

              {/* Concentration Measurement Panel - For Experiments 2 & 3 */}
              {(experimentTitle.includes("Acid-Base") ||
                experimentTitle.includes("Equilibrium")) && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm flex items-center">
                      <FlaskConical className="w-4 h-4 mr-2 text-blue-600" />
                      Live Measurements
                    </h3>
                    {isRunning && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-xs text-blue-600 font-medium">
                          Volume
                        </div>
                        <div className="text-sm font-bold text-blue-900">
                          {measurements.volume.toFixed(1)} mL
                        </div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <div className="text-xs text-purple-600 font-medium">
                          pH
                        </div>
                        <div className="text-sm font-bold text-purple-900">
                          {measurements.ph.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-xs text-green-600 font-medium">
                          Molarity
                        </div>
                        <div className="text-sm font-bold text-green-900">
                          {measurements.molarity.toFixed(3)} M
                        </div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <div className="text-xs text-orange-600 font-medium">
                          Moles
                        </div>
                        <div className="text-sm font-bold text-orange-900">
                          {measurements.moles.toFixed(4)} mol
                        </div>
                      </div>
                    </div>

                    {experimentTitle.includes("Equilibrium") && (
                      <div className="bg-indigo-50 p-2 rounded">
                        <div className="text-xs text-indigo-600 font-medium">
                          Temperature
                        </div>
                        <div className="text-sm font-bold text-indigo-900">
                          {measurements.temperature}°C
                        </div>
                      </div>
                    )}

                    {experimentTitle.includes("Acid-Base") &&
                      measurements.volume > 0 && (
                        <div className="bg-gray-50 p-2 rounded border-t border-gray-200">
                          <div className="text-xs text-gray-600 font-medium mb-1">
                            Titration Status
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-600">Endpoint: </span>
                            <span className="font-medium text-gray-900">
                              {measurements.ph > 8.5
                                ? "Reached"
                                : "Not reached"}
                            </span>
                          </div>
                        </div>
                      )}

                    {experimentTitle.includes("Equilibrium") && (
                      <div className="bg-gray-50 p-2 rounded border-t border-gray-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">
                          Equilibrium
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-600">Color: </span>
                          <span className="font-medium text-gray-900">
                            {measurements.ph < 7
                              ? "Blue (acidic)"
                              : "Pink (basic)"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col items-center">
            <button
              onClick={() => setShowSteps(true)}
              className="p-3 text-gray-600 hover:text-blue-600 border-b border-gray-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-center">
              <div className="transform -rotate-90 text-xs font-medium text-gray-500 whitespace-nowrap">
                Procedure
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Lab Content */}
      <div className="flex-1 flex flex-col">
        {/* Equipment Bar - Top Horizontal */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 text-sm flex items-center">
              <Atom className="w-4 h-4 mr-2 text-blue-600" />
              {experimentTitle} - Equipment
            </h4>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-600 mr-3">
                Step {currentStep} of {experimentSteps.length}
              </div>
              <Controls
                isRunning={isRunning}
                onStart={handleStartExperiment}
                onStop={() => setIsRunning(false)}
                onReset={() => {
                  setEquipmentPositions([]);
                  setResults([]);
                  setIsRunning(false);
                  setCurrentStep(1);
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-2 overflow-x-auto pb-2">
            {experimentEquipment.map((equipment) => (
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
          <div className="flex-1 p-6 relative">
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

        {/* Calculator and pH Meter Bar - For Experiments 2 & 3 */}
        {(experimentTitle.includes("Acid-Base") ||
          experimentTitle.includes("Equilibrium")) && (
          <div className="bg-gray-900 text-white p-3 border-t border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* pH Meter Section */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">pH Meter</span>
                  </div>
                  <div className="bg-black px-3 py-1 rounded font-mono text-lg">
                    {measurements.ph.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {measurements.ph < 7
                      ? "Acidic"
                      : measurements.ph > 7
                        ? "Basic"
                        : "Neutral"}
                  </div>
                </div>

                {/* Volume Tracker */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">Volume</span>
                  <div className="bg-black px-3 py-1 rounded font-mono text-lg">
                    {measurements.volume.toFixed(1)} mL
                  </div>
                </div>

                {/* Molarity Calculator */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">Molarity</span>
                  <div className="bg-black px-3 py-1 rounded font-mono text-lg">
                    {measurements.molarity.toFixed(3)} M
                  </div>
                </div>
              </div>

              {/* Calculator Actions */}
              <div className="flex items-center space-x-3">
                {experimentTitle.includes("Acid-Base") && (
                  <button
                    onClick={() => {
                      const equivalencePoint = 25.0; // mL for 0.1M solutions
                      const percentComplete =
                        (measurements.volume / equivalencePoint) * 100;
                      console.log(
                        `Titration ${percentComplete.toFixed(1)}% complete`,
                      );
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Calculate Endpoint
                  </button>
                )}

                {experimentTitle.includes("Equilibrium") && (
                  <button
                    onClick={() => {
                      const kc = Math.pow(10, -measurements.ph); // Simplified equilibrium constant
                      console.log(
                        `Equilibrium constant: ${kc.toExponential(2)}`,
                      );
                    }}
                    className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Calculate Kc
                  </button>
                )}

                <button
                  onClick={() => {
                    // Reset calculations
                    setMeasurements((prev) => ({
                      ...prev,
                      volume: 0,
                      concentration: 0,
                      ph: 7,
                      molarity: 0,
                      moles: 0,
                    }));
                  }}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Additional calculation info */}
            {measurements.volume > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center space-x-4">
                    <span>Moles: {measurements.moles.toFixed(4)} mol</span>
                    {experimentTitle.includes("Acid-Base") && (
                      <span>
                        Endpoint:{" "}
                        {measurements.ph > 8.5 ? "✓ Reached" : "○ Not reached"}
                      </span>
                    )}
                    {experimentTitle.includes("Equilibrium") && (
                      <span>Temperature: {measurements.temperature}°C</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualLabApp;
