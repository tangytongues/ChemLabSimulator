import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Thermometer, Beaker, Droplets, CheckCircle, Flame, RotateCcw, Target, Play, Pause, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FlaskComponent from "./lab-equipment/flask-component";
import TestTubeRack from "./lab-equipment/test-tube-rack";
import BeakerComponent from "./lab-equipment/beaker-component";
import StirringPlate from "./lab-equipment/stirring-plate";
import ThermometerComponent from "./lab-equipment/thermometer-component";
import GraduatedCylinder from "./lab-equipment/graduated-cylinder";
import type { ExperimentStep } from "@shared/schema";

interface VirtualLabProps {
  step: ExperimentStep;
  onStepComplete: () => void;
  isActive: boolean;
  stepNumber: number;
  totalSteps: number;
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
  required?: boolean;
}

interface LabState {
  temperature: number;
  targetTemperature: number;
  isHeating: boolean;
  isCooling: boolean;
  stirringSpeed: number;
  reactionProgress: number;
  flaskColor: string;
  isReacting: boolean;
  flaskContents: Chemical[];
  bubbleIntensity: number;
  stepCompleted: boolean;
  timer: number;
  isTimerRunning: boolean;
  checkpoints: string[];
  canProceed: boolean;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocity: { x: number; y: number };
}

const ASPIRIN_CHEMICALS: Chemical[] = [
  { id: "salicylic", name: "Salicylic Acid", formula: "C₇H₆O₃", amount: 2.0, unit: "g", color: "#ffffff", added: false, density: 1.44, required: true },
  { id: "acetic", name: "Acetic Anhydride", formula: "(CH₃CO)₂O", amount: 5.0, unit: "mL", color: "#fff3cd", added: false, density: 1.08, required: true },
  { id: "phosphoric", name: "Phosphoric Acid", formula: "H₃PO₄", amount: 3, unit: "drops", color: "#f8d7da", added: false, density: 1.69, required: true },
];

export default function SimpleVirtualLab({ step, onStepComplete, isActive, stepNumber, totalSteps }: VirtualLabProps) {
  const { toast } = useToast();
  
  const [chemicals, setChemicals] = useState<Chemical[]>(ASPIRIN_CHEMICALS);
  const [labState, setLabState] = useState<LabState>({
    temperature: 22,
    targetTemperature: 22,
    isHeating: false,
    isCooling: false,
    stirringSpeed: 0,
    reactionProgress: 0,
    flaskColor: 'transparent',
    isReacting: false,
    flaskContents: [],
    bubbleIntensity: 0,
    stepCompleted: false,
    timer: 0,
    isTimerRunning: false,
    checkpoints: [],
    canProceed: false
  });

  const [draggedItem, setDraggedItem] = useState<{type: 'chemical' | 'equipment', id: string} | null>(null);
  const [isStirring, setIsStirring] = useState(false);
  const [stirringAngle, setStirringAngle] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  
  const timerIntervalRef = useRef<NodeJS.Timeout>();

  // Timer management
  useEffect(() => {
    if (labState.isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setLabState(prev => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [labState.isTimerRunning]);

  // Temperature and reaction simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLabState(prev => {
        let newTemp = prev.temperature;
        
        if (prev.isHeating && newTemp < prev.targetTemperature) {
          newTemp = Math.min(prev.targetTemperature, newTemp + 2);
        } else if (!prev.isHeating && newTemp > 22) {
          newTemp = Math.max(22, newTemp - 0.5);
        }

        let newProgress = prev.reactionProgress;
        if (prev.flaskContents.length > 1 && newTemp > 60 && prev.stirringSpeed > 0) {
          newProgress = Math.min(100, prev.reactionProgress + 1);
        }

        return {
          ...prev,
          temperature: newTemp,
          reactionProgress: newProgress,
          isReacting: newTemp > 60 && prev.flaskContents.length > 1 && prev.stirringSpeed > 0,
        };
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Check completion criteria
  useEffect(() => {
    const requiredChemicals = chemicals.filter(c => c.required);
    const addedRequiredChemicals = requiredChemicals.filter(c => c.added);
    
    const stepTitle = step.title.toLowerCase();
    let canProceed = false;
    
    if (stepTitle.includes('synthesis') || stepTitle.includes('aspirin')) {
      canProceed = 
        addedRequiredChemicals.length === requiredChemicals.length &&
        labState.reactionProgress >= 80 &&
        labState.temperature >= 60 &&
        labState.stirringSpeed > 0 &&
        labState.timer >= 120;
    } else if (stepTitle.includes('heat')) {
      canProceed = 
        addedRequiredChemicals.length === requiredChemicals.length &&
        labState.temperature >= 60 &&
        labState.timer >= 90 &&
        labState.isHeating;
    } else {
      canProceed = 
        addedRequiredChemicals.length === requiredChemicals.length &&
        labState.timer >= 30;
    }
    
    setLabState(prev => ({ ...prev, canProceed }));
    
    if (canProceed && !labState.stepCompleted) {
      addCheckpoint("Step requirements completed successfully");
      toast({
        title: "Step Complete!",
        description: "All laboratory procedures completed.",
      });
    }
  }, [chemicals, labState.reactionProgress, labState.timer, labState.temperature, labState.stirringSpeed, labState.isHeating, step.title, toast]);

  const addCheckpoint = (description: string) => {
    setLabState(prev => ({
      ...prev,
      checkpoints: [...prev.checkpoints, `${new Date().toLocaleTimeString()}: ${description}`]
    }));
  };

  const handleChemicalDrop = (chemicalId: string) => {
    const chemical = chemicals.find(c => c.id === chemicalId);
    if (!chemical || chemical.added) return;

    setChemicals(prev => prev.map(c => 
      c.id === chemicalId ? { ...c, added: true } : c
    ));

    setLabState(prev => ({
      ...prev,
      flaskContents: [...prev.flaskContents, chemical],
      flaskColor: chemical.color
    }));

    addCheckpoint(`Added ${chemical.name} to reaction flask`);
    toast({
      title: "Chemical Added",
      description: `${chemical.name} added to flask`,
    });
  };

  const startHeating = () => {
    setLabState(prev => ({ 
      ...prev, 
      isHeating: true, 
      targetTemperature: 80,
      isCooling: false 
    }));
    addCheckpoint("Started heating reaction mixture");
  };

  const stopHeating = () => {
    setLabState(prev => ({ 
      ...prev, 
      isHeating: false,
      isCooling: true,
      targetTemperature: 22
    }));
    addCheckpoint("Stopped heating");
  };

  const startStirring = (speed: number) => {
    setLabState(prev => ({ ...prev, stirringSpeed: speed }));
    setIsStirring(speed > 0);
    if (speed > 0) {
      addCheckpoint(`Started stirring at ${speed}% speed`);
    } else {
      addCheckpoint("Stopped stirring");
    }
  };

  const startTimer = () => {
    setLabState(prev => ({ ...prev, isTimerRunning: true }));
    addCheckpoint("Started lab timer");
  };

  const pauseTimer = () => {
    setLabState(prev => ({ ...prev, isTimerRunning: false }));
  };

  const resetTimer = () => {
    setLabState(prev => ({ ...prev, timer: 0, isTimerRunning: false }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-none p-4">
      <div className="grid grid-cols-4 gap-4 h-screen">
        
        {/* Main Workbench - Takes up 3/4 of the screen */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-center">WORKBENCH</CardTitle>
            </CardHeader>
            <CardContent className="h-full p-4">
              <div 
                className="relative bg-gray-200 rounded-lg h-full flex"
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedItem?.type === 'chemical') {
                    handleChemicalDrop(draggedItem.id);
                    setDraggedItem(null);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                
                {/* Left Side - Test Tubes */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-gray-800 rounded-lg p-8 h-3/4 w-3/4 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold mb-4">TEST TUBES</div>
                      <TestTubeRack
                        testTubes={[
                          { id: "sample1", label: "S1", contents: { color: "#fef3c7", level: 30, name: "Sample" } },
                          { id: "sample2", label: "S2" },
                          { id: "sample3", label: "S3" },
                          { id: "blank", label: "Blank", contents: { color: "#f0f9ff", level: 25, name: "Control" } }
                        ]}
                        className="scale-150"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Center - Main Flask */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative">
                    {/* Drop Zone */}
                    <div className={`absolute -inset-8 rounded-xl border-2 border-dashed transition-all ${
                      draggedItem ? 'border-blue-400 bg-blue-50 bg-opacity-50' : 'border-transparent'
                    }`}>
                      {draggedItem && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                            Drop Chemical Here
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Main Flask */}
                    <div className="border-4 border-black rounded-lg p-4 bg-white">
                      <div className="text-center text-sm font-medium mb-2">beaker/flask</div>
                      <FlaskComponent
                        contents={labState.flaskContents.map((content, index) => ({
                          color: content.color,
                          level: 30 + (index * 10),
                          name: content.name
                        }))}
                        temperature={labState.temperature}
                        isHeating={labState.isHeating}
                        bubbles={bubbles}
                        stirringAngle={stirringAngle}
                        isStirring={isStirring}
                        className="scale-150"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Right Side - Step Info */}
                <div className="flex-1 flex items-start justify-center pt-8">
                  <div className="bg-gray-600 rounded-lg p-6 w-4/5 h-1/2">
                    <div className="text-white text-center">
                      <div className="text-lg font-bold mb-2">STEP {stepNumber}:</div>
                      <div className="text-sm mb-4">{step.title}</div>
                      <div className="text-xs text-gray-300">{step.description}</div>
                      <div className="mt-4">
                        <Badge variant={labState.canProceed ? "default" : "secondary"} className="mb-2">
                          {labState.canProceed ? "Complete" : "In Progress"}
                        </Badge>
                        <Progress value={(stepNumber / totalSteps) * 100} className="w-full h-2" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status Indicators */}
                <div className="absolute top-4 right-4 space-y-2">
                  {labState.isHeating && (
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      🔥 {Math.round(labState.temperature)}°C
                    </div>
                  )}
                  {labState.stirringSpeed > 0 && (
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      🌀 {labState.stirringSpeed}%
                    </div>
                  )}
                  {labState.isReacting && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      ⚗️ Reacting
                    </div>
                  )}
                </div>
                
                {/* Reaction Progress */}
                {labState.reactionProgress > 0 && (
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-4 border">
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Reaction Progress
                    </div>
                    <Progress value={labState.reactionProgress} className="w-32 h-2 mb-1" />
                    <div className="text-sm text-gray-600">{Math.round(labState.reactionProgress)}%</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - 1/4 width */}
        <div className="col-span-1 space-y-4">
          
          {/* Control Panel Row 1 */}
          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-bold mb-2">HEAT</div>
                  <Button 
                    size="sm" 
                    variant={labState.isHeating ? "destructive" : "outline"}
                    onClick={labState.isHeating ? stopHeating : startHeating}
                    className="w-full"
                  >
                    <Flame className="h-4 w-4 mr-2" />
                    {labState.isHeating ? "Stop" : "Heat"}
                  </Button>
                  <div className="text-sm text-gray-600 mt-2">
                    {Math.round(labState.temperature)}°C
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-bold mb-2">STIR/SPIN</div>
                  <Button 
                    size="sm" 
                    variant={labState.stirringSpeed > 0 ? "default" : "outline"}
                    onClick={() => startStirring(labState.stirringSpeed > 0 ? 0 : 50)}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {labState.stirringSpeed > 0 ? "Stop" : "Stir"}
                  </Button>
                  <div className="text-sm text-gray-600 mt-2">
                    {labState.stirringSpeed}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Experiment Steps/Procedure */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-center">EXPERIMENT STEPS/PROCEDURE</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              
              {/* Timer */}
              <div className="text-center mb-4">
                <div className="text-xl font-mono font-bold text-blue-600">
                  {formatTime(labState.timer)}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant={labState.isTimerRunning ? "secondary" : "default"}
                    onClick={labState.isTimerRunning ? pauseTimer : startTimer}
                    className="flex-1"
                  >
                    {labState.isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetTimer}>
                    <Square className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Chemicals */}
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Chemicals</div>
                <div className="space-y-2">
                  {chemicals.map(chemical => (
                    <div
                      key={chemical.id}
                      draggable={!chemical.added}
                      onDragStart={() => setDraggedItem({ type: 'chemical', id: chemical.id })}
                      className={`p-2 rounded border cursor-pointer transition-all text-xs ${
                        chemical.added 
                          ? 'bg-green-50 border-green-200 cursor-not-allowed opacity-60' 
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{chemical.name}</div>
                          <div className="text-gray-500">{chemical.formula}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{chemical.amount}{chemical.unit}</div>
                          {chemical.added && <CheckCircle className="h-3 w-3 text-green-600 ml-auto mt-1" />}
                          {chemical.required && !chemical.added && <Badge variant="outline" className="text-xs">Required</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Requirements */}
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Requirements</div>
                <div className="space-y-2 text-xs">
                  {(() => {
                    const stepTitle = step.title.toLowerCase();
                    const requirements = [];
                    
                    const requiredChemicals = chemicals.filter(c => c.required);
                    const addedRequiredChemicals = requiredChemicals.filter(c => c.added);
                    requirements.push({
                      text: `Add chemicals (${addedRequiredChemicals.length}/${requiredChemicals.length})`,
                      completed: addedRequiredChemicals.length === requiredChemicals.length
                    });
                    
                    if (stepTitle.includes('synthesis') || stepTitle.includes('aspirin')) {
                      requirements.push(
                        { text: `Heat to 60°C (${Math.round(labState.temperature)}°C)`, completed: labState.temperature >= 60 },
                        { text: `Start stirring`, completed: labState.stirringSpeed > 0 },
                        { text: `React for 2+ min (${labState.timer}s)`, completed: labState.timer >= 120 },
                        { text: `Complete reaction (${Math.round(labState.reactionProgress)}%)`, completed: labState.reactionProgress >= 80 }
                      );
                    } else if (stepTitle.includes('heat')) {
                      requirements.push(
                        { text: `Activate heating`, completed: labState.isHeating },
                        { text: `Reach 60°C (${Math.round(labState.temperature)}°C)`, completed: labState.temperature >= 60 },
                        { text: `Heat for 90s (${labState.timer}s)`, completed: labState.timer >= 90 }
                      );
                    } else {
                      requirements.push(
                        { text: `Run procedure (${labState.timer}s/30s)`, completed: labState.timer >= 30 }
                      );
                    }
                    
                    return requirements.map((req, index) => (
                      <div key={index} className={`p-2 rounded border ${req.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                          {req.completed ? (
                            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          ) : (
                            <div className="w-3 h-3 border border-gray-300 rounded-full flex-shrink-0" />
                          )}
                          <span className={req.completed ? 'text-green-700' : 'text-gray-700'}>{req.text}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
              
              {/* Step Completion */}
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-2">
                  {labState.canProceed ? "✅ All requirements completed" : "⏳ Complete all requirements to proceed"}
                </div>
                <Button 
                  onClick={onStepComplete}
                  disabled={!labState.canProceed}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {labState.canProceed ? "Proceed to Next Step" : "Complete Requirements First"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}