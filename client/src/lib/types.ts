// Agent types
export interface Agent {
  id: string;
  position: Vector3D;
  rotation: Vector3D;
  velocity: Vector3D;
  scale: number;
  color: string;
  energy: number;
  age: number;
  lifespan: number;
  generation: number;
  perceptionRadius: number;
  movementSpeed: number;
  sensorValues: SensorValues;
  memory: Memory[];
  reproductionThreshold: number;
  mutationRate: number;
  consciousnessValue: number;
  lastReproductionTime: number;
  lastAction: AgentAction;
  reproductionCooldown: number;
  traits: AgentTraits;
}

export interface AgentTraits {
  curiosity: number;
  socialAffinity: number;
  resourceAffinity: number;
  exploration: number;
  adaptability: number;
}

export interface SensorValues {
  visualInput: any[];
  auditoryInput: any[];
  tactileInput: any[];
  proximity: ProximityData[];
  resourceLevels: {
    light: number;
    food: number;
    water: number;
  };
}

export interface ProximityData {
  type: 'agent' | 'resource' | 'obstacle';
  distance: number;
  direction: Vector3D;
  id: string;
}

export interface Memory {
  timestamp: number;
  type: 'encounter' | 'action' | 'feedback' | 'observation';
  data: any;
  intensity: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type AgentAction = 
  | 'move'
  | 'explore'
  | 'approach'
  | 'avoid'
  | 'consume'
  | 'reproduce'
  | 'communicate'
  | 'idle';

// Environment types
export interface WorldState {
  time: number;
  timeScale: number;
  resources: Resource[];
  agents: Agent[];
  environmentalParameters: EnvironmentalParameters;
  events: WorldEvent[];
  statistics: SimulationStatistics;
  cellGrid: Cell[][];
  timeElapsed: number;
  dayNightCycle: number;
}

export interface Cell {
  position: Vector3D;
  resources: {
    food: number;
    water: number;
    light: number;
  };
  occupied: boolean;
  temperature: number;
  elevation: number;
  occupants: string[]; // Agent IDs
}

export interface Resource {
  id: string;
  type: 'food' | 'water' | 'light';
  position: Vector3D;
  amount: number;
  regenerationRate: number;
  lastRegeneration: number;
}

export interface EnvironmentalParameters {
  temperature: number;
  lightLevel: number;
  resourceAbundance: number;
  resourceDistribution: number;
  foodGrowthRate: number;
  waterAvailability: number;
  weatherCondition: 'clear' | 'rain' | 'storm' | 'drought';
  catastropheChance: number;
}

export interface WorldEvent {
  id: string;
  type: string;
  timestamp: number;
  duration: number;
  affectedAgents: string[];
  description: string;
}

export interface SimulationStatistics {
  populationSize: number;
  averageConsciousness: number;
  maxConsciousness: number;
  averageLifespan: number;
  totalGenerations: number;
  languageComplexity: number;
  socialComplexity: number;
  resourceConsumption: number;
  speciesCount: number;
}

// Controls
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  up = 'up',
  down = 'down',
  toggleMenu = 'toggleMenu',
  interact = 'interact',
}

// Consciousness components
export interface ConsciousnessComponents {
  integration: number;       // Φ - Information integration
  selfModeling: number;      // σ - Self-modeling capability
  decisionFreedom: number;   // δ - Decision freedom/autonomy
}

// Agent mutation parameters
export interface MutationParameters {
  sensorCapability: number;
  movementCapability: number;
  memoryCapacity: number;
  learningRate: number;
  communicationAbility: number;
  resourceEfficiency: number;
  lifespanFactor: number;
}

// Timeline Events
export interface TimelineEvent {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  type: 'language' | 'social' | 'technological' | 'extinction' | 'population' | 'mutation';
  significance: number;
}
