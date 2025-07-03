import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Thermometer, Beaker, Droplets, CheckCircle, Flame, RotateCcw, Scale, Timer, Play, Pause, Square, Clock, Target, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FlaskComponent from "./lab-equipment/flask-component";
import TestTubeRack from "./lab-equipment/test-tube-rack";
import BeakerComponent from "./lab-equipment/beaker-component";
import BurnerComponent from "./lab-equipment/burner-component";
import ThermometerComponent from "./lab-equipment/thermometer-component";
import StirringPlate from "./lab-equipment/stirring-plate";
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

interface Equipment {
  id: string;
  name: string;
  icon: string;
  used: boolean;
  required?: boolean;
  position?: { x: number; y: number };
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
  { id: "water", name: "Distilled Water", formula: "H₂O", amount: 20.0, unit: "mL", color: "#cce7ff", added: false, density: 1.0, required: false },
];

const TITRATION_CHEMICALS: Chemical[] = [
  { id: "naoh", name: "NaOH Solution", formula: "NaOH", amount: 0.1, unit: "M", color: "#e3f2fd", added: false, density: 1.04, required: true },
  { id: "hcl", name: "HCl Solution", formula: "HCl", amount: 0.1, unit: "M", color: "#fff3e0", added: false, density: 1.02, required: true },
  { id: "phenolphthalein", name: "Phenolphthalein", formula: "C₂₀H₁₄O₄", amount: 2, unit: "drops", color: "#fce4ec", added: false, density: 1.0, required: true },
];

const EQUIPMENT: Equipment[] = [
  { id: "thermometer", name: "Digital Thermometer", icon: "🌡️", used: false, required: false },
  { id: "stirrer", name: "Magnetic Stirrer", icon: "🔄", used: false, required: false },
  { id: "heater", name: "Hot Plate", icon: "🔥", used: false, required: false },
  { id: "timer", name: "Lab Timer", icon: "⏱️", used: false, required: false },
];

export default function EnhancedVirtualLab({ step, onStepComplete, isActive, stepNumber, totalSteps }: VirtualLabProps) {
  const { toast } = useToast();
  
  const getChemicalsForExperiment = () => {
    const stepTitle = step.title.toLowerCase();
    if (stepTitle.includes('titration') || stepTitle.includes('acid') || stepTitle.includes('base')) {
      return TITRATION_CHEMICALS;
    }
    return ASPIRIN_CHEMICALS;
  };

  const [chemicals, setChemicals] = useState<Chemical[]>(getChemicalsForExperiment());
  const [equipment, setEquipment] = useState<Equipment[]>(EQUIPMENT);
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
  const [stepInstructions, setStepInstructions] = useState<string[]>([]);
  const [completedInstructions, setCompletedInstructions] = useState<boolean[]>([]);
  
  const labBenchRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const timerIntervalRef = useRef<NodeJS.Timeout>();
  const bubbleIdRef = useRef(0);

  // Initialize step instructions based on step content
  useEffect(() => {
    if (step) {
      const instructions = [
        "Read the step instructions carefully",
        "Gather required chemicals and equipment",
        "Follow safety protocols",
        "Complete all required actions",
        "Verify results before proceeding"
      ];
      setStepInstructions(instructions);
      setCompletedInstructions(new Array(instructions.length).fill(false));
    }
  }, [step]);

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

  // Stirring animation
  useEffect(() => {
    if (isStirring && labState.stirringSpeed > 0) {
      const animate = () => {
        setStirringAngle(prev => (prev + (labState.stirringSpeed / 10)) % 360);
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
  }, [isStirring, labState.stirringSpeed]);

  // Temperature control simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLabState(prev => {
        let newTemp = prev.temperature;
        
        if (prev.isHeating && newTemp < prev.targetTemperature) {
          newTemp = Math.min(prev.targetTemperature, newTemp + 2);
        } else if (prev.isCooling && newTemp > prev.targetTemperature) {
          newTemp = Math.max(prev.targetTemperature, newTemp - 1);
        } else if (!prev.isHeating && !prev.isCooling && newTemp > 22) {
          newTemp = Math.max(22, newTemp - 0.5); // Natural cooling to room temperature
        }

        // Update reaction progress based on temperature and mixing
        let newProgress = prev.reactionProgress;
        if (prev.flaskContents.length > 1 && newTemp > 60 && prev.stirringSpeed > 0) {
          newProgress = Math.min(100, prev.reactionProgress + 1);
        }

        return {
          ...prev,
          temperature: newTemp,
          reactionProgress: newProgress,
          isReacting: newTemp > 60 && prev.flaskContents.length > 1 && prev.stirringSpeed > 0,
          bubbleIntensity: prev.isReacting ? Math.min(10, Math.floor(newTemp / 10)) : 0
        };
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Bubble generation and animation
  useEffect(() => {
    if (labState.isReacting && labState.bubbleIntensity > 0) {
      const generateBubbles = () => {
        const newBubbles: Bubble[] = [];
        for (let i = 0; i < labState.bubbleIntensity; i++) {
          if (Math.random() < 0.3) {
            newBubbles.push({
              id: bubbleIdRef.current++,
              x: 50 + Math.random() * 100,
              y: 80,
              size: 2 + Math.random() * 4,
              opacity: 0.6 + Math.random() * 0.4,
              velocity: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }
            });
          }
        }
        setBubbles(prev => [...prev.slice(-20), ...newBubbles]);
      };

      const animateBubbles = () => {
        setBubbles(prev => prev
          .map(bubble => ({
            ...bubble,
            x: bubble.x + bubble.velocity.x,
            y: bubble.y + bubble.velocity.y,
            opacity: bubble.opacity - 0.01
          }))
          .filter(bubble => bubble.opacity > 0 && bubble.y > 0)
        );
      };

      const bubbleInterval = setInterval(generateBubbles, 200);
      const animateInterval = setInterval(animateBubbles, 50);

      return () => {
        clearInterval(bubbleInterval);
        clearInterval(animateInterval);
      };
    }
  }, [labState.isReacting, labState.bubbleIntensity]);

  // Check step completion criteria - Enhanced validation
  useEffect(() => {
    const checkCompletion = () => {
      const requiredChemicals = chemicals.filter(c => c.required);
      const addedRequiredChemicals = requiredChemicals.filter(c => c.added);
      
      // Step-specific completion criteria
      const stepTitle = step.title.toLowerCase();
      const stepDescription = step.description.toLowerCase();
      
      let completionCriteria: boolean[] = [];
      
      if (stepTitle.includes('synthesis') || stepTitle.includes('aspirin')) {
        completionCriteria = [
          addedRequiredChemicals.length === requiredChemicals.length, // All required chemicals added
          labState.reactionProgress >= 80, // Reaction must be nearly complete
          labState.temperature >= 60, // Must reach proper temperature
          labState.stirringSpeed > 0, // Must be stirring
          labState.timer >= 120 // Must run for at least 2 minutes
        ];
      } else if (stepTitle.includes('titration') || stepTitle.includes('acid') || stepTitle.includes('base')) {
        completionCriteria = [
          addedRequiredChemicals.length === requiredChemicals.length,
          labState.reactionProgress >= 60, // Titration endpoint reached
          labState.timer >= 60, // Must run for at least 1 minute
          labState.flaskContents.length >= 2 // Must have mixed solutions
        ];
      } else if (stepTitle.includes('heat') || stepDescription.includes('heat')) {
        completionCriteria = [
          addedRequiredChemicals.length === requiredChemicals.length,
          labState.temperature >= 60, // Must reach heating temperature
          labState.timer >= 90, // Must heat for adequate time
          labState.isHeating // Must have heating equipment active
        ];
      } else if (stepTitle.includes('cool') || stepDescription.includes('cool')) {
        completionCriteria = [
          labState.temperature <= 35, // Must cool down
          labState.timer >= 60, // Must wait for cooling
          !labState.isHeating // Heating must be off
        ];
      } else if (stepTitle.includes('mix') || stepDescription.includes('stir')) {
        completionCriteria = [
          addedRequiredChemicals.length === requiredChemicals.length,
          labState.stirringSpeed > 0, // Must be stirring
          labState.timer >= 30, // Must mix for adequate time
          labState.reactionProgress >= 30 // Some reaction progress
        ];
      } else {
        // Default criteria for other steps
        completionCriteria = [
          addedRequiredChemicals.length === requiredChemicals.length,
          labState.timer >= 30, // Basic time requirement
          labState.reactionProgress >= 20 || labState.temperature >= 30 // Some progress
        ];
      }

      const canProceed = completionCriteria.every(Boolean);
      
      setLabState(prev => ({ ...prev, canProceed, stepCompleted: canProceed }));
      
      if (canProceed && !labState.stepCompleted) {
        addCheckpoint("Step requirements completed successfully");
        toast({
          title: "Step Complete!",
          description: "All laboratory procedures completed. You can proceed to the next step.",
        });
      }
    };

    checkCompletion();
  }, [chemicals, equipment, labState.reactionProgress, labState.timer, labState.temperature, labState.stirringSpeed, labState.isHeating, labState.flaskContents, step.title, step.description, toast]);

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
      flaskColor: chemical.color !== 'transparent' ? chemical.color : prev.flaskColor
    }));

    addCheckpoint(`Added ${chemical.name} to flask`);
    toast({
      title: "Chemical Added",
      description: `${chemical.name} (${chemical.amount}${chemical.unit}) added to flask`,
    });
  };

  const handleEquipmentUse = (equipmentId: string) => {
    setEquipment(prev => prev.map(e => 
      e.id === equipmentId ? { ...e, used: true } : e
    ));
    addCheckpoint(`Used ${equipment.find(e => e.id === equipmentId)?.name}`);
  };

  const startTimer = () => {
    setLabState(prev => ({ ...prev, isTimerRunning: true }));
    addCheckpoint("Timer started");
  };

  const pauseTimer = () => {
    setLabState(prev => ({ ...prev, isTimerRunning: false }));
    addCheckpoint("Timer paused");
  };

  const resetTimer = () => {
    setLabState(prev => ({ ...prev, timer: 0, isTimerRunning: false }));
    addCheckpoint("Timer reset");
  };

  const startHeating = () => {
    setLabState(prev => ({ ...prev, isHeating: true, isCooling: false, targetTemperature: 85 }));
    handleEquipmentUse('heater');
    addCheckpoint("Started heating");
  };

  const stopHeating = () => {
    setLabState(prev => ({ ...prev, isHeating: false, isCooling: true, targetTemperature: 22 }));
    addCheckpoint("Stopped heating - cooling down");
  };

  const startStirring = (speed: number) => {
    setLabState(prev => ({ ...prev, stirringSpeed: speed }));
    setIsStirring(speed > 0);
    handleEquipmentUse('stirrer');
    addCheckpoint(`${speed > 0 ? 'Started' : 'Stopped'} stirring${speed > 0 ? ` at speed ${speed}` : ''}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderLabBench = () => (
    <div 
      className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border-2 border-slate-300 shadow-lg"
      style={{ minHeight: '500px', width: '100%' }}
      onDrop={(e) => {
        e.preventDefault();
        if (draggedItem?.type === 'chemical') {
          handleChemicalDrop(draggedItem.id);
          setDraggedItem(null);
        }
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Lab Bench Background */}
      <div className="absolute inset-0 bg-white rounded-lg opacity-50"></div>
      
      {/* Main Lab Work Area */}
      <div className="relative p-8 h-full flex flex-col">
        
        {/* Top Equipment Row */}
        <div className="flex justify-between items-start mb-8">
          {/* Left Side Equipment */}
          <div className="flex space-x-8">
            <div className="text-center">
              <GraduatedCylinder
                capacity={100}
                contents={labState.flaskContents.length > 1 ? {
                  color: "#ddd6fe",
                  volume: 75,
                  name: "Solution"
                } : undefined}
                accuracy="high"
                label="100mL"
                className="cursor-pointer hover:scale-105 transition-transform"
              />
              <div className="text-xs text-gray-600 mt-2">Graduated Cylinder</div>
            </div>
            
            <div className="text-center">
              <BeakerComponent
                size="medium"
                contents={labState.flaskContents.length > 2 ? {
                  color: "#e0f2fe",
                  level: 40,
                  name: "Wash Water"
                } : undefined}
                label="Wash"
                className="cursor-pointer hover:scale-105 transition-transform"
              />
              <div className="text-xs text-gray-600 mt-2">Beaker</div>
            </div>
          </div>
          
          {/* Right Side Equipment */}
          <div className="flex space-x-8">
            <div className="text-center">
              <ThermometerComponent
                temperature={labState.temperature}
                label="Digital"
                className="cursor-pointer hover:scale-105 transition-transform"
              />
              <div className="text-xs text-gray-600 mt-2">Thermometer</div>
            </div>
            
            <div className="text-center">
              <TestTubeRack
                testTubes={[
                  { id: "sample1", label: "S1", contents: { color: "#fef3c7", level: 30, name: "Sample" } },
                  { id: "sample2", label: "S2" },
                  { id: "sample3", label: "S3" },
                  { id: "blank", label: "Blank", contents: { color: "#f0f9ff", level: 25, name: "Control" } }
                ]}
                className="cursor-pointer hover:scale-105 transition-transform"
              />
              <div className="text-xs text-gray-600 mt-2">Test Tubes</div>
            </div>
          </div>
        </div>
        
        {/* Central Reaction Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative mb-6">
            {/* Drop zone highlighting */}
            <div className={`absolute -inset-8 rounded-xl border-2 border-dashed transition-all ${
              draggedItem ? 'border-blue-400 bg-blue-50 bg-opacity-50' : 'border-transparent'
            }`}>
              {draggedItem && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                    Drop {draggedItem.type === 'chemical' ? 'Chemical' : 'Equipment'} Here
                  </div>
                </div>
              )}
            </div>
            
            {/* Main Flask */}
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
              className="scale-150 cursor-pointer hover:scale-155 transition-transform"
            />
          </div>
          
          {/* Reaction Progress Display */}
          {labState.reactionProgress > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 min-w-[200px] text-center">
              <div className="text-sm font-medium mb-2 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Reaction Progress
              </div>
              <Progress value={labState.reactionProgress} className="w-full h-2 mb-2" />
              <div className="text-xs text-gray-500">{Math.round(labState.reactionProgress)}% Complete</div>
            </div>
          )}
        </div>
        
        {/* Bottom Equipment Row */}
        <div className="flex justify-center items-end space-x-12">
          <div className="text-center">
            <StirringPlate
              isOn={labState.stirringSpeed > 0}
              speed={labState.stirringSpeed}
              temperature={labState.temperature}
              isHeating={labState.isHeating}
              onToggle={() => startStirring(labState.stirringSpeed > 0 ? 0 : 50)}
              onSpeedChange={(speed) => startStirring(speed)}
              onHeatToggle={() => labState.isHeating ? stopHeating() : startHeating()}
              className="cursor-pointer hover:scale-105 transition-transform"
            />
            <div className="text-xs text-gray-600 mt-2">Stirring Plate</div>
          </div>
          
          {step.description.toLowerCase().includes('flame') && (
            <div className="text-center">
              <BurnerComponent
                isOn={labState.isHeating}
                intensity={Math.round((labState.temperature - 22) / 80 * 100)}
                onToggle={() => labState.isHeating ? stopHeating() : startHeating()}
                className="cursor-pointer hover:scale-105 transition-transform"
              />
              <div className="text-xs text-gray-600 mt-2">Bunsen Burner</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Indicators */}
      <div className="absolute top-4 right-4 space-y-2">
        {labState.isHeating && (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
            🔥 Heating: {Math.round(labState.temperature)}°C
          </div>
        )}
        {labState.stirringSpeed > 0 && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
            🌀 Stirring: {labState.stirringSpeed}%
          </div>
        )}
        {labState.isReacting && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
            ⚗️ Reacting
          </div>
        )}
      </div>
      
      {/* Safety Notice */}
      <div className="absolute bottom-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">Lab Safety</span>
        </div>
        <div className="text-xs text-yellow-700">
          Always follow proper safety protocols
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-full mx-auto p-6 space-y-6">
      {/* Step Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Step {stepNumber} of {totalSteps}: {step.title}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">{step.description}</p>
            </div>
            <div className="text-right">
              <Badge variant={labState.canProceed ? "default" : "secondary"} className="mb-2">
                {labState.canProceed ? "Complete" : "In Progress"}
              </Badge>
              <Progress value={(stepNumber / totalSteps) * 100} className="w-32" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Full Width Lab Bench */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Virtual Lab Bench
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div ref={labBenchRef} className="w-full">
            {renderLabBench()}
          </div>
        </CardContent>
      </Card>

      {/* Controls and Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lab Controls - Column 1 */}
        <div className="space-y-4">
          {/* Timer Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Lab Timer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-3">
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {formatTime(labState.timer)}
                </div>
              </div>
              <div className="flex gap-2">
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
            </CardContent>
          </Card>

          {/* Equipment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Thermometer className="h-4 w-4" />
                Equipment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Temperature</span>
                  <Badge variant={labState.temperature > 50 ? "destructive" : "secondary"}>
                    {Math.round(labState.temperature)}°C
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Stirring</span>
                  <Badge variant={labState.stirringSpeed > 0 ? "default" : "secondary"}>
                    {labState.stirringSpeed > 0 ? `${labState.stirringSpeed}%` : "Off"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Heating</span>
                  <Badge variant={labState.isHeating ? "destructive" : "secondary"}>
                    {labState.isHeating ? "Active" : "Off"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4" />
                Quick Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  variant={labState.isHeating ? "destructive" : "outline"}
                  onClick={labState.isHeating ? stopHeating : startHeating}
                >
                  <Flame className="h-3 w-3 mr-1" />
                  {labState.isHeating ? "Stop" : "Heat"}
                </Button>
                <Button 
                  size="sm" 
                  variant={labState.stirringSpeed > 0 ? "default" : "outline"}
                  onClick={() => startStirring(labState.stirringSpeed > 0 ? 0 : 50)}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  {labState.stirringSpeed > 0 ? "Stop" : "Stir"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4" />
                Step Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const stepTitle = step.title.toLowerCase();
                  const stepDescription = step.description.toLowerCase();
                  const requirements = [];
                  
                  // Add chemicals requirement
                  const requiredChemicals = chemicals.filter(c => c.required);
                  const addedRequiredChemicals = requiredChemicals.filter(c => c.added);
                  requirements.push({
                    text: `Add all required chemicals (${addedRequiredChemicals.length}/${requiredChemicals.length})`,
                    completed: addedRequiredChemicals.length === requiredChemicals.length
                  });
                  
                  // Add step-specific requirements
                  if (stepTitle.includes('synthesis') || stepTitle.includes('aspirin')) {
                    requirements.push(
                      { text: `Reach reaction temperature (${labState.temperature}°C / 60°C)`, completed: labState.temperature >= 60 },
                      { text: `Start stirring mechanism`, completed: labState.stirringSpeed > 0 },
                      { text: `Allow reaction to proceed (${labState.timer}s / 120s)`, completed: labState.timer >= 120 },
                      { text: `Reaction completion (${Math.round(labState.reactionProgress)}% / 80%)`, completed: labState.reactionProgress >= 80 }
                    );
                  } else if (stepTitle.includes('titration') || stepTitle.includes('acid') || stepTitle.includes('base')) {
                    requirements.push(
                      { text: `Mix solutions in flask`, completed: labState.flaskContents.length >= 2 },
                      { text: `Run titration procedure (${labState.timer}s / 60s)`, completed: labState.timer >= 60 },
                      { text: `Reach endpoint (${Math.round(labState.reactionProgress)}% / 60%)`, completed: labState.reactionProgress >= 60 }
                    );
                  } else if (stepTitle.includes('heat') || stepDescription.includes('heat')) {
                    requirements.push(
                      { text: `Activate heating element`, completed: labState.isHeating },
                      { text: `Reach target temperature (${labState.temperature}°C / 60°C)`, completed: labState.temperature >= 60 },
                      { text: `Heat for required time (${labState.timer}s / 90s)`, completed: labState.timer >= 90 }
                    );
                  } else if (stepTitle.includes('cool') || stepDescription.includes('cool')) {
                    requirements.push(
                      { text: `Turn off heating`, completed: !labState.isHeating },
                      { text: `Cool to room temperature (${labState.temperature}°C / 35°C)`, completed: labState.temperature <= 35 },
                      { text: `Wait for cooling (${labState.timer}s / 60s)`, completed: labState.timer >= 60 }
                    );
                  } else if (stepTitle.includes('mix') || stepDescription.includes('stir')) {
                    requirements.push(
                      { text: `Start stirring mechanism`, completed: labState.stirringSpeed > 0 },
                      { text: `Mix for adequate time (${labState.timer}s / 30s)`, completed: labState.timer >= 30 },
                      { text: `Observe mixing progress (${Math.round(labState.reactionProgress)}% / 30%)`, completed: labState.reactionProgress >= 30 }
                    );
                  } else {
                    requirements.push(
                      { text: `Follow procedure (${labState.timer}s / 30s)`, completed: labState.timer >= 30 },
                      { text: `Complete basic requirements`, completed: labState.reactionProgress >= 20 || labState.temperature >= 30 }
                    );
                  }
                  
                  return requirements.map((req, index) => (
                    <div key={index} className={`p-2 rounded border text-xs ${req.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
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
            </CardContent>
          </Card>

        </div>

        {/* Chemical Inventory - Column 2 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4" />
                Chemicals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chemicals.map(chemical => (
                  <div
                    key={chemical.id}
                    draggable={!chemical.added}
                    onDragStart={() => setDraggedItem({ type: 'chemical', id: chemical.id })}
                    className={`p-2 rounded border cursor-pointer transition-all ${
                      chemical.added 
                        ? 'bg-green-50 border-green-200 cursor-not-allowed opacity-60' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-xs">{chemical.name}</div>
                        <div className="text-xs text-gray-500">{chemical.formula}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium">{chemical.amount}{chemical.unit}</div>
                        {chemical.added && <CheckCircle className="h-3 w-3 text-green-600 ml-auto mt-1" />}
                        {chemical.required && !chemical.added && <Badge variant="outline" className="text-xs">Required</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Required Equipment - Column 3 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Scale className="h-4 w-4" />
                Required Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>125mL Erlenmeyer Flask</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Thermometer</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Graduated Cylinder</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Stirring Plate</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Beaker</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety Information - Column 4 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                Safety Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-700 space-y-2">
                <p>This virtual experiment simulates real laboratory conditions.</p>
                <p>Always wear proper PPE in real laboratory settings.</p>
                <p>Acetic anhydride and phosphoric acid are corrosive chemicals.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkpoints */}
      {labState.checkpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4" />
              Lab Progress Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {labState.checkpoints.map((checkpoint, index) => (
                <div key={index} className="text-xs text-gray-600 border-l-2 border-blue-200 pl-2">
                  {checkpoint}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Completion */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {labState.canProceed ? "✅ All requirements completed" : "⏳ Complete all requirements to proceed"}
        </div>
        <Button 
          onClick={onStepComplete}
          disabled={!labState.canProceed}
          size="lg"
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {labState.canProceed ? "Proceed to Next Step" : "Complete Requirements First"}
        </Button>
      </div>
    </div>
  );
}