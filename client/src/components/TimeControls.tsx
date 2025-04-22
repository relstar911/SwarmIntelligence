import React from 'react';
import { useSimulation } from '../lib/stores/useSimulation';

const TimeControls: React.FC = () => {
  const { timeScale, setTimeScale } = useSimulation();
  
  const timeOptions = [
    { value: 0.1, label: '0.1x' },
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 5, label: '5x' },
    { value: 10, label: '10x' },
    { value: 50, label: '50x' },
    { value: 100, label: '100x' }
  ];
  
  return (
    <div className="bg-slate-800/90 text-white rounded shadow-lg p-2 backdrop-blur-sm">
      <div className="text-xs font-semibold mb-1">Time Scale</div>
      <div className="flex gap-1">
        {timeOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setTimeScale(option.value)}
            className={`px-2 py-1 rounded text-xs ${
              timeScale === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeControls;
