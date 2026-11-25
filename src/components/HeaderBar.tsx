import React from 'react';
import { PRESET_PROJECTS } from '../presets/sampleProjects';
import {
  Layers,
  Eye,
  Calculator,
  Sparkles,
  PenTool,
  RotateCcw
} from 'lucide-react';

interface HeaderBarProps {
  activeView: '2d' | '3d';
  onToggleView: (view: '2d' | '3d') => void;
  projectName: string;
  totalCost: number;
  onOpenBOQ: () => void;
  onOpenRules: () => void;
  onLoadPreset: (presetId: string) => void;
  wallToolActive: boolean;
  onToggleWallTool: () => void;
  onReset: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeView,
  onToggleView,
  projectName,
  totalCost,
  onOpenBOQ,
  onOpenRules,
  onLoadPreset,
  wallToolActive,
  onToggleWallTool,
  onReset,
}) => {
  return (
    <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between select-none shadow-xs z-30">
      {/* Left: Brand & Layout Preset Selector */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            i
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">infurnia</span>
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            MVP
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        {/* Layout Preset Dropdown */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-500 font-medium">Layout:</span>
          <select
            onChange={e => {
              if (e.target.value) onLoadPreset(e.target.value);
            }}
            defaultValue=""
            className="bg-slate-50 text-xs text-slate-700 font-medium border border-slate-200 rounded px-2 py-1 focus:outline-none hover:bg-slate-100 cursor-pointer"
          >
            <option value="" disabled>Load Layout...</option>
            {PRESET_PROJECTS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: 2D ⇄ 3D Viewport Toggle & Wall Drawing Tool */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
          <button
            onClick={() => onToggleView('2d')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeView === '2d'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Floor Plan</span>
          </button>
          <button
            onClick={() => onToggleView('3d')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeView === '3d'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D Workspace</span>
          </button>
        </div>

        {/* Draw Wall Tool (Instant access) */}
        <button
          onClick={onToggleWallTool}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all border ${
            wallToolActive
              ? 'bg-blue-50 text-blue-600 border-blue-400 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Draw walls on 2D floor plan"
        >
          <PenTool className="w-3.5 h-3.5 text-blue-600" />
          <span>{wallToolActive ? 'Drawing Wall...' : 'Draw Wall'}</span>
        </button>
      </div>

      {/* Right: Rules Engine & Live BOQ */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenRules}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md text-xs font-semibold transition-colors"
          title="Inspect Tag-Based Pricing & Hardware Rules"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Tags & Rules</span>
        </button>

        <button
          onClick={onOpenBOQ}
          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-all shadow-xs"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Live BOQ:</span>
          <span className="font-mono font-bold bg-blue-700 px-1.5 py-0.2 rounded text-[11px]">
            ${totalCost.toLocaleString()}
          </span>
        </button>

        <button
          onClick={onReset}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          title="Reset Canvas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
