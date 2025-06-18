import { users, experiments, userProgress, type User, type InsertUser, type Experiment, type InsertExperiment, type UserProgress, type InsertUserProgress, type ExperimentStep } from "@shared/schema";
import fs from 'fs';
import path from 'path';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllExperiments(): Promise<Experiment[]>;
  getExperiment(id: number): Promise<Experiment | undefined>;
  createExperiment(experiment: InsertExperiment): Promise<Experiment>;
  
  getUserProgress(userId: string, experimentId: number): Promise<UserProgress | undefined>;
  getAllUserProgress(userId: string): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private experiments: Map<number, Experiment>;
  private userProgress: Map<string, UserProgress>;
  private currentUserId: number;
  private currentExperimentId: number;
  private currentProgressId: number;

  constructor() {
    this.users = new Map();
    this.experiments = new Map();
    this.userProgress = new Map();
    this.currentUserId = 1;
    this.currentExperimentId = 1;
    this.currentProgressId = 1;
    
    this.initializeExperiments();
  }

  private initializeExperiments() {
    try {
      const experimentsPath = path.resolve(process.cwd(), 'data', 'experiments.json');
      const experimentsData = JSON.parse(fs.readFileSync(experimentsPath, 'utf-8'));
      
      experimentsData.forEach((exp: any, index: number) => {
        const experiment: Experiment = {
          id: index + 1, // Use 1-based indexing for consistent IDs
          title: exp.title,
          description: exp.description,
          category: exp.category,
          difficulty: exp.difficulty,
          duration: exp.duration,
          steps: exp.steps,
          rating: Math.round(exp.rating * 10), // Convert to integer
          imageUrl: exp.imageUrl,
          equipment: exp.equipment,
          stepDetails: exp.stepDetails,
          safetyInfo: exp.safetyInfo,
        };
        this.experiments.set(experiment.id, experiment);
        console.log(`Loaded experiment ${experiment.id}: ${experiment.title}`);
      });
      console.log(`Total experiments loaded: ${this.experiments.size}`);
    } catch (error) {
      console.error('Failed to load experiments data:', error);
      // Fallback to empty experiments if file doesn't exist
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllExperiments(): Promise<Experiment[]> {
    return Array.from(this.experiments.values());
  }

  async getExperiment(id: number): Promise<Experiment | undefined> {
    return this.experiments.get(id);
  }

  async createExperiment(insertExperiment: InsertExperiment): Promise<Experiment> {
    const id = this.currentExperimentId++;
    const experiment: Experiment = { 
      ...insertExperiment, 
      id,
      equipment: insertExperiment.equipment as string[],
      stepDetails: insertExperiment.stepDetails as ExperimentStep[]
    };
    this.experiments.set(id, experiment);
    return experiment;
  }

  async getUserProgress(userId: string, experimentId: number): Promise<UserProgress | undefined> {
    const key = `${userId}_${experimentId}`;
    return this.userProgress.get(key);
  }

  async getAllUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const key = `${progress.userId}_${progress.experimentId}`;
    const existing = this.userProgress.get(key);
    
    if (existing) {
      const updated: UserProgress = {
        ...existing,
        ...progress,
        lastUpdated: new Date(),
      };
      this.userProgress.set(key, updated);
      return updated;
    } else {
      return this.createUserProgress(progress);
    }
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentProgressId++;
    const progress: UserProgress = {
      id,
      userId: insertProgress.userId,
      experimentId: insertProgress.experimentId,
      currentStep: insertProgress.currentStep ?? 0,
      completed: insertProgress.completed ?? false,
      progressPercentage: insertProgress.progressPercentage ?? 0,
      lastUpdated: new Date(),
    };
    const key = `${progress.userId}_${progress.experimentId}`;
    this.userProgress.set(key, progress);
    return progress;
  }
}

export const storage = new MemStorage();
