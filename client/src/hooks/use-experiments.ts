import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Experiment, UserProgress } from "@shared/schema";

// Generate a simple session-based user ID
const getUserId = () => {
  let userId = localStorage.getItem('chemlab_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chemlab_user_id', userId);
  }
  return userId;
};

export function useExperiments() {
  return useQuery<Experiment[]>({
    queryKey: ['/api/experiments'],
  });
}

export function useExperiment(id: number) {
  return useQuery<Experiment>({
    queryKey: ['/api/experiments', id],
    enabled: !!id,
  });
}

export function useUserProgress(experimentId?: number) {
  const userId = getUserId();
  
  return useQuery<UserProgress[]>({
    queryKey: ['/api/progress', userId],
    enabled: !experimentId,
  });
}

export function useExperimentProgress(experimentId: number) {
  const userId = getUserId();
  
  return useQuery<UserProgress | null>({
    queryKey: ['/api/progress', userId, experimentId],
    enabled: !!experimentId,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const userId = getUserId();

  return useMutation({
    mutationFn: async (progress: {
      experimentId: number;
      currentStep: number;
      completed: boolean;
      progressPercentage: number;
    }) => {
      const response = await apiRequest('POST', '/api/progress', {
        ...progress,
        userId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/progress', userId, data.experimentId] });
    },
  });
}

export function useStats() {
  return useQuery<{
    experiments: number;
    students: number;
    completed: number;
    rating: number;
  }>({
    queryKey: ['/api/stats'],
  });
}
