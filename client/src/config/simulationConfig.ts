/**
 * Configuration parameters for the Genesis simulation
 */
export const simulationConfig = {
  // World parameters
  world: {
    size: 100, // The world extends from -50 to +50 in x and z
    gridSize: 10, // Number of cells in each dimension
    initialResources: {
      food: 25,
      water: 15,
      light: 10
    },
    maxAgents: 100 // Maximum number of agents to prevent performance issues
  },
  
  // Time parameters
  time: {
    dayLength: 1, // In simulation time units
    yearLength: 365, // Days per year
    maxTimeScale: 100, // Maximum time acceleration
    minTimeScale: 0.1 // Minimum time slow-motion
  },
  
  // Agent parameters
  agents: {
    initialCount: 2, // Adam and Eve
    initialTraits: {
      adam: {
        curiosity: 0.7,
        socialAffinity: 0.6,
        resourceAffinity: 0.5,
        exploration: 0.8,
        adaptability: 0.6
      },
      eve: {
        curiosity: 0.6,
        socialAffinity: 0.8,
        resourceAffinity: 0.7,
        exploration: 0.5,
        adaptability: 0.7
      }
    },
    reproductionSettings: {
      defaultThreshold: 70, // Default consciousness threshold for reproduction
      cooldown: 100, // Time between reproductions
      energyCost: 20 // Energy cost of reproduction
    },
    consciciousnessCalculation: {
      integrationWeight: 0.4,
      selfModelingWeight: 0.3,
      decisionFreedomWeight: 0.3
    }
  },
  
  // Environmental parameters
  environment: {
    defaultParameters: {
      temperature: 0.5, // Neutral temperature
      lightLevel: 0.7, // Daylight
      resourceAbundance: 0.8, // Plentiful resources
      resourceDistribution: 0.5, // Medium clustering
      foodGrowthRate: 0.005, // Food regrows slowly
      waterAvailability: 0.7, // Good water availability
      weatherCondition: 'clear' as 'clear' | 'rain' | 'storm' | 'drought',
      catastropheChance: 0.001 // Very rare catastrophes
    },
    weatherImpacts: {
      clear: {
        food: 1.0,
        water: 1.0,
        light: 1.0
      },
      rain: {
        food: 1.2,
        water: 1.5,
        light: 0.7
      },
      storm: {
        food: 0.8,
        water: 2.0,
        light: 0.3
      },
      drought: {
        food: 0.6,
        water: 0.3,
        light: 1.2
      }
    }
  },
  
  // Visualization settings
  visualization: {
    defaultCameraPosition: [0, 8, 12],
    agentScaleFactor: 1,
    resourceScaleFactor: 1.5,
    gridVisibilityDefault: false
  }
};
