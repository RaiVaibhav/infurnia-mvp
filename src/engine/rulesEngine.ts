import { Tag, PricingRule, CabinetItem, Wall, BOQItem, HardwareTriggerResult } from '../types';

// ==========================================
// 1. MASTER CATALOG TAGS
// ==========================================
export const DEFAULT_TAGS: Tag[] = [
  // Core Substrates
  { id: 'core:hdhmr_18', name: '18mm HDHMR (Moisture Resistant)', category: 'core', color: '#10b981', description: 'High Density High Moisture Resistant Board' },
  { id: 'core:bwp_ply_18', name: '18mm BWP Marine Plywood', category: 'core', color: '#059669', description: 'Boiling Water Proof 710 Marine Grade Plywood' },
  { id: 'core:mdf_18', name: '18mm Interior MDF', category: 'core', color: '#6ee7b7', description: 'Standard Medium Density Fiberboard' },

  // External Finishes
  { id: 'ext:matte_laminate', name: '1.0mm Super Matte Laminate', category: 'finish_ext', color: '#3b82f6', description: 'Anti-fingerprint soft matte laminate' },
  { id: 'ext:gloss_acrylic', name: '2.0mm Ultra Gloss Acrylic', category: 'finish_ext', color: '#6366f1', description: 'High-gloss seamless glass-look acrylic shutter' },
  { id: 'ext:pu_lacquer', name: 'PU Paint Lacquer (Satin)', category: 'finish_ext', color: '#8b5cf6', description: 'Polyurethane factory spray lacquer with router grooves' },
  { id: 'ext:natural_veneer', name: 'Natural Teak/Walnut Veneer', category: 'finish_ext', color: '#d97706', description: 'Natural wood veneer sheets with PU polish' },

  // Internal Finishes
  { id: 'int:white_laminate', name: '0.8mm Frost White Liner', category: 'finish_int', color: '#94a3b8', description: 'Standard hygienic white inner balance sheet' },
  { id: 'int:fabric_grey', name: '0.8mm Grey Fabric Linen', category: 'finish_int', color: '#64748b', description: 'Premium woven texture inner laminate' },

  // Hardware Specifications
  { id: 'hardware:soft_close', name: 'Soft-Close Blum/Hettich Hydraulic', category: 'hardware', color: '#ec4899', description: 'Tested for 200,000 cycles with soft-dampening' },
  { id: 'hardware:standard', name: 'Standard Self-Closing Clip-on', category: 'hardware', color: '#f43f5e', description: 'Commercial grade clip-on hinges' },

  // Handle & Profile
  { id: 'profile:gola', name: 'Gola J-Profile Handleless (Alu)', category: 'profile', color: '#eab308', description: 'Modern continuous recessed aluminium channel' },
  { id: 'profile:bar_handle', name: 'Matte Black Edge Bar Handle', category: 'profile', color: '#ca8a04', description: 'Sleek surface mount zinc-alloy pull' },
];

// ==========================================
// 2. TAG-BASED PRICING RULES MATRIX
// ==========================================
export const DEFAULT_PRICING_RULES: PricingRule[] = [
  {
    id: 'rule_hdhmr_matte',
    name: 'HDHMR + Matte Laminate + White Liner',
    coreTag: 'core:hdhmr_18',
    extFinishTag: 'ext:matte_laminate',
    intFinishTag: 'int:white_laminate',
    ratePerSqFt: 18.5, // USD per sq.ft of panel surface
    description: 'Popular durability & value package for kitchens and vanities',
  },
  {
    id: 'rule_hdhmr_acrylic',
    name: 'HDHMR + Gloss Acrylic + White Liner',
    coreTag: 'core:hdhmr_18',
    extFinishTag: 'ext:gloss_acrylic',
    intFinishTag: 'int:white_laminate',
    ratePerSqFt: 25.0,
    description: 'High-end contemporary glossy kitchen finish',
  },
  {
    id: 'rule_hdhmr_pu',
    name: 'HDHMR + PU Lacquer + Grey Fabric',
    coreTag: 'core:hdhmr_18',
    extFinishTag: 'ext:pu_lacquer',
    intFinishTag: 'int:fabric_grey',
    ratePerSqFt: 32.0,
    description: 'Luxury seamless routed PU finish',
  },
  {
    id: 'rule_ply_veneer',
    name: 'BWP Marine Ply + Natural Wood Veneer',
    coreTag: 'core:bwp_ply_18',
    extFinishTag: 'ext:natural_veneer',
    intFinishTag: 'int:fabric_grey',
    ratePerSqFt: 36.0,
    description: 'Waterproof luxury wood finish for high-moisture zones',
  },
  {
    id: 'rule_ply_matte',
    name: 'BWP Marine Ply + Matte Laminate',
    coreTag: 'core:bwp_ply_18',
    extFinishTag: 'ext:matte_laminate',
    intFinishTag: 'int:white_laminate',
    ratePerSqFt: 21.0,
    description: 'Waterproof kitchen sink/wet area standard',
  },
  {
    id: 'rule_mdf_matte',
    name: 'Interior MDF + Matte Laminate (Budget)',
    coreTag: 'core:mdf_18',
    extFinishTag: 'ext:matte_laminate',
    intFinishTag: 'int:white_laminate',
    ratePerSqFt: 14.0,
    description: 'Cost-effective package for dry bedroom wardrobes',
  },
];

// ==========================================
// 3. HARDWARE & GEOMETRY RULE ENGINE
// ==========================================
export function evaluateHardwareRules(cabinet: CabinetItem): HardwareTriggerResult[] {
  const results: HardwareTriggerResult[] = [];
  const hMm = cabinet.dimensions.height;
  const isSoftClose = cabinet.tags.includes('hardware:soft_close');

  // Rule: Hinge calculation by shutter height & unit type
  let hingeCountPerDoor = 2;
  if (hMm >= 1800) {
    hingeCountPerDoor = 5;
  } else if (hMm >= 1400) {
    hingeCountPerDoor = 4;
  } else if (hMm >= 900) {
    hingeCountPerDoor = 3;
  }

  const doorCount = cabinet.type.includes('double') ? 2 : cabinet.type === 'base_drawers' ? 0 : 1;
  const totalHinges = hingeCountPerDoor * doorCount;

  if (totalHinges > 0) {
    results.push({
      ruleName: `Hinge Rule (Height ${hMm}mm -> ${hingeCountPerDoor}/door)`,
      sku: isSoftClose ? 'BLUM-CLIP-TOP-BLUMOTION' : 'HETTICH-SLIDE-ON',
      description: isSoftClose ? 'Blum Soft-Close 110° Clip-Top Concealed Hinge' : 'Hettich Standard 110° Concealed Hinge',
      quantity: totalHinges,
      unitCost: isSoftClose ? 6.5 : 2.5,
      totalCost: totalHinges * (isSoftClose ? 6.5 : 2.5),
    });
  }

  // Rule: Drawer runners by depth
  if (cabinet.type === 'base_drawers') {
    const drawerCount = 3;
    const depthMm = cabinet.dimensions.depth;
    const runnerSize = depthMm >= 500 ? '500mm' : '450mm';
    results.push({
      ruleName: `Drawer Runner Rule (Depth ${depthMm}mm -> ${runnerSize} Tandem)`,
      sku: `TANDEMBOX-ANTARO-${runnerSize}`,
      description: `Blum Tandembox Soft-Close Drawer Runner (${runnerSize})`,
      quantity: drawerCount,
      unitCost: 38.0,
      totalCost: drawerCount * 38.0,
    });
  }

  // Rule: Adjustable Cabinet Legs (4 legs for <= 900mm width, 6 legs for > 900mm)
  if (!cabinet.type.startsWith('wall')) {
    const legCount = cabinet.dimensions.width > 900 ? 6 : 4;
    results.push({
      ruleName: `Leg Support Rule (Width ${cabinet.dimensions.width}mm -> ${legCount} legs)`,
      sku: 'PLINTH-LEG-100MM',
      description: 'Heavy duty adjustable PVC cabinet leveling feet (100mm)',
      quantity: legCount,
      unitCost: 1.8,
      totalCost: legCount * 1.8,
    });
  }

  // Rule: Handle hardware by profile tag
  const hasGola = cabinet.tags.includes('profile:gola');
  if (!hasGola && doorCount > 0) {
    results.push({
      ruleName: 'Surface Handle Rule',
      sku: 'HANDLE-EDGE-MB-160',
      description: 'Matte Black Anodized Aluminium Pull Handle',
      quantity: doorCount,
      unitCost: 4.5,
      totalCost: doorCount * 4.5,
    });
  }

  return results;
}

// ==========================================
// 4. PANEL SURFACE AREA CALCULATOR
// ==========================================
/**
 * Calculates total panel surface area (in sq.ft) of a cabinet
 * Carcass: 2 sides + bottom + top + back + 1 shelf
 * Shutters: Front face
 */
export function calculateCabinetPanelAreaSqFt(cabinet: CabinetItem): { carcassSqFt: number; shutterSqFt: number; totalSqFt: number } {
  const w = cabinet.dimensions.width / 1000;  // in meters
  const d = cabinet.dimensions.depth / 1000;
  const h = cabinet.dimensions.height / 1000;

  // Carcass panels area (m²)
  const sidePanels = 2 * (d * h);
  const topBottomPanels = 2 * (w * d);
  const backPanel = w * h;
  const internalShelf = w * d;
  const carcassSqM = sidePanels + topBottomPanels + backPanel + internalShelf;

  // Front Shutter area (m²)
  const shutterSqM = w * h;

  // 1 m² = 10.7639 sq.ft
  const carcassSqFt = carcassSqM * 10.7639;
  const shutterSqFt = shutterSqM * 10.7639;

  return {
    carcassSqFt: Math.round(carcassSqFt * 100) / 100,
    shutterSqFt: Math.round(shutterSqFt * 100) / 100,
    totalSqFt: Math.round((carcassSqFt + shutterSqFt) * 100) / 100,
  };
}

// ==========================================
// 5. LIVE BOQ (BILL OF QUANTITIES) ENGINE
// ==========================================
export function generateLiveBOQ(
  walls: Wall[],
  cabinets: CabinetItem[],
  rules: PricingRule[] = DEFAULT_PRICING_RULES
): {
  items: BOQItem[];
  totalCost: number;
  breakdown: {
    cabinetPanels: number;
    hardware: number;
    countertopAndSkirting: number;
    civilWalls: number;
  };
} {
  const items: BOQItem[] = [];
  let cabinetPanelsCost = 0;
  let hardwareCost = 0;
  let countertopSkirtingCost = 0;
  let civilWallsCost = 0;

  // 1. Process Cabinets with Tag-Based Pricing Rules
  cabinets.forEach((cab, idx) => {
    const area = calculateCabinetPanelAreaSqFt(cab);

    // Find matching pricing rule based on tags
    const matchedRule = rules.find(r =>
      cab.tags.includes(r.coreTag) &&
      cab.tags.includes(r.extFinishTag) &&
      cab.tags.includes(r.intFinishTag)
    ) || rules[0]; // fallback to first rule

    const panelCost = Math.round(area.totalSqFt * matchedRule.ratePerSqFt);
    cabinetPanelsCost += panelCost;

    items.push({
      id: `boq_cab_${cab.id}`,
      category: 'Carcass & Shutters',
      description: `${cab.name} (${cab.dimensions.width}W × ${cab.dimensions.depth}D × ${cab.dimensions.height}H mm)`,
      tags: cab.tags,
      unit: 'sq.ft',
      quantity: area.totalSqFt,
      rate: matchedRule.ratePerSqFt,
      amount: panelCost,
      notes: `Applied Rule: ${matchedRule.name}`,
    });

    // Hardware rule evaluation
    const hwList = evaluateHardwareRules(cab);
    hwList.forEach((hw, hwIdx) => {
      hardwareCost += hw.totalCost;
      items.push({
        id: `boq_hw_${cab.id}_${hwIdx}`,
        category: 'Hardware & Fittings',
        description: `${hw.description} [${hw.sku}]`,
        tags: cab.tags.filter(t => t.startsWith('hardware:')),
        unit: 'pcs',
        quantity: hw.quantity,
        rate: hw.unitCost,
        amount: hw.totalCost,
        notes: hw.ruleName,
      });
    });
  });

  // 2. Countertop & Skirting Rules for Base Cabinets
  const baseCabinets = cabinets.filter(c => !c.type.startsWith('wall'));
  if (baseCabinets.length > 0) {
    const totalBaseWidthM = baseCabinets.reduce((sum, c) => sum + c.dimensions.width, 0) / 1000;
    // Quartz countertop: 650mm depth
    const countertopSqFt = Math.round(totalBaseWidthM * 0.65 * 10.7639 * 100) / 100;
    const countertopCost = Math.round(countertopSqFt * 42.0); // $42 / sq.ft installed quartz
    countertopSkirtingCost += countertopCost;

    items.push({
      id: 'boq_countertop',
      category: 'Countertops & Skirting',
      description: 'Engineered Calacatta Quartz Countertop (20mm, polished edge)',
      tags: ['material:quartz', 'surface:countertop'],
      unit: 'sq.ft',
      quantity: countertopSqFt,
      rate: 42.0,
      amount: countertopCost,
      notes: 'Auto-calculated for continuous base units',
    });

    // Skirting / Plinth length in running meters
    const skirtingM = Math.round(totalBaseWidthM * 100) / 100;
    const skirtingCost = Math.round(skirtingM * 16.0);
    countertopSkirtingCost += skirtingCost;

    items.push({
      id: 'boq_skirting',
      category: 'Countertops & Skirting',
      description: 'Water-resistant PVC Plinth Skirting (100mm, with rubber lip)',
      tags: ['accessory:skirting'],
      unit: 'r.m',
      quantity: skirtingM,
      rate: 16.0,
      amount: skirtingCost,
      notes: 'Plinth cover for adjustable legs',
    });
  }

  // 3. Walls & Civil Finishing
  let totalWallAreaSqM = 0;
  walls.forEach(w => {
    const lenM = Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y) / 1000;
    const heightM = w.height / 1000;
    totalWallAreaSqM += lenM * heightM * 2; // two sides of the wall
  });
  const wallAreaSqFt = Math.round(totalWallAreaSqM * 10.7639 * 100) / 100;
  const paintCost = Math.round(wallAreaSqFt * 1.8);
  civilWallsCost += paintCost;

  if (wallAreaSqFt > 0) {
    items.push({
      id: 'boq_civil_paint',
      category: 'Civil / Walls',
      description: 'Interior Acrylic Emulsion Wall Painting (Primer + 2 coats)',
      tags: ['civil:paint'],
      unit: 'sq.ft',
      quantity: wallAreaSqFt,
      rate: 1.8,
      amount: paintCost,
      notes: 'Calculated from 3D extruded wall area',
    });
  }

  const totalCost = cabinetPanelsCost + hardwareCost + countertopSkirtingCost + civilWallsCost;

  return {
    items,
    totalCost,
    breakdown: {
      cabinetPanels: cabinetPanelsCost,
      hardware: hardwareCost,
      countertopAndSkirting: countertopSkirtingCost,
      civilWalls: civilWallsCost,
    },
  };
}
