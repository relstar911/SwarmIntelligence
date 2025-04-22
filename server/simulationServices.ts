import { eq } from 'drizzle-orm';
import { db } from './db';
import { agents, simulations, resources, agentMemories, timelineEvents } from '../shared/schema';
import { Agent, Resource, TimelineEvent, WorldState } from '../client/src/lib/types';

// Create new simulation
export async function createSimulation(name: string, initialState: WorldState) {
  // Simulation settings
  const [simulation] = await db.insert(simulations).values({
    name,
    time_elapsed: initialState.timeElapsed,
    day_night_cycle: initialState.dayNightCycle,
    settings: {
      timeScale: initialState.timeScale,
      environmentalParameters: initialState.environmentalParameters
    }
  }).returning();

  // Initial agents (Adam and Eve)
  for (const agent of initialState.agents) {
    await createAgent(simulation.id, agent);
  }

  // Initial resources
  for (const resource of initialState.resources) {
    await createResource(simulation.id, resource);
  }

  return simulation;
}

// Get active simulation
export async function getActiveSimulation() {
  const simulation = await db.query.simulations.findFirst({
    where: eq(simulations.active, true),
    with: {
      agents: true,
      resources: true,
      timelineEvents: true
    }
  });
  
  return simulation;
}

// Save simulation state
export async function saveSimulationState(simulationId: number, state: WorldState) {
  // Update simulation
  await db.update(simulations)
    .set({
      time_elapsed: state.timeElapsed,
      day_night_cycle: state.dayNightCycle,
      last_updated: new Date(),
      settings: {
        timeScale: state.timeScale,
        environmentalParameters: state.environmentalParameters
      }
    })
    .where(eq(simulations.id, simulationId));

  // Update agents
  for (const agent of state.agents) {
    await updateAgent(simulationId, agent);
  }

  // Update resources
  for (const resource of state.resources) {
    await updateResource(simulationId, resource);
  }
}

// Create an agent
export async function createAgent(simulationId: number, agent: Agent) {
  await db.insert(agents).values({
    id: agent.id,
    simulation_id: simulationId,
    position_x: agent.position.x,
    position_y: agent.position.y,
    position_z: agent.position.z,
    rotation_y: agent.rotation.y,
    scale: agent.scale,
    color: agent.color,
    energy: agent.energy,
    age: agent.age,
    lifespan: agent.lifespan,
    generation: agent.generation,
    consciousness_value: agent.consciousnessValue,
    last_reproduction_time: agent.lastReproductionTime,
    last_action: agent.lastAction,
    reproduction_cooldown: agent.reproductionCooldown,
    perception_radius: agent.perceptionRadius,
    movement_speed: agent.movementSpeed,
    mutation_rate: agent.mutationRate,
    traits: agent.traits
  });

  // Create initial memories
  for (const memory of agent.memory) {
    await db.insert(agentMemories).values({
      agent_id: agent.id,
      timestamp: memory.timestamp,
      memory_type: memory.type,
      data: memory.data,
      intensity: memory.intensity
    });
  }
}

// Update an agent
export async function updateAgent(simulationId: number, agent: Agent) {
  const existingAgent = await db.query.agents.findFirst({
    where: eq(agents.id, agent.id)
  });

  if (existingAgent) {
    // Update existing agent
    await db.update(agents)
      .set({
        position_x: agent.position.x,
        position_y: agent.position.y,
        position_z: agent.position.z,
        rotation_y: agent.rotation.y,
        scale: agent.scale,
        color: agent.color,
        energy: agent.energy,
        age: agent.age,
        lifespan: agent.lifespan,
        consciousness_value: agent.consciousnessValue,
        last_reproduction_time: agent.lastReproductionTime,
        last_action: agent.lastAction,
        reproduction_cooldown: agent.reproductionCooldown,
        updated_at: new Date()
      })
      .where(eq(agents.id, agent.id));
  } else {
    // Create new agent
    await createAgent(simulationId, agent);
  }
}

// Create a resource
export async function createResource(simulationId: number, resource: Resource) {
  await db.insert(resources).values({
    simulation_id: simulationId,
    resource_id: resource.id,
    type: resource.type,
    position_x: resource.position.x,
    position_y: resource.position.y,
    position_z: resource.position.z,
    amount: resource.amount,
    regeneration_rate: resource.regenerationRate,
    last_regeneration: resource.lastRegeneration
  });
}

// Update a resource
export async function updateResource(simulationId: number, resource: Resource) {
  const existingResource = await db.query.resources.findFirst({
    where: eq(resources.resource_id, resource.id)
  });

  if (existingResource) {
    // Update existing resource
    await db.update(resources)
      .set({
        amount: resource.amount,
        position_x: resource.position.x,
        position_y: resource.position.y,
        position_z: resource.position.z,
        last_regeneration: resource.lastRegeneration
      })
      .where(eq(resources.resource_id, resource.id));
  } else {
    // Create new resource
    await createResource(simulationId, resource);
  }
}

// Add a memory to an agent
export async function addAgentMemory(agentId: string, memory: any) {
  await db.insert(agentMemories).values({
    agent_id: agentId,
    timestamp: memory.timestamp,
    memory_type: memory.type,
    data: memory.data,
    intensity: memory.intensity
  });
}

// Get an agent's memories
export async function getAgentMemories(agentId: string) {
  return await db.query.agentMemories.findMany({
    where: eq(agentMemories.agent_id, agentId),
    orderBy: (agentMemories, { desc }) => [desc(agentMemories.timestamp)]
  });
}

// Add a timeline event
export async function addTimelineEvent(simulationId: number, event: TimelineEvent) {
  await db.insert(timelineEvents).values({
    simulation_id: simulationId,
    timestamp: event.timestamp,
    title: event.title,
    description: event.description,
    event_type: event.type,
    significance: event.significance
  });
}

// Get timeline events
export async function getTimelineEvents(simulationId: number) {
  return await db.query.timelineEvents.findMany({
    where: eq(timelineEvents.simulation_id, simulationId),
    orderBy: (timelineEvents, { asc }) => [asc(timelineEvents.timestamp)]
  });
}