import { v4 as uuidv4 } from 'uuid';
import { WorldState, Resource, Cell, EnvironmentalParameters } from './types';
import { createInitialAgents } from './agentBehavior';

/**
 * Initialize the world state
 */
export function initializeWorld(): WorldState {
  // Create a grid of cells
  const gridSize = 10; // 10x10 grid
  const cellGrid: Cell[][] = [];
  
  for (let x = 0; x < gridSize; x++) {
    cellGrid[x] = [];
    for (let z = 0; z < gridSize; z++) {
      // Calculate world position
      const worldX = (x * 10) - 45; // Center the grid
      const worldZ = (z * 10) - 45;
      
      // Create cell with randomized resources
      cellGrid[x][z] = {
        position: { x: worldX, y: 0, z: worldZ },
        resources: {
          food: Math.random() * 0.7 + 0.3, // 0.3-1.0
          water: Math.random() * 0.7 + 0.3,
          light: Math.random() * 0.7 + 0.3
        },
        occupied: false,
        temperature: 0.5, // Neutral temperature
        elevation: Math.random(),
        occupants: []
      };
    }
  }
  
  // Create initial resources
  const resources: Resource[] = generateInitialResources();
  
  // Create initial agents
  const agents = createInitialAgents();
  
  // Calculate resource distribution for the agents' cells
  placeResourcesInCells(resources, cellGrid);
  
  return {
    time: 0,
    timeScale: 1,
    resources,
    agents,
    environmentalParameters: {
      temperature: 0.5, // Neutral temperature
      lightLevel: 0.7, // Daylight
      resourceAbundance: 0.8, // Plentiful resources
      resourceDistribution: 0.5, // Medium clustering
      foodGrowthRate: 0.005, // Food regrows slowly
      waterAvailability: 0.7, // Good water availability
      weatherCondition: 'clear',
      catastropheChance: 0.001 // Very rare catastrophes
    },
    events: [],
    statistics: {
      populationSize: agents.length,
      averageConsciousness: 0,
      maxConsciousness: 0,
      averageLifespan: 0,
      totalGenerations: 1,
      languageComplexity: 0,
      socialComplexity: 0,
      resourceConsumption: 0,
      speciesCount: 1
    },
    cellGrid,
    timeElapsed: 0,
    dayNightCycle: 0
  };
}

/**
 * Generate initial resources in the world
 */
function generateInitialResources(): Resource[] {
  const resources: Resource[] = [];
  
  // Food resources (25)
  for (let i = 0; i < 25; i++) {
    resources.push({
      id: uuidv4(),
      type: 'food',
      position: {
        x: Math.random() * 100 - 50, // -50 to 50
        y: 0,
        z: Math.random() * 100 - 50
      },
      amount: Math.random() * 50 + 50, // 50-100 units
      regenerationRate: 0.01,
      lastRegeneration: 0
    });
  }
  
  // Water resources (15)
  for (let i = 0; i < 15; i++) {
    resources.push({
      id: uuidv4(),
      type: 'water',
      position: {
        x: Math.random() * 100 - 50,
        y: 0,
        z: Math.random() * 100 - 50
      },
      amount: Math.random() * 80 + 70, // 70-150 units
      regenerationRate: 0.02,
      lastRegeneration: 0
    });
  }
  
  // Light resources (10) - represent sunlight areas
  for (let i = 0; i < 10; i++) {
    resources.push({
      id: uuidv4(),
      type: 'light',
      position: {
        x: Math.random() * 100 - 50,
        y: 10, // Above the ground
        z: Math.random() * 100 - 50
      },
      amount: 100, // Constant light
      regenerationRate: 0,
      lastRegeneration: 0
    });
  }
  
  return resources;
}

/**
 * Place resources in cells for resource level calculation
 */
function placeResourcesInCells(resources: Resource[], cellGrid: Cell[][]): void {
  // Reset cell resource values
  for (let x = 0; x < cellGrid.length; x++) {
    for (let z = 0; z < cellGrid[x].length; z++) {
      cellGrid[x][z].resources = {
        food: 0.1, // Base resource levels
        water: 0.1,
        light: 0.5
      };
    }
  }
  
  // Add resource influence to cells
  resources.forEach(resource => {
    // Calculate grid coordinates from world position
    const gridX = Math.floor((resource.position.x + 50) / 10);
    const gridZ = Math.floor((resource.position.z + 50) / 10);
    
    // Resource influence radius (in grid cells)
    const influenceRadius = 2;
    
    // Add resource influence to nearby cells
    for (let x = Math.max(0, gridX - influenceRadius); x <= Math.min(cellGrid.length - 1, gridX + influenceRadius); x++) {
      for (let z = Math.max(0, gridZ - influenceRadius); z <= Math.min(cellGrid[0].length - 1, gridZ + influenceRadius); z++) {
        // Calculate distance (in grid cells)
        const distance = Math.sqrt(Math.pow(x - gridX, 2) + Math.pow(z - gridZ, 2));
        
        // Skip if outside influence radius
        if (distance > influenceRadius) continue;
        
        // Calculate influence based on distance and resource amount
        const influence = (1 - distance / influenceRadius) * (resource.amount / 100);
        
        // Add influence to cell
        if (resource.type === 'food') {
          cellGrid[x][z].resources.food += influence;
        } else if (resource.type === 'water') {
          cellGrid[x][z].resources.water += influence;
        } else if (resource.type === 'light') {
          cellGrid[x][z].resources.light += influence;
        }
        
        // Cap at 1.0
        cellGrid[x][z].resources.food = Math.min(1, cellGrid[x][z].resources.food);
        cellGrid[x][z].resources.water = Math.min(1, cellGrid[x][z].resources.water);
        cellGrid[x][z].resources.light = Math.min(1, cellGrid[x][z].resources.light);
      }
    }
  });
}

/**
 * Update resource levels based on time passage and environmental parameters
 */
export function updateResourceLevels(
  resources: Resource[],
  deltaTime: number
): Resource[] {
  return resources.map(resource => {
    // Skip light resources
    if (resource.type === 'light') return resource;
    
    // Time since last regeneration
    const timeSinceRegen = deltaTime;
    
    // Calculate regeneration amount
    const regenAmount = resource.regenerationRate * timeSinceRegen;
    
    // Apply regeneration
    return {
      ...resource,
      amount: Math.min(100, resource.amount + regenAmount),
      lastRegeneration: resource.lastRegeneration + deltaTime
    };
  });
}

/**
 * Calculate the resource distribution across cells
 */
export function calculateResourceDistribution(
  cellGrid: Cell[][],
  environmentalParameters: EnvironmentalParameters
): Cell[][] {
  const { resourceAbundance, resourceDistribution, weatherCondition } = environmentalParameters;
  
  // Create a deep copy of the grid
  const updatedGrid = JSON.parse(JSON.stringify(cellGrid));
  
  // Weather impact on resources
  let weatherImpact = {
    food: 1,
    water: 1,
    light: 1
  };
  
  switch (weatherCondition) {
    case 'rain':
      weatherImpact.water = 1.5;
      weatherImpact.light = 0.7;
      break;
    case 'storm':
      weatherImpact.water = 2.0;
      weatherImpact.light = 0.3;
      weatherImpact.food = 0.8;
      break;
    case 'drought':
      weatherImpact.water = 0.3;
      weatherImpact.light = 1.2;
      weatherImpact.food = 0.6;
      break;
    default: // clear
      break;
  }
  
  // Apply weather and environmental parameters to all cells
  for (let x = 0; x < updatedGrid.length; x++) {
    for (let z = 0; z < updatedGrid[x].length; z++) {
      // Base resources affected by abundance
      const baseFood = updatedGrid[x][z].resources.food * resourceAbundance;
      const baseWater = updatedGrid[x][z].resources.water * resourceAbundance;
      const baseLight = updatedGrid[x][z].resources.light;
      
      // Apply weather impact
      updatedGrid[x][z].resources.food = Math.min(1, baseFood * weatherImpact.food);
      updatedGrid[x][z].resources.water = Math.min(1, baseWater * weatherImpact.water);
      updatedGrid[x][z].resources.light = Math.min(1, baseLight * weatherImpact.light);
      
      // Apply distribution factor (clumping vs. evenness)
      if (resourceDistribution > 0.5) {
        // More clumped resources
        const amplifyFactor = 1 + (resourceDistribution - 0.5) * 2;
        updatedGrid[x][z].resources.food = Math.pow(updatedGrid[x][z].resources.food, amplifyFactor);
        updatedGrid[x][z].resources.water = Math.pow(updatedGrid[x][z].resources.water, amplifyFactor);
      } else {
        // More evenly distributed resources
        const evenFactor = 1 - resourceDistribution;
        
        // Pull values toward middle (0.5)
        updatedGrid[x][z].resources.food = updatedGrid[x][z].resources.food * (1 - evenFactor) + 0.5 * evenFactor;
        updatedGrid[x][z].resources.water = updatedGrid[x][z].resources.water * (1 - evenFactor) + 0.5 * evenFactor;
      }
    }
  }
  
  return updatedGrid;
}
