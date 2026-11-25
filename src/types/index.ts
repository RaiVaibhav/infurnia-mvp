// Data types for Infurnia CAD/BIM & Parametric Modular Cabinetry MVP

export interface Point2D {
  x: number; // in mm
  y: number; // in mm
}

export interface Wall {
  id: string;
  start: Point2D; // in mm
  end: Point2D;   // in mm
  thickness: number; // default 150mm
  height: number;    // default 2800mm
}

export interface Room {
  id: string;
  name: string;
  wallIds: string[];
  vertices: Point2D[];
  areaSqM: number;
  perimeterM: number;
}

export type CabinetType =
  | 'base_single'
  | 'base_double'
  | 'base_drawers'
  | 'wall_single'
  | 'wall_double'
  | 'tall_pantry'
  | 'sink_unit';

export interface CabinetItem {
  id: string;
  type: CabinetType;
  name: string;
  // Position in 2D/3D world (in mm)
  position: { x: number; y: number; z: number };
  rotation: number; // degrees (0, 90, 180, 270)
  // Parametric Dimensions (in mm)
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  elevation: number; // mm from floor (0 for base units, 1450 for overhead wall units)
  // Tags attached to this unit for Rules & Pricing
  tags: string[];
  // Interactive state
  isOpen: boolean; // open shutter to inspect internal shelves/hinges
}

export type TagCategory = 'core' | 'finish_ext' | 'finish_int' | 'hardware' | 'profile';

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color: string;
  description: string;
}

export interface PricingRule {
  id: string;
  name: string;
  coreTag: string;
  extFinishTag: string;
  intFinishTag: string;
  ratePerSqFt: number; // in USD or INR
  description: string;
}

export interface HardwareTriggerResult {
  ruleName: string;
  sku: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface BOQItem {
  id: string;
  category: 'Carcass & Shutters' | 'Hardware & Fittings' | 'Countertops & Skirting' | 'Civil / Walls';
  description: string;
  tags: string[];
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  notes?: string;
}

export interface ProjectState {
  projectName: string;
  ceilingHeight: number; // mm
  walls: Wall[];
  cabinets: CabinetItem[];
  selectedId: string | null;
  activeView: '2d' | '3d';
  gridSnap: number; // mm, default 50mm
}
