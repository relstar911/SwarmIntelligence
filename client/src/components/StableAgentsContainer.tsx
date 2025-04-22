import React, { useRef, useMemo } from 'react';
import { useSimulation } from '../lib/stores/useSimulation';
import StableAgent from './StableAgent';

/**
 * A completely stabilized agent container that is optimized to never re-render
 * This uses a fixed approach with pre-determined IDs for Adam and Eve
 */
const StableAgentsContainer: React.FC = () => {
  // Use a ref to avoid any re-renders
  const agentMapRef = useRef<Record<string, any>>({});
  const initializedRef = useRef<boolean>(false);
  
  // Get the world state
  const { world } = useSimulation();
  
  // Only initialize once and keep a stable reference
  if (!initializedRef.current) {
    console.log("Initializing StableAgentsContainer with fixed agents");
    
    // Always create entries for Adam and Eve first
    const adam = world.agents.find(a => a.id === 'adam');
    const eve = world.agents.find(a => a.id === 'eve');
    
    if (adam) agentMapRef.current['adam'] = adam;
    if (eve) agentMapRef.current['eve'] = eve;
    
    // Add any other initial agents
    world.agents.forEach(agent => {
      if (agent.id !== 'adam' && agent.id !== 'eve') {
        agentMapRef.current[agent.id] = agent;
      }
    });
    
    initializedRef.current = true;
  }
  
  // Create a static, permanent list of agent components
  const staticAgents = useMemo(() => {
    return Object.entries(agentMapRef.current).map(([id, data]) => (
      <StableAgent 
        key={id}
        agentId={id}
        initialData={data}
      />
    ));
  }, []);
  
  return (
    <>
      {/* Static predefined agents that never re-render */}
      {staticAgents}
      
      {/* Special case: any completely new agents (rare event) */}
      {world.agents
        .filter(a => !agentMapRef.current[a.id])
        .map(agent => {
          // Add to our map for next time
          agentMapRef.current[agent.id] = agent;
          
          return (
            <StableAgent 
              key={agent.id}
              agentId={agent.id}
              initialData={agent}
            />
          );
        })
      }
    </>
  );
};

// Use React.memo to ensure this component only renders once
export default React.memo(StableAgentsContainer);