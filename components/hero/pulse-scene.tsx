'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A ribbon of "pulse bars" arranged in a ring, gently orbiting and reacting
 * to pointer position — MAAR Pulse's brand signature rendered in 3D.
 * Deliberately low poly-count: this is a mood object, not a showcase scene.
 */
function PulseRing() {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const count = 48;

  const bars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.3;
      return {
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number],
        rotationY: -angle,
        phase: i * 0.35,
      };
    });
  }, [count]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.12;

    const px = (state.pointer.x * viewport.width) / 8;
    const py = (state.pointer.y * viewport.height) / 8;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -py * 0.15, 0.05);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, px * 0.08, 0.05);

    group.current.children.forEach((child, i) => {
      const scale = 0.4 + Math.abs(Math.sin(t * 1.6 + bars[i].phase)) * 1.1;
      child.scale.y = scale;
      (child as THREE.Mesh).position.y = 0;
    });
  });

  return (
    <group ref={group}>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.position} rotation={[0, bar.rotationY, 0]}>
          <boxGeometry args={[0.06, 1, 0.06]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#8a7cff' : '#2de0c4'}
            emissive={i % 3 === 0 ? '#8a7cff' : '#2de0c4'}
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function PulseScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.6, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={40} color="#2de0c4" />
      <pointLight position={[-4, -2, -4]} intensity={30} color="#8a7cff" />
      <PulseRing />
    </Canvas>
  );
}
