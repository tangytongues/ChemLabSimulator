import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { useExperiment, useExperimentProgress, useUpdateProgress } from "@/hooks/use-experiments";
import Header from "@/components/header";
import VirtualLab from "@/components/virtual-lab";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle, Clock, Thermometer, Play, Pause, FlaskConical } from "lucide-react";
import { Link } from "wouter";
import type { ExperimentStep } from "@shared/schema";

export default function Experiment() {
  const { id } = useParams<{ id: string }>();
  const experimentId = parseInt(id || "1"); // Default to experiment 1 if no ID
  
  const { data: experiment, isLoading: experimentLoading, error } = useExperiment(experimentId);
  const { data: progress } = useExperimentProgress(experimentId);
  const updateProgressMutation = useUpdateProgress();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (progress) {
      setCurrentStep(progress.currentStep);
    }
  }, [progress]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timer]);

  const handleNextStep = () => {
    if (!experiment) return;
    
    const nextStepIndex = Math.min(currentStep + 1, experiment.stepDetails.length - 1);
    const progressPercentage = Math.round(((nextStepIndex + 1) / experiment.stepDetails.length) * 100);
    const isCompleted = nextStepIndex === experiment.stepDetails.length - 1;
    
    updateProgressMutation.mutate({
      experimentId,
      currentStep: nextStepIndex,
      completed: isCompleted,
      progressPercentage,
    });
    
    setCurrentStep(nextStepIndex);
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (experimentLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (experimentLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Experiment...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!experiment || !experiment.stepDetails || experiment.stepDetails.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Experiment Not Found</h2>
            <p className="text-gray-600 mb-6">
              The requested experiment (ID: {experimentId}) could not be found. Please try again.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = experiment.stepDetails[currentStep];
  const progressPercentage = Math.round(((currentStep + 1) / experiment.stepDetails.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6">
          <Link href="/" className="text-science-blue hover:text-blue-700 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experiments
          </Link>
        </div>

        {/* Experiment Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{experiment.title}</h1>
              <div className="flex items-center space-x-4">
                <Badge className="bg-blue-100 text-science-blue">
                  {experiment.category}
                </Badge>
                <span className="text-lab-gray">{experiment.difficulty}</span>
                <span className="text-lab-gray">{experiment.duration} minutes</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-right">
                <div className="text-2xl font-bold text-science-blue">{progressPercentage}%</div>
                <div className="text-sm text-lab-gray">Complete</div>
              </div>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Experiment Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Step {currentStep + 1}: {currentStepData.title}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleTimer}
                      className="flex items-center"
                    >
                      {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                      {formatTime(timer)}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Safety Warning */}
                {currentStepData.safety && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertTriangle className="text-alert-red h-5 w-5 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-alert-red mb-1">Safety Alert</h4>
                        <p className="text-sm text-gray-700">{currentStepData.safety}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Instructions */}
                <div className="mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Step Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-lab-gray">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{currentStepData.duration}</span>
                  </div>
                  {currentStepData.temperature && (
                    <div className="flex items-center space-x-2 text-lab-gray">
                      <Thermometer className="h-4 w-4" />
                      <span className="text-sm">{currentStepData.temperature}</span>
                    </div>
                  )}
                </div>

                {/* Interactive Virtual Lab */}
                <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg p-8 mb-6">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <FlaskConical className="h-16 w-16 text-science-blue" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Virtual Lab Simulation</h3>
                    <p className="text-lab-gray text-sm mb-4">
                      Step {currentStep + 1}: {currentStepData.title}
                    </p>
                    <p className="text-gray-700 text-sm">
                      {currentStepData.description}
                    </p>
                    
                    {/* Interactive Elements */}
                    <div className="mt-6 space-y-4">
                      {/* Chemical Mixing Animation */}
                      <div className="flex justify-center space-x-4">
                        <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center">
                          <span className="text-2xl">⚗️</span>
                        </div>
                        <div className="w-16 h-16 bg-yellow-100 rounded-full border-4 border-yellow-300 flex items-center justify-center">
                          <span className="text-2xl">🧪</span>
                        </div>
                      </div>
                      
                      {/* Step Progress */}
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Step Progress</span>
                          <span className="text-sm text-science-blue font-semibold">
                            {Math.round(((currentStep + 1) / experiment.stepDetails.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-science-blue h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / experiment.stepDetails.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous Step
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={currentStep === experiment.stepDetails.length - 1}
                    className="bg-science-blue hover:bg-blue-700"
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Steps Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Experiment Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {experiment.stepDetails.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        index === currentStep
                          ? 'bg-blue-50 border border-science-blue'
                          : index < currentStep
                          ? 'bg-green-50'
                          : 'bg-gray-50'
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          index < currentStep
                            ? 'bg-lab-green text-white'
                            : index === currentStep
                            ? 'bg-science-blue text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {index < currentStep ? <CheckCircle className="h-3 w-3" /> : index + 1}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-900">{step.title}</p>
                        <p className="text-xs text-lab-gray">{step.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment List */}
            <Card>
              <CardHeader>
                <CardTitle>Required Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {experiment.equipment.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-science-blue rounded-full"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
