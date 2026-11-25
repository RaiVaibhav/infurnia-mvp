# Infurnia Studio MVP — 2D/3D BIM & Parametric Modular Cabinetry

A client-side Proof-of-Concept prototype demonstrating the core architectural pillars of [Infurnia](https://infurnia.com):
1. **Interactive 2D Floor Plan Drafting:** Millimeter-grid snapping, orthogonal wall drawing, auto room-polygon & area detection.
2. **Instant 2D ⇄ 3D WebGL BIM Kernel (Three.js):** Real-time wall extrusion, floor generation, PBR materials, dynamic shadows, and orbit navigation.
3. **Parametric Modular Cabinetry Engine:** Carcass, adjustable shutters, pull-out drawers, adjustable legs, and sink units.
4. **Infurnia Tags & Rules Engine:**
   - **Tag-Based Panel Pricing Matrix:** Matches `Core Board` + `External Finish` + `Internal Finish` tags to calculate panel rate per sq.ft.
   - **Geometry-Driven Hardware Rules:** Dynamically calculates concealed hinge counts based on shutter height ($<900\text{mm} \to 2$, $900-1400\text{mm} \to 3$, $1400-1800\text{mm} \to 4$) and drawer runner lengths based on carcass depth.
5. **Live Bill of Quantities (BOQ):** Real-time cost recalculation as you stretch dimensions or change tags, with CSV and printable quotation exports.

---

## Quick Start (Run Locally)

```bash
# 1. Install dependencies
npm install

# 2. Start local Vite development server
npm run dev
```

Then open your browser at `http://localhost:5173`.

---

## Architectural Breakdown

```
src/
├── types/index.ts            # BIM schemas: Walls, Cabinets, Tags, Pricing Rules, BOQ
├── engine/
│   ├── geometry.ts           # 2D wall snapping, wall thickness polygons, room cycle detection
│   └── rulesEngine.ts        # Infurnia Tag-matching matrix & hardware calculation formulas
├── components/
│   ├── Viewport2D.tsx        # High-performance Canvas 2D drafting with mm grid & dimensions
│   ├── Viewport3D.tsx        # Three.js WebGL scene with extruded walls & parametric 3D meshes
│   ├── SidebarCatalog.tsx    # Modular base, overhead, drawer, and tall pantry units
│   ├── PropertyInspector.tsx # Parametric dimension sliders, tag toggles & active rule readout
│   ├── BOQModal.tsx          # Comprehensive live quotation table with CSV export
│   ├── RulesManagerModal.tsx # Rule matrix inspector explaining Infurnia's rule logic
│   └── HeaderBar.tsx         # 2D/3D view toggle, preset loader, live cost pill
├── presets/sampleProjects.ts # Pre-configured layouts: Modern L-Kitchen, Empty Studio
├── App.tsx                   # Central reactive state & localStorage synchronization
└── main.tsx                  # React 19 entry point
```

---

## Why No Backend is Needed for this MVP

- **Geometric Math & 3D Extrusion:** Runs 100% in WebGL via Three.js.
- **Parametric Calculations:** Handled synchronously in TypeScript.
- **Rules & BOQ Engine:** Evaluated dynamically client-side in microseconds.
- **Persistence:** Automatically saves project state to browser `localStorage`.
- **When a backend IS needed later:** User auth, cloud project sharing, team real-time collaboration (WebSockets / CRDTs), and photorealistic server-side raytracing clusters.
