import React, { useState, useEffect } from 'react';
import { Wall, CabinetItem } from './types';
import { PRESET_PROJECTS } from './presets/sampleProjects';
import { generateLiveBOQ } from './engine/rulesEngine';
import { HeaderBar } from './components/HeaderBar';
import { SidebarCatalog } from './components/SidebarCatalog';
import { PropertyInspector } from './components/PropertyInspector';
import { Viewport2D } from './components/Viewport2D';
import { Viewport3D } from './components/Viewport3D';
import { BOQModal } from './components/BOQModal';
import { RulesManagerModal } from './components/RulesManagerModal';

const STORAGE_KEY = 'infurnia_mvp_project_state_v3';

export const App: React.FC = () => {
  const defaultPreset = PRESET_PROJECTS[0];

  const [projectName, setProjectName] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).projectName || defaultPreset.name;
      } catch (e) {
        // ignore
      }
    }
    return defaultPreset.name;
  });

  const [walls, setWalls] = useState<Wall[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.walls?.length) return parsed.walls;
      } catch (e) {
        // ignore
      }
    }
    return defaultPreset.walls;
  });

  const [cabinets, setCabinets] = useState<CabinetItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.cabinets) return parsed.cabinets;
      } catch (e) {
        // ignore
      }
    }
    return defaultPreset.cabinets;
  });

  const [activeView, setActiveView] = useState<'2d' | '3d'>('2d');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'wall'>('select');
  const [isBOQOpen, setIsBOQOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          projectName,
          walls,
          cabinets,
        })
      );
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [projectName, walls, cabinets]);

  // Compute live BOQ dynamically
  const liveBOQ = generateLiveBOQ(walls, cabinets);

  // Actions
  const handleAddWall = (newWall: Wall) => {
    setWalls(prev => [...prev, newWall]);
  };

  const handleAddCabinet = (item: Omit<CabinetItem, 'id' | 'position' | 'rotation' | 'isOpen'>) => {
    const newId = `cab_${Date.now()}`;
    const newCabinet: CabinetItem = {
      ...item,
      id: newId,
      position: { x: 2100, y: 1600, z: 0 },
      rotation: 0,
      isOpen: false,
    };
    setCabinets(prev => [...prev, newCabinet]);
    setSelectedId(newId);
  };

  const handleUpdateCabinet = (updated: CabinetItem) => {
    setCabinets(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const handleUpdateCabinetPos = (id: string, pos: { x: number; y: number }) => {
    setCabinets(prev =>
      prev.map(c => (c.id === id ? { ...c, position: { ...c.position, ...pos } } : c))
    );
  };

  const handleRotateCabinet = (id: string) => {
    setCabinets(prev =>
      prev.map(c => (c.id === id ? { ...c, rotation: (c.rotation + 90) % 360 } : c))
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setCabinets(prev => prev.filter(c => c.id !== selectedId));
    setWalls(prev => prev.filter(w => w.id !== selectedId));
    setSelectedId(null);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_PROJECTS.find(p => p.id === presetId);
    if (!preset) return;
    setProjectName(preset.name);
    setWalls(preset.walls);
    setCabinets(preset.cabinets);
    setSelectedId(null);
  };

  const handleReset = () => {
    if (window.confirm('Reset to an empty layout?')) {
      const empty = PRESET_PROJECTS.find(p => p.id === 'preset_empty') || PRESET_PROJECTS[1];
      setProjectName('Custom Studio Layout');
      setWalls(empty.walls);
      setCabinets([]);
      setSelectedId(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      } else if (e.key === '1') {
        setActiveView('2d');
      } else if (e.key === '2') {
        setActiveView('3d');
      } else if (e.key === 'Escape') {
        setSelectedId(null);
        setTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId]);

  const selectedCabinet = cabinets.find(c => c.id === selectedId);
  const selectedWall = walls.find(w => w.id === selectedId);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f1f3f7] overflow-hidden text-slate-800">
      {/* Streamlined Top Navigation Bar */}
      <HeaderBar
        activeView={activeView}
        onToggleView={setActiveView}
        projectName={projectName}
        totalCost={liveBOQ.totalCost}
        onOpenBOQ={() => setIsBOQOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onLoadPreset={handleLoadPreset}
        wallToolActive={tool === 'wall'}
        onToggleWallTool={() => {
          setActiveView('2d');
          setTool(t => (t === 'wall' ? 'select' : 'wall'));
        }}
        onReset={handleReset}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Parametric Modular Catalog (100% functional) */}
        <SidebarCatalog onAddCabinet={handleAddCabinet} />

        {/* Center: Viewport (2D Architectural Canvas or 3D WebGL Studio) */}
        <main className="flex-1 relative h-full bg-[#f8fafc]">
          {activeView === '2d' ? (
            <Viewport2D
              walls={walls}
              cabinets={cabinets}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAddWall={handleAddWall}
              onUpdateCabinetPos={handleUpdateCabinetPos}
              onRotateCabinet={handleRotateCabinet}
              onDeleteSelected={handleDeleteSelected}
              tool={tool}
              setTool={setTool}
            />
          ) : (
            <Viewport3D
              walls={walls}
              cabinets={cabinets}
              selectedId={selectedId}
              onSelect={setSelectedId}
              ceilingHeight={2800}
            />
          )}
        </main>

        {/* Right: Infurnia 3-Subtab Property Inspector (100% functional) */}
        <PropertyInspector
          selectedId={selectedId}
          cabinet={selectedCabinet}
          wall={selectedWall}
          onUpdateCabinet={handleUpdateCabinet}
          onRotateCabinet={handleRotateCabinet}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>

      {/* Modals */}
      <BOQModal
        isOpen={isBOQOpen}
        onClose={() => setIsBOQOpen(false)}
        boq={liveBOQ}
        projectName={projectName}
      />

      <RulesManagerModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
};
export default App;
