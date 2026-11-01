import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

// Procedural stylized molar tooth mesh built with clean geometric composition
function ProceduralTooth() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.45;
    }
  });

  const enamelMaterial = new THREE.MeshPhysicalMaterial({
    color: '#FAFCF9',
    roughness: 0.15,
    metalness: 0.05,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    transmission: 0.05,
    reflectivity: 0.9,
  });

  const rootMaterial = new THREE.MeshStandardMaterial({
    color: '#F0F4EC',
    roughness: 0.35,
    metalness: 0.02,
  });

  return (
    <group ref={meshRef} position={[0, -0.2, 0]} scale={[1.35, 1.35, 1.35]}>
      {/* Crown base */}
      <mesh position={[0, 0.4, 0]} material={enamelMaterial}>
        <cylinderGeometry args={[0.95, 0.75, 0.9, 32]} />
      </mesh>

      {/* Occlusal surface / Cusps */}
      <mesh position={[0.4, 0.8, 0.4]} material={enamelMaterial}>
        <sphereGeometry args={[0.42, 24, 24]} />
      </mesh>
      <mesh position={[-0.4, 0.8, 0.4]} material={enamelMaterial}>
        <sphereGeometry args={[0.42, 24, 24]} />
      </mesh>
      <mesh position={[0.4, 0.8, -0.4]} material={enamelMaterial}>
        <sphereGeometry args={[0.42, 24, 24]} />
      </mesh>
      <mesh position={[-0.4, 0.8, -0.4]} material={enamelMaterial}>
        <sphereGeometry args={[0.42, 24, 24]} />
      </mesh>

      {/* Center fissure fill */}
      <mesh position={[0, 0.78, 0]} material={enamelMaterial}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 24]} />
      </mesh>

      {/* Roots (Left & Right dual root anatomy) */}
      <mesh position={[-0.35, -0.55, 0]} rotation={[0, 0, 0.1]} material={rootMaterial}>
        <coneGeometry args={[0.32, 1.2, 24]} />
      </mesh>
      <mesh position={[0.35, -0.55, 0]} rotation={[0, 0, -0.1]} material={rootMaterial}>
        <coneGeometry args={[0.32, 1.2, 24]} />
      </mesh>
    </group>
  );
}

export const Tooth3D: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (reducedMotion) {
    return (
      <div className="w-full h-[360px] sm:h-[450px] flex items-center justify-center p-6 bg-gradient-to-br from-clinic-lightGreen/30 to-clinic-bg rounded-3xl border border-clinic-border/60 shadow-soft">
        <div className="text-center">
          <img
            src="/logo.svg"
            alt="Smile Dental Tooth"
            className="w-36 h-36 mx-auto mb-4 drop-shadow-md"
          />
          <p className="text-sm font-medium text-forest-800">
            Precision Restorative Dental Care
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[360px] sm:h-[460px] flex items-center justify-center select-none">
      {/* Background Soft Glow circle */}
      <div className="absolute w-72 h-72 sm:w-80 sm:h-80 bg-clinic-lightGreen/60 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />

      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[4, 6, 5]} intensity={1.8} color="#FFFFFF" />
        <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#CFEBD6" />
        <pointLight position={[0, -2, 2]} intensity={0.8} color="#1B6B3A" />

        <PresentationControls
          global={false}
          snap={true}
          speed={1.5}
          zoom={1}
          polar={[-Math.PI / 6, Math.PI / 6]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <ProceduralTooth />
          </Float>
        </PresentationControls>
      </Canvas>
    </div>
  );
};
