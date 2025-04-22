import { v4 as uuidv4 } from 'uuid';
import { 
  Agent, 
  Vector3D, 
  AgentAction,
  Resource,
  EnvironmentalParameters,
  WorldEvent,
  Cell
} from './types';
import { calculateConsciousness } from './consciousness';
import { mutateAgent } from './evolutionSystem';

/**
 * Create the initial Adam and Eve agents
 */
export function createInitialAgents(): Agent[] {
  // Create Adam
  const adam: Agent = {
    id: 'adam',
    position: { x: -2, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    scale: 1,
    color: '#4285F4', // blue
    energy: 100,
    age: 0,
    lifespan: 1000, // in simulation time units
    generation: 1,
    perceptionRadius: 10,
    movementSpeed: 0.05,
    sensorValues: {
      visualInput: [],
      auditoryInput: [],
      tactileInput: [],
      proximity: [],
      resourceLevels: { light: 0, food: 0, water: 0 }
    },
    memory: [],
    reproductionThreshold: 70, // consciousness threshold for reproduction
    mutationRate: 0.1,
    consciousnessValue: 0, // Will be calculated
    lastReproductionTime: 0,
    lastAction: 'idle',
    reproductionCooldown: 100,
    traits: {
      curiosity: 0.7,
      socialAffinity: 0.6,
      resourceAffinity: 0.5,
      exploration: 0.8,
      adaptability: 0.6
    }
  };
  
  // Create Eve with slightly different traits
  const eve: Agent = {
    ...adam,
    id: 'eve',
    position: { x: 2, y: 0, z: 0 },
    color: '#EA4335', // red
    traits: {
      curiosity: 0.6,
      socialAffinity: 0.8,
      resourceAffinity: 0.7,
      exploration: 0.5,
      adaptability: 0.7
    }
  };
  
  // Calculate initial consciousness values
  adam.consciousnessValue = calculateConsciousness(adam);
  eve.consciousnessValue = calculateConsciousness(eve);
  
  return [adam, eve];
}

/**
 * Update all agents based on their current state, environment, and consciousness
 */
export function updateAgents(
  agents: Agent[],
  resources: Resource[],
  environmentalParameters: EnvironmentalParameters,
  cellGrid: Cell[][],
  deltaTime: number
): { updatedAgents: Agent[], newAgents: Agent[], events: WorldEvent[] } {
  const updatedAgents: Agent[] = [];
  const events: WorldEvent[] = [];
  
  // Agents that are alive after this update
  for (const agent of agents) {
    // Skip if agent has no energy left
    if (agent.energy <= 0) {
      // Record death event
      events.push({
        id: uuidv4(),
        type: 'death',
        timestamp: Date.now(),
        duration: 0,
        affectedAgents: [agent.id],
        description: `Agent ${agent.id} died at age ${agent.age}`
      });
      continue;
    }
    
    // Age the agent
    const updatedAgent = {
      ...agent,
      age: agent.age + deltaTime
    };
    
    // Energy consumption based on movement and actions
    updatedAgent.energy -= 0.1 * deltaTime;
    
    // Update sensor values based on environment
    updateSensorValues(updatedAgent, agents, resources, cellGrid);
    
    // Decide and perform action
    const action = decideAction(updatedAgent, agents, resources);
    performAction(updatedAgent, action, resources, agents, deltaTime);
    
    // Record the action in memory if significant
    if (action !== 'idle') {
      addMemory(updatedAgent, {
        timestamp: Date.now(),
        type: 'action',
        data: { action },
        intensity: 0.5
      });
    }
    
    // Update consciousness value
    updatedAgent.consciousnessValue = calculateConsciousness(updatedAgent);
    
    // Check if agent has died of old age
    if (updatedAgent.age >= updatedAgent.lifespan) {
      // Record death event
      events.push({
        id: uuidv4(),
        type: 'death',
        timestamp: Date.now(),
        duration: 0,
        affectedAgents: [agent.id],
        description: `Agent ${agent.id} died of old age at ${updatedAgent.age}`
      });
      continue;
    }
    
    // Add the updated agent to the list
    updatedAgents.push(updatedAgent);
  }
  
  return { updatedAgents, newAgents: [], events };
}

/**
 * Update the agent's sensor values based on environment
 */
function updateSensorValues(
  agent: Agent,
  allAgents: Agent[],
  resources: Resource[],
  cellGrid: Cell[][]
): void {
  // Reset proximity data
  agent.sensorValues.proximity = [];
  
  // Detect nearby agents
  allAgents.forEach(otherAgent => {
    if (otherAgent.id !== agent.id) {
      const distance = calculateDistance(agent.position, otherAgent.position);
      if (distance <= agent.perceptionRadius) {
        agent.sensorValues.proximity.push({
          type: 'agent',
          distance,
          direction: calculateDirection(agent.position, otherAgent.position),
          id: otherAgent.id
        });
      }
    }
  });
  
  // Detect nearby resources
  resources.forEach(resource => {
    const distance = calculateDistance(agent.position, resource.position);
    if (distance <= agent.perceptionRadius) {
      agent.sensorValues.proximity.push({
        type: 'resource',
        distance,
        direction: calculateDirection(agent.position, resource.position),
        id: resource.id
      });
    }
  });
  
  // Update resource levels based on current cell
  const x = Math.floor((agent.position.x + 50) / 10);
  const z = Math.floor((agent.position.z + 50) / 10);
  
  if (x >= 0 && x < cellGrid.length && z >= 0 && z < cellGrid[0].length) {
    const cell = cellGrid[x][z];
    agent.sensorValues.resourceLevels = {
      food: cell.resources.food,
      water: cell.resources.water,
      light: cell.resources.light
    };
  }
}

/**
 * Decide which action the agent should take based on its current state
 */
function decideAction(
  agent: Agent,
  allAgents: Agent[],
  resources: Resource[]
): AgentAction {
  // Low energy? Look for food
  if (agent.energy < 30) {
    const nearbyFood = agent.sensorValues.proximity.find(
      p => p.type === 'resource' && resources.find(r => r.id === p.id)?.type === 'food'
    );
    if (nearbyFood) {
      return 'approach';
    }
    return 'explore';
  }
  
  // Reproduction ready?
  if (
    agent.consciousnessValue >= agent.reproductionThreshold && 
    agent.age > agent.lastReproductionTime + agent.reproductionCooldown
  ) {
    // Look for another agent to reproduce with
    const nearbyAgent = agent.sensorValues.proximity.find(p => p.type === 'agent');
    if (nearbyAgent) {
      // Find the other agent
      const partner = allAgents.find(a => a.id === nearbyAgent.id);
      if (
        partner && 
        partner.consciousnessValue >= partner.reproductionThreshold &&
        partner.age > partner.lastReproductionTime + partner.reproductionCooldown
      ) {
        return 'reproduce';
      }
      return 'approach';
    }
    return 'explore';
  }
  
  // Default behaviors based on traits
  
  // Curious agents explore more
  if (Math.random() < agent.traits.curiosity * 0.3) {
    return 'explore';
  }
  
  // Social agents approach others
  if (Math.random() < agent.traits.socialAffinity * 0.3) {
    const nearbyAgent = agent.sensorValues.proximity.find(p => p.type === 'agent');
    if (nearbyAgent) {
      return 'approach';
    }
  }
  
  // Resource-focused agents seek resources
  if (Math.random() < agent.traits.resourceAffinity * 0.3) {
    const nearbyResource = agent.sensorValues.proximity.find(p => p.type === 'resource');
    if (nearbyResource) {
      return 'approach';
    }
  }
  
  // Default: explore or idle
  return Math.random() < 0.7 ? 'explore' : 'idle';
}

/**
 * Perform the chosen action
 */
function performAction(
  agent: Agent,
  action: AgentAction,
  resources: Resource[],
  allAgents: Agent[],
  deltaTime: number
): void {
  agent.lastAction = action;
  
  switch (action) {
    case 'move':
      // Simple random movement
      agent.velocity = {
        x: (Math.random() * 2 - 1) * agent.movementSpeed,
        y: 0,
        z: (Math.random() * 2 - 1) * agent.movementSpeed
      };
      break;
      
    case 'explore':
      // More purposeful movement in a direction
      const angle = Math.random() * Math.PI * 2;
      agent.velocity = {
        x: Math.cos(angle) * agent.movementSpeed,
        y: 0,
        z: Math.sin(angle) * agent.movementSpeed
      };
      break;
      
    case 'approach':
      // Move toward the nearest entity of interest
      const nearest = agent.sensorValues.proximity.sort((a, b) => a.distance - b.distance)[0];
      if (nearest) {
        const direction = nearest.direction;
        const normalizedDir = normalizeVector(direction);
        agent.velocity = {
          x: normalizedDir.x * agent.movementSpeed,
          y: 0,
          z: normalizedDir.z * agent.movementSpeed
        };
      }
      break;
      
    case 'avoid':
      // Move away from the nearest entity
      const threat = agent.sensorValues.proximity.sort((a, b) => a.distance - b.distance)[0];
      if (threat) {
        const direction = threat.direction;
        const normalizedDir = normalizeVector(direction);
        agent.velocity = {
          x: -normalizedDir.x * agent.movementSpeed,
          y: 0,
          z: -normalizedDir.z * agent.movementSpeed
        };
      }
      break;
      
    case 'consume':
      // Consume nearby resources for energy
      const nearbyFood = agent.sensorValues.proximity.find(p => p.type === 'resource');
      if (nearbyFood) {
        const resourceIndex = resources.findIndex(r => r.id === nearbyFood.id);
        if (resourceIndex !== -1) {
          const resource = resources[resourceIndex];
          
          // Consume some of the resource
          const amountConsumed = Math.min(resource.amount, 10);
          resources[resourceIndex].amount -= amountConsumed;
          
          // Gain energy
          agent.energy = Math.min(100, agent.energy + amountConsumed * 5);
          
          // Add memory of consumption
          addMemory(agent, {
            timestamp: Date.now(),
            type: 'action',
            data: { action: 'consume', resourceType: resource.type, amount: amountConsumed },
            intensity: 0.7
          });
        }
      }
      break;
      
    case 'reproduce':
      // Reproduction is handled separately
      // Just mark the agent as ready
      break;
      
    case 'communicate':
      // Simple communication
      // In a more complex simulation, this would involve language evolution
      const nearbyAgent = agent.sensorValues.proximity.find(p => p.type === 'agent');
      if (nearbyAgent) {
        addMemory(agent, {
          timestamp: Date.now(),
          type: 'action',
          data: { action: 'communicate', targetId: nearbyAgent.id },
          intensity: 0.6
        });
      }
      break;
      
    case 'idle':
    default:
      // Do nothing
      agent.velocity = { x: 0, y: 0, z: 0 };
      break;
  }
  
  // Apply velocity to position
  agent.position.x += agent.velocity.x * deltaTime;
  agent.position.z += agent.velocity.z * deltaTime;
  
  // Ensure agent stays within world bounds (-50 to 50)
  agent.position.x = Math.max(-50, Math.min(50, agent.position.x));
  agent.position.z = Math.max(-50, Math.min(50, agent.position.z));
  
  // Update rotation based on movement direction
  if (agent.velocity.x !== 0 || agent.velocity.z !== 0) {
    agent.rotation.y = Math.atan2(agent.velocity.x, agent.velocity.z);
  }
}

/**
 * Handle agent reproduction
 */
export function reproduceAgents(
  agents: Agent[],
  currentTime: number
): { reproducedAgents: Agent[], offspringAgents: Agent[] } {
  const reproducedAgents: Agent[] = [];
  const offspringAgents: Agent[] = [];
  
  // Group potential reproduction partners
  const readyAgents = agents.filter(
    agent => 
      agent.consciousnessValue >= agent.reproductionThreshold && 
      agent.lastAction === 'reproduce' &&
      agent.age > agent.lastReproductionTime + agent.reproductionCooldown
  );
  
  // Find pairs of agents that are close to each other
  for (let i = 0; i < readyAgents.length; i++) {
    const agent1 = readyAgents[i];
    
    // Already reproduced in this cycle
    if (reproducedAgents.includes(agent1)) continue;
    
    for (let j = i + 1; j < readyAgents.length; j++) {
      const agent2 = readyAgents[j];
      
      // Already reproduced in this cycle
      if (reproducedAgents.includes(agent2)) continue;
      
      // Check if agents are close to each other
      const distance = calculateDistance(agent1.position, agent2.position);
      if (distance <= 2) {
        // Create offspring
        const offspring = createOffspring(agent1, agent2);
        
        // Update parent agents
        agent1.lastReproductionTime = currentTime;
        agent2.lastReproductionTime = currentTime;
        agent1.energy = Math.max(10, agent1.energy - 20);
        agent2.energy = Math.max(10, agent2.energy - 20);
        
        // Add memory of reproduction
        addMemory(agent1, {
          timestamp: currentTime,
          type: 'action',
          data: { action: 'reproduce', partnerId: agent2.id, offspringId: offspring.id },
          intensity: 0.9
        });
        
        addMemory(agent2, {
          timestamp: currentTime,
          type: 'action',
          data: { action: 'reproduce', partnerId: agent1.id, offspringId: offspring.id },
          intensity: 0.9
        });
        
        // Add to results
        reproducedAgents.push(agent1, agent2);
        offspringAgents.push(offspring);
        
        // Continue to next agent
        break;
      }
    }
  }
  
  // Return all agents that haven't reproduced, plus the reproduced ones and new offspring
  return {
    reproducedAgents: agents.map(agent => {
      const reproduced = reproducedAgents.find(a => a.id === agent.id);
      return reproduced || agent;
    }),
    offspringAgents
  };
}

/**
 * Create a new agent offspring from two parents
 */
function createOffspring(parent1: Agent, parent2: Agent): Agent {
  // Average position between parents
  const position = {
    x: (parent1.position.x + parent2.position.x) / 2,
    y: 0,
    z: (parent1.position.z + parent2.position.z) / 2
  };
  
  // Determine generation
  const generation = Math.max(parent1.generation, parent2.generation) + 1;
  
  // Average traits between parents
  const baseTrait = (trait1: number, trait2: number) => (trait1 + trait2) / 2;
  
  // Create base offspring
  const offspring: Agent = {
    id: uuidv4(),
    position,
    rotation: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    scale: 0.7, // Start smaller
    color: blendColors(parent1.color, parent2.color),
    energy: 50, // Start with half energy
    age: 0,
    lifespan: (parent1.lifespan + parent2.lifespan) / 2 * 1.1, // Slight increase in lifespan
    generation,
    perceptionRadius: (parent1.perceptionRadius + parent2.perceptionRadius) / 2,
    movementSpeed: (parent1.movementSpeed + parent2.movementSpeed) / 2,
    sensorValues: {
      visualInput: [],
      auditoryInput: [],
      tactileInput: [],
      proximity: [],
      resourceLevels: { light: 0, food: 0, water: 0 }
    },
    memory: [],
    reproductionThreshold: (parent1.reproductionThreshold + parent2.reproductionThreshold) / 2,
    mutationRate: (parent1.mutationRate + parent2.mutationRate) / 2,
    consciousnessValue: 0, // Will be calculated
    lastReproductionTime: 0,
    lastAction: 'idle',
    reproductionCooldown: (parent1.reproductionCooldown + parent2.reproductionCooldown) / 2,
    traits: {
      curiosity: baseTrait(parent1.traits.curiosity, parent2.traits.curiosity),
      socialAffinity: baseTrait(parent1.traits.socialAffinity, parent2.traits.socialAffinity),
      resourceAffinity: baseTrait(parent1.traits.resourceAffinity, parent2.traits.resourceAffinity),
      exploration: baseTrait(parent1.traits.exploration, parent2.traits.exploration),
      adaptability: baseTrait(parent1.traits.adaptability, parent2.traits.adaptability)
    }
  };
  
  // Apply mutations based on consciousness level and mutation rate
  const mutatedOffspring = mutateAgent(offspring);
  
  // Calculate initial consciousness value
  mutatedOffspring.consciousnessValue = calculateConsciousness(mutatedOffspring);
  
  // Give the offspring its first memory - being born
  addMemory(mutatedOffspring, {
    timestamp: Date.now(),
    type: 'observation',
    data: { event: 'birth', parent1Id: parent1.id, parent2Id: parent2.id },
    intensity: 1.0
  });
  
  return mutatedOffspring;
}

/**
 * Add a memory to an agent's memory store
 */
function addMemory(agent: Agent, memory: any): void {
  // Limit memory size
  if (agent.memory.length >= 50) {
    // Remove oldest or least intense memory
    agent.memory.sort((a, b) => {
      if (a.intensity === b.intensity) {
        return a.timestamp - b.timestamp;
      }
      return a.intensity - b.intensity;
    });
    agent.memory.shift();
  }
  
  agent.memory.push(memory);
}

// Utility functions

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: Vector3D, pos2: Vector3D): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  const dz = pos2.z - pos1.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate direction vector from pos1 to pos2
 */
export function calculateDirection(pos1: Vector3D, pos2: Vector3D): Vector3D {
  return {
    x: pos2.x - pos1.x,
    y: pos2.y - pos1.y,
    z: pos2.z - pos1.z
  };
}

/**
 * Normalize a vector
 */
export function normalizeVector(vector: Vector3D): Vector3D {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

/**
 * Blend two hex colors
 */
function blendColors(color1: string, color2: string): string {
  // Convert hex to RGB
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  
  // Calculate average with slight mutation
  const r = Math.floor((r1 + r2) / 2 + (Math.random() * 20 - 10));
  const g = Math.floor((g1 + g2) / 2 + (Math.random() * 20 - 10));
  const b = Math.floor((b1 + b2) / 2 + (Math.random() * 20 - 10));
  
  // Ensure values are in valid range
  const validR = Math.max(0, Math.min(255, r));
  const validG = Math.max(0, Math.min(255, g));
  const validB = Math.max(0, Math.min(255, b));
  
  // Convert back to hex
  return `#${validR.toString(16).padStart(2, '0')}${validG.toString(16).padStart(2, '0')}${validB.toString(16).padStart(2, '0')}`;
}
