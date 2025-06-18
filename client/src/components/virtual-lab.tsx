import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Thermometer, Scale, Beaker, Droplets, CheckCircle, X, Flame, Play, Pause, RotateCcw } from "lucide-react";
import type { ExperimentStep } from "@shared/schema";

interface VirtualLabProps {
  step: ExperimentStep;
  onStepComplete: () => void;
  isActive: boolean;
}

interface Chemical {
  id: string;
  name: string;
  formula: string;
  amount: number;
  unit: string;
  color: string;
  added: boolean;
  position?: { x: number; y: number };
}

interface Equipment {
  id: string;
  name: string;
  icon: string;
  used: boolean;
  position?: { x: number; y: number };
}

interface LabState {
  temperature: number;
  targetTemperature: number;
  isHeating: boolean;
  mixingSpeed: number;
  reactionProgress: number;
  currentColor: string;
  isReacting: boolean;
}

const ASPIRIN_CHEMICALS: Chemical[] = [
  { id: "salicylic", name: "Salicylic Acid", formula: "C₇H₆O₃", amount: 2.0, unit: "g", color: "bg-white", added: false },
  { id: "acetic", name: "Acetic Anhydride", formula: "(CH₃CO)₂O", amount: 5.0, unit: "mL", color: "bg-yellow-100", added: false },
  { id: "phosphoric", name: "Phosphoric Acid", formula: "H₃PO₄", amount: 3, unit: "drops", color: "bg-red-100", added: false },
  { id: "water", name: "Distilled Water", formula: "H₂O", amount: 20.0, unit: "mL", color: "bg-blue-100", added: false },
];

const EQUIPMENT: Equipment[] = [
  { id: "flask", name: "125mL Erlenmeyer Flask", icon: "🧪", used: false },
  { id: "thermometer", name: "Thermometer", icon: "🌡️", used: false },
  { id: "cylinder", name: "Graduated Cylinder", icon: "📏", used: false },
  { id: "stirrer", name: "Stirring Rod", icon: "🥄", used: false },
];

export default function VirtualLab({ step, onStepComplete, isActive }: VirtualLabProps) {
  const [chemicals, setChemicals] = useState<Chemical[]>(ASPIRIN_CHEMICALS);
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT);
  const [labState, setLabState] = useState<LabState>({
    temperature: 25,
    targetTemperature: 25,
    isHeating: false,
    mixingSpeed: 0,
    reactionProgress: 0,
    currentColor: '#f0f8ff',
    isReacting: false
  });
  const [draggedItem, setDraggedItem] = useState<{type: 'chemical' | 'equipment', id: string} | null>(null);
  const labBenchRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  // Temperature control and heating simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (labState.isHeating && labState.temperature < labState.targetTemperature) {
      interval = setInterval(() => {
        setLabState(prev => ({
          ...prev,
          temperature: Math.min(prev.temperature + 0.5, prev.targetTemperature)
        }));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [labState.isHeating, labState.temperature, labState.targetTemperature]);

  // Reaction simulation based on temperature and chemicals
  useEffect(() => {
    if (labState.temperature > 80 && chemicals.every(c => c.added) && !labState.isReacting) {
      setLabState(prev => ({ ...prev, isReacting: true }));
      
      const reactionInterval = setInterval(() => {
        setLabState(prev => {
          const newProgress = Math.min(prev.reactionProgress + 2, 100);
          const colorIntensity = Math.floor((newProgress / 100) * 255);
          const newColor = `rgb(${255 - colorIntensity}, ${255 - colorIntensity/2}, 200)`;
          
          return {
            ...prev,
            reactionProgress: newProgress,
            currentColor: newColor
          };
        });
      }, 100);

      setTimeout(() => {
        clearInterval(reactionInterval);
        setLabState(prev => ({ ...prev, isReacting: false }));
      }, 5000);
    }
  }, [labState.temperature, chemicals, labState.isReacting]);

  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [stepProgress, setStepProgress] = useState(0);

  const getStepConfig = (stepId: number) => {
    const configs: Record<number, {
      title: string;
      requiredChemicals: string[];
      requiredEquipment: string[];
      quiz: string;
      answer: string;
      targetTemp: number;
      instructions: string;
    }> = {
      1: {
        title: "Prepare Reagents",
        requiredChemicals: ["salicylic", "acetic"],
        requiredEquipment: ["flask", "cylinder"],
        quiz: "How much salicylic acid should be measured?",
        answer: "2.0g",
        targetTemp: 25,
        instructions: "Drag salicylic acid and acetic anhydride to the flask"
      },
      2: {
        title: "Add Catalyst",
        requiredChemicals: ["phosphoric"],
        requiredEquipment: ["stirrer"],
        quiz: "How many drops of phosphoric acid catalyst should be added?",
        answer: "2-3",
        targetTemp: 25,
        instructions: "Carefully add phosphoric acid catalyst drop by drop"
      },
      3: {
        title: "Heat Reaction Mixture",
        requiredChemicals: [],
        requiredEquipment: ["thermometer"],
        quiz: "What temperature should the reaction mixture reach?",
        answer: "85°C",
        targetTemp: 85,
        instructions: "Heat the mixture to the correct temperature"
      },
      4: {
        title: "Cool and Add Water",
        requiredChemicals: ["water"],
        requiredEquipment: ["cylinder"],
        quiz: "How much water should be added to precipitate the product?",
        answer: "20mL",
        targetTemp: 25,
        instructions: "Cool the mixture and add distilled water"
      }
    };
    return configs[stepId];
  };

  const currentConfig = getStepConfig(step.id);

  useEffect(() => {
    if (currentConfig) {
      setTargetTemperature(currentConfig.targetTemp);
      setShowQuiz(false);
      setQuizCorrect(null);
      setStepProgress(0);
    }
  }, [step.id, currentConfig]);

  const handleDragStart = (e: React.DragEvent, itemId: string, type: 'chemical' | 'equipment') => {
    setDraggedItem(`${type}-${itemId}`);
    e.dataTransfer.setData("text/plain", `${type}-${itemId}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const [type, itemId] = data.split("-");

    if (type === "chemical") {
      addChemical(itemId);
    } else if (type === "equipment") {
      useEquipment(itemId);
    }
    setDraggedItem(null);
  };

  const addChemical = (chemicalId: string) => {
    if (!currentConfig?.requiredChemicals.includes(chemicalId)) return;

    setChemicals(prev => prev.map(chem => 
      chem.id === chemicalId ? { ...chem, added: true } : chem
    ));
    setTimeout(updateProgress, 100);
  };

  const useEquipment = (equipmentId: string) => {
    if (!currentConfig?.requiredEquipment.includes(equipmentId)) return;

    setEquipment(prev => prev.map(equip => 
      equip.id === equipmentId ? { ...equip, used: true } : equip
    ));
    setTimeout(updateProgress, 100);
  };

  const updateProgress = () => {
    if (!currentConfig) return;

    const totalRequired = currentConfig.requiredChemicals.length + currentConfig.requiredEquipment.length;
    const chemicalsAdded = chemicals.filter(c => c.added && currentConfig.requiredChemicals.includes(c.id)).length;
    const equipmentUsed = equipment.filter(e => e.used && currentConfig.requiredEquipment.includes(e.id)).length;
    
    const progress = totalRequired > 0 ? ((chemicalsAdded + equipmentUsed) / totalRequired) * 100 : 0;
    setStepProgress(progress);

    if (progress >= 100 && !showQuiz) {
      setTimeout(() => setShowQuiz(true), 1000);
    }
  };

  const handleQuizSubmit = () => {
    if (!currentConfig) return;

    const isCorrect = quizAnswer.toLowerCase().includes(currentConfig.answer.toLowerCase()) ||
                     currentConfig.answer.toLowerCase().includes(quizAnswer.toLowerCase());
    setQuizCorrect(isCorrect);

    if (isCorrect) {
      setTimeout(() => {
        onStepComplete();
      }, 2000);
    }
  };

  const adjustTemperature = (delta: number) => {
    setTemperature(prev => Math.max(0, Math.min(100, prev + delta)));
  };

  if (!currentConfig) return null;

  return (
    <div className="space-y-6">
      {/* Step Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{currentConfig.title}</span>
            <Badge variant={stepProgress >= 100 ? "default" : "secondary"}>
              {Math.round(stepProgress)}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{currentConfig.instructions}</p>
          <Progress value={stepProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Virtual Lab Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lab Bench */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Beaker className="mr-2 h-5 w-5" />
              Lab Bench
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="min-h-64 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Flask Representation */}
              <div className="relative">
                <div className="w-32 h-40 bg-gradient-to-b from-transparent to-blue-100 rounded-b-full border-4 border-gray-400 flex items-end justify-center">
                  {chemicals.filter(c => c.added).length > 0 && (
                    <div className="w-24 h-16 bg-gradient-to-t from-yellow-200 to-transparent rounded-b-full mb-2 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">
                        {chemicals.filter(c => c.added).length} chemicals
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Temperature Display */}
                <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <div className="flex items-center space-x-1">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-semibold">{temperature}°C</span>
                  </div>
                </div>
              </div>

              {stepProgress < 100 ? (
                <p className="text-gray-500 text-center mt-4">
                  Drag chemicals and equipment here
                </p>
              ) : (
                <p className="text-green-600 text-center mt-4 font-semibold">
                  Ready for next step!
                </p>
              )}
            </div>

            {/* Temperature Controls */}
            {step.id === 3 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <Label className="text-sm font-semibold mb-2 block">Temperature Control</Label>
                <div className="flex items-center space-x-2">
                  <Button size="sm" onClick={() => adjustTemperature(-5)}>-5°C</Button>
                  <Button size="sm" onClick={() => adjustTemperature(5)}>+5°C</Button>
                  <span className="text-sm text-gray-600">
                    Target: {targetTemperature}°C
                  </span>
                </div>
                {Math.abs(temperature - targetTemperature) <= 2 && (
                  <div className="mt-2 text-green-600 text-sm flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Correct temperature reached!
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chemicals & Equipment */}
        <div className="space-y-4">
          {/* Chemicals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="mr-2 h-5 w-5" />
                Chemicals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {chemicals.map((chemical) => (
                  <div
                    key={chemical.id}
                    draggable={!chemical.added && currentConfig.requiredChemicals.includes(chemical.id)}
                    onDragStart={(e) => handleDragStart(e, chemical.id, 'chemical')}
                    className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                      chemical.added 
                        ? 'bg-green-50 border-green-200 opacity-50' 
                        : currentConfig.requiredChemicals.includes(chemical.id)
                        ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                        : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                    } ${draggedItem === `chemical-${chemical.id}` ? 'scale-105 shadow-lg' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${chemical.color} border border-gray-300`}></div>
                      <div className="flex-grow">
                        <div className="font-semibold text-sm">{chemical.name}</div>
                        <div className="text-gray-500 text-xs">{chemical.formula}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{chemical.amount} {chemical.unit}</div>
                        {chemical.added && <CheckCircle className="h-4 w-4 text-green-500 mt-1" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="mr-2 h-5 w-5" />
                Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {equipment.map((item) => (
                  <div
                    key={item.id}
                    draggable={!item.used && currentConfig.requiredEquipment.includes(item.id)}
                    onDragStart={(e) => handleDragStart(e, item.id, 'equipment')}
                    className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                      item.used 
                        ? 'bg-green-50 border-green-200 opacity-50' 
                        : currentConfig.requiredEquipment.includes(item.id)
                        ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                        : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                    } ${draggedItem === `equipment-${item.id}` ? 'scale-105 shadow-lg' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-grow">
                        <div className="font-semibold text-sm">{item.name}</div>
                      </div>
                      {item.used && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quiz Section */}
      {showQuiz && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Knowledge Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="font-semibold">{currentConfig.quiz}</p>
              
              <div className="flex space-x-2">
                <Input
                  value={quizAnswer}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="flex-grow"
                />
                <Button onClick={handleQuizSubmit} disabled={!quizAnswer.trim()}>
                  Submit
                </Button>
              </div>

              {quizCorrect !== null && (
                <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                  quizCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {quizCorrect ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Correct! Proceeding to next step...</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5" />
                      <span>Incorrect. The correct answer is: {currentConfig.answer}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Notice */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Safety Reminder</h4>
              <p className="text-red-700 text-sm">
                In a real laboratory, always wear safety goggles, gloves, and work in a well-ventilated area. 
                Acetic anhydride is corrosive and phosphoric acid can cause burns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}