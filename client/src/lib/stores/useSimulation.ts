import { create } from 'zustand';
import { 
  Agent, 
  WorldState, 
  EnvironmentalParameters, 
  SimulationStatistics,
  TimelineEvent 
} from '../types';
import { 
  createInitialAgents, 
  updateAgents, 
  reproduceAgents 
} from '../agentBehavior';
import { 
  initializeWorld,
  calculateResourceDistribution,
  updateResourceLevels
} from '../worldResources';
import { subscribeWithSelector } from 'zustand/middleware';

interface SimulationStore {
  // World state
  world: WorldState;
  running: boolean;
  timeScale: number;
  elapsedYears: number;
  timeline: TimelineEvent[];
  simulationId?: number; // Database simulation ID
  lastUpdateTime?: number; // For simulation update throttling
  
  // Environmental controls
  setEnvironmentalParameter: (param: keyof EnvironmentalParameters, value: number) => void;
  setWeatherCondition: (condition: 'clear' | 'rain' | 'storm' | 'drought') => void;
  triggerCatastrophe: (type: string, intensity: number) => void;
  
  // Simulation controls
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setTimeScale: (scale: number) => void;
  toggleRunning: () => void;
  
  // Simulation updates
  updateSimulation: (deltaTime: number) => void;
  
  // Database persistence
  saveToDatabase: () => Promise<boolean>;
  loadFromDatabase: () => Promise<boolean>;
  
  // Utilities
  getAgentById: (id: string) => Agent | undefined;
  trackTimelineEvent: (event: TimelineEvent) => void;
  
  // Camera/View-related
  focusedAgentId: string | null;
  setFocusedAgent: (id: string | null) => void;
}

export const useSimulation = create<SimulationStore>()(
  subscribeWithSelector((set, get) => ({
    world: initializeWorld(),
    running: false,
    timeScale: 1.0,
    elapsedYears: 0,
    timeline: [],
    focusedAgentId: null,
    simulationId: undefined,
    lastUpdateTime: 0,
    
    setEnvironmentalParameter: (param, value) => set(state => ({
      world: {
        ...state.world,
        environmentalParameters: {
          ...state.world.environmentalParameters,
          [param]: value
        }
      }
    })),
    
    setWeatherCondition: (condition) => set(state => ({
      world: {
        ...state.world,
        environmentalParameters: {
          ...state.world.environmentalParameters,
          weatherCondition: condition
        }
      }
    })),
    
    triggerCatastrophe: (type, intensity) => {
      const { world } = get();
      const event: TimelineEvent = {
        id: `event-${Date.now()}`,
        timestamp: world.time,
        title: `${type} Catastrophe`,
        description: `A ${type} catastrophe of intensity ${intensity} has occurred.`,
        type: 'extinction',
        significance: intensity
      };
      
      // Reduce resources based on catastrophe intensity
      set(state => ({
        world: {
          ...state.world,
          events: [...state.world.events, {
            id: `event-${Date.now()}`,
            type,
            timestamp: state.world.time,
            duration: 1000 * intensity,
            affectedAgents: state.world.agents.map(a => a.id),
            description: `${type} catastrophe of intensity ${intensity}`
          }],
          resources: state.world.resources.map(r => ({
            ...r,
            amount: Math.max(0, r.amount * (1 - intensity * 0.3))
          }))
        },
        timeline: [...state.timeline, event]
      }));
    },
    
    startSimulation: () => set({ running: true }),
    pauseSimulation: () => set({ running: false }),
    resetSimulation: () => set({ 
      world: initializeWorld(),
      elapsedYears: 0,
      timeline: []
    }),
    
    setTimeScale: (scale) => set({ timeScale: scale }),
    
    toggleRunning: () => set(state => ({ running: !state.running })),
    
    updateSimulation: (deltaTime) => {
      const { world, timeScale } = get();
      const scaledDelta = deltaTime * timeScale;
      
      // Throttle: Only update the simulation every 100ms of real time to reduce flickering
      // This makes the simulation more stable by reducing the frequency of updates
      const lastUpdateTime = get().lastUpdateTime || 0;
      const currentTime = Date.now();
      
      // If less than 100ms has passed, don't update
      if (currentTime - lastUpdateTime < 100) {
        return;
      }
      
      // Record update time for throttling
      set({ lastUpdateTime: currentTime });
      
      // Time tracking (1 real second = 1 simulated day at timeScale 1)
      const newTime = world.time + scaledDelta;
      const daysPassed = Math.floor(newTime / 1) - Math.floor(world.time / 1);
      const newTimeElapsed = world.timeElapsed + scaledDelta;
      
      // Calculate years (365 days = 1 year)
      const newElapsedYears = newTimeElapsed / 365;
      
      // Calculate day/night cycle (0-1 range, 0.5 is noon)
      const dayNightCycle = (newTime % 1);
      
      // Update resources
      const updatedResources = updateResourceLevels(world.resources, scaledDelta);
      
      // Update agent states based on consciousness and behaviors
      const { updatedAgents, newAgents, events } = updateAgents(
        world.agents, 
        updatedResources,
        world.environmentalParameters,
        world.cellGrid,
        scaledDelta
      );
      
      // Handle reproduction if any agents meet the threshold
      const { reproducedAgents, offspringAgents } = reproduceAgents(
        updatedAgents, 
        world.time
      );
      
      // Combine all agents (existing + newly reproduced)
      const allAgents = [...reproducedAgents, ...newAgents, ...offspringAgents];
      
      // Calculate new statistics
      const statistics = calculateStatistics(allAgents);
      
      // Create any significant events for the timeline
      checkForSignificantEvents(statistics, get().world.statistics, newElapsedYears);
      
      // Update cell grid with new agent positions
      const updatedCellGrid = updateCellGrid(world.cellGrid, allAgents);
      
      set(state => ({
        world: {
          ...state.world,
          time: newTime,
          timeElapsed: newTimeElapsed,
          dayNightCycle,
          agents: allAgents,
          resources: updatedResources,
          events: [...state.world.events, ...events],
          statistics,
          cellGrid: updatedCellGrid
        },
        elapsedYears: newElapsedYears
      }));
    },
    
    getAgentById: (id) => {
      return get().world.agents.find(agent => agent.id === id);
    },
    
    trackTimelineEvent: (event) => set(state => ({
      timeline: [...state.timeline, event]
    })),
    
    setFocusedAgent: (id) => set({ focusedAgentId: id }),
    
    // Database persistence functions
    saveToDatabase: async () => {
      try {
        const { world, simulationId } = get();
        const { simulationApi } = await import('../queryClient');
        
        if (simulationId) {
          // Update existing simulation
          await simulationApi.saveSimulationState(simulationId, world);
        } else {
          // Create new simulation
          const result = await simulationApi.createSimulation('Genesis Simulation', world);
          if (result && result.id) {
            set({ simulationId: result.id });
          }
        }
        
        return true;
      } catch (error) {
        console.error('Failed to save simulation to database:', error);
        return false;
      }
    },
    
    loadFromDatabase: async () => {
      try {
        const { simulationApi } = await import('../queryClient');
        const result = await simulationApi.getActiveSimulation();
        
        if (result && result.state) {
          set({ 
            world: result.state,
            simulationId: result.id,
            elapsedYears: result.state.timeElapsed / 365
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to load simulation from database:', error);
        return false;
      }
    }
  }))
);

// Helper function to calculate overall simulation statistics
function calculateStatistics(agents: Agent[]): SimulationStatistics {
  if (agents.length === 0) {
    return {
      populationSize: 0,
      averageConsciousness: 0,
      maxConsciousness: 0,
      averageLifespan: 0,
      totalGenerations: 0,
      languageComplexity: 0,
      socialComplexity: 0,
      resourceConsumption: 0,
      speciesCount: 0
    };
  }
  
  // Calculate statistics
  const totalConsciousness = agents.reduce((sum, agent) => sum + agent.consciousnessValue, 0);
  const maxConsciousness = Math.max(...agents.map(agent => agent.consciousnessValue));
  const maxGeneration = Math.max(...agents.map(agent => agent.generation));
  const avgLifespan = agents.reduce((sum, agent) => sum + agent.lifespan, 0) / agents.length;
  
  // Simple proxy for language and social complexity based on generation and consciousness
  const languageComplexity = Math.min(1, (maxGeneration / 10) * (maxConsciousness / 100));
  const socialComplexity = Math.min(1, (agents.length / 20) * (maxConsciousness / 100));
  
  // Resource consumption is proportional to population size and average movement
  const resourceConsumption = agents.length * 0.5;
  
  // Very simple species count based on distinct trait patterns
  // In a real simulation, this would be much more sophisticated
  const traitSignatures = new Set();
  agents.forEach(agent => {
    const signature = `${Math.round(agent.traits.curiosity*10)}-${Math.round(agent.traits.socialAffinity*10)}`;
    traitSignatures.add(signature);
  });
  
  return {
    populationSize: agents.length,
    averageConsciousness: totalConsciousness / agents.length,
    maxConsciousness,
    averageLifespan: avgLifespan,
    totalGenerations: maxGeneration,
    languageComplexity,
    socialComplexity,
    resourceConsumption,
    speciesCount: traitSignatures.size
  };
}

// Generate significant events for the timeline
function checkForSignificantEvents(
  newStats: SimulationStatistics, 
  oldStats: SimulationStatistics,
  elapsedYears: number
): void {
  const store = useSimulation.getState();
  
  // New species evolved
  if (newStats.speciesCount > oldStats.speciesCount) {
    store.trackTimelineEvent({
      id: `event-${Date.now()}`,
      timestamp: store.world.time,
      title: 'New Species Evolved',
      description: `A new species has evolved, bringing the total to ${newStats.speciesCount}.`,
      type: 'mutation',
      significance: 0.7
    });
  }
  
  // Population milestone (every 10 agents)
  if (Math.floor(newStats.populationSize / 10) > Math.floor(oldStats.populationSize / 10)) {
    store.trackTimelineEvent({
      id: `event-${Date.now()}`,
      timestamp: store.world.time,
      title: 'Population Milestone',
      description: `The population has reached ${Math.floor(newStats.populationSize / 10) * 10} individuals.`,
      type: 'population',
      significance: 0.5
    });
  }
  
  // Language milestones (based on complexity)
  if (newStats.languageComplexity > oldStats.languageComplexity + 0.2) {
    store.trackTimelineEvent({
      id: `event-${Date.now()}`,
      timestamp: store.world.time,
      title: 'Communication Evolution',
      description: `The agents have developed more complex communication patterns.`,
      type: 'language',
      significance: 0.8
    });
  }
  
  // Social structure milestone
  if (newStats.socialComplexity > oldStats.socialComplexity + 0.2) {
    store.trackTimelineEvent({
      id: `event-${Date.now()}`,
      timestamp: store.world.time,
      title: 'Social Structure Formed',
      description: `Agents have begun forming more complex social structures.`,
      type: 'social',
      significance: 0.7
    });
  }
  
  // Generation milestone
  if (newStats.totalGenerations > oldStats.totalGenerations) {
    store.trackTimelineEvent({
      id: `event-${Date.now()}`,
      timestamp: store.world.time,
      title: 'New Generation',
      description: `Generation ${newStats.totalGenerations} has emerged.`,
      type: 'population',
      significance: 0.4
    });
  }
}

// Update cell grid with new agent positions
function updateCellGrid(cellGrid: any[][], agents: Agent[]) {
  // Create a deep copy of the grid
  const updatedGrid = cellGrid.map(row => [...row]);
  
  // Reset occupancy
  for (let i = 0; i < updatedGrid.length; i++) {
    for (let j = 0; j < updatedGrid[i].length; j++) {
      updatedGrid[i][j].occupied = false;
      updatedGrid[i][j].occupants = [];
    }
  }
  
  // Update with new agent positions
  agents.forEach(agent => {
    const x = Math.floor((agent.position.x + 50) / 10);
    const z = Math.floor((agent.position.z + 50) / 10);
    
    // Ensure coordinates are within bounds
    if (x >= 0 && x < updatedGrid.length && z >= 0 && z < updatedGrid[0].length) {
      updatedGrid[x][z].occupied = true;
      updatedGrid[x][z].occupants.push(agent.id);
    }
  });
  
  return updatedGrid;
}
