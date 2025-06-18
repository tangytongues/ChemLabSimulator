import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Thermometer, Play, Download, CheckCircle, Lock, Activity } from "lucide-react";
import type { Experiment, ExperimentStep } from "@shared/schema";
import { useLocation } from "wouter";

interface ExperimentModalProps {
  experiment: Experiment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExperimentModal({ experiment, isOpen, onClose }: ExperimentModalProps) {
  const [, navigate] = useLocation();

  if (!experiment) return null;

  const handleStartExperiment = () => {
    navigate(`/experiment/${experiment.id}`);
    onClose();
  };

  const renderStep = (step: ExperimentStep, index: number) => {
    const isActive = index === 1; // Mock active step
    const isCompleted = index === 0; // Mock completed step
    const isLocked = index > 1; // Mock locked steps

    return (
      <div
        key={step.id}
        className={`flex items-start space-x-4 p-4 rounded-lg ${
          isActive ? 'bg-blue-50 border-l-4 border-science-blue' :
          isCompleted ? 'bg-gray-50' : 
          'bg-gray-50 opacity-60'
        }`}
      >
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          isCompleted ? 'bg-lab-green text-white' :
          isActive ? 'bg-science-blue text-white' :
          'bg-gray-300 text-white'
        }`}>
          {index + 1}
        </div>
        <div className="flex-grow">
          <h5 className="font-semibold text-gray-900 mb-2">{step.title}</h5>
          <p className="text-lab-gray text-sm mb-2">{step.description}</p>
          <div className="flex items-center text-xs text-lab-gray space-x-4">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>{step.duration}</span>
            </div>
            {step.temperature && (
              <div className="flex items-center">
                <Thermometer className="mr-1 h-3 w-3" />
                <span>{step.temperature}</span>
              </div>
            )}
            {step.safety && (
              <div className="flex items-center text-alert-red">
                <AlertTriangle className="mr-1 h-3 w-3" />
                <span>{step.safety}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle className="text-lab-green h-6 w-6" />
          ) : isActive ? (
            <div className="w-6 h-6 border-2 border-science-blue rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-science-blue rounded-full animate-pulse" />
            </div>
          ) : (
            <Lock className="text-gray-400 h-6 w-6" />
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {experiment.title}
          </DialogTitle>
          <p className="text-lab-gray">Interactive Virtual Chemistry Lab</p>
        </DialogHeader>

        {/* Safety Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="text-alert-red h-5 w-5 mr-3 mt-1" />
            <div>
              <h4 className="font-semibold text-alert-red mb-2">Safety Information</h4>
              <p className="text-sm text-gray-700">{experiment.safetyInfo}</p>
            </div>
          </div>
        </div>

        {/* Experiment Steps */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Experiment Steps</h4>
          <div className="space-y-4">
            {experiment.stepDetails.map((step, index) => renderStep(step, index))}
          </div>
        </div>

        {/* Equipment Needed */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Equipment & Materials</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {experiment.equipment.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Activity className="text-science-blue h-4 w-4" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <Button onClick={handleStartExperiment} className="flex-1 bg-science-blue hover:bg-blue-700">
            <Play className="mr-2 h-4 w-4" />
            Start Virtual Experiment
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download Instructions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
