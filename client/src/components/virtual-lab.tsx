import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Thermometer, Beaker, Droplets, CheckCircle, X, Flame, Play, Pause, RotateCcw, Scale } from "lucide-react";
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
  flaskContents: string[];
}

const ASPIRIN_CHEMICALS: Chemical[] = [
  { id: "salicylic", name: "Salicylic Acid", formula: "C₇H₆O₃", amount: 2.0, unit: "g", color: "#ffffff", added: false },
  { id: "acetic", name: "Acetic Anhydride", formula: "(CH₃CO)₂O", amount: 5.0, unit: "mL", color: "#fef3c7", added: false },
  { id: "phosphoric", name: "Phosphoric Acid", formula: "H₃PO₄", amount: 3, unit: "drops", color: "#fecaca", added: false },
  { id: "water", name: "Distilled Water", formula: "H₂O", amount: 20.0, unit: "mL", color: "#dbeafe", added: false },
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
    isReacting: false,
    flaskContents: []
  });
  
  const [draggedItem, setDraggedItem] = useState<{type: 'chemical' | 'equipment', id: string} | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const labBenchRef = useRef<HTMLDivElement>(null);

  // Temperature control simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (labState.isHeating && labState.temperature < labState.targetTemperature) {
      interval = setInterval(() => {
        setLabState(prev => ({
          ...prev,
          temperature: Math.min(prev.temperature + 1, prev.targetTemperature)
        }));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [labState.isHeating, labState.temperature, labState.targetTemperature]);

  // Reaction simulation
  useEffect(() => {
    if (labState.temperature > 80 && labState.flaskContents.length >= 2 && !labState.isReacting) {
      setLabState(prev => ({ ...prev, isReacting: true }));
      
      const reactionInterval = setInterval(() => {
        setLabState(prev => {
          const newProgress = Math.min(prev.reactionProgress + 3, 100);
          const colorIntensity = Math.floor((newProgress / 100) * 200);
          const newColor = `hsl(${60 - newProgress/5}, 70%, ${80 - colorIntensity/4}%)`;
          
          return {
            ...prev,
            reactionProgress: newProgress,
            currentColor: newColor
          };
        });
      }, 150);

      setTimeout(() => {
        clearInterval(reactionInterval);
        setLabState(prev => ({ ...prev, isReacting: false }));
      }, 5000);
    }
  }, [labState.temperature, labState.flaskContents, labState.isReacting]);

  const handleDragStart = (e: React.DragEvent, type: 'chemical' | 'equipment', id: string) => {
    setDraggedItem({ type, id });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    const rect = labBenchRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedItem.type === 'chemical') {
      // Add chemical to flask
      const chemical = chemicals.find(c => c.id === draggedItem.id);
      if (chemical && !chemical.added) {
        setChemicals(prev => prev.map(c => 
          c.id === draggedItem.id ? { ...c, added: true, position: { x, y } } : c
        ));
        setLabState(prev => ({
          ...prev,
          flaskContents: [...prev.flaskContents, chemical.name]
        }));
      }
    } else {
      // Position equipment
      setEquipment(prev => prev.map(e => 
        e.id === draggedItem.id ? { ...e, used: true, position: { x, y } } : e
      ));
    }

    setDraggedItem(null);
  };

  const startHeating = () => {
    setLabState(prev => ({ ...prev, isHeating: true, targetTemperature: 85 }));
  };

  const stopHeating = () => {
    setLabState(prev => ({ ...prev, isHeating: false }));
  };

  const resetLab = () => {
    setChemicals(ASPIRIN_CHEMICALS);
    setEquipment(EQUIPMENT);
    setLabState({
      temperature: 25,
      targetTemperature: 25,
      isHeating: false,
      mixingSpeed: 0,
      reactionProgress: 0,
      currentColor: '#f0f8ff',
      isReacting: false,
      flaskContents: []
    });
  };

  const getStepQuiz = (stepId: number) => {
    const quizzes: Record<number, {question: string, answer: string}> = {
      1: { question: "How many grams of salicylic acid should be used?", answer: "2.0" },
      2: { question: "How many drops of phosphoric acid catalyst should be added?", answer: "3" },
      3: { question: "What temperature should the reaction mixture be heated to?", answer: "85" },
      4: { question: "How many mL of distilled water should be added?", answer: "20" },
    };
    return quizzes[stepId] || null;
  };

  const checkQuizAnswer = () => {
    const quiz = getStepQuiz(step.id);
    if (quiz) {
      const correct = quizAnswer.toLowerCase().includes(quiz.answer.toLowerCase());
      setQuizCorrect(correct);
      if (correct) {
        setTimeout(() => {
          setShowQuiz(false);
          onStepComplete();
        }, 1500);
      }
    }
  };

  const canCompleteStep = () => {
    switch (step.id) {
      case 1: return labState.flaskContents.includes("Salicylic Acid") && labState.flaskContents.includes("Acetic Anhydride");
      case 2: return labState.flaskContents.includes("Phosphoric Acid");
      case 3: return labState.temperature >= 80 && labState.reactionProgress > 50;
      case 4: return labState.flaskContents.includes("Distilled Water");
      default: return true;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Lab Bench - Interactive Area */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Virtual Lab Bench - {step.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={labBenchRef}
              className="relative bg-gradient-to-b from-blue-50 to-blue-100 border-2 border-dashed border-blue-300 rounded-lg h-96 overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Lab Bench Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-100 to-amber-200 opacity-30"></div>
              
              {/* Main Flask */}
              <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div 
                    className="w-24 h-32 rounded-b-full border-4 border-gray-700 transition-all duration-500"
                    style={{ backgroundColor: labState.currentColor }}
                  >
                    {/* Flask contents visualization */}
                    {labState.flaskContents.length > 0 && (
                      <div className="absolute bottom-2 left-2 right-2 text-xs text-gray-700">
                        {labState.flaskContents.map((content, idx) => (
                          <div key={idx} className="opacity-75">• {content}</div>
                        ))}
                      </div>
                    )}
                    
                    {/* Heating indicator */}
                    {labState.isHeating && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                        <Flame className="h-6 w-6 text-red-500 animate-pulse" />
                      </div>
                    )}
                    
                    {/* Reaction bubbles */}
                    {labState.isReacting && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i}
                            className="absolute w-2 h-2 bg-white rounded-full opacity-70 animate-bounce"
                            style={{
                              left: `${20 + i * 15}%`,
                              bottom: `${10 + (i % 3) * 20}%`,
                              animationDelay: `${i * 0.2}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Flask neck */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 border-4 border-gray-700 border-b-0 rounded-t-lg bg-transparent"></div>
                </div>
              </div>

              {/* Positioned Equipment */}
              {equipment.filter(e => e.used && e.position).map(item => (
                <div
                  key={item.id}
                  className="absolute text-2xl"
                  style={{ left: item.position!.x, top: item.position!.y }}
                >
                  {item.icon}
                </div>
              ))}

              {/* Drop Instructions */}
              {labState.flaskContents.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg">
                  Drag chemicals and equipment here to start the experiment
                </div>
              )}
            </div>

            {/* Temperature and Controls */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    <span className="font-medium">Temperature: {labState.temperature.toFixed(1)}°C</span>
                  </div>
                  {labState.isReacting && (
                    <Badge variant="secondary" className="animate-pulse">
                      Reacting... {labState.reactionProgress.toFixed(0)}%
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={startHeating}
                    disabled={labState.isHeating}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Flame className="h-4 w-4 mr-1" />
                    Heat
                  </Button>
                  <Button
                    onClick={stopHeating}
                    disabled={!labState.isHeating}
                    size="sm"
                    variant="outline"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Stop
                  </Button>
                  <Button onClick={resetLab} size="sm" variant="outline">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              {labState.reactionProgress > 0 && (
                <div>
                  <Label>Reaction Progress</Label>
                  <Progress value={labState.reactionProgress} className="mt-1" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Chemicals and Equipment */}
      <div className="space-y-6">
        {/* Chemicals Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Chemicals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {chemicals.map(chemical => (
              <div
                key={chemical.id}
                draggable={!chemical.added}
                onDragStart={(e) => handleDragStart(e, 'chemical', chemical.id)}
                className={`p-3 border rounded-lg cursor-move transition-all ${
                  chemical.added 
                    ? 'bg-green-50 border-green-200 opacity-60' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{chemical.name}</div>
                    <div className="text-xs text-gray-500">{chemical.formula}</div>
                    <div className="text-xs font-medium mt-1">
                      {chemical.amount} {chemical.unit}
                    </div>
                  </div>
                  <div 
                    className="w-6 h-6 rounded border-2 border-gray-300"
                    style={{ backgroundColor: chemical.color }}
                  />
                </div>
                {chemical.added && (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Added
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Equipment Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Equipment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {equipment.map(item => (
              <div
                key={item.id}
                draggable={!item.used}
                onDragStart={(e) => handleDragStart(e, 'equipment', item.id)}
                className={`p-3 border rounded-lg cursor-move transition-all ${
                  item.used 
                    ? 'bg-blue-50 border-blue-200 opacity-60' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                  </div>
                  <div className="text-2xl">{item.icon}</div>
                </div>
                {item.used && (
                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    In Use
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Step Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">{step.description}</div>
              
              {step.temperature && (
                <div className="flex items-center gap-2 text-sm">
                  <Thermometer className="h-4 w-4" />
                  Target: {step.temperature}
                </div>
              )}

              {step.safety && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  {step.safety}
                </div>
              )}

              <Button
                onClick={() => setShowQuiz(true)}
                disabled={!canCompleteStep() || showQuiz}
                className="w-full"
              >
                {canCompleteStep() ? 'Complete Step' : 'Complete the step requirements first'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Modal */}
        {showQuiz && (
          <Card className="border-2 border-blue-300">
            <CardHeader>
              <CardTitle>Knowledge Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">{getStepQuiz(step.id)?.question}</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quizAnswer}
                    onChange={(e) => setQuizAnswer(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                    placeholder="Enter your answer..."
                  />
                  <Button onClick={checkQuizAnswer} size="sm">
                    Check
                  </Button>
                </div>
                {quizCorrect !== null && (
                  <div className={`text-sm ${quizCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {quizCorrect ? '✓ Correct! Proceeding to next step...' : '✗ Try again'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}