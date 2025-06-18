import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const experiments = pgTable("experiments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  duration: integer("duration").notNull(), // in minutes
  steps: integer("steps").notNull(),
  rating: integer("rating").notNull(), // out of 50 (4.8 * 10)
  imageUrl: text("image_url").notNull(),
  equipment: jsonb("equipment").$type<string[]>().notNull(),
  stepDetails: jsonb("step_details").$type<ExperimentStep[]>().notNull(),
  safetyInfo: text("safety_info").notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // For now, we'll use session-based tracking
  experimentId: integer("experiment_id").notNull().references(() => experiments.id),
  currentStep: integer("current_step").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  progressPercentage: integer("progress_percentage").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export type ExperimentStep = {
  id: number;
  title: string;
  description: string;
  duration: string;
  temperature?: string;
  safety?: string;
  completed: boolean;
};

export const insertExperimentSchema = createInsertSchema(experiments).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastUpdated: true,
});

export type InsertExperiment = z.infer<typeof insertExperimentSchema>;
export type Experiment = typeof experiments.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

// Users table (keeping existing structure)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
