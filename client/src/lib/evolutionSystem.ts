import { Agent, MutationParameters } from './types';

/**
 * Apply mutations to an agent based on its mutation rate
 */
export function mutateAgent(agent: Agent): Agent {
  const mutationRate = agent.mutationRate;
  
  // Helper to apply mutation based on probability
  const applyMutation = (value: number, factor: number = 0.2): number => {
    if (Math.random() < mutationRate) {
      // Apply random mutation within factor range
      return Math.max(0, Math.min(1, value + (Math.random() * factor * 2 - factor)));
    }
    return value;
  };
  
  // Create mutation parameters
  const mutations: MutationParameters = {
    sensorCapability: applyMutation(agent.perceptionRadius / 10) * 10,
    movementCapability: applyMutation(agent.movementSpeed / 0.05) * 0.05,
    memoryCapacity: 50, // Fixed for now
    learningRate: applyMutation(0.5), // Base learning rate
    communicationAbility: applyMutation(0.5), // Base communication ability
    resourceEfficiency: applyMutation(0.5), // How efficiently resources are used
    lifespanFactor: applyMutation(1.0, 0.1) // Slight mutations in lifespan
  };
  
  // Apply all mutations to create a new agent
  return {
    ...agent,
    perceptionRadius: mutations.sensorCapability,
    movementSpeed: mutations.movementCapability,
    lifespan: agent.lifespan * mutations.lifespanFactor,
    mutationRate: applyMutation(agent.mutationRate, 0.05), // Mutation rate itself can mutate slightly
    
    // Trait mutations
    traits: {
      curiosity: applyMutation(agent.traits.curiosity),
      socialAffinity: applyMutation(agent.traits.socialAffinity),
      resourceAffinity: applyMutation(agent.traits.resourceAffinity),
      exploration: applyMutation(agent.traits.exploration),
      adaptability: applyMutation(agent.traits.adaptability)
    },
    
    // Color mutation (slight variation)
    color: mutateColor(agent.color, mutationRate)
  };
}

/**
 * Mutate a color slightly based on mutation rate
 */
function mutateColor(color: string, mutationRate: number): string {
  if (Math.random() > mutationRate * 2) {
    return color; // No mutation
  }
  
  // Convert hex to RGB
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);
  
  // Calculate mutation factor (smaller for colors to avoid drastic changes)
  const factor = mutationRate * 50;
  
  // Apply random mutation within factor range
  const rNew = Math.max(0, Math.min(255, r + (Math.random() * factor * 2 - factor)));
  const gNew = Math.max(0, Math.min(255, g + (Math.random() * factor * 2 - factor)));
  const bNew = Math.max(0, Math.min(255, b + (Math.random() * factor * 2 - factor)));
  
  // Convert back to hex
  return `#${Math.round(rNew).toString(16).padStart(2, '0')}${Math.round(gNew).toString(16).padStart(2, '0')}${Math.round(bNew).toString(16).padStart(2, '0')}`;
}

/**
 * Determine if an agent is a new species based on trait differences
 */
export function isNewSpecies(agent: Agent, existingAgents: Agent[]): boolean {
  // Simple species differentiation based on trait distance
  // In a more complex simulation, this would involve genetic distance
  
  const traitSimilarityThreshold = 0.3; // Threshold for considering traits similar
  
  for (const existingAgent of existingAgents) {
    // Skip self-comparison
    if (agent.id === existingAgent.id) {
      continue;
    }
    
    // Calculate trait distance
    const traitDistance = calculateTraitDistance(agent.traits, existingAgent.traits);
    
    // If traits are similar enough, they're the same species
    if (traitDistance < traitSimilarityThreshold) {
      return false;
    }
  }
  
  // If no similar agent found, it's a new species
  return true;
}

/**
 * Calculate distance between two sets of traits
 */
function calculateTraitDistance(traits1: any, traits2: any): number {
  let sum = 0;
  let count = 0;
  
  // Iterate through all traits
  for (const key in traits1) {
    if (traits2.hasOwnProperty(key)) {
      const diff = Math.abs(traits1[key] - traits2[key]);
      sum += diff;
      count++;
    }
  }
  
  // Return average difference
  return count > 0 ? sum / count : 1;
}
