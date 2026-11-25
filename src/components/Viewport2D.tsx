import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Wall, CabinetItem, Point2D } from '../types';
import { snapToGrid, snapAngle, distance, getWallPolygon2D, detectRooms, isPointNearSegment } from '../engine/geometry';
import { Plus, Trash2, RotateCw, ZoomIn, ZoomOut, Maximize2, MousePointer, PenTool } from 'lucide-react';

interface Viewport2DProps {
  walls: Wall[];
  cabinets: CabinetItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAddWall: (wall: Wall) => void;
  onUpdateCabinetPos: (id: string, pos: { x: number; y: number }) => void;
  onRotateCabinet: (id: string) => void;
  onDeleteSelected: () => void;
  tool: 'select' | 'wall';
  setTool: (tool: 'select' | 'wall') => void;
}

export const Viewport2D: React.FC<Viewport2DProps> = ({
  walls,
  cabinets,
  selectedId,
  onSelect,
  onAddWall,
  onUpdateCabinetPos,
  onRotateCabinet,
  onDeleteSelected,
  tool,
  setTool,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Viewport transform (Pan & Zoom)
  const [scale, setScale] = useState(0.12);
  const [offset, setOffset] = useState<Point2D>({ x: 180, y: 140 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point2D>({ x: 0, y: 0 });

  // Tool state
  const [drawingStart, setDrawingStart] = useState<Point2D | null>(null);
  const [cursorPos, setCursorPos] = useState<Point2D>({ x: 0, y: 0 });

  // Dragging cabinet state
  const [draggingCabinetId, setDraggingCabinetId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point2D>({ x: 0, y: 0 });

  // Convert Screen coordinates to World mm
  const screenToWorld = useCallback((screenX: number, screenY: number): Point2D => {
    return {
      x: (screenX - offset.x) / scale,
      y: (screenY - offset.y) / scale,
    };
  }, [offset, scale]);

  // Convert World mm to Screen coordinates
  const worldToScreen = useCallback((worldX: number, worldY: number): Point2D => {
    return {
      x: worldX * scale + offset.x,
      y: worldY * scale + offset.y,
    };
  }, [offset, scale]);

  // Redraw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 600;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Infurnia Crisp Light Architectural Canvas Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // 2. CAD Grid (Light clean grid lines)
    const minX = -offset.x / scale;
    const maxX = (width - offset.x) / scale;
    const minY = -offset.y / scale;
    const maxY = (height - offset.y) / scale;

    const minorStep = 200; // 200mm minor grid
    const majorStep = 1000; // 1000mm major grid

    ctx.lineWidth = 1;

    // Minor grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    const startX = Math.floor(minX / minorStep) * minorStep;
    const endX = Math.ceil(maxX / minorStep) * minorStep;
    for (let x = startX; x <= endX; x += minorStep) {
      const sx = x * scale + offset.x;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    const startY = Math.floor(minY / minorStep) * minorStep;
    const endY = Math.ceil(maxY / minorStep) * minorStep;
    for (let y = startY; y <= endY; y += minorStep) {
      const sy = y * scale + offset.y;
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // Major grid lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    const startMajX = Math.floor(minX / majorStep) * majorStep;
    const endMajX = Math.ceil(maxX / majorStep) * majorStep;
    for (let x = startMajX; x <= endMajX; x += majorStep) {
      const sx = x * scale + offset.x;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    const startMajY = Math.floor(minY / majorStep) * majorStep;
    const endMajY = Math.ceil(maxY / majorStep) * majorStep;
    for (let y = startMajY; y <= endMajY; y += majorStep) {
      const sy = y * scale + offset.y;
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // 3. Room Floor Polygons & Area Stamp
    const rooms = detectRooms(walls);
    rooms.forEach(room => {
      if (room.vertices.length >= 3) {
        ctx.beginPath();
        const first = worldToScreen(room.vertices[0].x, room.vertices[0].y);
        ctx.moveTo(first.x, first.y);
        for (let i = 1; i < room.vertices.length; i++) {
          const pt = worldToScreen(room.vertices[i].x, room.vertices[i].y);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.04)';
        ctx.fill();

        // Room Stamp Badge
        const cx = room.vertices.reduce((s, p) => s + p.x, 0) / room.vertices.length;
        const cy = room.vertices.reduce((s, p) => s + p.y, 0) / room.vertices.length;
        const screenCenter = worldToScreen(cx, cy);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(room.name.toUpperCase(), screenCenter.x, screenCenter.y - 12);
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText(`${room.areaSqM} m²  (${Math.round(room.areaSqM * 10.7639)} sq.ft)`, screenCenter.x, screenCenter.y + 8);
      }
    });

    // 4. Walls (Architectural CAD Styling)
    walls.forEach(w => {
      const isSelected = selectedId === w.id;
      const poly = getWallPolygon2D(w);
      if (poly.length === 4) {
        ctx.beginPath();
        const p0 = worldToScreen(poly[0].x, poly[0].y);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < 4; i++) {
          const pt = worldToScreen(poly[i].x, poly[i].y);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();

        // Architectural Wall Fill (Dark Charcoal or Highlighted Blue)
        ctx.fillStyle = isSelected ? '#3b82f6' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#1d4ed8' : '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Architectural Dimension Line with witness marks
        const mx = (w.start.x + w.end.x) / 2;
        const my = (w.start.y + w.end.y) / 2;
        const sm = worldToScreen(mx, my);
        const len = Math.round(distance(w.start, w.end));

        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${len} mm`, sm.x, sm.y - 14);
      }
    });

    // 5. Active Wall Drawing Guideline
    if (tool === 'wall' && drawingStart) {
      const snappedCurrent = snapAngle(drawingStart, cursorPos);
      const sStart = worldToScreen(drawingStart.x, drawingStart.y);
      const sEnd = worldToScreen(snappedCurrent.x, snappedCurrent.y);

      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(sStart.x, sStart.y);
      ctx.lineTo(sEnd.x, sEnd.y);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(sStart.x, sStart.y, 4, 0, Math.PI * 2);
      ctx.arc(sEnd.x, sEnd.y, 4, 0, Math.PI * 2);
      ctx.fill();

      const dist = Math.round(distance(drawingStart, snappedCurrent));
      const mid = { x: (sStart.x + sEnd.x) / 2, y: (sStart.y + sEnd.y) / 2 };
      ctx.fillStyle = '#1d4ed8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${dist} mm`, mid.x + 10, mid.y - 10);
    }

    // 6. Modular Cabinets (Architectural Footprints)
    cabinets.forEach(cab => {
      const isSelected = selectedId === cab.id;
      const isWallUnit = cab.type.startsWith('wall');
      const w = cab.dimensions.width;
      const d = cab.dimensions.depth;

      const sc = worldToScreen(cab.position.x, cab.position.y);
      const sw = w * scale;
      const sd = d * scale;

      ctx.save();
      ctx.translate(sc.x, sc.y);
      ctx.rotate((cab.rotation * Math.PI) / 180);

      ctx.beginPath();
      ctx.rect(-sw / 2, -sd / 2, sw, sd);

      if (isSelected) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
      } else if (isWallUnit) {
        // Dashed lines for overhead units
        ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
      }

      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      // Front Shutter Line (Heavy edge showing door direction)
      ctx.beginPath();
      ctx.moveTo(-sw / 2, sd / 2);
      ctx.lineTo(sw / 2, sd / 2);
      ctx.strokeStyle = isSelected ? '#1d4ed8' : '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Drawer Lines or Details
      if (cab.type === 'base_drawers') {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-sw / 2, -sd / 6);
        ctx.lineTo(sw / 2, -sd / 6);
        ctx.moveTo(-sw / 2, sd / 6);
        ctx.lineTo(sw / 2, sd / 6);
        ctx.stroke();
      }

      // Name & Dimensions
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${w}×${d}`, 0, 0);

      ctx.restore();
    });

    ctx.restore();
  }, [walls, cabinets, selectedId, scale, offset, tool, drawingStart, cursorPos, worldToScreen]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const worldPt = screenToWorld(sx, sy);

    if (e.button === 1 || e.button === 2 || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: sx - offset.x, y: sy - offset.y });
      return;
    }

    if (e.button === 0) {
      if (tool === 'wall') {
        const snapped = {
          x: snapToGrid(worldPt.x),
          y: snapToGrid(worldPt.y),
        };

        if (!drawingStart) {
          setDrawingStart(snapped);
        } else {
          const snappedEnd = snapAngle(drawingStart, snapped);
          if (distance(drawingStart, snappedEnd) > 200) {
            onAddWall({
              id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              start: drawingStart,
              end: snappedEnd,
              thickness: 150,
              height: 2800,
            });
            setDrawingStart(snappedEnd);
          }
        }
      } else {
        // Selection Mode
        let hitCabinet: CabinetItem | null = null;
        for (const cab of cabinets) {
          const halfW = cab.dimensions.width / 2;
          const halfD = cab.dimensions.depth / 2;
          if (
            worldPt.x >= cab.position.x - halfW &&
            worldPt.x <= cab.position.x + halfW &&
            worldPt.y >= cab.position.y - halfD &&
            worldPt.y <= cab.position.y + halfD
          ) {
            hitCabinet = cab;
            break;
          }
        }

        if (hitCabinet) {
          onSelect(hitCabinet.id);
          setDraggingCabinetId(hitCabinet.id);
          setDragOffset({
            x: worldPt.x - hitCabinet.position.x,
            y: worldPt.y - hitCabinet.position.y,
          });
          return;
        }

        let hitWall: Wall | null = null;
        for (const w of walls) {
          if (isPointNearSegment(worldPt, w.start, w.end, w.thickness / 2 + 100)) {
            hitWall = w;
            break;
          }
        }

        if (hitWall) {
          onSelect(hitWall.id);
        } else {
          onSelect(null);
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (isPanning) {
      setOffset({
        x: sx - panStart.x,
        y: sy - panStart.y,
      });
      return;
    }

    const worldPt = screenToWorld(sx, sy);
    setCursorPos({
      x: snapToGrid(worldPt.x),
      y: snapToGrid(worldPt.y),
    });

    if (draggingCabinetId) {
      const newPos = {
        x: snapToGrid(worldPt.x - dragOffset.x),
        y: snapToGrid(worldPt.y - dragOffset.y),
      };
      onUpdateCabinetPos(draggingCabinetId, newPos);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingCabinetId(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newScale = Math.max(0.04, Math.min(0.6, scale * zoomFactor));

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setOffset({
      x: mouseX - (mouseX - offset.x) * (newScale / scale),
      y: mouseY - (mouseY - offset.y) * (newScale / scale),
    });
    setScale(newScale);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f8fafc]">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
      />

      {/* Floating 2D Controls Bar */}
      <div className="absolute top-4 left-4 flex items-center space-x-1.5 bg-white/95 backdrop-blur border border-slate-200 p-1 rounded-lg shadow-sm">
        <button
          onClick={() => { setTool('select'); setDrawingStart(null); }}
          className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            tool === 'select' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Select & Move Tool"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Select</span>
        </button>

        <button
          onClick={() => { setTool('wall'); onSelect(null); }}
          className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            tool === 'wall' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Draw Continuous 3D Parametric Walls"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Draw Wall</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-1" />

        {selectedId && (
          <>
            <button
              onClick={() => onRotateCabinet(selectedId)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={onDeleteSelected}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Delete Selected"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-5 bg-slate-200 mx-1" />
          </>
        )}

        <button
          onClick={() => setScale(s => Math.min(0.6, s * 1.2))}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale(s => Math.max(0.04, s * 0.8))}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setScale(0.12); setOffset({ x: 180, y: 140 }); }}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
          title="Reset Zoom"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Instruction banner */}
      {tool === 'wall' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center space-x-2">
          <span>Click to place wall corners (orthogonal 90° snap). Click Done or select to finish.</span>
          <button
            onClick={() => { setTool('select'); setDrawingStart(null); }}
            className="ml-2 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[11px]"
          >
            Done
          </button>
        </div>
      )}

      {/* Infurnia CAD Status Footer */}
      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-500 bg-white/90 backdrop-blur px-3 py-1 rounded border border-slate-200">
        <div>
          <span>CURSOR: </span>
          <span className="font-semibold text-slate-800">X: {cursorPos.x}mm | Y: {cursorPos.y}mm</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>SNAP: <strong className="text-blue-600 font-bold">50mm</strong></span>
          <span>ORTHO: <strong className="text-emerald-600 font-bold">ON</strong></span>
          <span>UNITS: <strong className="text-slate-800">MILLIMETERS</strong></span>
          <span>SCALE: <strong>1:50</strong></span>
        </div>
      </div>
    </div>
  );
};
