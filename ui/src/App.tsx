import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Visualizer from './components/Visualizer';
import Information from './components/Information';
import Footer from './components/Footer';
import { Machine, Link } from './types';
import './App.css';

interface Position {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machinePositions, setMachinePositions] = useState<Record<string, Position>>({});
  const [machines, setMachines] = useState<Machine[]>([]);
  const [previousMachines, setPreviousMachines] = useState<Machine[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusChanges, setStatusChanges] = useState<Record<string, boolean>>({});
  const visualizerRef = useRef<HTMLDivElement>(null);
  
  const generateLinks = (machinesList: Machine[]): Link[] => {
    const generatedLinks: Link[] = [];
    
    for (let i = 0; i < machinesList.length; i++) {
      for (let j = i + 1; j < machinesList.length; j++) {
        if (machinesList[i].status === "connected" && machinesList[j].status === "connected") {
          generatedLinks.push({ 
            source: machinesList[i].id, 
            target: machinesList[j].id,
            type: "connected"
          });
        } else {
          generatedLinks.push({ 
            source: machinesList[i].id, 
            target: machinesList[j].id,
            type: "isolated"
          });
        }
      }
    }
    
    return generatedLinks;
  };
  
  // Détection des changements d'état des machines
  useEffect(() => {
    const changes: Record<string, boolean> = {};
    
    machines.forEach(machine => {
      const previousMachine = previousMachines.find(m => m.id === machine.id);
      if (previousMachine && previousMachine.status !== machine.status) {
        changes[machine.id] = true;
      }
    });
    
    if (Object.keys(changes).length > 0) {
      setStatusChanges(changes);
      
      // Réinitialiser après un délai
      const timer = setTimeout(() => {
        setStatusChanges({});
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [machines, previousMachines]);
  
  const fetchMachines = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/machines');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch machines: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sauvegarder l'état précédent pour détecter les changements
      setPreviousMachines(machines);
      setMachines(data);
      
      const newLinks = generateLinks(data);
      setLinks(newLinks);
      
      if (selectedMachine) {
        const updatedSelectedMachine = data.find(m => m.id === selectedMachine.id) || null;
        setSelectedMachine(updatedSelectedMachine);
      }
      
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
      
      if (machines.length === 0) {
        const sampleMachines = [
          { "id": "1", "name": "1", "ip": "xxx.xxx.xxx.xxx", "mac": "xx:xx:xx:xx:xx:xx", "lastUpdate": "01/03/2025", "status": "connected" },
          { "id": "2", "name": "2", "ip": "xxx.xxx.xxx.xxx", "mac": "xx:xx:xx:xx:xx:xx", "lastUpdate": "28/02/2025", "status": "isolated" },
          { "id": "3", "name": "3", "ip": "xxx.xxx.xxx.xxx", "mac": "xx:xx:xx:xx:xx:xx", "lastUpdate": "02/03/2025", "status": "connected" },
          { "id": "4", "name": "4", "ip": "xxx.xxx.xxx.xxx", "mac": "xx:xx:xx:xx:xx:xx", "lastUpdate": "03/03/2025", "status": "connected" },
        ];
        
        setMachines(sampleMachines);
        setPreviousMachines(sampleMachines);
        setLinks(generateLinks(sampleMachines));
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedMachine, machines.length, machines]);
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchMachines();
    
    // Load saved positions on initial render
    const savedPositions = localStorage.getItem('machinePositions');
    if (savedPositions) {
      try {
        setMachinePositions(JSON.parse(savedPositions));
      } catch (e) {
        console.error('Failed to load saved positions', e);
      }
    }
  }, [fetchMachines]);
  

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMachines();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchMachines]);
  
  const handleMachineClick = (machine: Machine) => {
    if (selectedMachine && selectedMachine.id === machine.id) {
      setSelectedMachine(null);
    } else {
      setSelectedMachine(machine);
    }
  };
  
  const updateMachinePositions = (positions: Record<string, Position>) => {
    setMachinePositions(positions);
    
    localStorage.setItem('machinePositions', JSON.stringify(positions));
  };
  
  return (
    <div className="app">
      <Header />
      <div className="main-content">
        {selectedMachine && (
          <Information machine={selectedMachine} />
        )}
        <div 
          ref={visualizerRef} 
          style={{ flex: 1, height: '100%' }}
        >
          {isLoading && machines.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading machines...</p>
            </div>
          ) : error && machines.length === 0 ? (
            <div className="error-container">
              <p>Error: {error}</p>
              <button onClick={fetchMachines}>Retry</button>
            </div>
          ) : (
            <Visualizer 
              machines={machines} 
              links={links} 
              onMachineClick={handleMachineClick}
              isReduced={selectedMachine !== null}
              initialPositions={machinePositions}
              onPositionsChange={updateMachinePositions}
              statusChanges={statusChanges}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;