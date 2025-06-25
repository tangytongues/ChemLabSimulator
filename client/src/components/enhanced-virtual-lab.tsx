import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Thermometer, Beaker, Droplets, CheckCircle, Flame, RotateCcw, Scale, Timer, Play, Pause, Square, Clock, Target, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

  // Check step completion criteria
  useEffect(() => {
    const checkCompletion = () => {
      const requiredChemicals = chemicals.filter(c => c.required);
      const addedRequiredChemicals = requiredChemicals.filter(c => c.added);
      const hasRequiredEquipment = equipment.some(e => e.required && e.used);
      
      const completionCriteria = [
        addedRequiredChemicals.length === requiredChemicals.length,
        labState.reactionProgress > 50 || labState.timer > 30,
        labState.temperature > 50 || !step.description.toLowerCase().includes('heat')
      ];

      const canProceed = completionCriteria.every(Boolean);
      
      setLabState(prev => ({ ...prev, canProceed, stepCompleted: canProceed }));
      
      if (canProceed && !labState.stepCompleted) {
        addCheckpoint("Step requirements completed successfully");
        toast({
          title: "Step Complete!",
          description: "All requirements met. You can proceed to the next step.",
        });
      }
    };

    checkCompletion();
  }, [chemicals, equipment, labState.reactionProgress, labState.timer, labState.temperature, step.description, toast]);

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

  const renderFlask = () => (
    <div 
      className="relative mx-auto"
      style={{ width: '200px', height: '300px' }}
      onDrop={(e) => {
        e.preventDefault();
        if (draggedItem?.type === 'chemical') {
          handleChemicalDrop(draggedItem.id);
        }
        setDraggedItem(null);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Flask Body */}
      <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 border-4 border-gray-800 rounded-b-full transition-all duration-300"
        style={{ 
          width: '160px', 
          height: '180px',
          backgroundColor: labState.flaskColor || 'rgba(200, 220, 255, 0.3)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
        }}
      >
        {/* Liquid Level */}
        {labState.flaskContents.length > 0 && (
          <div 
            className="absolute bottom-0 left-0 right-0 rounded-b-full transition-all duration-500"
            style={{
              height: `${Math.min(80, labState.flaskContents.length * 20)}%`,
              backgroundColor: labState.flaskColor,
              opacity: 0.8
            }}
          />
        )}
        
        {/* Bubbles */}
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              opacity: bubble.opacity,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
        
        {/* Stirring Rod */}
        {isStirring && (
          <div
            className="absolute top-1/2 left-1/2 w-1 bg-gray-600 origin-bottom transition-transform"
            style={{
              height: '60px',
              transform: `translate(-50%, -50%) rotate(${stirringAngle}deg)`,
            }}
          />
        )}
      </div>
      
      {/* Flask Neck */}
      <div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 border-4 border-gray-800 border-b-0"
        style={{ width: '40px', height: '120px', backgroundColor: 'rgba(255,255,255,0.1)' }}
      />
      
      {/* Temperature Display */}
      {labState.temperature > 25 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <Badge variant="destructive" className="animate-pulse">
            {labState.isHeating && <Thermometer className="w-3 h-3 mr-1" />}
            {Math.round(labState.temperature)}°C
          </Badge>
        </div>
      )}
      
      {/* Heat Indicator */}
      {labState.isHeating && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-2xl animate-bounce">
          🔥
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lab Bench */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Virtual Lab Bench
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={labBenchRef}
                className="relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg p-8 min-h-96 border-2 border-dashed border-gray-300"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.05) 10px, rgba(0,0,0,.05) 20px)' }}
              >
                {renderFlask()}
                
                {/* Progress Indicator */}
                {labState.reactionProgress > 0 && (
                  <div className="absolute top-4 right-4">
                    <div className="text-sm font-medium mb-1">Reaction Progress</div>
                    <Progress value={labState.reactionProgress} className="w-32" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
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

          {/* Temperature Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Thermometer className="h-4 w-4" />
                Temperature Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-3">
                <div className="text-xl font-bold">
                  {Math.round(labState.temperature)}°C
                </div>
                {labState.isHeating && <Badge variant="destructive" className="text-xs">Heating</Badge>}
                {labState.isCooling && <Badge variant="secondary" className="text-xs">Cooling</Badge>}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={labState.isHeating ? "destructive" : "outline"}
                  onClick={labState.isHeating ? stopHeating : startHeating}
                  className="flex-1"
                >
                  <Flame className="h-3 w-3 mr-1" />
                  {labState.isHeating ? "Stop" : "Heat"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stirring Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4" />
                Stirring Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label>Speed: {labState.stirringSpeed}</Label>
                <Slider
                  value={[labState.stirringSpeed]}
                  onValueChange={([value]) => startStirring(value)}
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Chemical Inventory */}
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