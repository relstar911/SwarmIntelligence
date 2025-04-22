import { useState } from "react";
import { SimulationProvider } from "./providers/SimulationProvider";
import { Canvas } from "@react-three/fiber";
import World from "./components/World";
import Metrics from "./components/Metrics";
import SimulationControls from "./components/SimulationControls";
import TimeControls from "./components/TimeControls";
import "@fontsource/inter";

/**
 * Aufbauende UI mit einfacherer 3D-Welt
 */
function App() {
  const [showControls, setShowControls] = useState(true);

  return (
    <SimulationProvider>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {/* 3D-Welt mit festen Intervall-Updates statt Animation */}
        <Canvas
          shadows
          gl={{ antialias: true }}
          camera={{ position: [0, 8, 20], fov: 50 }}
          style={{ height: '100vh' }}
        >
          <color attach="background" args={["#000033"]} />
          <World />
        </Canvas>
        
        {/* UI Steuerelemente */}
        <div className="absolute bottom-4 right-4">
          <TimeControls />
        </div>
        
        <button 
          onClick={() => setShowControls(!showControls)} 
          className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded shadow-lg z-10"
        >
          {showControls ? "Steuerung ausblenden" : "Steuerung anzeigen"}
        </button>
        
        {showControls && (
          <div className="absolute top-4 left-4 w-80 bg-slate-800/90 text-white rounded shadow-lg p-4 backdrop-blur-sm z-10">
            <SimulationControls />
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 w-80 bg-slate-800/90 text-white rounded shadow-lg p-4 backdrop-blur-sm z-10">
          <Metrics />
        </div>
      </div>
    </SimulationProvider>
  );
}

export default App;
