import React from 'react';
import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  duration: number;
  status: 'pending' | 'active' | 'completed' | 'warning';
  requirements?: string[];
}

interface ExperimentStepsProps {
  currentStep: number;
  steps: Step[];
  onStepClick: (stepId: number) => void;
}

export const ExperimentSteps: React.FC<ExperimentStepsProps> = ({ 
  currentStep, 
  steps, 
  onStepClick 
}) => {
  const getStepIcon = (step: Step, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="text-green-500" size={20} />;
    } else if (step.status === 'active') {
      return <Clock className="text-blue-500 animate-pulse" size={20} />;
    } else if (step.status === 'warning') {
      return <AlertTriangle className="text-yellow-500" size={20} />;
    } else {
      return <Circle className="text-gray-400" size={20} />;
    }
  };

  const getStepBgColor = (step: Step, index: number) => {
    if (step.status === 'completed') {
      return 'bg-green-50 border-green-200';
    } else if (step.status === 'active') {
      return 'bg-blue-50 border-blue-300 shadow-md';
    } else if (step.status === 'warning') {
      return 'bg-yellow-50 border-yellow-200';
    } else {
      return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <h2 className="font-semibold">Experiment Procedure</h2>
        <p className="text-sm opacity-90">Acid-Base Titration</p>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getStepBgColor(step, index)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step, index)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      Step {step.id}: {step.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {step.duration}min
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                  {step.requirements && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Requirements:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {step.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center space-x-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};