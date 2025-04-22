import { pgTable, text, serial, integer, boolean, json, timestamp, doublePrecision, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original user schema
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

// Simulation specific schemas
export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  last_updated: timestamp("last_updated").defaultNow().notNull(),
  time_elapsed: doublePrecision("time_elapsed").default(0).notNull(),
  day_night_cycle: doublePrecision("day_night_cycle").default(0).notNull(),
  year_count: integer("year_count").default(0).notNull(),
  active: boolean("active").default(true),
  settings: json("settings").$type<{
    timeScale: number;
    environmentalParameters: {
      temperature: number;
      lightLevel: number;
      resourceAbundance: number;
      resourceDistribution: number;
      weatherCondition: string;
    };
  }>(),
});

export const agents = pgTable("agents", {
  id: text("id").primaryKey(), // Could be 'adam', 'eve', or unique IDs
  simulation_id: integer("simulation_id").references(() => simulations.id).notNull(),
  position_x: doublePrecision("position_x").notNull(),
  position_y: doublePrecision("position_y").notNull(),
  position_z: doublePrecision("position_z").notNull(),
  rotation_x: doublePrecision("rotation_x").default(0),
  rotation_y: doublePrecision("rotation_y").default(0),
  rotation_z: doublePrecision("rotation_z").default(0),
  scale: doublePrecision("scale").default(1),
  color: text("color").notNull(),
  energy: doublePrecision("energy").default(100),
  age: doublePrecision("age").default(0),
  lifespan: doublePrecision("lifespan").default(100),
  generation: integer("generation").default(0),
  consciousness_value: doublePrecision("consciousness_value").default(0),
  last_reproduction_time: doublePrecision("last_reproduction_time").default(0),
  last_action: text("last_action").default("idle"),
  reproduction_cooldown: doublePrecision("reproduction_cooldown").default(0),
  perception_radius: doublePrecision("perception_radius").default(10),
  movement_speed: doublePrecision("movement_speed").default(1),
  mutation_rate: doublePrecision("mutation_rate").default(0.05),
  traits: json("traits").$type<{
    curiosity: number;
    socialAffinity: number;
    resourceAffinity: number;
    exploration: number;
    adaptability: number;
  }>(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  active: boolean("active").default(true),
});

export const agentMemories = pgTable("agent_memories", {
  id: serial("id").primaryKey(),
  agent_id: text("agent_id").references(() => agents.id).notNull(),
  timestamp: doublePrecision("timestamp").notNull(),
  memory_type: text("memory_type").notNull(), // 'encounter', 'action', 'feedback', 'observation'
  data: json("data").$type<any>(),
  intensity: doublePrecision("intensity").default(1),
  created_at: timestamp("created_at").defaultNow(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  simulation_id: integer("simulation_id").references(() => simulations.id).notNull(),
  resource_id: text("resource_id").notNull(), // Unique identifier within the simulation
  type: text("type").notNull(), // 'food', 'water', 'light'
  position_x: doublePrecision("position_x").notNull(),
  position_y: doublePrecision("position_y").notNull(),
  position_z: doublePrecision("position_z").notNull(),
  amount: doublePrecision("amount").default(100),
  regeneration_rate: doublePrecision("regeneration_rate").default(0.1),
  last_regeneration: doublePrecision("last_regeneration").default(0),
  created_at: timestamp("created_at").defaultNow(),
  active: boolean("active").default(true),
});

// Timeline events for tracking important simulation moments
export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  simulation_id: integer("simulation_id").references(() => simulations.id).notNull(),
  timestamp: doublePrecision("timestamp").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  event_type: text("event_type").notNull(), // 'language', 'social', 'technological', 'extinction', 'population', 'mutation'
  significance: doublePrecision("significance").default(1),
  created_at: timestamp("created_at").defaultNow(),
});
