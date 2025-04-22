import React, { useState, useEffect, useMemo } from 'react';
import { useSimulation } from '../lib/stores/useSimulation';
import StableAgent from './StableAgent';

/**
 * A container that maintains a stable list of agents without re-rendering
 * constantly when agent data changes. This is crucial for preventing
 * flickering and position swapping.
 */
const StableAgentsContainer: React.FC = () => {
  const { world } = useSimulation();
  
  // Keep track of agent IDs we've seen
  const [knownAgents, setKnownAgents] = useState<Record<string, any>>({});
  
  // Initial setup for agents - only adds new agents, never removes them
  useEffect(() => {
    const currentAgentIds = new Set(world.agents.map(agent => agent.id));
    const knownAgentIds = new Set(Object.keys(knownAgents));
    
    // Check if there are new agents to add
    const hasNewAgents = world.agents.some(agent => !knownAgentIds.has(agent.id));
    
    if (hasNewAgents) {
      const updatedAgents = { ...knownAgents };
      
      // Add any new agents
      world.agents.forEach(agent => {
        if (!knownAgentIds.has(agent.id)) {
          updatedAgents[agent.id] = agent;
        }
      });
      
      setKnownAgents(updatedAgents);
    }
  }, [world.agents]);
  
  // Memoize the stable list of agent keys to prevent re-rendering
  const agentKeys = useMemo(() => Object.keys(knownAgents), [knownAgents]);
  
  return (
    <>
      {agentKeys.map(agentId => (
        <StableAgent 
          key={agentId} 
          agentId={agentId} 
          initialData={knownAgents[agentId]} 
        />
      ))}
    </>
  );
};

export default StableAgentsContainer;