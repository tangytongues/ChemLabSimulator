import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, FlaskRound, Star, Play, CheckCircle } from "lucide-react";
import type { Experiment, UserProgress } from "@shared/schema";
import { useLocation } from "wouter";

interface ExperimentCardProps {
  experiment: Experiment;
  progress?: UserProgress | null;
  onViewDetails: (experiment: Experiment) => void;
}

export default function ExperimentCard({ experiment, progress, onViewDetails }: ExperimentCardProps) {
  const [, navigate] = useLocation();
  
  const progressPercentage = progress?.progressPercentage || 0;
  const isCompleted = progress?.completed || false;
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Organic Chemistry':
        return 'bg-blue-100 text-science-blue';
      case 'Acid-Base':
        return 'bg-green-100 text-lab-green';
      case 'Equilibrium':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600';
      case 'Intermediate':
        return 'text-yellow-600';
      case 'Advanced':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleStartExperiment = () => {
    navigate(`/experiment/${experiment.id}`);
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      <img 
        src={experiment.imageUrl} 
        alt={experiment.title}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={getCategoryColor(experiment.category)}>
            {experiment.category}
          </Badge>
          <div className="flex items-center text-lab-gray text-sm">
            <Clock className="mr-1 h-4 w-4" />
            <span>{experiment.duration} min</span>
          </div>
        </div>
        
        <h4 className="text-xl font-bold text-gray-900 mb-3">{experiment.title}</h4>
        <p className="text-lab-gray mb-4 text-sm leading-relaxed">
          {experiment.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-lab-gray">
              <Activity className="mr-1 h-4 w-4" />
              <span className={getDifficultyColor(experiment.difficulty)}>
                {experiment.difficulty}
              </span>
            </div>
            <div className="flex items-center text-sm text-lab-gray">
              <FlaskRound className="mr-1 h-4 w-4" />
              <span>{experiment.steps} Steps</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-yellow-600">
            <Star className="mr-1 h-4 w-4 fill-current" />
            <span>{(experiment.rating / 10).toFixed(1)}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-lab-gray">Progress</span>
            <span className={`font-medium ${isCompleted ? 'text-lab-green' : 'text-science-blue'}`}>
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${isCompleted ? 'bg-lab-green' : 'bg-science-blue'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        <Button 
          onClick={handleStartExperiment}
          className={`w-full py-3 font-semibold transition-colors ${
            isCompleted 
              ? 'bg-lab-green hover:bg-green-700 text-white' 
              : 'bg-science-blue hover:bg-blue-700 text-white'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Review Completed
            </>
          ) : progressPercentage > 0 ? (
            <>
              <Play className="mr-2 h-4 w-4" />
              Continue Experiment
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Experiment
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
