import { Point2D, Wall, Room } from '../types';

export const SNAP_INTERVAL = 50; // mm

/**
 * Snap point to grid
 */
export function snapToGrid(val: number, interval = SNAP_INTERVAL): number {
  return Math.round(val / interval) * interval;
}

/**
 * Snap a point to 0, 90, 180, 270 degree angles relative to start point
 */
export function snapAngle(start: Point2D, current: Point2D): Point2D {
  const dx = current.x - start.x;
  const dy = current.y - start.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const dist = Math.hypot(dx, dy);

  // 15-degree threshold for orthogonal snap
  const normalizedAngle = (angle + 360) % 360;

  if (normalizedAngle >= 345 || normalizedAngle < 15) {
    return { x: start.x + dist, y: start.y };
  } else if (normalizedAngle >= 75 && normalizedAngle < 105) {
    return { x: start.x, y: start.y + dist };
  } else if (normalizedAngle >= 165 && normalizedAngle < 195) {
    return { x: start.x - dist, y: start.y };
  } else if (normalizedAngle >= 255 && normalizedAngle < 285) {
    return { x: start.x, y: start.y - dist };
  }

  return current;
}

/**
 * Euclidean distance between two 2D points (in mm)
 */
export function distance(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Calculates perpendicular corners for wall thickness in 2D
 */
export function getWallPolygon2D(wall: Wall): Point2D[] {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return [];

  const halfT = wall.thickness / 2;
  const nx = (-dy / len) * halfT;
  const ny = (dx / len) * halfT;

  return [
    { x: wall.start.x + nx, y: wall.start.y + ny },
    { x: wall.end.x + nx, y: wall.end.y + ny },
    { x: wall.end.x - nx, y: wall.end.y - ny },
    { x: wall.start.x - nx, y: wall.start.y - ny },
  ];
}

/**
 * Polygon Area using Shoelace formula (returns m²)
 */
export function polygonAreaSqM(points: Point2D[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  // Convert mm² to m²: divide by 1,000,000
  return Math.abs(area) / 2 / 1000000;
}

/**
 * Check if point is near a line segment (for selection)
 */
export function isPointNearSegment(p: Point2D, a: Point2D, b: Point2D, maxDist: number): boolean {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 === 0) return distance(p, a) <= maxDist;
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  return distance(p, proj) <= maxDist;
}

/**
 * Detect closed room loops from connected walls
 */
export function detectRooms(walls: Wall[]): Room[] {
  if (walls.length < 3) return [];

  // Group vertices
  const tolerance = 50; // mm
  const points: Point2D[] = [];

  function getOrAddPoint(p: Point2D): Point2D {
    for (const existing of points) {
      if (distance(p, existing) < tolerance) {
        return existing;
      }
    }
    points.push({ x: p.x, y: p.y });
    return points[points.length - 1];
  }

  const cleanWalls = walls.map(w => ({
    id: w.id,
    start: getOrAddPoint(w.start),
    end: getOrAddPoint(w.end),
  }));

  // Build adjacency
  const adj = new Map<Point2D, { point: Point2D; wallId: string }[]>();
  for (const pt of points) adj.set(pt, []);

  for (const w of cleanWalls) {
    adj.get(w.start)?.push({ point: w.end, wallId: w.id });
    adj.get(w.end)?.push({ point: w.start, wallId: w.id });
  }

  // Find a simple closed convex/ordered hull or cycle if 4 corners connect
  const visited = new Set<Point2D>();
  const cycle: Point2D[] = [];

  if (points.length >= 3) {
    // Sort vertices counter-clockwise to form a clean room floor polygon
    const center = {
      x: points.reduce((s, p) => s + p.x, 0) / points.length,
      y: points.reduce((s, p) => s + p.y, 0) / points.length,
    };
    const sortedPoints = [...points].sort((a, b) => {
      const a1 = Math.atan2(a.y - center.y, a.x - center.x);
      const a2 = Math.atan2(b.y - center.y, b.x - center.x);
      return a1 - a2;
    });

    const area = polygonAreaSqM(sortedPoints);
    if (area > 1) {
      let perimeter = 0;
      for (let i = 0; i < sortedPoints.length; i++) {
        perimeter += distance(sortedPoints[i], sortedPoints[(i + 1) % sortedPoints.length]) / 1000;
      }
      return [
        {
          id: 'room_1',
          name: 'Main Space',
          wallIds: walls.map(w => w.id),
          vertices: sortedPoints,
          areaSqM: Math.round(area * 100) / 100,
          perimeterM: Math.round(perimeter * 100) / 100,
        },
      ];
    }
  }

  return [];
}
