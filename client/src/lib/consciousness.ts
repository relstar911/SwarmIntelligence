import { Agent, ConsciousnessComponents } from './types';

/**
 * Calculate consciousness value based on the formula: B(S) = Φ(S) · σ(S) · δ(S)
 * 
 * Φ (Phi) - Information integration
 * σ (Sigma) - Self-modeling capability
 * δ (Delta) - Decision freedom/autonomy
 * 
 * @param agent The agent to calculate consciousness for
 * @returns A consciousness value between 0 and 100
 */
export function calculateConsciousness(agent: Agent): number {
  const components = calculateConsciousnessComponents(agent);
  
  // Apply the consciousness formula: B(S) = Φ(S) · σ(S) · δ(S)
  const rawConsciousness = components.integration * components.selfModeling * components.decisionFreedom;
  
  // Scale to a 0-100 range for easier understanding
  return Math.min(100, rawConsciousness * 100);
}

/**
 * Calculate the individual components of consciousness
 */
export function calculateConsciousnessComponents(agent: Agent): ConsciousnessComponents {
  // Calculate Φ (Phi) - Information integration
  // This represents how well the agent integrates information from different sources
  const informationIntegration = calculateInformationIntegration(agent);
  
  // Calculate σ (Sigma) - Self-modeling capability
  // This represents how well the agent models itself and its place in the world
  const selfModeling = calculateSelfModeling(agent);
  
  // Calculate δ (Delta) - Decision freedom/autonomy
  // This represents the agent's freedom in making decisions
  const decisionFreedom = calculateDecisionFreedom(agent);
  
  return {
    integration: informationIntegration,
    selfModeling: selfModeling,
    decisionFreedom: decisionFreedom
  };
}

/**
 * Calculate information integration (Φ) component
 * Measures how effectively the agent processes and combines information
 */
function calculateInformationIntegration(agent: Agent): number {
  // Base integration value from agent traits
  const traitFactor = (
    agent.traits.curiosity * 0.3 + 
    agent.traits.adaptability * 0.4 + 
    agent.traits.exploration * 0.3
  );
  
  // Perceptual integration - how many different inputs the agent is processing
  const perceptualInputs = [
    agent.sensorValues.visualInput.length,
    agent.sensorValues.auditoryInput.length,
    agent.sensorValues.tactileInput.length,
    agent.sensorValues.proximity.length
  ].filter(v => v > 0).length;
  
  const perceptionFactor = Math.min(1, perceptualInputs / 4);
  
  // Memory integration - how effectively the agent uses memory
  const memoryFactor = Math.min(1, agent.memory.length / 20);
  
  // Resource awareness
  const resourceAwareness = (
    agent.sensorValues.resourceLevels.food +
    agent.sensorValues.resourceLevels.water +
    agent.sensorValues.resourceLevels.light
  ) / 3;
  
  // Combine factors with appropriate weights
  return (
    traitFactor * 0.4 +
    perceptionFactor * 0.3 +
    memoryFactor * 0.2 +
    resourceAwareness * 0.1
  );
}

/**
 * Calculate self-modeling (σ) component
 * Measures how well the agent understands itself and its place in the world
 */
function calculateSelfModeling(agent: Agent): number {
  // Self-awareness through memory
  // More memories about one's own actions indicate higher self-awareness
  const selfActionMemories = agent.memory.filter(m => 
    m.type === 'action' || m.type === 'feedback'
  ).length;
  const memoryFactor = Math.min(1, selfActionMemories / 15);
  
  // Learning from past actions
  // Calculate how much the agent's actions vary based on context
  const actionVarietyFactor = agent.memory.length > 0 ? 
    new Set(agent.memory.map(m => m.type)).size / 4 : 0;
  
  // Generation factor - agents of higher generations have more "inherited knowledge"
  const generationFactor = Math.min(1, agent.generation / 10);
  
  // Age factor - older agents have more experience
  const ageFactor = Math.min(1, agent.age / agent.lifespan);
  
  // Combine factors with appropriate weights
  return (
    memoryFactor * 0.3 +
    actionVarietyFactor * 0.3 +
    generationFactor * 0.2 +
    ageFactor * 0.2
  );
}

/**
 * Calculate decision freedom (δ) component
 * Measures the agent's autonomy and freedom in decision making
 */
function calculateDecisionFreedom(agent: Agent): number {
  // Energy availability affects freedom of choice
  const energyFactor = Math.min(1, agent.energy / 100);
  
  // Available actions variety
  // More potential actions = more freedom
  const actionVariety = 0.7; // Assuming a constant base action variety
  
  // Environmental constraint
  // How much the environment limits choices (e.g., resource scarcity)
  const environmentalFreedom = (
    agent.sensorValues.resourceLevels.food +
    agent.sensorValues.resourceLevels.water +
    agent.sensorValues.resourceLevels.light
  ) / 3;
  
  // Social constraint
  // More agents nearby = potentially less freedom
  const proximityCount = agent.sensorValues.proximity.filter(p => p.type === 'agent').length;
  const socialFreedom = Math.max(0, 1 - (proximityCount / 10));
  
  // Combine factors with appropriate weights
  return (
    energyFactor * 0.3 +
    actionVariety * 0.3 +
    environmentalFreedom * 0.2 +
    socialFreedom * 0.2
  );
}

/**
 * Check if an agent's consciousness exceeds the reproduction threshold
 */
export function checkConsciousnessThreshold(agent: Agent): boolean {
  return agent.consciousnessValue >= agent.reproductionThreshold;
}
