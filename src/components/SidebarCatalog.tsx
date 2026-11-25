import React, { useState } from 'react';
import { CabinetType, CabinetItem } from '../types';
import { Box, Layers, Archive, Package, Plus, Search, Filter } from 'lucide-react';

interface SidebarCatalogProps {
  onAddCabinet: (item: Omit<CabinetItem, 'id' | 'position' | 'rotation' | 'isOpen'>) => void;
}

interface CatalogEntry {
  type: CabinetType;
  name: string;
  category: 'Base Units' | 'Overhead Units' | 'Tall & Pantry';
  defaultDims: { width: number; depth: number; height: number };
  elevation: number;
  tags: string[];
  description: string;
  sku: string;
}

const CATALOG_ITEMS: CatalogEntry[] = [
  // Base Cabinets
  {
    type: 'base_single',
    sku: 'INF-BASE-S600',
    name: '1-Door Base Unit',
    category: 'Base Units',
    defaultDims: { width: 600, depth: 600, height: 850 },
    elevation: 0,
    tags: ['core:hdhmr_18', 'ext:matte_laminate', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
    description: 'Single shutter base module with adjustable internal shelf',
  },
  {
    type: 'base_double',
    sku: 'INF-BASE-D900',
    name: '2-Door Base Unit',
    category: 'Base Units',
    defaultDims: { width: 900, depth: 600, height: 850 },
    elevation: 0,
    tags: ['core:hdhmr_18', 'ext:matte_laminate', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
    description: 'Wide double door base cabinet for pots & groceries',
  },
  {
    type: 'base_drawers',
    sku: 'INF-BASE-DR800',
    name: '3-Drawer Tandem Unit',
    category: 'Base Units',
    defaultDims: { width: 800, depth: 600, height: 850 },
    elevation: 0,
    tags: ['core:hdhmr_18', 'ext:gloss_acrylic', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
    description: '1 Cutlery organizer + 2 Deep Pot soft-close tandem drawers',
  },
  {
    type: 'sink_unit',
    sku: 'INF-SINK-B800',
    name: 'Kitchen Sink Wet Unit',
    category: 'Base Units',
    defaultDims: { width: 800, depth: 600, height: 850 },
    elevation: 0,
    tags: ['core:bwp_ply_18', 'ext:matte_laminate', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
    description: '100% BWP Marine Plywood carcass with sink basin & faucet',
  },

  // Overhead Units
  {
    type: 'wall_single',
    sku: 'INF-WALL-S450',
    name: 'Single Door Overhead',
    category: 'Overhead Units',
    defaultDims: { width: 450, depth: 350, height: 700 },
    elevation: 1450,
    tags: ['core:hdhmr_18', 'ext:matte_laminate', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
    description: 'Wall mounted 1-door overhead cabinet (1450mm from FFL)',
  },
  {
    type: 'wall_double',
    sku: 'INF-WALL-D900',
    name: 'Double Door Overhead',
    category: 'Overhead Units',
    defaultDims: { width: 900, depth: 350, height: 700 },
    elevation: 1450,
    tags: ['core:hdhmr_18', 'ext:matte_laminate', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
    description: 'Wall mounted 2-door overhead cabinet with twin shelves',
  },

  // Tall Units
  {
    type: 'tall_pantry',
    sku: 'INF-TALL-P600',
    name: 'Full Height Pantry Larder',
    category: 'Tall & Pantry',
    defaultDims: { width: 600, depth: 600, height: 2150 },
    elevation: 0,
    tags: ['core:hdhmr_18', 'ext:gloss_acrylic', 'int:fabric_grey', 'hardware:soft_close', 'profile:gola'],
    description: 'Full-height 2150mm pull-out larder unit with 6 wire baskets',
  },
];

export const SidebarCatalog: React.FC<SidebarCatalogProps> = ({ onAddCabinet }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Base Units' | 'Overhead Units' | 'Tall & Pantry'>('All');

  const filteredItems = CATALOG_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full select-none shadow-sm z-20">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-200 space-y-2 bg-[#f8fafc]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
            <Box className="w-3.5 h-3.5 text-blue-600" />
            <span>Catalog Library</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
            Parametric BIM
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search kitchen units or SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white text-xs text-slate-800 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-0.5">
          {(['All', 'Base Units', 'Overhead Units', 'Tall & Pantry'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded text-[11px] whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
        {filteredItems.map(item => (
          <div
            key={item.sku}
            onClick={() => {
              onAddCabinet({
                type: item.type,
                name: item.name,
                dimensions: { ...item.defaultDims },
                elevation: item.elevation,
                tags: [...item.tags],
              });
            }}
            className="bg-white hover:bg-blue-50/40 active:scale-[0.99] border border-slate-200 hover:border-blue-400 p-2.5 rounded-lg cursor-pointer transition-all shadow-xs group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-600 font-semibold uppercase">{item.sku}</span>
                <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h4>
              </div>
              <div className="p-1 rounded bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.description}</p>

            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-600">
              <span className="font-mono text-slate-500">{item.defaultDims.width}W × {item.defaultDims.depth}D mm</span>
              <span className="font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                H: {item.defaultDims.height}mm
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 border-t border-slate-200 bg-white text-[11px] text-slate-500 text-center">
        Click any unit to place it into the active room layout.
      </div>
    </div>
  );
};
