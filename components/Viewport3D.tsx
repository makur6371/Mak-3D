import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Environment, ContactShadows, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { SceneObject, ObjectType } from '../types';
import { Video, Move, Rotate3D, Scaling } from 'lucide-react';

// Augmented type definition for React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      boxGeometry: any;
      sphereGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      meshStandardMaterial: any;
      lineSegments: any;
      edgesGeometry: any;
      lineBasicMaterial: any;
      ambientLight: any;
      spotLight: any;
      group: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      boxGeometry: any;
      sphereGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      meshStandardMaterial: any;
      lineSegments: any;
      edgesGeometry: any;
      lineBasicMaterial: any;
      ambientLight: any;
      spotLight: any;
      group: any;
    }
  }
}

type TransformMode = 'translate' | 'rotate' | 'scale';

interface Viewport3DProps {
  objects: SceneObject[];
  onSelectObject: (id: string) => void;
  selectedId: string | null;
  isCinematic: boolean;
  toggleCinematic: () => void;
  onUpdateObject: (id: string, updates: Partial<SceneObject>) => void;
  showGrid: boolean;    // New Prop
  showShadows: boolean; // New Prop
}

// Procedural Mesh Component based on type
const MeshComponent: React.FC<{ 
  obj: SceneObject; 
  isSelected: boolean; 
  onClick: () => void;
  mode: TransformMode;
  onUpdate: (updates: Partial<SceneObject>) => void;
  isCinematic: boolean;
}> = ({ obj, isSelected, onClick, mode, onUpdate, isCinematic }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Apply properties to mesh
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...obj.position);
      meshRef.current.rotation.set(...obj.rotation);
      meshRef.current.scale.set(...obj.scale);
    }
  }, [obj.position, obj.rotation, obj.scale]);

  if (!obj.visible) return null;

  // Standardization Note:
  // All geometries are normalized to fit within a 1x1x1 unit box approximately.
  // This allows the 'scale' parameter from AI to act directly as 'dimensions'.
  return (
    <>
      <mesh
        ref={meshRef}
        onClick={(e: any) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {obj.type === ObjectType.CUBE && <boxGeometry args={[1, 1, 1]} />}
        {/* Sphere: Radius 0.5 = Diameter 1 */}
        {obj.type === ObjectType.SPHERE && <sphereGeometry args={[0.5, 32, 32]} />}
        {/* Cylinder: Radius 0.5 (Dia 1), Height 1 */}
        {obj.type === ObjectType.CYLINDER && <cylinderGeometry args={[0.5, 0.5, 1, 32]} />}
        {/* Cone: Radius 0.5 (Dia 1), Height 1 */}
        {obj.type === ObjectType.CONE && <coneGeometry args={[0.5, 1, 32]} />}
        
        <meshStandardMaterial 
          color={isSelected ? '#60a5fa' : obj.color} 
          roughness={0.3}
          metalness={0.6}
          emissive={isSelected ? '#1e40af' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
        {isSelected && !isCinematic && <lineSegments>
          {/* Edges helper visualization */}
          {obj.type === ObjectType.CUBE && <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />}
          {obj.type === ObjectType.CYLINDER && <edgesGeometry args={[new THREE.CylinderGeometry(0.5, 0.5, 1, 16)]} />}
          {obj.type === ObjectType.CONE && <edgesGeometry args={[new THREE.ConeGeometry(0.5, 1, 16)]} />}
          {/* Sphere edges are usually too messy, skipping or using simplified */}
          <lineBasicMaterial color="white" />
        </lineSegments>}
      </mesh>

      {isSelected && !isCinematic && meshRef.current && (
        <TransformControls 
          object={meshRef.current} 
          mode={mode}
          onMouseUp={() => {
            if (meshRef.current) {
              onUpdate({
                position: meshRef.current.position.toArray(),
                rotation: [meshRef.current.rotation.x, meshRef.current.rotation.y, meshRef.current.rotation.z],
                scale: meshRef.current.scale.toArray()
              });
            }
          }}
        />
      )}
    </>
  );
};

// Cinematic Camera Rig
const CinematicRig: React.FC<{ active: boolean }> = ({ active }) => {
  const vec = new THREE.Vector3();
  useFrame((state) => {
    if (active) {
      // "Media Storm" style swooping motion
      const t = state.clock.getElapsedTime();
      const radius = 8 + Math.sin(t * 0.3) * 3; // Slower radius change
      const height = 4 + Math.sin(t * 0.2) * 2; // Slower height change
      const angle = t * 0.5; // Slower rotation speed

      state.camera.position.lerp(vec.set(
        Math.sin(angle) * radius,
        height,
        Math.cos(angle) * radius
      ), 0.05);
      
      state.camera.lookAt(0, 0, 0);
      state.camera.updateProjectionMatrix();
    }
  });
  return null;
};

const Viewport3D: React.FC<Viewport3DProps> = ({ 
  objects, 
  onSelectObject, 
  selectedId, 
  isCinematic, 
  toggleCinematic, 
  onUpdateObject,
  showGrid,
  showShadows 
}) => {
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-900 to-black overflow-hidden group">
      
      {/* Transform Controls Toolbar */}
      {!isCinematic && selectedId && (
        <div className="absolute top-4 left-4 z-10 flex space-x-2 bg-slate-800/80 backdrop-blur rounded-lg p-1.5 border border-slate-700 shadow-xl">
          <button 
            onClick={() => setTransformMode('translate')}
            className={`p-2 rounded ${transformMode === 'translate' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            title="移动 (Translate)"
          >
            <Move size={18} />
          </button>
          <button 
            onClick={() => setTransformMode('rotate')}
            className={`p-2 rounded ${transformMode === 'rotate' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            title="旋转 (Rotate)"
          >
            <Rotate3D size={18} />
          </button>
          <button 
            onClick={() => setTransformMode('scale')}
            className={`p-2 rounded ${transformMode === 'scale' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            title="缩放 (Scale)"
          >
            <Scaling size={18} />
          </button>
        </div>
      )}

      {/* Cinematic Button */}
      <button 
        onClick={toggleCinematic}
        className={`absolute top-4 right-4 z-10 flex items-center space-x-2 px-4 py-2 rounded-full font-bold uppercase tracking-wider text-xs shadow-lg transition-all transform hover:scale-105 ${
          isCinematic 
            ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400' 
            : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20'
        }`}
      >
        <Video size={14} className={isCinematic ? "animate-spin" : ""} />
        <span>{isCinematic ? '影视运镜开启' : '影视运镜'}</span>
      </button>

      <Canvas shadows dpr={[1, 2]} onClick={(e: any) => {
         if (e.target === e.currentTarget) onSelectObject('');
      }}>
        <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={45} />
        
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow={showShadows} />
        
        <group>
             <group position={[0, -0.5, 0]}>
                {objects.map(obj => (
                  <MeshComponent 
                    key={obj.id} 
                    obj={obj} 
                    isSelected={selectedId === obj.id}
                    onClick={() => onSelectObject(obj.id)}
                    mode={transformMode}
                    onUpdate={(updates) => onUpdateObject(obj.id, updates)}
                    isCinematic={isCinematic}
                  />
                ))}
             </group>
             
             {showShadows && (
               <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
             )}
             
             {showGrid && (
               <Grid 
                  infiniteGrid 
                  fadeDistance={30} 
                  sectionColor="#4f4f4f" 
                  cellColor="#2f2f2f" 
                  position={[0, -1.01, 0]}
                />
             )}
        </group>

        <OrbitControls 
          makeDefault 
          enableDamping={!isCinematic} 
          enabled={!isCinematic}     
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2} 
        />
        
        <CinematicRig active={isCinematic} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 pointer-events-none text-xs text-slate-500 font-mono">
        <div>操作模式: {isCinematic ? '观影' : '编辑'}</div>
        <div>状态: 就绪</div>
      </div>
    </div>
  );
};

export default Viewport3D;