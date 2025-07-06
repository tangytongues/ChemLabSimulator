import { useParams } from "wouter";
import { useState, useEffect } from "react";
import {
  useExperiment,
  useExperimentProgress,
  useUpdateProgress,
} from "@/hooks/use-experiments";
import { getUserId } from "@/lib/utils";
import Header from "@/components/header";
import VirtualLabApp from "@/components/VirtualLab/VirtualLabApp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Thermometer,
  Play,
  Pause,
} from "lucide-react";
import { Link } from "wouter";
import type { ExperimentStep } from "@shared/schema";

export default function Experiment() {
  const { id } = useParams<{ id: string }>();
  const experimentId = parseInt(id || "1");

  const {
    data: experiment,
    isLoading: experimentLoading,
    error,
  } = useExperiment(experimentId);
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
        setTimer((timer) => timer + 1);
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleCompleteStep = () => {
    updateProgressMutation.mutate({
      experimentId: experimentId,
      currentStep: Math.min(
        currentStep + 1,
        experiment?.stepDetails.length || 0 - 1,
      ),
      completed: currentStep === (experiment?.stepDetails.length || 0) - 1,
      progressPercentage: Math.round(
        ((currentStep + 2) / (experiment?.stepDetails.length || 1)) * 100,
      ),
    });

    if (currentStep < (experiment?.stepDetails.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < (experiment?.stepDetails.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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

  if (
    !experiment ||
    !experiment.stepDetails ||
    experiment.stepDetails.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Experiment Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The requested experiment (ID: {experimentId}) could not be found.
              Please try again.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStepData = experiment.stepDetails[currentStep];
  const progressPercentage = Math.round(
    ((currentStep + 1) / experiment.stepDetails.length) * 100,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Experiments
          </Link>
        </div>

        {/* Experiment Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {experiment.title}
          </h1>
          <p className="text-gray-600 mb-4">{experiment.description}</p>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm text-blue-600 font-semibold">
              {progressPercentage}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Main Lab Area - Full Width */}
        <div className="w-full">
          <Card className="min-h-[80vh]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-2xl">
                  {experiment.title} - Virtual Laboratory
                </span>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTimer}
                    className="flex items-center"
                  >
                    {isRunning ? (
                      <Pause className="h-4 w-4 mr-1" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {formatTime(timer)}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={currentStep === 0}
                      size="sm"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600 px-2">
                      {currentStep + 1} / {experiment.stepDetails.length}
                    </span>
                    <Button
                      variant="outline"
                      onClick={handleNextStep}
                      disabled={
                        currentStep === experiment.stepDetails.length - 1
                      }
                      size="sm"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Interactive Virtual Lab - Full Size */}
              <VirtualLabApp
                step={currentStepData}
                onStepComplete={handleCompleteStep}
                isActive={isActive}
                stepNumber={currentStep + 1}
                totalSteps={experiment.stepDetails.length}
                experimentTitle={experiment.title}
                allSteps={experiment.stepDetails}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
