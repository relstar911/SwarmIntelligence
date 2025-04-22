import React from 'react';
import { useSimulation } from '../lib/stores/useSimulation';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Metrics: React.FC = () => {
  const { world, elapsedYears, timeline } = useSimulation();
  const { statistics } = world;
  
  // Format years with appropriate precision
  const formatYears = (years: number) => {
    if (years < 1) {
      return `${Math.floor(years * 12)} months`;
    } else if (years < 10) {
      return `${years.toFixed(1)} years`;
    } else {
      return `${Math.floor(years)} years`;
    }
  };
  
  // Prepare consciousness distribution data for chart
  const consciousnessData = React.useMemo(() => {
    // Group agents by consciousness ranges (0-10, 10-20, etc.)
    const ranges = Array.from({ length: 10 }, (_, i) => i * 10);
    const distribution = ranges.map(range => ({
      range: `${range}-${range + 10}`,
      count: world.agents.filter(
        agent => agent.consciousnessValue >= range && agent.consciousnessValue < range + 10
      ).length
    }));
    
    return distribution;
  }, [world.agents]);
  
  // Recent timeline events
  const recentEvents = timeline
    .slice(-5)
    .reverse()
    .map(event => ({
      ...event,
      // Format timestamp based on elapsed years
      time: formatYears(event.timestamp / 365)
    }));
  
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-lg font-bold">Simulation Metrics</h2>
      
      {/* Time */}
      <div className="text-sm">
        <div>Simulation Time: {formatYears(elapsedYears)}</div>
        <div>Population: {statistics.populationSize}</div>
      </div>
      
      {/* Consciousness Stats */}
      <div className="border-t border-slate-700 pt-2">
        <h3 className="text-sm font-semibold mb-1">Consciousness</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Average: {statistics.averageConsciousness.toFixed(1)}</div>
          <div>Maximum: {statistics.maxConsciousness.toFixed(1)}</div>
        </div>
        
        {/* Consciousness Distribution Chart */}
        <div className="h-24 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={consciousnessData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 8 }} />
              <YAxis tick={{ fontSize: 8 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: 'none', 
                  fontSize: '10px',
                  color: 'white'
                }} 
              />
              <Bar dataKey="count" fill="#4c6ef5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Complexity Stats */}
      <div className="border-t border-slate-700 pt-2">
        <h3 className="text-sm font-semibold mb-1">Emergent Complexity</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Social: {(statistics.socialComplexity * 100).toFixed(0)}%</div>
          <div>Language: {(statistics.languageComplexity * 100).toFixed(0)}%</div>
          <div>Species: {statistics.speciesCount}</div>
          <div>Generations: {statistics.totalGenerations}</div>
        </div>
        
        {/* Complexity Growth Chart */}
        <div className="h-24 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                { name: 'Social', value: statistics.socialComplexity * 100 },
                { name: 'Language', value: statistics.languageComplexity * 100 },
                { name: 'Resource', value: statistics.resourceConsumption * 10 }
              ]}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 8 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: 'none', 
                  fontSize: '10px',
                  color: 'white'
                }} 
              />
              <Line type="monotone" dataKey="value" stroke="#4c6ef5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Timeline Events */}
      <div className="border-t border-slate-700 pt-2">
        <h3 className="text-sm font-semibold mb-1">Recent Events</h3>
        <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
          {recentEvents.length > 0 ? (
            recentEvents.map((event, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-400">{event.time}:</span>
                <span>{event.title}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-400">No events yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
