import React, { useState } from 'react';
import { useSimulation } from '../lib/stores/useSimulation';
import { useAudio } from '../lib/stores/useAudio';

const SimulationControls: React.FC = () => {
  const { 
    world, 
    running,
    toggleRunning,
    resetSimulation,
    setEnvironmentalParameter,
    setWeatherCondition,
    triggerCatastrophe
  } = useSimulation();
  
  const { toggleMute, isMuted } = useAudio();
  
  const [catastropheType, setCatastropheType] = useState('earthquake');
  const [catastropheIntensity, setCatastropheIntensity] = useState(0.5);
  
  const handleCatastrophe = () => {
    triggerCatastrophe(catastropheType, catastropheIntensity);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Simulation Controls</h2>
        <div className="flex gap-2">
          <button 
            onClick={toggleRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            {running ? "Pause" : "Start"}
          </button>
          <button 
            onClick={resetSimulation}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Sound toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm">Sound:</span>
        <button 
          onClick={toggleMute}
          className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
      </div>
      
      {/* Environmental Parameters */}
      <div className="border-t border-slate-700 pt-2">
        <h3 className="text-sm font-semibold mb-2">Environmental Parameters</h3>
        
        <div className="space-y-2">
          {/* Temperature */}
          <div className="flex flex-col">
            <div className="flex justify-between text-xs">
              <label htmlFor="temperature">Temperature</label>
              <span>{world.environmentalParameters.temperature.toFixed(1)}</span>
            </div>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={world.environmentalParameters.temperature}
              onChange={(e) => setEnvironmentalParameter('temperature', parseFloat(e.target.value))}
              className="simulation-slider"
            />
          </div>
          
          {/* Light Level */}
          <div className="flex flex-col">
            <div className="flex justify-between text-xs">
              <label htmlFor="lightLevel">Light Level</label>
              <span>{world.environmentalParameters.lightLevel.toFixed(1)}</span>
            </div>
            <input
              id="lightLevel"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={world.environmentalParameters.lightLevel}
              onChange={(e) => setEnvironmentalParameter('lightLevel', parseFloat(e.target.value))}
              className="simulation-slider"
            />
          </div>
          
          {/* Resource Abundance */}
          <div className="flex flex-col">
            <div className="flex justify-between text-xs">
              <label htmlFor="resourceAbundance">Resource Abundance</label>
              <span>{world.environmentalParameters.resourceAbundance.toFixed(1)}</span>
            </div>
            <input
              id="resourceAbundance"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={world.environmentalParameters.resourceAbundance}
              onChange={(e) => setEnvironmentalParameter('resourceAbundance', parseFloat(e.target.value))}
              className="simulation-slider"
            />
          </div>
          
          {/* Weather Condition */}
          <div className="flex flex-col">
            <label htmlFor="weatherCondition" className="text-xs mb-1">
              Weather Condition
            </label>
            <select
              id="weatherCondition"
              value={world.environmentalParameters.weatherCondition}
              onChange={(e) => setWeatherCondition(e.target.value as any)}
              className="bg-slate-700 text-white px-2 py-1 rounded text-xs"
            >
              <option value="clear">Clear</option>
              <option value="rain">Rain</option>
              <option value="storm">Storm</option>
              <option value="drought">Drought</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Catastrophe Controls */}
      <div className="border-t border-slate-700 pt-2">
        <h3 className="text-sm font-semibold mb-2">
          Catastrophe Trigger
          <span className="tooltip ml-1 text-xs text-slate-400">
            ⓘ
            <span className="tooltip-text">
              Trigger environmental events to test agent adaptability.
              These represent external challenges like natural disasters.
            </span>
          </span>
        </h3>
        
        <div className="space-y-2">
          <div className="flex flex-col">
            <label htmlFor="catastropheType" className="text-xs mb-1">
              Catastrophe Type
            </label>
            <select
              id="catastropheType"
              value={catastropheType}
              onChange={(e) => setCatastropheType(e.target.value)}
              className="bg-slate-700 text-white px-2 py-1 rounded text-xs"
            >
              <option value="earthquake">Earthquake</option>
              <option value="flood">Flood</option>
              <option value="drought">Drought</option>
              <option value="disease">Disease</option>
              <option value="meteor">Meteor Impact</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <div className="flex justify-between text-xs">
              <label htmlFor="catastropheIntensity">Intensity</label>
              <span>{catastropheIntensity.toFixed(1)}</span>
            </div>
            <input
              id="catastropheIntensity"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={catastropheIntensity}
              onChange={(e) => setCatastropheIntensity(parseFloat(e.target.value))}
              className="simulation-slider"
            />
          </div>
          
          <button
            onClick={handleCatastrophe}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
          >
            Trigger Catastrophe
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
