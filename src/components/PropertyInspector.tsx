import React, { useState } from 'react';
import { CabinetItem, Wall } from '../types';
import { DEFAULT_TAGS, evaluateHardwareRules, calculateCabinetPanelAreaSqFt, DEFAULT_PRICING_RULES } from '../engine/rulesEngine';
import {
  Sliders,
  Sparkles,
  DoorOpen,
  DoorClosed,
  Trash2,
  RotateCw,
  Info,
  Check,
  Layers,
  Wrench,
  HelpCircle
} from 'lucide-react';

interface PropertyInspectorProps {
  selectedId: string | null;
  cabinet: CabinetItem | undefined;
  wall: Wall | undefined;
  onUpdateCabinet: (updated: CabinetItem) => void;
  onRotateCabinet: (id: string) => void;
  onDeleteSelected: () => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  selectedId,
  cabinet,
  wall,
  onUpdateCabinet,
  onRotateCabinet,
  onDeleteSelected,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'customize' | 'construction'>('quick');

  if (!selectedId) {
    return (
      <div className="w-84 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center select-none shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
          <Sliders className="w-5 h-5 text-slate-500" />
        </div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Properties Panel</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[210px] leading-relaxed">
          Select any wall, room slab, or modular cabinet in the 2D or 3D viewport to inspect its parameters.
        </p>
      </div>
    );
  }

  // Wall Properties
  if (wall) {
    const len = Math.round(Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y));
    return (
      <div className="w-84 bg-white border-l border-slate-200 flex flex-col h-full select-none shadow-sm z-20">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-[#f8fafc]">
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">STRUCTURAL WALL</span>
            <h3 className="text-xs font-bold text-slate-800">Interior Partition Wall</h3>
          </div>
          <button
            onClick={onDeleteSelected}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Delete Wall"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Wall Length:</span>
              <span className="font-mono font-bold text-slate-800">{len} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Thickness:</span>
              <span className="font-mono font-bold text-slate-800">{wall.thickness} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ceiling Height:</span>
              <span className="font-mono font-bold text-slate-800">{wall.height} mm</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cabinet) return null;

  // Evaluate Live Rules for this cabinet
  const triggeredHardware = evaluateHardwareRules(cabinet);
  const panelArea = calculateCabinetPanelAreaSqFt(cabinet);
  const matchedPricingRule = DEFAULT_PRICING_RULES.find(r =>
    cabinet.tags.includes(r.coreTag) &&
    cabinet.tags.includes(r.extFinishTag) &&
    cabinet.tags.includes(r.intFinishTag)
  ) || DEFAULT_PRICING_RULES[0];

  const handleDimChange = (dim: 'width' | 'depth' | 'height', val: number) => {
    onUpdateCabinet({
      ...cabinet,
      dimensions: {
        ...cabinet.dimensions,
        [dim]: val,
      },
    });
  };

  const handleTagToggle = (tagId: string, category: string) => {
    const isSingleChoice = ['core', 'finish_ext', 'finish_int', 'hardware'].includes(category);
    let newTags = [...cabinet.tags];

    if (isSingleChoice) {
      const categoryTags = DEFAULT_TAGS.filter(t => t.category === category).map(t => t.id);
      newTags = newTags.filter(t => !categoryTags.includes(t));
      newTags.push(tagId);
    } else {
      if (newTags.includes(tagId)) {
        newTags = newTags.filter(t => t !== tagId);
      } else {
        newTags.push(tagId);
      }
    }

    onUpdateCabinet({ ...cabinet, tags: newTags });
  };

  return (
    <div className="w-84 bg-white border-l border-slate-200 flex flex-col h-full select-none shadow-sm z-20">
      {/* 1. Header with Component SKU */}
      <div className="p-3 border-b border-slate-200 bg-[#f8fafc] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
            {cabinet.type.replace('_', ' ')}
          </span>
          <h3 className="text-xs font-bold text-slate-800">{cabinet.name}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onRotateCabinet(cabinet.id)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDeleteSelected}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Infurnia 3-Subtab Switcher: Quick Access | Customize | Construction */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-medium">
        <button
          onClick={() => setActiveTab('quick')}
          className={`flex-1 py-2 text-center border-b-2 transition-all ${
            activeTab === 'quick'
              ? 'border-blue-600 text-blue-600 font-bold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Quick Access
        </button>
        <button
          onClick={() => setActiveTab('customize')}
          className={`flex-1 py-2 text-center border-b-2 transition-all ${
            activeTab === 'customize'
              ? 'border-blue-600 text-blue-600 font-bold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Customize
        </button>
        <button
          onClick={() => setActiveTab('construction')}
          className={`flex-1 py-2 text-center border-b-2 transition-all ${
            activeTab === 'construction'
              ? 'border-blue-600 text-blue-600 font-bold bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Construction
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ========================================================= */}
        {/* TAB 1: QUICK ACCESS */}
        {/* ========================================================= */}
        {activeTab === 'quick' && (
          <div className="space-y-4">
            {/* Interactive Shutter Toggle */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {cabinet.isOpen ? (
                  <DoorOpen className="w-4 h-4 text-emerald-600" />
                ) : (
                  <DoorClosed className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">3D Shutter Action</span>
                  <span className="text-[10px] text-slate-500">Peek inside carcass & hardware</span>
                </div>
              </div>
              <button
                onClick={() => onUpdateCabinet({ ...cabinet, isOpen: !cabinet.isOpen })}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                  cabinet.isOpen
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cabinet.isOpen ? 'Opened' : 'Closed'}
              </button>
            </div>

            {/* Parametric Dimension Inputs */}
            <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Parametric Dimensions
              </span>

              {/* Width */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Width (W)</span>
                  <span className="font-mono text-blue-600 font-bold">{cabinet.dimensions.width} mm</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1200}
                  step={50}
                  value={cabinet.dimensions.width}
                  onChange={e => handleDimChange('width', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Depth */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Depth (D)</span>
                  <span className="font-mono text-blue-600 font-bold">{cabinet.dimensions.depth} mm</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={650}
                  step={25}
                  value={cabinet.dimensions.depth}
                  onChange={e => handleDimChange('depth', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Height */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Height (H)</span>
                  <span className="font-mono text-emerald-600 font-bold">{cabinet.dimensions.height} mm</span>
                </div>
                <input
                  type="range"
                  min={600}
                  max={2400}
                  step={50}
                  value={cabinet.dimensions.height}
                  onChange={e => handleDimChange('height', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Elevation from FFL */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-600">Elevation from FFL:</span>
                <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {cabinet.elevation} mm
                </span>
              </div>
            </div>

            {/* Quick Summary of Active Rule */}
            <div className="bg-blue-50/60 border border-blue-200 p-2.5 rounded-lg text-xs space-y-1">
              <span className="text-blue-800 font-semibold block">Matched Tag Pricing Rate:</span>
              <div className="flex justify-between text-slate-600">
                <span>{matchedPricingRule.name}</span>
                <span className="font-mono font-bold text-blue-700">${matchedPricingRule.ratePerSqFt}/sq.ft</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CUSTOMIZE (MATERIALS & TAGS) */}
        {/* ========================================================= */}
        {activeTab === 'customize' && (
          <div className="space-y-4">
            {/* Core Board Substrate */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-600 tracking-wide block">
                Carcass Core Substrate
              </span>
              <div className="grid grid-cols-1 gap-1">
                {DEFAULT_TAGS.filter(t => t.category === 'core').map(t => {
                  const isActive = cabinet.tags.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTagToggle(t.id, 'core')}
                      className={`text-left px-2.5 py-1.5 rounded text-xs border transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{t.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* External Shutter Finish */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-600 tracking-wide block">
                External Shutter Finish
              </span>
              <div className="grid grid-cols-1 gap-1">
                {DEFAULT_TAGS.filter(t => t.category === 'finish_ext').map(t => {
                  const isActive = cabinet.tags.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTagToggle(t.id, 'finish_ext')}
                      className={`text-left px-2.5 py-1.5 rounded text-xs border transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{t.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fittings & Hardware */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase font-bold text-slate-600 tracking-wide block">
                Hardware & Motion
              </span>
              <div className="grid grid-cols-1 gap-1">
                {DEFAULT_TAGS.filter(t => t.category === 'hardware').map(t => {
                  const isActive = cabinet.tags.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTagToggle(t.id, 'hardware')}
                      className={`text-left px-2.5 py-1.5 rounded text-xs border transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{t.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CONSTRUCTION (RULES & MANUFACTURING BREAKDOWN) */}
        {/* ========================================================= */}
        {activeTab === 'construction' && (
          <div className="space-y-4 text-xs">
            {/* Manufacturing Spec */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block uppercase tracking-wide text-[10px]">
                CNC & Assembly Rules
              </span>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Front Shutter Edge Band:</span>
                  <span className="font-semibold text-slate-800">2.0 mm PVC</span>
                </div>
                <div className="flex justify-between">
                  <span>Carcass Edge Band:</span>
                  <span className="font-semibold text-slate-800">0.8 mm PVC</span>
                </div>
                <div className="flex justify-between">
                  <span>Back Panel:</span>
                  <span className="font-semibold text-slate-800">6.0 mm Grooved MDF</span>
                </div>
              </div>
            </div>

            {/* Sub-Panel Area Breakdown */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block uppercase tracking-wide text-[10px]">
                Panel Square-Footage Calculation
              </span>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Carcass Surface:</span>
                  <span className="font-mono text-slate-800">{panelArea.carcassSqFt} sq.ft</span>
                </div>
                <div className="flex justify-between">
                  <span>Front Shutter Surface:</span>
                  <span className="font-mono text-slate-800">{panelArea.shutterSqFt} sq.ft</span>
                </div>
                <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-blue-600">
                  <span>Total Panel Area:</span>
                  <span className="font-mono">{panelArea.totalSqFt} sq.ft</span>
                </div>
              </div>
            </div>

            {/* Hardware Rules Injection */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block uppercase tracking-wide text-[10px]">
                Automated Hardware Calculation
              </span>
              <div className="space-y-2">
                {triggeredHardware.map(hw => (
                  <div key={hw.ruleName} className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-blue-600 font-semibold block text-[11px]">{hw.ruleName}</span>
                    <div className="flex justify-between text-slate-600 mt-0.5">
                      <span className="text-[11px] truncate max-w-[150px]">{hw.description}</span>
                      <span className="font-mono font-bold text-slate-900">×{hw.quantity} pcs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
