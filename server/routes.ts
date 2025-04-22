import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as simulationServices from './simulationServices';
import { WorldState } from "../client/src/lib/types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // === Simulation endpoints ===

  // Get active simulation
  app.get('/api/simulation', async (req: Request, res: Response) => {
    try {
      const simulation = await simulationServices.getActiveSimulation();
      if (!simulation) {
        return res.status(404).json({ error: 'No active simulation found' });
      }
      res.json(simulation);
    } catch (error) {
      console.error('Error fetching simulation:', error);
      res.status(500).json({ error: 'Failed to fetch simulation' });
    }
  });

  // Create new simulation
  app.post('/api/simulation', async (req: Request, res: Response) => {
    try {
      const { name, initialState } = req.body;
      if (!name || !initialState) {
        return res.status(400).json({ error: 'Name and initial state are required' });
      }
      
      const simulation = await simulationServices.createSimulation(name, initialState);
      res.status(201).json(simulation);
    } catch (error) {
      console.error('Error creating simulation:', error);
      res.status(500).json({ error: 'Failed to create simulation' });
    }
  });

  // Save simulation state
  app.put('/api/simulation/:id', async (req: Request, res: Response) => {
    try {
      const simulationId = parseInt(req.params.id);
      const state = req.body as WorldState;
      
      await simulationServices.saveSimulationState(simulationId, state);
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving simulation state:', error);
      res.status(500).json({ error: 'Failed to save simulation state' });
    }
  });

  // Get agent memories
  app.get('/api/agent/:id/memories', async (req: Request, res: Response) => {
    try {
      const agentId = req.params.id;
      const memories = await simulationServices.getAgentMemories(agentId);
      res.json(memories);
    } catch (error) {
      console.error('Error fetching agent memories:', error);
      res.status(500).json({ error: 'Failed to fetch agent memories' });
    }
  });

  // Add agent memory
  app.post('/api/agent/:id/memory', async (req: Request, res: Response) => {
    try {
      const agentId = req.params.id;
      const memory = req.body;
      
      await simulationServices.addAgentMemory(agentId, memory);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error adding agent memory:', error);
      res.status(500).json({ error: 'Failed to add agent memory' });
    }
  });

  // Get timeline events
  app.get('/api/simulation/:id/timeline', async (req: Request, res: Response) => {
    try {
      const simulationId = parseInt(req.params.id);
      const events = await simulationServices.getTimelineEvents(simulationId);
      res.json(events);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      res.status(500).json({ error: 'Failed to fetch timeline events' });
    }
  });

  // Add timeline event
  app.post('/api/simulation/:id/timeline', async (req: Request, res: Response) => {
    try {
      const simulationId = parseInt(req.params.id);
      const event = req.body;
      
      await simulationServices.addTimelineEvent(simulationId, event);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error adding timeline event:', error);
      res.status(500).json({ error: 'Failed to add timeline event' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
