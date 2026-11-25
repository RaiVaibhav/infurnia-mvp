import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Wall, CabinetItem } from '../types';
import { Eye, RotateCcw, Layers, Compass } from 'lucide-react';

interface Viewport3DProps {
  walls: Wall[];
  cabinets: CabinetItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  ceilingHeight: number;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  walls,
  cabinets,
  selectedId,
  onSelect,
  ceilingHeight,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Setup Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene with Infurnia's Clean Light Architectural Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e9edf2');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(2.8, 3.8, 5.8);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and soft shadow map
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below floor
    controls.minDistance = 1;
    controls.maxDistance = 25;
    controls.target.set(2, 0.9, 1.5);
    controlsRef.current = controls;

    // 5. Clean Architectural Studio Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#f8fafc', '#e2e8f0', 0.9);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    // Warm sun light for architectural depth
    const sunLight = new THREE.DirectionalLight('#fffaf0', 1.8);
    sunLight.position.set(6, 9, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -7;
    sunLight.shadow.camera.right = 7;
    sunLight.shadow.camera.top = 7;
    sunLight.shadow.camera.bottom = -7;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Soft architectural fill light
    const fillLight = new THREE.DirectionalLight('#e0f2fe', 0.7);
    fillLight.position.set(-5, 6, -4);
    scene.add(fillLight);

    // 6. Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Meshes whenever state changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const toRemove: THREE.Object3D[] = [];
    scene.traverse(obj => {
      if (obj.userData?.isDynamic) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach(obj => scene.remove(obj));

    // 1. Extruded 3D Walls (Clean Architectural Plaster)
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.9,
      metalness: 0.05,
    });

    const selectedWallMaterial = new THREE.MeshStandardMaterial({
      color: '#93c5fd',
      roughness: 0.7,
      metalness: 0.1,
    });

    walls.forEach(w => {
      const x1 = w.start.x / 1000;
      const z1 = w.start.y / 1000;
      const x2 = w.end.x / 1000;
      const z2 = w.end.y / 1000;

      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      if (len === 0) return;

      const angle = Math.atan2(dz, dx);
      const h = (w.height || ceilingHeight) / 1000;
      const t = w.thickness / 1000;

      const wallGeo = new THREE.BoxGeometry(len, h, t);
      const isSelected = selectedId === w.id;
      const mesh = new THREE.Mesh(wallGeo, isSelected ? selectedWallMaterial : wallMaterial);

      mesh.position.set((x1 + x2) / 2, h / 2, (z1 + z2) / 2);
      mesh.rotation.y = -angle;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { isDynamic: true, id: w.id, type: 'wall' };

      // Edges helper for crisp CAD look
      const edges = new THREE.EdgesGeometry(wallGeo);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#cbd5e1' }));
      mesh.add(line);

      scene.add(mesh);
    });

    // 2. Architectural Floor Plane (Neutral Light Porcelain Tile)
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#f1f5f9',
      roughness: 0.5,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(2, 0, 2);
    floorMesh.receiveShadow = true;
    floorMesh.userData = { isDynamic: true, type: 'floor' };
    scene.add(floorMesh);

    // Subtle CAD floor grid
    const gridHelper = new THREE.GridHelper(16, 32, '#93c5fd', '#e2e8f0');
    gridHelper.position.set(2, 0.003, 2);
    gridHelper.userData = { isDynamic: true };
    scene.add(gridHelper);

    // 3. Parametric Modular Cabinets
    cabinets.forEach(cab => {
      const isSelected = selectedId === cab.id;
      const group = new THREE.Group();
      group.userData = { isDynamic: true, id: cab.id, type: 'cabinet' };

      const w = cab.dimensions.width / 1000;
      const d = cab.dimensions.depth / 1000;
      const h = cab.dimensions.height / 1000;
      const elev = cab.elevation / 1000;
      const isWallUnit = cab.type.startsWith('wall');

      // Finish Material resolution based on tags
      const hasAcrylic = cab.tags.includes('ext:gloss_acrylic');
      const hasPU = cab.tags.includes('ext:pu_lacquer');
      const hasVeneer = cab.tags.includes('ext:natural_veneer');

      let shutterColor = '#2563eb';
      let roughness = 0.5;
      let metalness = 0.1;

      if (hasAcrylic) {
        shutterColor = '#1e40af'; // deep rich navy acrylic
        roughness = 0.08;
        metalness = 0.2;
      } else if (hasPU) {
        shutterColor = '#334155'; // satin slate
        roughness = 0.35;
      } else if (hasVeneer) {
        shutterColor = '#92400e'; // rich warm teak wood
        roughness = 0.6;
      } else {
        shutterColor = '#2563eb'; // royal blue matte laminate
        roughness = 0.75;
      }

      if (isSelected) {
        shutterColor = '#3b82f6';
      }

      const shutterMat = new THREE.MeshStandardMaterial({
        color: shutterColor,
        roughness: roughness,
        metalness: metalness,
      });

      const carcassMat = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.8,
        metalness: 0.05,
      });

      // Carcass Box
      const carcassGeo = new THREE.BoxGeometry(w, h, d);
      const carcassMesh = new THREE.Mesh(carcassGeo, carcassMat);
      carcassMesh.position.set(0, h / 2, 0);
      carcassMesh.castShadow = true;
      carcassMesh.receiveShadow = true;
      group.add(carcassMesh);

      // Plinth (Base units)
      if (!isWallUnit) {
        const plinthH = 0.1;
        const plinthGeo = new THREE.BoxGeometry(w * 0.98, plinthH, d * 0.9);
        const plinthMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.9 });
        const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
        plinthMesh.position.set(0, plinthH / 2, 0.02);
        group.add(plinthMesh);
      }

      // Shutters & Doors
      const doorCount = cab.type.includes('double') ? 2 : cab.type === 'base_drawers' ? 0 : 1;
      const doorThickness = 0.018;

      if (doorCount === 1) {
        const doorW = w - 0.004;
        const doorH = isWallUnit ? h - 0.004 : h - 0.1 - 0.004;
        const doorGeo = new THREE.BoxGeometry(doorW, doorH, doorThickness);
        const doorMesh = new THREE.Mesh(doorGeo, shutterMat);

        const doorPivot = new THREE.Group();
        const pivotY = isWallUnit ? h / 2 : 0.1 + doorH / 2;
        doorPivot.position.set(-w / 2, pivotY, d / 2);
        doorMesh.position.set(doorW / 2, 0, doorThickness / 2);

        if (cab.isOpen) doorPivot.rotation.y = -Math.PI / 2.5;

        // Handle
        if (!cab.tags.includes('profile:gola')) {
          const handleGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.14, 12);
          const handleMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.2, metalness: 0.8 });
          const handle = new THREE.Mesh(handleGeo, handleMat);
          handle.position.set(doorW - 0.04, 0, doorThickness + 0.015);
          doorMesh.add(handle);
        }

        doorPivot.add(doorMesh);
        group.add(doorPivot);
      } else if (doorCount === 2) {
        const doorW = w / 2 - 0.004;
        const doorH = isWallUnit ? h - 0.004 : h - 0.1 - 0.004;
        const pivotY = isWallUnit ? h / 2 : 0.1 + doorH / 2;

        // Left Door
        const leftPivot = new THREE.Group();
        leftPivot.position.set(-w / 2, pivotY, d / 2);
        const leftDoor = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorThickness), shutterMat);
        leftDoor.position.set(doorW / 2, 0, doorThickness / 2);
        if (cab.isOpen) leftPivot.rotation.y = -Math.PI / 2.5;
        leftPivot.add(leftDoor);
        group.add(leftPivot);

        // Right Door
        const rightPivot = new THREE.Group();
        rightPivot.position.set(w / 2, pivotY, d / 2);
        const rightDoor = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorThickness), shutterMat);
        rightDoor.position.set(-doorW / 2, 0, doorThickness / 2);
        if (cab.isOpen) rightPivot.rotation.y = Math.PI / 2.5;
        rightPivot.add(rightDoor);
        group.add(rightPivot);
      } else if (cab.type === 'base_drawers') {
        const drawerH = (h - 0.1) / 3 - 0.004;
        for (let i = 0; i < 3; i++) {
          const drawerGeo = new THREE.BoxGeometry(w - 0.006, drawerH, doorThickness);
          const drawerMesh = new THREE.Mesh(drawerGeo, shutterMat);
          const drawerY = 0.1 + drawerH / 2 + i * (drawerH + 0.004);
          const zSlide = cab.isOpen ? 0.35 : 0;
          drawerMesh.position.set(0, drawerY, d / 2 + doorThickness / 2 + zSlide);

          const barGeo = new THREE.BoxGeometry(w * 0.45, 0.012, 0.016);
          const barMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.2, metalness: 0.8 });
          const bar = new THREE.Mesh(barGeo, barMat);
          bar.position.set(0, 0, doorThickness / 2 + 0.01);
          drawerMesh.add(bar);

          group.add(drawerMesh);
        }
      }

      // Countertop for Base Units (Engineered Quartz Slab)
      if (!isWallUnit && cab.type !== 'tall_pantry') {
        const topOverhang = 0.02;
        const topGeo = new THREE.BoxGeometry(w + 0.002, 0.025, d + topOverhang);
        const topMat = new THREE.MeshStandardMaterial({
          color: '#ffffff',
          roughness: 0.2,
          metalness: 0.1,
        });
        const topMesh = new THREE.Mesh(topGeo, topMat);
        topMesh.position.set(0, h + 0.025 / 2, topOverhang / 2);
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        group.add(topMesh);

        if (cab.type === 'sink_unit') {
          const sinkGeo = new THREE.BoxGeometry(w * 0.7, 0.01, d * 0.6);
          const sinkMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.2, metalness: 0.9 });
          const sink = new THREE.Mesh(sinkGeo, sinkMat);
          sink.position.set(0, h + 0.026, 0);
          group.add(sink);

          const faucetGeo = new THREE.TorusGeometry(0.08, 0.01, 8, 24, Math.PI);
          const faucetMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1, metalness: 0.95 });
          const faucet = new THREE.Mesh(faucetGeo, faucetMat);
          faucet.position.set(0, h + 0.15, -d * 0.15);
          faucet.rotation.z = Math.PI;
          group.add(faucet);
        }
      }

      group.position.set(cab.position.x / 1000, elev, cab.position.y / 1000);
      group.rotation.y = (-cab.rotation * Math.PI) / 180;
      scene.add(group);
    });
  }, [walls, cabinets, selectedId, ceilingHeight]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!container || !camera || !scene) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const intersects = raycasterRef.current.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      let hit = intersects[0].object;
      while (hit && !hit.userData?.id && hit.parent && hit.parent !== scene) {
        hit = hit.parent;
      }
      if (hit?.userData?.id) {
        onSelect(hit.userData.id);
        return;
      }
    }
  };

  const setCameraPreset = (preset: 'perspective' | 'top' | 'iso') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (preset === 'perspective') {
      camera.position.set(2.8, 3.8, 5.8);
      controls.target.set(2, 0.9, 1.5);
    } else if (preset === 'top') {
      camera.position.set(2, 7.5, 2.01);
      controls.target.set(2, 0, 2);
    } else if (preset === 'iso') {
      camera.position.set(5.5, 5.5, 5.5);
      controls.target.set(2, 1, 2);
    }
    controls.update();
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-[#e9edf2]"
    >
      {/* Floating 3D Navigation Controls */}
      <div className="absolute top-4 left-4 flex items-center space-x-1.5 bg-white/95 backdrop-blur border border-slate-200 p-1 rounded-lg shadow-sm z-10">
        <button
          onClick={() => setCameraPreset('perspective')}
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors font-medium"
          title="3D Eye-Level Perspective View"
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Eye-level</span>
        </button>

        <button
          onClick={() => setCameraPreset('iso')}
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors font-medium"
          title="Axonometric Isometric View"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Isometric</span>
        </button>

        <button
          onClick={() => setCameraPreset('top')}
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors font-medium"
          title="Top Down 3D View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          <span>Top-Down</span>
        </button>
      </div>

      {/* Floating ViewCube Controller in Top Right Corner */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-lg shadow-sm text-center select-none z-10">
        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>ViewCube</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[11px] font-semibold text-slate-700">
          <button
            onClick={() => setCameraPreset('top')}
            className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded"
          >
            TOP
          </button>
          <button
            onClick={() => setCameraPreset('iso')}
            className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded"
          >
            ISO
          </button>
        </div>
      </div>

      {/* 3D Navigation Guide Pill */}
      <div className="absolute bottom-2 left-4 text-[11px] text-slate-600 bg-white/90 backdrop-blur px-3 py-1 rounded-md border border-slate-200 pointer-events-none">
        <span className="text-blue-600 font-semibold">Left-Click:</span> Orbit |{' '}
        <span className="text-emerald-600 font-semibold">Right-Click:</span> Pan |{' '}
        <span className="text-amber-600 font-semibold">Scroll:</span> Zoom |{' '}
        <span className="text-purple-600 font-semibold">Click Unit:</span> Select
      </div>
    </div>
  );
};
