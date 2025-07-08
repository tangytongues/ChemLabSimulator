import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Book, Trophy } from "lucide-react";
import { useExperiments, useUserProgress } from "@/hooks/use-experiments";
import { getUserId } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface ProgressModalProps {
  children: React.ReactNode;
}

export default function ProgressModal({ children }: ProgressModalProps) {
  const { data: experiments } = useExperiments();
  const { data: userProgress } = useUserProgress();

  const getExperimentProgress = (experimentId: number) => {
    const progress = userProgress?.find(
      (p: any) => p.experimentId === experimentId,
    );
    return progress ? progress.progress : 0;
  };

  const getTotalProgress = () => {
    if (!experiments || !userProgress) return 0;
    const totalSteps = experiments.reduce(
      (sum: number, exp: any) => sum + exp.steps.length,
      0,
    );
    const completedSteps = userProgress.reduce(
      (sum: number, p: any) => sum + p.progress,
      0,
    );
    return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  };

  const getCompletedExperiments = () => {
    if (!experiments || !userProgress) return 0;
    return userProgress.filter((p: any) => {
      const experiment = experiments.find(
        (exp: any) => exp.id === p.experimentId,
      );
      return experiment && p.progress >= experiment.steps.length;
    }).length;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            My Learning Progress
          </DialogTitle>
          <DialogDescription>
            Track your progress across all chemistry experiments
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Overall Progress */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Overall Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {getTotalProgress()}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Overall Completion
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getCompletedExperiments()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Experiments Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {experiments?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Experiments</div>
                </div>
              </div>
              <Progress value={getTotalProgress()} className="h-3" />
            </section>

            {/* Individual Experiment Progress */}
            <section>
              <h3 className="text-lg font-semibold mb-4">
                Experiment Progress
              </h3>
              <div className="space-y-4">
                {experiments?.map((experiment: any) => {
                  const progress = getExperimentProgress(experiment.id);
                  const progressPercentage = Math.round(
                    (progress / experiment.steps.length) * 100,
                  );
                  const isCompleted = progress >= experiment.steps.length;

                  return (
                    <div key={experiment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : progress > 0 ? (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <Book className="h-5 w-5 text-gray-400" />
                          )}
                          <h4 className="font-medium">{experiment.title}</h4>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {progress}/{experiment.steps.length} steps
                        </span>
                      </div>
                      <Progress
                        value={progressPercentage}
                        className="h-2 mb-2"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {isCompleted
                            ? "Completed!"
                            : progress > 0
                              ? "In Progress"
                              : "Not Started"}
                        </span>
                        <span className="text-sm font-medium">
                          {progressPercentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Learning Stats */}
            <section className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Learning Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Steps Completed:</span>
                  <div className="font-semibold">
                    {userProgress?.reduce(
                      (sum: number, p: any) => sum + p.progress,
                      0,
                    ) || 0}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Average Progress:</span>
                  <div className="font-semibold">{getTotalProgress()}%</div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
