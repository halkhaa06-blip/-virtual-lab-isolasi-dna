import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TableId, TableStatus } from '../../types/lab';
import { 
  Play, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  MousePointerClick
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface VirtualLab3DProps {
  tableStatus: TableStatus;
  onEnterTable: (tableId: TableId) => void;
  externalMoveVector?: { x: number; y: number } | null;
  autoNavigateTarget?: TableId | null;
  onAutoNavigateArrived?: (tableId: TableId) => void;
  transitionMessage?: string | null;
  initialPlayerX?: number;
  onOpenInquiry?: (step?: 1 | 2 | 3 | 4 | 5 | 6) => void;
}

interface NearTableInfo {
  id: TableId;
  name: string;
  isLocked: boolean;
  isDone: boolean;
  screenX: number;
  screenY: number;
  instruction: string;
  shortGoal: string;
}

export const VirtualLab3D: React.FC<VirtualLab3DProps> = ({
  tableStatus,
  onEnterTable,
  externalMoveVector,
  autoNavigateTarget,
  onAutoNavigateArrived,
  transitionMessage,
  initialPlayerX = 0,
  onOpenInquiry,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Stable refs for external inputs to prevent costly Three.js scene recreation
  const externalMoveVectorRef = useRef(externalMoveVector);
  useEffect(() => {
    externalMoveVectorRef.current = externalMoveVector;
  }, [externalMoveVector]);

  const onOpenInquiryRef = useRef(onOpenInquiry);
  useEffect(() => {
    onOpenInquiryRef.current = onOpenInquiry;
  }, [onOpenInquiry]);

  const tableStatusRef = useRef(tableStatus);
  useEffect(() => {
    tableStatusRef.current = tableStatus;
  }, [tableStatus]);

  const onEnterTableRef = useRef(onEnterTable);
  useEffect(() => {
    onEnterTableRef.current = onEnterTable;
  }, [onEnterTable]);

  const autoNavigateTargetRef = useRef(autoNavigateTarget);
  useEffect(() => {
    autoNavigateTargetRef.current = autoNavigateTarget;
    if (autoNavigateTarget) {
      setArrivedTable(null);
      hasNotifiedArrivedRef.current = false;
    }
  }, [autoNavigateTarget]);

  const onAutoNavigateArrivedRef = useRef(onAutoNavigateArrived);
  useEffect(() => {
    onAutoNavigateArrivedRef.current = onAutoNavigateArrived;
  }, [onAutoNavigateArrived]);

  const [arrivedTable, setArrivedTable] = useState<TableId | null>(null);
  const hasNotifiedArrivedRef = useRef(false);

  // Player state: starts in the aisle so commands only appear when walking up to a table
  const playerRef = useRef({
    x: initialPlayerX,
    z: 2.5,
    rotation: 0,
    speed: 3.8,
    isMoving: false,
    walkCycle: 0,
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const nearTableRef = useRef<NearTableInfo | null>(null);
  const [nearTable, setNearTable] = useState<NearTableInfo | null>(null);

  // Table coordinates matching the reference image
  const getTablesConfig = () => [
    {
      id: 'table1' as TableId,
      name: 'MEJA 1 — PERSIAPAN & EKSTRAKSI DNA',
      pos: new THREE.Vector3(-4.0, 0, -0.4),
      isUnlocked: true,
      isDone: tableStatusRef.current.table1Completed,
    },
    {
      id: 'table2' as TableId,
      name: 'MEJA 2 — SENTRIFUGASI & PEMISAHAN DNA',
      pos: new THREE.Vector3(0, 0, -0.4),
      isUnlocked: true,
      isDone: tableStatusRef.current.table2Completed,
    },
    {
      id: 'table3' as TableId,
      name: 'MEJA 3 — SPEKTROFOTOMETRI UV-VIS',
      pos: new THREE.Vector3(4.0, 0, -0.4),
      isUnlocked: true,
      isDone: tableStatusRef.current.table3Completed,
    },
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software GL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene setup with soft pastel lab ambiance
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#dbeafe'); // soft sky blue outside
    scene.fog = new THREE.Fog('#dbeafe', 18, 35);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      60
    );
    // Camera angle matching reference image (wide view showing all 3 tables & back blackboard)
    camera.position.set(0, 4.4, 7.8);
    camera.lookAt(0, 1.4, -1.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting matching bright, friendly lab
    const hemiLight = new THREE.HemisphereLight('#ffffff', '#bfdbfe', 0.9);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const mainLight = new THREE.DirectionalLight('#ffffff', 1.3);
    mainLight.position.set(5, 12, 8);
    if (!isSoftwareGl) {
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      mainLight.shadow.bias = -0.0005;
    }
    scene.add(mainLight);

    const softFillLight = new THREE.DirectionalLight('#e0f2fe', 0.6);
    softFillLight.position.set(-8, 6, -4);
    scene.add(softFillLight);

    // Procedural Floor Tiles Texture (Clean lilac/grey grid)
    const makeFloorTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#e2e8f0'; // pastel lab floor
      ctx.fillRect(0, 0, 512, 512);

      // Tile grout lines
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(3, 3, 250, 250);
      ctx.strokeRect(259, 3, 250, 250);
      ctx.strokeRect(3, 259, 250, 250);
      ctx.strokeRect(259, 259, 250, 250);

      // Inner tile fill
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(6, 6, 244, 244);
      ctx.fillRect(262, 6, 244, 244);
      ctx.fillRect(6, 262, 244, 244);
      ctx.fillRect(262, 262, 244, 244);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10, 8);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };

    // Floor Mesh
    const floorGeo = new THREE.PlaneGeometry(28, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      map: makeFloorTexture(),
      roughness: 0.3,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // Wall Materials
    const wallUpperMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      roughness: 0.5,
    });
    const wallBaseTrimMat = new THREE.MeshStandardMaterial({
      color: '#2563eb', // Royal blue lab trim matching image
      roughness: 0.3,
      metalness: 0.1,
    });

    // Back Wall
    const backWallGroup = new THREE.Group();
    backWallGroup.position.set(0, 0, -6.5);

    // Upper white wall
    const backWallUpper = new THREE.Mesh(new THREE.BoxGeometry(26, 4.5, 0.4), wallUpperMat);
    backWallUpper.position.set(0, 3.8, 0);
    backWallGroup.add(backWallUpper);

    // Lower blue wainscoting
    const backWallLower = new THREE.Mesh(new THREE.BoxGeometry(26, 1.8, 0.42), wallBaseTrimMat);
    backWallLower.position.set(0, 0.9, 0);
    backWallGroup.add(backWallLower);

    scene.add(backWallGroup);

    // Ceiling with recessed warm lights
    const ceilingGeo = new THREE.PlaneGeometry(28, 20);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.8 });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.rotation.x = Math.PI / 2;
    ceilingMesh.position.y = 5.8;
    scene.add(ceilingMesh);

    // Recessed light boxes in ceiling
    const lightPositions = [
      [-3.5, -4.2],
      [3.5, -4.2],
      [-3.5, 0],
      [3.5, 0],
    ];
    lightPositions.forEach(([lx, lz]) => {
      const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.12, 1.0),
        new THREE.MeshStandardMaterial({
          color: '#ffffff',
          emissive: '#fffbeb',
          emissiveIntensity: 0.95,
        })
      );
      lamp.position.set(lx, 5.75, lz);
      scene.add(lamp);
    });

    // Left and Right Wall Windows with Voxel Trees outside!
    const createWindowGroup = (isLeft: boolean) => {
      const winGroup = new THREE.Group();
      winGroup.position.set(isLeft ? -9.5 : 9.5, 3.2, -1.5);
      winGroup.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;

      // Dark blue outer window frame
      const outerFrame = new THREE.Mesh(
        new THREE.BoxGeometry(7.5, 3.8, 0.2),
        new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.2 })
      );
      winGroup.add(outerFrame);

      // Glass pane
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(7.2, 3.5),
        new THREE.MeshStandardMaterial({
          color: '#bae6fd',
          transparent: true,
          opacity: 0.45,
          roughness: 0.1,
        })
      );
      glass.position.z = 0.05;
      winGroup.add(glass);

      // Window mullions (cross bars)
      const barH = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.12, 0.12),
        new THREE.MeshStandardMaterial({ color: '#1e3a8a' })
      );
      barH.position.z = 0.08;
      winGroup.add(barH);

      [-1.8, 0, 1.8].forEach((bx) => {
        const barV = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 3.5, 0.12),
          new THREE.MeshStandardMaterial({ color: '#1e3a8a' })
        );
        barV.position.set(bx, 0, 0.08);
        winGroup.add(barV);
      });

      // Voxel Trees outside the window!
      const treeMat1 = new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.7 });
      const treeMat2 = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.7 });
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });

      for (let tx = -2.5; tx <= 2.5; tx += 1.8) {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(tx, -0.6, -2.5);

        // Trunk
        const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.0, 0.4), trunkMat);
        trunk.position.y = 0;
        treeGroup.add(trunk);

        // Foliage blocks (stacked voxel cubes)
        const fol1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.4), treeMat1);
        fol1.position.y = 1.4;
        treeGroup.add(fol1);

        const fol2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.0), treeMat2);
        fol2.position.y = 2.2;
        treeGroup.add(fol2);

        winGroup.add(treeGroup);
      }

      return winGroup;
    };

    scene.add(createWindowGroup(true));
    scene.add(createWindowGroup(false));

    // Lab Potted Plants (Voxel Bonsai on pedestals)
    const createPottedPlant = (x: number, z: number) => {
      const plant = new THREE.Group();
      plant.position.set(x, 0, z);

      // White cubic pedestal
      const ped = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.2, 0.9),
        new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 })
      );
      ped.position.y = 0.6;
      plant.add(ped);

      // Green voxel foliage
      const stem = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.7, 0.18),
        new THREE.MeshStandardMaterial({ color: '#92400e' })
      );
      stem.position.y = 1.4;
      plant.add(stem);

      const leaf1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.7, 0.9),
        new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.7 })
      );
      leaf1.position.y = 1.85;
      plant.add(leaf1);

      const leaf2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.65, 0.65),
        new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 0.7 })
      );
      leaf2.position.y = 2.4;
      plant.add(leaf2);

      return plant;
    };

    scene.add(createPottedPlant(-6.4, -5.5));
    scene.add(createPottedPlant(6.4, -5.5));

    // Back Lab Counters with Blue Reagent Bottles
    const counterGeo = new THREE.BoxGeometry(8.2, 1.1, 1.0);
    const counterMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.3 });
    const backCounter = new THREE.Mesh(counterGeo, counterMat);
    backCounter.position.set(0, 0.55, -5.7);
    scene.add(backCounter);

    // Row of blue reagent bottles on the back counter
    for (let bx = -3.2; bx <= 3.2; bx += 0.8) {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12),
        new THREE.MeshStandardMaterial({ color: '#38bdf8', transparent: true, opacity: 0.85 })
      );
      bottle.position.set(bx, 1.24, -5.7);
      scene.add(bottle);
    }

    // Tall Glass Storage Cabinet on Right Back
    const cabinetGroup = new THREE.Group();
    cabinetGroup.position.set(7.8, 0, -5.4);
    const cabFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 3.4, 0.8),
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.3 })
    );
    cabFrame.position.y = 1.7;
    cabinetGroup.add(cabFrame);

    const cabGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 3.0),
      new THREE.MeshStandardMaterial({ color: '#e0f2fe', transparent: true, opacity: 0.55 })
    );
    cabGlass.position.set(0, 1.7, 0.42);
    cabinetGroup.add(cabGlass);
    scene.add(cabinetGroup);

    // Lab Sink & Faucet on Left Back
    const sinkGroup = new THREE.Group();
    sinkGroup.position.set(-7.8, 0, -4.8);
    const sinkCounter = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.1, 1.2),
      new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.4 })
    );
    sinkCounter.position.y = 0.55;
    sinkGroup.add(sinkCounter);

    const basin = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 0.8),
      new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.2 })
    );
    basin.position.set(0, 1.0, 0);
    sinkGroup.add(basin);

    // Faucet
    const faucet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9 })
    );
    faucet.position.set(0, 1.4, -0.2);
    sinkGroup.add(faucet);
    scene.add(sinkGroup);

    // Whiteboard Chart on Stand on Left Back
    const wbGroup = new THREE.Group();
    wbGroup.position.set(-4.5, 0, -5.5);
    const wbBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.8, 0.06),
      new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 })
    );
    wbBoard.position.y = 2.4;
    wbGroup.add(wbBoard);

    // Stand legs
    const wbLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 8), new THREE.MeshStandardMaterial({ color: '#64748b' }));
    wbLeg1.position.set(-0.7, 1.2, 0);
    wbGroup.add(wbLeg1);
    const wbLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 8), new THREE.MeshStandardMaterial({ color: '#64748b' }));
    wbLeg2.position.set(0.7, 1.2, 0);
    wbGroup.add(wbLeg2);
    scene.add(wbGroup);

    // CREATE THE THREE PRIMARY WORKBENCHES (Meja 1, Meja 2, Meja 3)
    // Table dimensions matching the reference image:
    // Dark slate top, light grey/white legs, and bright number badge on front apron!
    const tableObjects: THREE.Object3D[] = [];

    const createTable = (
      num: 1 | 2 | 3,
      x: number,
      z: number,
      isUnlocked: boolean,
      isDone: boolean
    ) => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(x, 0, z);
      tableGroup.name = `table${num}`;

      // Tabletop: Dark slate slab with rounded bevel look
      const topGeo = new THREE.BoxGeometry(3.3, 0.16, 1.7);
      const topMat = new THREE.MeshStandardMaterial({
        color: '#1e293b', // dark charcoal countertop
        roughness: 0.25,
        metalness: 0.1,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = 1.05;
      topMesh.castShadow = !isSoftwareGl;
      topMesh.receiveShadow = !isSoftwareGl;
      tableGroup.add(topMesh);

      // Light grey table legs and frame
      const frameMat = new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.3,
      });
      // 4 thick legs
      const legGeo = new THREE.BoxGeometry(0.24, 1.05, 0.24);
      const legPositions = [
        [-1.45, -0.65],
        [1.45, -0.65],
        [-1.45, 0.65],
        [1.45, 0.65],
      ];
      legPositions.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, frameMat);
        leg.position.set(lx, 1.05 / 2, lz);
        leg.castShadow = !isSoftwareGl;
        tableGroup.add(leg);
      });

      // Front crossbar apron
      const frontApron = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 0.2, 0.12),
        frameMat
      );
      frontApron.position.set(0, 0.88, 0.65);
      tableGroup.add(frontApron);

      // NUMBER BADGE ON FRONT APRON (1, 2, 3) matching reference image
      const numCvs = document.createElement('canvas');
      numCvs.width = 128;
      numCvs.height = 128;
      const numCtx = numCvs.getContext('2d')!;
      numCtx.fillStyle = isDone ? '#059669' : isUnlocked ? '#2563eb' : '#475569';
      numCtx.roundRect(8, 8, 112, 112, 24);
      numCtx.fill();
      numCtx.strokeStyle = '#ffffff';
      numCtx.lineWidth = 8;
      numCtx.roundRect(8, 8, 112, 112, 24);
      numCtx.stroke();

      numCtx.fillStyle = '#ffffff';
      numCtx.font = 'bold 72px sans-serif';
      numCtx.textAlign = 'center';
      numCtx.textBaseline = 'middle';
      numCtx.fillText(String(num), 64, 66);

      const numTex = new THREE.CanvasTexture(numCvs);
      numTex.colorSpace = THREE.SRGBColorSpace;
      const badgeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.38, 0.38),
        new THREE.MeshBasicMaterial({ map: numTex, transparent: true })
      );
      badgeMesh.position.set(0, 0.88, 0.72);
      tableGroup.add(badgeMesh);

      // PROPS ON TABLETOP SPECIFIC TO EACH TABLE (matching reference image)
      if (num === 1) {
        // Table 1 Props: Tray with Onion, Glass Beaker, Pipette with Red Bulb, Funnel on Flask
        // 1. Tray with Onion
        const tray = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 0.05, 0.55),
          new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.5 })
        );
        tray.position.set(-1.0, 1.15, 0.05);
        tableGroup.add(tray);

        // Onion bulb (purple/red onion with sprout)
        const onion = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 16, 16),
          new THREE.MeshStandardMaterial({ color: '#9d174d', roughness: 0.4 })
        );
        onion.scale.set(1, 0.85, 1);
        onion.position.set(-1.0, 1.3, 0.05);
        tableGroup.add(onion);

        const sprout = new THREE.Mesh(
          new THREE.ConeGeometry(0.04, 0.16, 8),
          new THREE.MeshStandardMaterial({ color: '#16a34a' })
        );
        sprout.position.set(-1.0, 1.44, 0.05);
        tableGroup.add(sprout);

        // 2. Glass Beaker with marks
        const beaker = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, 0.36, 16),
          new THREE.MeshStandardMaterial({
            color: '#e0f2fe',
            transparent: true,
            opacity: 0.65,
            roughness: 0.1,
          })
        );
        beaker.position.set(-0.35, 1.31, 0.05);
        tableGroup.add(beaker);

        // 3. Dropper/Pipette with red bulb and blue droplet
        const dropperBulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 12, 12),
          new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.3 })
        );
        dropperBulb.position.set(0.2, 1.35, 0.05);
        tableGroup.add(dropperBulb);

        const dropperTube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.008, 0.28, 8),
          new THREE.MeshStandardMaterial({ color: '#93c5fd', transparent: true, opacity: 0.8 })
        );
        dropperTube.rotation.z = 0.3;
        dropperTube.position.set(0.17, 1.22, 0.05);
        tableGroup.add(dropperTube);

        // Blue droplet on table
        const drop = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 8, 8),
          new THREE.MeshStandardMaterial({ color: '#0284c7' })
        );
        drop.scale.set(1.5, 0.4, 1.5);
        drop.position.set(0.12, 1.15, 0.12);
        tableGroup.add(drop);

        // 4. Glass Funnel on Erlenmeyer Flask
        const flask = new THREE.Mesh(
          new THREE.ConeGeometry(0.2, 0.4, 16),
          new THREE.MeshStandardMaterial({ color: '#e0f2fe', transparent: true, opacity: 0.65 })
        );
        flask.position.set(0.85, 1.33, 0.05);
        tableGroup.add(flask);

        const funnelCone = new THREE.Mesh(
          new THREE.ConeGeometry(0.18, 0.2, 16, 1, true),
          new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 })
        );
        funnelCone.rotation.x = Math.PI;
        funnelCone.position.set(0.85, 1.58, 0.05);
        tableGroup.add(funnelCone);
      } else if (num === 2) {
        // Table 2 Props: Benchtop Centrifuge (open lid) & Tube Rack with blue liquid
        // 1. Centrifuge body (white cubic/cylindrical base)
        const centBase = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.35, 0.8),
          new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 })
        );
        centBase.position.set(-0.35, 1.3, 0.05);
        tableGroup.add(centBase);

        // Circular rotor cavity
        const rotorCavity = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, 0.15, 20),
          new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4 })
        );
        rotorCavity.position.set(-0.35, 1.42, 0.05);
        tableGroup.add(rotorCavity);

        // 6 tube holes in rotor
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const tubeHead = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8),
            new THREE.MeshStandardMaterial({ color: '#0284c7' })
          );
          tubeHead.position.set(-0.35 + Math.cos(angle) * 0.18, 1.48, 0.05 + Math.sin(angle) * 0.18);
          tableGroup.add(tubeHead);
        }

        // Open Centrifuge Lid (tilted upward like in reference image!)
        const lid = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.06, 20),
          new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.25 })
        );
        lid.rotation.x = -Math.PI / 3;
        lid.position.set(-0.35, 1.68, -0.28);
        tableGroup.add(lid);

        // Front blue control screen
        const screen = new THREE.Mesh(
          new THREE.PlaneGeometry(0.25, 0.12),
          new THREE.MeshBasicMaterial({ color: '#38bdf8' })
        );
        screen.position.set(-0.35, 1.3, 0.46);
        tableGroup.add(screen);

        // 2. Test Tube Rack with 4 tubes of blue liquid
        const rackFrame = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.25, 0.3),
          new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.4 })
        );
        rackFrame.position.set(0.65, 1.25, 0.05);
        tableGroup.add(rackFrame);

        [-0.22, -0.07, 0.07, 0.22].forEach((tx) => {
          const tube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.38, 12),
            new THREE.MeshStandardMaterial({ color: '#0284c7', transparent: true, opacity: 0.85 })
          );
          tube.position.set(0.65 + tx, 1.36, 0.05);
          tableGroup.add(tube);

          const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12),
            new THREE.MeshStandardMaterial({ color: '#1d4ed8' })
          );
          cap.position.set(0.65 + tx, 1.56, 0.05);
          tableGroup.add(cap);
        });
      } else if (num === 3) {
        // Table 3 Props: UV-Vis Spectrophotometer & Cuvette/Tube Rack
        // 1. Spectrophotometer Unit (sculpted white housing with slanted display)
        const specBase = new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 0.45, 0.8),
          new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 })
        );
        specBase.position.set(-0.35, 1.35, 0.05);
        tableGroup.add(specBase);

        // Slanted upper panel
        const specSlant = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.3, 0.5),
          new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.25 })
        );
        specSlant.rotation.x = -0.4;
        specSlant.position.set(-0.35, 1.62, 0);
        tableGroup.add(specSlant);

        // Black measurement display screen
        const disp = new THREE.Mesh(
          new THREE.PlaneGeometry(0.45, 0.24),
          new THREE.MeshBasicMaterial({ color: '#0f172a' })
        );
        disp.rotation.x = -0.4;
        disp.position.set(-0.35, 1.65, 0.22);
        tableGroup.add(disp);

        // Sample slot compartment
        const slot = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.15, 0.12),
          new THREE.MeshStandardMaterial({ color: '#1e293b' })
        );
        slot.position.set(-0.35, 1.35, 0.46);
        tableGroup.add(slot);

        // 2. Cuvette/Tube Rack
        const rack3 = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 0.2, 0.25),
          new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4 })
        );
        rack3.position.set(0.65, 1.23, 0.05);
        tableGroup.add(rack3);

        [-0.18, -0.06, 0.06, 0.18].forEach((tx) => {
          const cuv = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.3, 0.06),
            new THREE.MeshStandardMaterial({ color: '#38bdf8', transparent: true, opacity: 0.85 })
          );
          cuv.position.set(0.65 + tx, 1.34, 0.05);
          tableGroup.add(cuv);
        });
      }

      scene.add(tableGroup);
      tableObjects.push(topMesh);
      return tableGroup;
    };

    createTable(1, -4.0, -0.4, true, tableStatus.table1Completed);
    createTable(2, 0, -0.4, tableStatus.table1Completed, tableStatus.table2Completed);
    createTable(3, 4.0, -0.4, tableStatus.table2Completed, tableStatus.table3Completed);

    // Player character in white lab coat (stylized voxel/chibi like reference avatar!)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(playerRef.current.x, 0, playerRef.current.z);

    // Head (cute blocky stylized avatar)
    const headMat = new THREE.MeshStandardMaterial({ color: '#fed7aa', roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: '#582f1b', roughness: 0.8 }); // brown hair
    const coatMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 }); // white coat
    const pantsMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.5 }); // blue pants

    // Head cube
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.38), headMat);
    headMesh.position.y = 1.6;
    headMesh.castShadow = !isSoftwareGl;
    playerGroup.add(headMesh);

    // Hair voxels
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.42), hairMat);
    hairTop.position.set(0, 1.82, 0);
    playerGroup.add(hairTop);

    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.16), hairMat);
    hairBack.position.set(0, 1.58, -0.16);
    playerGroup.add(hairBack);

    // Torso (White Lab Coat)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.32), coatMat);
    torso.position.y = 1.05;
    torso.castShadow = !isSoftwareGl;
    playerGroup.add(torso);

    // Blue collar/shirt inside
    const collar = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.22, 0.08),
      new THREE.MeshStandardMaterial({ color: '#2563eb' })
    );
    collar.position.set(0, 1.22, 0.14);
    playerGroup.add(collar);

    // Arms
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.33, 1.25, 0);
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.14), coatMat);
    leftArm.position.y = -0.2;
    leftArmGroup.add(leftArm);
    playerGroup.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.33, 1.25, 0);
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.14), coatMat);
    rightArm.position.y = -0.2;
    rightArmGroup.add(rightArm);
    playerGroup.add(rightArmGroup);

    // Legs
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.14, 0.65, 0);
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.18), pantsMat);
    leftLeg.position.y = -0.28;
    leftLegGroup.add(leftLeg);
    playerGroup.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.14, 0.65, 0);
    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.18), pantsMat);
    rightLeg.position.y = -0.28;
    rightLegGroup.add(rightLeg);
    playerGroup.add(rightLegGroup);

    // Soft round shadow beneath player
    const shadowGeo = new THREE.PlaneGeometry(0.9, 0.9);
    const shadowTex = (() => {
      const cvs = document.createElement('canvas');
      cvs.width = 128;
      cvs.height = 128;
      const ctx = cvs.getContext('2d')!;
      const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0,0,0,0.4)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(cvs);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();
    const shadowMesh = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    playerGroup.add(shadowMesh);

    scene.add(playerGroup);

    // Raycaster for click on tables
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClickCanvas = (event: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj && obj !== scene) {
          if (obj.name === 'table1') {
            soundFx.playClick();
            onEnterTableRef.current('table1');
            return;
          }
          if (obj.name === 'table2') {
            if (!tableStatusRef.current.table1Completed) {
              soundFx.playBeep(false);
              return;
            }
            soundFx.playClick();
            onEnterTableRef.current('table2');
            return;
          }
          if (obj.name === 'table3') {
            if (!tableStatusRef.current.table2Completed) {
              soundFx.playBeep(false);
              return;
            }
            soundFx.playClick();
            onEnterTableRef.current('table3');
            return;
          }
          obj = obj.parent;
        }
      }
    };
    container.addEventListener('click', handleClickCanvas);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);

      // Movement calculation (Keyboard, Joystick, or Auto-Navigation)
      let dx = 0;
      let dz = 0;
      const k = keysPressed.current;

      if (k['w'] || k['arrowup']) dz -= 1;
      if (k['s'] || k['arrowdown']) dz += 1;
      if (k['a'] || k['arrowleft']) dx -= 1;
      if (k['d'] || k['arrowright']) dx += 1;

      const extVec = externalMoveVectorRef.current;
      if (extVec && (extVec.x !== 0 || extVec.y !== 0)) {
        dx = extVec.x;
        dz = extVec.y;
      }

      const p = playerRef.current;

      // Auto-navigation between tables when transitioning
      if (autoNavigateTargetRef.current && !hasNotifiedArrivedRef.current && dx === 0 && dz === 0) {
        const targetX =
          autoNavigateTargetRef.current === 'table1'
            ? -4.0
            : autoNavigateTargetRef.current === 'table2'
            ? 0.0
            : 4.0;
        const diffX = targetX - p.x;
        if (Math.abs(diffX) > 0.12) {
          dx = diffX > 0 ? 1 : -1;
          dz = (1.8 - p.z) * 0.5;
        } else {
          p.x = targetX;
          p.z = 1.8;
          dx = 0;
          dz = 0;
          hasNotifiedArrivedRef.current = true;
          setArrivedTable(autoNavigateTargetRef.current);
          soundFx.playBeep(true);
          if (onAutoNavigateArrivedRef.current) {
            onAutoNavigateArrivedRef.current(autoNavigateTargetRef.current);
          }
        }
      }

      const isMoving = dx !== 0 || dz !== 0;
      p.isMoving = isMoving;

      if (isMoving) {
        const len = Math.sqrt(dx * dx + dz * dz);
        dx /= len;
        dz /= len;

        const moveSpeed = p.speed * delta;
        p.x += dx * moveSpeed;
        p.z += dz * moveSpeed;

        // Boundaries in front of the tables
        p.x = Math.max(-6.5, Math.min(6.5, p.x));
        p.z = Math.max(0.6, Math.min(3.8, p.z));

        // Smooth rotation
        const targetRot = Math.atan2(dx, dz);
        p.rotation = THREE.MathUtils.damp(p.rotation, targetRot, 14, delta);

        // Walking limb animation
        p.walkCycle += delta * 12;
        const swing = Math.sin(p.walkCycle) * 0.4;
        leftLegGroup.rotation.x = swing;
        rightLegGroup.rotation.x = -swing;
        leftArmGroup.rotation.x = -swing;
        rightArmGroup.rotation.x = swing;
      } else {
        leftLegGroup.rotation.x = THREE.MathUtils.damp(leftLegGroup.rotation.x, 0, 10, delta);
        rightLegGroup.rotation.x = THREE.MathUtils.damp(rightLegGroup.rotation.x, 0, 10, delta);
        leftArmGroup.rotation.x = THREE.MathUtils.damp(leftArmGroup.rotation.x, 0, 10, delta);
        rightArmGroup.rotation.x = THREE.MathUtils.damp(rightArmGroup.rotation.x, 0, 10, delta);
      }

      playerGroup.position.x = p.x;
      playerGroup.position.z = p.z;
      playerGroup.rotation.y = p.rotation;

      // Subtle dynamic camera following
      const targetCamX = p.x * 0.25;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4, delta);

      // Check proximity to each specific table (strictly when the student approaches that desk)
      let detected: NearTableInfo | null = null;

      const tablesConfig = [
        {
          id: 'table1' as TableId,
          name: 'Meja 1: Ekstraksi & Lisis',
          pos: new THREE.Vector3(-4.0, 0, -0.4),
          isUnlocked: true,
          isDone: tableStatusRef.current.table1Completed,
          instruction: 'Potong & timbang sampel bawang bombai, tambahkan buffer lisis, gerus halus di mortar, dan saring ekstraknya.',
          shortGoal: 'Ekstraksi Seluler',
        },
        {
          id: 'table2' as TableId,
          name: 'Meja 2: Sentrifugasi & Presipitasi',
          pos: new THREE.Vector3(0.0, 0, -0.4),
          isUnlocked: tableStatusRef.current.table1Completed,
          isDone: tableStatusRef.current.table2Completed,
          instruction: 'Seimbangkan tabung mikro, sentrifugasi 6000 RPM, pisahkan supernatan DNA, dan presipitasi dengan etanol dingin 95%.',
          shortGoal: 'Pemisahan DNA',
        },
        {
          id: 'table3' as TableId,
          name: 'Meja 3: Spektrofotometri UV-Vis',
          pos: new THREE.Vector3(4.0, 0, -0.4),
          isUnlocked: tableStatusRef.current.table2Completed,
          isDone: tableStatusRef.current.table3Completed,
          instruction: 'Kalibrasi blanko kuvet, ukur absorbansi DNA pada λ 260 & 280 nm, lalu periksa rasio kemurnian DNA.',
          shortGoal: 'Kuantifikasi & Kemurnian',
        },
      ];

      for (const tb of tablesConfig) {
        // Praktikan must approach right in front of this specific table (within dx <= 1.45 and dz <= 2.2)
        const dx = Math.abs(p.x - tb.pos.x);
        const dz = Math.abs(p.z - tb.pos.z);
        if (dx <= 1.45 && dz <= 2.2) {
          // Project 3D position above table surface to 2D viewport coordinates
          const tableAnchor = new THREE.Vector3(tb.pos.x, 1.4, tb.pos.z);
          tableAnchor.project(camera);
          const screenX = THREE.MathUtils.clamp((tableAnchor.x * 0.5 + 0.5) * 100, 16, 84);
          const screenY = THREE.MathUtils.clamp((-(tableAnchor.y * 0.5) + 0.5) * 100, 15, 60);

          detected = {
            id: tb.id,
            name: tb.name,
            isLocked: !tb.isUnlocked,
            isDone: tb.isDone,
            screenX,
            screenY,
            instruction: tb.instruction,
            shortGoal: tb.shortGoal,
          };
          break;
        }
      }

      // Only trigger React state update if nearTable changes
      if (
        detected?.id !== nearTableRef.current?.id ||
        detected?.isLocked !== nearTableRef.current?.isLocked ||
        detected?.isDone !== nearTableRef.current?.isDone
      ) {
        nearTableRef.current = detected;
        setNearTable(detected);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('click', handleClickCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[84vh] min-h-[580px] rounded-3xl overflow-hidden shadow-2xl select-none border-2 border-slate-700/60 bg-sky-100">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-pointer" />

      {/* Floating Transition Banner when walking to next table */}
      {autoNavigateTarget && !arrivedTable && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-2xl bg-blue-950/90 border-2 border-cyan-400 text-cyan-200 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-2xl animate-in fade-in slide-in-from-top-3 backdrop-blur-md">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <span>
            {transitionMessage ||
              `Praktikan sedang berjalan menuju ${
                autoNavigateTarget === 'table2'
                  ? 'Meja 2 (Sentrifugasi)'
                  : 'Meja 3 (Spektrofotometri)'
              }...`}
          </span>
        </div>
      )}

      {/* Prominent Arrival Card when arrived at destination table */}
      {arrivedTable && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 max-w-sm w-[90%] rounded-3xl bg-slate-900/95 border-2 border-emerald-400 p-6 shadow-2xl backdrop-blur-md text-center space-y-3.5 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              PRAKTIKAN TELAH TIBA
            </span>
            <h3 className="text-base font-extrabold text-white mt-1">
              {arrivedTable === 'table2'
                ? 'Meja 2 — Sentrifugasi & Pemisahan'
                : 'Meja 3 — Spektrofotometri UV-Vis'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {arrivedTable === 'table2'
                ? 'Meja 2 siap digunakan untuk sentrifugasi filtrat dan presipitasi etanol dingin.'
                : 'Meja 3 siap digunakan untuk mengukur absorbansi A260, A280, dan kemurnian DNA.'}
            </p>
          </div>

          <button
            onClick={() => {
              soundFx.playBeep(true);
              onEnterTable(arrivedTable);
              setArrivedTable(null);
            }}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-blue-600/40 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>
              {arrivedTable === 'table2' ? 'MASUK KE MEJA 2' : 'MASUK KE MEJA 3'}
            </span>
          </button>
        </div>
      )}

      {/* Table-Anchored Compact Instruction Card (Only shown when player is at that table) */}
      {nearTable && !arrivedTable && (
        <div
          className="absolute z-30 w-64 sm:w-72 max-w-[88vw] pointer-events-auto transition-all duration-200 animate-in fade-in zoom-in-95 select-none"
          style={{
            left: `${nearTable.screenX}%`,
            top: `${nearTable.screenY}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="relative rounded-2xl bg-slate-900/95 border-2 border-cyan-400/80 p-2.5 sm:p-3 shadow-2xl backdrop-blur-md space-y-2 text-left">
            {/* Header: Table Name & Goal */}
            <div className="flex items-center justify-between gap-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-950 border border-cyan-400/50 text-cyan-300">
                {nearTable.isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : nearTable.isLocked ? (
                  <Lock className="w-3 h-3 text-amber-400" />
                ) : (
                  <Play className="w-3 h-3 text-cyan-400" />
                )}
                <span className="truncate">{nearTable.name}</span>
              </div>
              <span className="text-[9px] font-semibold text-slate-400">
                {nearTable.isLocked ? 'TERKUNCI' : nearTable.shortGoal}
              </span>
            </div>

            {/* Compact Instruction Box or Locked Notice */}
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] leading-relaxed text-slate-200">
              {nearTable.isLocked ? (
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Meja masih TERKUNCI. Selesaikan praktikum di {nearTable.id === 'table2' ? 'Meja 1' : 'Meja 2'} terlebih dahulu.
                  </span>
                </div>
              ) : (
                <>
                  <span className="font-bold text-cyan-300 mr-1">Perintah:</span>
                  <span>{nearTable.instruction}</span>
                </>
              )}
            </div>

            {/* Action button */}
            <div>
              {nearTable.isLocked ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold bg-slate-800/80 border border-slate-700 text-slate-400 shadow-none flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Meja Masih Terkunci</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playBeep(true);
                    onEnterTable(nearTable.id);
                  }}
                  className="w-full py-1.5 px-3 rounded-xl text-[11px] font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md flex items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>{nearTable.isDone ? 'BUKA KEMBALI MEJA' : 'MULAI PRAKTIKUM MEJA'}</span>
                </button>
              )}
            </div>

            {/* Downward Pointer Triangle pointing directly to the table */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400/90" />
          </div>
        </div>
      )}

      {/* Subtle Hint on top right of canvas */}
      <div className="absolute top-4 right-4 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 text-[11px] text-slate-300">
        <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
        <span>Klik meja 1, 2, atau 3 untuk langsung berinteraksi</span>
      </div>
    </div>
  );
};
