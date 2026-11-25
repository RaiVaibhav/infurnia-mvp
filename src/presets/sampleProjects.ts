import { Wall, CabinetItem } from '../types';

export interface ProjectPreset {
  id: string;
  name: string;
  description: string;
  walls: Wall[];
  cabinets: CabinetItem[];
}

export const PRESET_PROJECTS: ProjectPreset[] = [
  {
    id: 'preset_modular_kitchen',
    name: 'Modern Modular L-Kitchen',
    description: 'Complete L-shaped kitchen layout with base units, drawers, overhead units, and sink module.',
    walls: [
      { id: 'w1', start: { x: 0, y: 0 }, end: { x: 4200, y: 0 }, thickness: 150, height: 2800 },
      { id: 'w2', start: { x: 4200, y: 0 }, end: { x: 4200, y: 3200 }, thickness: 150, height: 2800 },
      { id: 'w3', start: { x: 4200, y: 3200 }, end: { x: 0, y: 3200 }, thickness: 150, height: 2800 },
      { id: 'w4', start: { x: 0, y: 3200 }, end: { x: 0, y: 0 }, thickness: 150, height: 2800 },
    ],
    cabinets: [
      // Base Units along top wall (y = 300)
      {
        id: 'cab_base_sink',
        type: 'sink_unit',
        name: 'Sink Base Unit (Under-sink Plumbing)',
        position: { x: 600, y: 320, z: 0 },
        rotation: 0,
        dimensions: { width: 800, depth: 600, height: 850 },
        elevation: 0,
        tags: ['core:bwp_ply_18', 'ext:matte_laminate', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
        isOpen: false,
      },
      {
        id: 'cab_base_drawers',
        type: 'base_drawers',
        name: 'Tandem Cutlery & Pot Drawers (3-Tier)',
        position: { x: 1450, y: 320, z: 0 },
        rotation: 0,
        dimensions: { width: 800, depth: 600, height: 850 },
        elevation: 0,
        tags: ['core:hdhmr_18', 'ext:gloss_acrylic', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
        isOpen: false,
      },
      {
        id: 'cab_base_double',
        type: 'base_double',
        name: '2-Door Base Storage Unit',
        position: { x: 2300, y: 320, z: 0 },
        rotation: 0,
        dimensions: { width: 900, depth: 600, height: 850 },
        elevation: 0,
        tags: ['core:hdhmr_18', 'ext:gloss_acrylic', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
        isOpen: false,
      },
      {
        id: 'cab_tall_pantry',
        type: 'tall_pantry',
        name: 'Tall Pantry Unit (Pull-out Larder)',
        position: { x: 3450, y: 320, z: 0 },
        rotation: 0,
        dimensions: { width: 600, depth: 600, height: 2150 },
        elevation: 0,
        tags: ['core:hdhmr_18', 'ext:gloss_acrylic', 'int:fabric_grey', 'hardware:soft_close', 'profile:gola'],
        isOpen: false,
      },
      // Overhead Wall Units along top wall (y = 175)
      {
        id: 'cab_wall_double_1',
        type: 'wall_double',
        name: 'Overhead Lift-up Glass/Solid Unit',
        position: { x: 1450, y: 175, z: 0 },
        rotation: 0,
        dimensions: { width: 800, depth: 350, height: 700 },
        elevation: 1450,
        tags: ['core:hdhmr_18', 'ext:gloss_acrylic', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
        isOpen: false,
      },
      {
        id: 'cab_wall_double_2',
        type: 'wall_double',
        name: 'Overhead Wall Storage Unit',
        position: { x: 2300, y: 175, z: 0 },
        rotation: 0,
        dimensions: { width: 900, depth: 350, height: 700 },
        elevation: 1450,
        tags: ['core:hdhmr_18', 'ext:gloss_acrylic', 'int:white_laminate', 'hardware:soft_close', 'profile:gola'],
        isOpen: false,
      },
    ],
  },
  {
    id: 'preset_empty',
    name: 'Empty Room Canvas',
    description: 'Clean 5m × 4m room ready for custom drafting and layout.',
    walls: [
      { id: 'w1', start: { x: 0, y: 0 }, end: { x: 5000, y: 0 }, thickness: 150, height: 2800 },
      { id: 'w2', start: { x: 5000, y: 0 }, end: { x: 5000, y: 4000 }, thickness: 150, height: 2800 },
      { id: 'w3', start: { x: 5000, y: 4000 }, end: { x: 0, y: 4000 }, thickness: 150, height: 2800 },
      { id: 'w4', start: { x: 0, y: 4000 }, end: { x: 0, y: 0 }, thickness: 150, height: 2800 },
    ],
    cabinets: [],
  },
];
