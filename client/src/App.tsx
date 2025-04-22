import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import World from "./components/World";
import Metrics from "./components/Metrics";
import SimulationControls from "./components/SimulationControls";
import TimeControls from "./components/TimeControls";
import { SimulationProvider } from "./providers/SimulationProvider";
import { Controls } from "./lib/types";
import "@fontsource/inter";

// Define control keys for the simulation
const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.up, keys: ["KeyQ", "PageUp"] },
  { name: Controls.down, keys: ["KeyE", "PageDown"] },
  { name: Controls.toggleMenu, keys: ["KeyM"] },
  { name: Controls.interact, keys: ["KeyF"] },
];

// Main App component
function App() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
  }, []);

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  return (
    <SimulationProvider>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {showCanvas && (
          <KeyboardControls map={controls}>
            <Canvas
              shadows
              camera={{
                position: [0, 8, 12],
                fov: 60,
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "default"
              }}
            >
              <color attach="background" args={["#000033"]} />
              <Suspense fallback={null}>
                <World />
              </Suspense>
            </Canvas>
            
            {/* UI Components */}
            <div className="absolute bottom-4 right-4">
              <TimeControls />
            </div>
            
            <button 
              onClick={toggleControls} 
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded shadow-lg z-10"
            >
              {showControls ? "Hide Controls" : "Show Controls"}
            </button>
            
            {showControls && (
              <div className="absolute top-4 left-4 w-80 bg-slate-800/90 text-white rounded shadow-lg p-4 backdrop-blur-sm z-10">
                <SimulationControls />
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 w-80 bg-slate-800/90 text-white rounded shadow-lg p-4 backdrop-blur-sm z-10">
              <Metrics />
            </div>
          </KeyboardControls>
        )}
      </div>
    </SimulationProvider>
  );
}

export default App;
