import { useState } from "react";
import MinimalWorld from "./components/MinimalWorld";
import "@fontsource/inter";

/**
 * Extrem vereinfachte App-Komponente ohne komplexe Simulation
 */
function App() {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Minimale 3D-Welt ohne komplexe Animation */}
      <MinimalWorld />
      
      {/* Einfache UI-Elemente */}
      <button 
        onClick={() => setShowInfo(!showInfo)} 
        className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded shadow-lg z-10"
      >
        {showInfo ? "Info ausblenden" : "Info anzeigen"}
      </button>
      
      {showInfo && (
        <div className="absolute top-4 left-4 w-80 bg-slate-800/90 text-white rounded shadow-lg p-4 backdrop-blur-sm z-10">
          <h2 className="text-xl mb-2">Genesis Simulation</h2>
          <p className="mb-3">Stark vereinfachte Version</p>
          <ul className="list-disc pl-5">
            <li>Roter Würfel = Adam</li>
            <li>Blauer Würfel = Eve</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
