import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Thermometer, Beaker, Droplets, CheckCircle, Flame, RotateCcw, Scale, Timer } from "lucide-react";
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
  density?: number;
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
  stirringSpeed: number;
  reactionProgress: number;
  flaskColor: string;
  isReacting: boolean;
  flaskContents: Chemical[];
  bubbleIntensity: number;
}

const ASPIRIN_CHEMICALS: Chemical[] = [
  { id: "salicylic", name: "Salicylic Acid", formula: "C₇H₆O₃", amount: 2.0, unit: "g", color: "#ffffff", added: false, density: 1.44 },
  { id: "acetic", name: "Acetic Anhydride", formula: "(CH₃CO)₂O", amount: 5.0, unit: "mL", color: "#fff3cd", added: false, density: 1.08 },
  { id: "phosphoric", name: "Phosphoric Acid", formula: "H₃PO₄", amount: 3, unit: "drops", color: "#f8d7da", added: false, density: 1.69 },
  { id: "water", name: "Distilled Water", formula: "H₂O", amount: 20.0, unit: "mL", color: "#cce7ff", added: false, density: 1.0 },
];

const EQUIPMENT: Equipment[] = [
  { id: "thermometer", name: "Digital Thermometer", icon: "🌡️", used: false },
  { id: "stirrer", name: "Magnetic Stirrer", icon: "🔄", used: false },
  { id: "heater", name: "Hot Plate", icon: "🔥", used: false },
  { id: "timer", name: "Lab Timer", icon: "⏱️", used: false },
];

export default function VirtualLab({ step, onStepComplete, isActive }: VirtualLabProps) {
  const [chemicals, setChemicals] = useState<Chemical[]>(ASPIRIN_CHEMICALS);
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT);
  const [labState, setLabState] = useState<LabState>({
    temperature: 22,
    targetTemperature: 22,
    isHeating: false,
    stirringSpeed: 0,
    reactionProgress: 0,
    flaskColor: 'transparent',
    isReacting: false,
    flaskContents: [],
    bubbleIntensity: 0
  });

  const [draggedItem, setDraggedItem] = useState<{type: 'chemical' | 'equipment', id: string} | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [isStirring, setIsStirring] = useState(false);
  const [stirringAngle, setStirringAngle] = useState(0);
  const [bubbles, setBubbles] = useState<Array<{id: number, x: number, y: number, size: number, opacity: number}>>([]);
  
  const labBenchRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Stirring animation
  useEffect(() => {
    if (isStirring) {
      const animate = () => {
        setStirringAngle(prev => (prev + 5) % 360);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStirring]);

  // Temperature simulation with realistic heating curve
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (labState.isHeating && labState.temperature < labState.targetTemperature) {
      interval = setInterval(() => {
        setLabState(prev => {
          const tempDiff = prev.targetTemperature - prev.temperature;
          const heatRate = Math.max(0.3, tempDiff * 0.05); // Slower heating as it approaches target
          return {
            ...prev,
            temperature: Math.min(prev.temperature + heatRate, prev.targetTemperature)
          };
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [labState.isHeating, labState.temperature, labState.targetTemperature]);

  // Reaction simulation with proper chemistry
  useEffect(() => {
    if (labState.temperature > 75 && labState.flaskContents.length >= 2 && !labState.isReacting) {
      setLabState(prev => ({ ...prev, isReacting: true }));
      
      // Generate bubbles during reaction
      const bubbleInterval = setInterval(() => {
        setBubbles(prev => {
          const newBubbles = [...prev];
          // Add new bubbles
          if (Math.random() < 0.7) {
            newBubbles.push({
              id: Date.now() + Math.random(),
              x: 30 + Math.random() * 40, // Percentage from left
              y: 80 + Math.random() * 15,  // Start near bottom
              size: 2 + Math.random() * 4,
              opacity: 0.7 + Math.random() * 0.3
            });
          }
          // Move bubbles up and fade
          return newBubbles
            .map(bubble => ({
              ...bubble,
              y: bubble.y - 1,
              opacity: bubble.opacity - 0.02
            }))
            .filter(bubble => bubble.y > 10 && bubble.opacity > 0);
        });
      }, 100);

      // Update reaction progress
      const reactionInterval = setInterval(() => {
        setLabState(prev => {
          const newProgress = Math.min(prev.reactionProgress + 2, 100);
          const intensity = Math.sin((newProgress / 100) * Math.PI);
          
          // Color progression: clear -> yellow -> orange -> pale yellow
          let newColor = 'transparent';
          if (newProgress > 10) {
            const hue = Math.max(45, 60 - newProgress * 0.3);
            const saturation = Math.min(80, newProgress * 0.8);
            const lightness = Math.max(85, 95 - newProgress * 0.2);
            newColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          }
          
          return {
            ...prev,
            reactionProgress: newProgress,
            flaskColor: newColor,
            bubbleIntensity: intensity * 10
          };
        });
      }, 150);

      setTimeout(() => {
        clearInterval(reactionInterval);
        clearInterval(bubbleInterval);
        setLabState(prev => ({ ...prev, isReacting: false }));
        setBubbles([]);
      }, 8000);
    }
  }, [labState.temperature, labState.flaskContents, labState.isReacting]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: 'chemical' | 'equipment', id: string) => {
    setDraggedItem({ type, id });
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.type === 'chemical') {
      const chemical = chemicals.find(c => c.id === draggedItem.id);
      if (chemical && !chemical.added) {
        setChemicals(prev => prev.map(c => 
          c.id === draggedItem.id ? { ...c, added: true } : c
        ));
        setLabState(prev => ({
          ...prev,
          flaskContents: [...prev.flaskContents, chemical]
        }));
        
        // Add pouring animation effect
        setTimeout(() => {
          setLabState(prev => ({
            ...prev,
            flaskColor: prev.flaskContents.length === 1 ? chemical.color : mixColors(prev.flaskContents)
          }));
        }, 500);
      }
    } else {
      setEquipment(prev => prev.map(e => 
        e.id === draggedItem.id ? { ...e, used: true } : e
      ));
    }

    setDraggedItem(null);
  };

  const mixColors = (contents: Chemical[]): string => {
    if (contents.length === 0) return 'transparent';
    if (contents.length === 1) return contents[0].color;
    
    // Simple color mixing simulation
    const colors = contents.map(c => c.color);
    return colors[colors.length - 1]; // For simplicity, use the last added color
  };

  const startHeating = () => {
    setLabState(prev => ({ ...prev, isHeating: true, targetTemperature: 85 }));
    setEquipment(prev => prev.map(e => 
      e.id === 'heater' ? { ...e, used: true } : e
    ));
  };

  const stopHeating = () => {
    setLabState(prev => ({ ...prev, isHeating: false }));
  };

  const toggleStirring = () => {
    setIsStirring(!isStirring);
    setLabState(prev => ({
      ...prev,
      stirringSpeed: isStirring ? 0 : 150
    }));
    setEquipment(prev => prev.map(e => 
      e.id === 'stirrer' ? { ...e, used: !isStirring } : e
    ));
  };

  const resetLab = () => {
    setChemicals(ASPIRIN_CHEMICALS);
    setEquipment(EQUIPMENT);
    setLabState({
      temperature: 22,
      targetTemperature: 22,
      isHeating: false,
      stirringSpeed: 0,
      reactionProgress: 0,
      flaskColor: 'transparent',
      isReacting: false,
      flaskContents: [],
      bubbleIntensity: 0
    });
    setIsStirring(false);
    setBubbles([]);
    setQuizAnswer("");
    setQuizCorrect(null);
    setShowQuiz(false);
  };

  const getStepQuiz = (stepId: number) => {
    const quizzes: Record<number, {question: string, answer: string, hint: string}> = {
      1: { 
        question: "How many grams of salicylic acid should be measured for this synthesis?", 
        answer: "2.0",
        hint: "Check the step description for the exact amount needed."
      },
      2: { 
        question: "How many drops of phosphoric acid catalyst should be added?", 
        answer: "3",
        hint: "This catalyst is very concentrated - only a few drops are needed."
      },
      3: { 
        question: "What temperature (°C) should the reaction mixture reach for optimal synthesis?", 
        answer: "85",
        hint: "This temperature allows the esterification to proceed efficiently."
      },
      4: { 
        question: "How many mL of distilled water should be added to precipitate the product?", 
        answer: "20",
        hint: "This amount will cause the aspirin to crystallize out of solution."
      },
    };
    return quizzes[stepId] || null;
  };

  const checkQuizAnswer = () => {
    const quiz = getStepQuiz(step.id);
    if (quiz) {
      const correct = quizAnswer.toLowerCase().trim().includes(quiz.answer.toLowerCase());
      setQuizCorrect(correct);
      if (correct) {
        setTimeout(() => {
          setShowQuiz(false);
          onStepComplete();
        }, 2000);
      }
    }
  };

  const canCompleteStep = () => {
    switch (step.id) {
      case 1: return labState.flaskContents.some(c => c.id === "salicylic") && 
                     labState.flaskContents.some(c => c.id === "acetic");
      case 2: return labState.flaskContents.some(c => c.id === "phosphoric");
      case 3: return labState.temperature >= 80 && labState.reactionProgress > 60;
      case 4: return labState.flaskContents.some(c => c.id === "water");
      default: return true;
    }
  };

  const getCompletionPercentage = () => {
    switch (step.id) {
      case 1: return labState.flaskContents.length >= 2 ? 100 : (labState.flaskContents.length * 50);
      case 2: return labState.flaskContents.some(c => c.id === "phosphoric") ? 100 : 0;
      case 3: return Math.min(100, (labState.temperature / 85) * 50 + (labState.reactionProgress / 100) * 50);
      case 4: return labState.flaskContents.some(c => c.id === "water") ? 100 : 0;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Lab Interface */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Beaker className="h-6 w-6" />
              <span>Virtual Chemistry Lab - {step.title}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Thermometer className="h-4 w-4" />
                <span>{labState.temperature.toFixed(1)}°C</span>
              </div>
              {labState.isReacting && (
                <Badge className="bg-orange-500 animate-pulse">
                  Reacting {labState.reactionProgress.toFixed(0)}%
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Lab Bench */}
          <div 
            ref={labBenchRef}
            className="relative h-96 bg-gradient-to-b from-slate-100 to-slate-200 border-b-4 border-amber-800 overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* Background lab environment */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-green-50/30" />
            
            {/* Lab bench surface */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-900 to-amber-700" />
            
            {/* Main Erlenmeyer Flask */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                {/* Flask body */}
                <div 
                  className="w-28 h-36 rounded-b-full border-4 border-gray-800 transition-all duration-300 relative overflow-hidden"
                  style={{ 
                    backgroundColor: labState.flaskColor,
                    boxShadow: labState.isHeating ? '0 0 20px rgba(255, 100, 0, 0.6)' : 'none'
                  }}
                >
                  {/* Liquid level indicator */}
                  {labState.flaskContents.length > 0 && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                      style={{
                        height: `${Math.min(80, labState.flaskContents.length * 20)}%`,
                        backgroundColor: labState.flaskColor,
                        opacity: 0.8
                      }}
                    />
                  )}
                  
                  {/* Stirring indicator */}
                  {isStirring && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ transform: `rotate(${stirringAngle}deg)` }}
                    >
                      <div className="w-16 h-1 bg-gray-700 rounded opacity-40" />
                    </div>
                  )}
                  
                  {/* Reaction bubbles */}
                  {bubbles.map(bubble => (
                    <div
                      key={bubble.id}
                      className="absolute rounded-full bg-white transition-all duration-100"
                      style={{
                        left: `${bubble.x}%`,
                        bottom: `${bubble.y}%`,
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                        opacity: bubble.opacity,
                        transform: `translate(-50%, 50%)`
                      }}
                    />
                  ))}
                  
                  {/* Contents label */}
                  {labState.flaskContents.length > 0 && (
                    <div className="absolute bottom-2 left-1 right-1 text-xs text-gray-700 text-center">
                      {labState.flaskContents.map(c => c.formula).join(' + ')}
                    </div>
                  )}
                </div>
                
                {/* Flask neck */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 border-4 border-gray-800 border-b-0 rounded-t-lg bg-transparent" />
                
                {/* Heating element */}
                {labState.isHeating && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
                    <div className="absolute inset-0 animate-ping">
                      <Flame className="h-8 w-8 text-red-500 opacity-20" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Equipment on bench */}
            {equipment.filter(e => e.used).map(item => (
              <div
                key={item.id}
                className="absolute bottom-20 text-3xl animate-bounce"
                style={{
                  left: item.id === 'thermometer' ? '20%' : 
                        item.id === 'stirrer' ? '70%' : 
                        item.id === 'heater' ? '50%' : '80%'
                }}
              >
                {item.icon}
              </div>
            ))}

            {/* Drop zone indicator */}
            {draggedItem && (
              <div className="absolute inset-0 border-4 border-dashed border-blue-500 bg-blue-50/50 flex items-center justify-center">
                <div className="text-blue-600 text-xl font-semibold bg-white px-4 py-2 rounded-lg shadow-lg">
                  Drop {draggedItem.type} here
                </div>
              </div>
            )}

            {/* Instructions overlay */}
            {labState.flaskContents.length === 0 && !draggedItem && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg font-medium bg-white/80 backdrop-blur-sm">
                Drag chemicals from the sidebar to begin the experiment
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temperature Controls */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Temperature Control</Label>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={startHeating}
                    disabled={labState.isHeating}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
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
                    Stop
                  </Button>
                </div>
                <div className="text-xs text-gray-600">
                  Target: {labState.targetTemperature}°C
                </div>
              </div>

              {/* Stirring Controls */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Mixing Control</Label>
                <Button
                  onClick={toggleStirring}
                  size="sm"
                  variant={isStirring ? "default" : "outline"}
                  className={isStirring ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  🔄 {isStirring ? 'Stop Stirring' : 'Start Stirring'}
                </Button>
                {isStirring && (
                  <div className="text-xs text-gray-600">
                    Speed: {labState.stirringSpeed} RPM
                  </div>
                )}
              </div>

              {/* Progress & Controls */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Step Progress</Label>
                <Progress value={getCompletionPercentage()} className="h-2" />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowQuiz(true)}
                    disabled={!canCompleteStep() || showQuiz}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete Step
                  </Button>
                  <Button
                    onClick={resetLab}
                    size="sm"
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chemical and Equipment Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chemicals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              Reagents & Chemicals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chemicals.map(chemical => (
              <div
                key={chemical.id}
                draggable={!chemical.added}
                onDragStart={(e) => handleDragStart(e, 'chemical', chemical.id)}
                onDragEnd={handleDragEnd}
                className={`group p-4 border-2 rounded-xl cursor-move transition-all duration-200 ${
                  chemical.added 
                    ? 'bg-green-50 border-green-200 opacity-60 cursor-not-allowed' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-105'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900">{chemical.name}</div>
                    <div className="text-sm text-gray-500 font-mono">{chemical.formula}</div>
                    <div className="text-sm font-medium text-blue-600">
                      {chemical.amount} {chemical.unit}
                    </div>
                    {chemical.density && (
                      <div className="text-xs text-gray-400">
                        Density: {chemical.density} g/mL
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-inner"
                      style={{ backgroundColor: chemical.color }}
                    />
                    {chemical.added && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Added
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-purple-600" />
              Laboratory Equipment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipment.map(item => (
              <div
                key={item.id}
                draggable={!item.used}
                onDragStart={(e) => handleDragStart(e, 'equipment', item.id)}
                onDragEnd={handleDragEnd}
                className={`group p-4 border-2 rounded-xl cursor-move transition-all duration-200 ${
                  item.used 
                    ? 'bg-purple-50 border-purple-200 opacity-60' 
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-lg hover:scale-105'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">Click and drag to lab bench</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-3xl">{item.icon}</div>
                    {item.used && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Check Quiz */}
      {showQuiz && (
        <Card className="border-2 border-blue-400 shadow-lg">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">Knowledge Check</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-gray-800 font-medium">
                {getStepQuiz(step.id)?.question}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={quizAnswer}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your answer..."
                  onKeyPress={(e) => e.key === 'Enter' && checkQuizAnswer()}
                />
                <Button 
                  onClick={checkQuizAnswer} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Check Answer
                </Button>
              </div>
              {quizCorrect !== null && (
                <div className={`p-3 rounded-lg ${
                  quizCorrect 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {quizCorrect 
                    ? '✓ Excellent! Proceeding to the next step...' 
                    : `✗ Not quite right. ${getStepQuiz(step.id)?.hint}`
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}