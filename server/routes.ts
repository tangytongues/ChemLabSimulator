import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all experiments
  app.get("/api/experiments", async (req, res) => {
    try {
      const experiments = await storage.getAllExperiments();
      res.json(experiments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiments" });
    }
  });

  // Get specific experiment
  app.get("/api/experiments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid experiment ID" });
      }

      const experiment = await storage.getExperiment(id);
      if (!experiment) {
        return res.status(404).json({ message: "Experiment not found" });
      }

      res.json(experiment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experiment" });
    }
  });

  // Get user progress for all experiments
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const progress = await storage.getAllUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Get user progress for specific experiment
  app.get("/api/progress/:userId/:experimentId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const experimentId = parseInt(req.params.experimentId);
      
      if (isNaN(experimentId)) {
        return res.status(400).json({ message: "Invalid experiment ID" });
      }

      const progress = await storage.getUserProgress(userId, experimentId);
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Update user progress
  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.updateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Get platform stats
  app.get("/api/stats", async (req, res) => {
    try {
      const experiments = await storage.getAllExperiments();
      const stats = {
        experiments: experiments.length,
        students: 2543, // Mock data for demo
        completed: 15678, // Mock data for demo
        rating: 4.9 // Mock data for demo
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
