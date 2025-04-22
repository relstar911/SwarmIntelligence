import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAudio } from '../lib/stores/useAudio';

type SimulationContextType = {
  loading: boolean;
  error: string | null;
};

const SimulationContext = createContext<SimulationContextType>({
  loading: true,
  error: null
});

export const useSimulationContext = () => useContext(SimulationContext);

interface SimulationProviderProps {
  children: ReactNode;
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get audio state for sound effects
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  
  // Initialize resources
  useEffect(() => {
    const loadResources = async () => {
      try {
        // Load audio elements
        const bgMusic = new Audio('/sounds/background.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        
        const hitSound = new Audio('/sounds/hit.mp3');
        const successSound = new Audio('/sounds/success.mp3');
        
        // Set the audio elements in the store
        setBackgroundMusic(bgMusic);
        setHitSound(hitSound);
        setSuccessSound(successSound);
        
        // Finish loading
        setLoading(false);
      } catch (err) {
        console.error('Failed to load resources:', err);
        setError('Failed to load simulation resources. Please refresh the page.');
        setLoading(false);
      }
    };
    
    loadResources();
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);
  
  const contextValue = {
    loading,
    error
  };
  
  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
};
