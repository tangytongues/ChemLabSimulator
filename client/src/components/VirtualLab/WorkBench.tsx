import React, { useState, useEffect } from 'react';
import { FlaskConical, Play, Pause, RotateCcw } from 'lucide-react';
import { AnimatedEquipment } from './AnimatedEquipment';
import { ExperimentSteps } from './ExperimentSteps';

interface WorkBenchProps {
  onDrop: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
  selectedChemical: string | null;
  isRunning: boolean;
}

interface Step {
  id: number;
  title: string;
  description: string;
  duration: number;
  status: 'pending' | 'active' | 'completed' | 'warning';
  requirements?: string[];
}

export const WorkBench: React.FC<WorkBenchProps> = ({ 
  onDrop, 
  children, 
  selectedChemical, 
  isRunning 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [temperature, setTemperature] = useState(22);
  const [volume, setVolume] = useState(0);
  const [solutionColor, setSolutionColor] = useState('#E3F2FD');
  const [isStirring, setIsStirring] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [bubbling, setBubbling] = useState(false);
  const [timer, setTimer] = useState(0);
  const [autoProgress, setAutoProgress] = useState(false);

  const experimentSteps: Step[] = [
    {
      id: 1,
      title: "Setup Equipment",
      description: "Arrange burette, conical flask, and magnetic stirrer",
      duration: 2,
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending',
      requirements: ["Burette with clamp", "250mL conical flask", "Magnetic stirrer"]
    },
    {
      id: 2,
      title: "Prepare Solutions",
      description: "Fill burette with NaOH solution and add HCl to flask",
      duration: 3,
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending',
      requirements: ["0.1M NaOH solution", "25mL 0.1M HCl", "Phenolphthalein indicator"]
    },
    {
      id: 3,
      title: "Add Indicator",
      description: "Add 2-3 drops of phenolphthalein to the acid solution",
      duration: 1,
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending',
      requirements: ["Phenolphthalein indicator"]
    },
    {
      id: 4,
      title: "Begin Titration",
      description: "Start adding NaOH dropwise while stirring continuously",
      duration: 8,
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'pending',
      requirements: ["Continuous stirring", "Slow addition of base"]
    },
    {
      id: 5,
      title: "Approach End Point",
      description: "Add base drop by drop as color changes become visible",
      duration: 5,
      status: currentStep === 5 ? 'active' : currentStep > 5 ? 'completed' : 'pending',
      requirements: ["Very slow addition", "Careful observation"]
    },
    {
      id: 6,
      title: "Detect End Point",
      description: "Stop when permanent pink color appears",
      duration: 2,
      status: currentStep === 6 ? 'active' : currentStep > 6 ? 'completed' : 'pending',
      requirements: ["Permanent color change"]
    },
    {
      id: 7,
      title: "Record Results",
      description: "Note the volume of NaOH used and calculate concentration",
      duration: 3,
      status: currentStep === 7 ? 'active' : currentStep > 7 ? 'completed' : 'pending',
      requirements: ["Accurate volume reading"]
    },
    {
      id: 8,
      title: "Repeat Titration",
      description: "Perform 2-3 more titrations for accuracy",
      duration: 15,
      status: currentStep === 8 ? 'active' : currentStep > 8 ? 'completed' : 'pending',
      requirements: ["Fresh solutions", "Clean equipment"]
    }
  ];

  // Auto-progress through experiment steps
  useEffect(() => {
    if (isRunning && autoProgress) {
      const stepDuration = experimentSteps[currentStep - 1]?.duration || 5;
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
        
        // Progress to next step based on duration
        if (timer >= stepDuration * 60) { // Convert minutes to seconds
          if (currentStep < experimentSteps.length) {
            setCurrentStep(prev => prev + 1);
            setTimer(0);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, autoProgress, currentStep, timer, experimentSteps]);

  // Step-specific animations and effects
  useEffect(() => {
    switch (currentStep) {
      case 1: // Setup
        setIsStirring(false);
        setIsDropping(false);
        setBubbling(false);
        break;
      case 2: // Prepare solutions
        setVolume(0);
        setSolutionColor('#FFE135'); // HCl color
        break;
      case 3: // Add indicator
        setSolutionColor('#FFCCCB'); // Slight pink tint
        break;
      case 4: // Begin titration
        setIsStirring(true);
        setIsDropping(true);
        // Gradually increase volume
        const volumeInterval = setInterval(() => {
          setVolume(prev => {
            if (prev < 20) return prev + 0.5;
            return prev;
          });
        }, 2000);
        setTimeout(() => clearInterval(volumeInterval), 20000);
        break;
      case 5: // Approach end point
        setIsDropping(true);
        setSolutionColor('#FFB6C1'); // Light pink
        setBubbling(true);
        break;
      case 6: // End point
        setIsDropping(false);
        setSolutionColor('#FF69B4'); // Bright pink
        setBubbling(false);
        break;
      case 7: // Record results
        setIsStirring(false);
        break;
      case 8: // Repeat
        // Reset for next titration
        setTimeout(() => {
          setVolume(0);
          setSolutionColor('#FFE135');
          setCurrentStep(2);
        }, 3000);
        break;
    }
  }, [currentStep]);

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    setTimer(0);
  };

  const handleAutoProgress = () => {
    setAutoProgress(!autoProgress);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setTimer(0);
    setTemperature(22);
    setVolume(0);
    setSolutionColor('#E3F2FD');
    setIsStirring(false);
    setIsDropping(false);
    setBubbling(false);
    setAutoProgress(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onDrop(id, x, y);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Experiment Steps */}
      <div className="lg:col-span-1">
        <ExperimentSteps 
          currentStep={currentStep}
          steps={experimentSteps}
          onStepClick={handleStepClick}
        />
        
        {/* Experiment Controls */}
        <div className="mt-4 bg-white rounded-lg shadow-lg border p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Experiment Controls</h3>
          
          <div className="space-y-3">
            <button
              onClick={handleAutoProgress}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                autoProgress
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {autoProgress ? <Pause size={20} /> : <Play size={20} />}
              <span>{autoProgress ? 'Pause' : 'Auto Progress'}</span>
            </button>
            
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw size={20} />
              <span>Reset Experiment</span>
            </button>
          </div>
          
          {/* Timer */}
          <div className="mt-4 bg-blue-600 text-white p-3 rounded-lg text-center">
            <div className="text-sm opacity-90 mb-1">Step Timer</div>
            <div className="text-xl font-mono font-bold">{formatTime(timer)}</div>
          </div>
          
          {/* Current Step Info */}
          <div className="mt-4 bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
            <div className="text-sm font-medium text-indigo-900">
              Current: Step {currentStep}
            </div>
            <div className="text-sm text-indigo-700">
              {experimentSteps[currentStep - 1]?.title}
            </div>
          </div>
        </div>
      </div>

      {/* Main Lab Bench */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg border">
          <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <h2 className="text-xl font-bold flex items-center">
              <FlaskConical className="mr-2" size={24} />
              Virtual Lab Bench - Acid-Base Titration
            </h2>
            <p className="text-sm opacity-90">
              Step {currentStep}: {experimentSteps[currentStep - 1]?.title}
            </p>
          </div>
          
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative w-full h-[600px] bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            {/* Lab Bench Surface */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-amber-200 to-amber-100 border-t-2 border-amber-300">
              <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-amber-300 to-amber-200"></div>
            </div>

            {/* Animated Equipment */}
            <AnimatedEquipment
              isStirring={isStirring}
              isDropping={isDropping}
              temperature={temperature}
              solutionColor={solutionColor}
              volume={volume}
              bubbling={bubbling}
            />

            {/* Manual Controls Overlay */}
            <div className="absolute bottom-4 left-4 space-y-2">
              <button
                onClick={() => setIsStirring(!isStirring)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isStirring ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isStirring ? 'Stop Stirring' : 'Start Stirring'}
              </button>
              
              <button
                onClick={() => setIsDropping(!isDropping)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDropping ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isDropping ? 'Stop Dropping' : 'Start Dropping'}
              </button>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};