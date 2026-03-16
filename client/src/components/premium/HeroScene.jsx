import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useMediaQuery } from "usehooks-ts";

function FloatingForms() {
  const groupRef = useRef(null);
  const dustRef = useRef(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.08;
    }
    if (dustRef.current) {
      dustRef.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 4, 3]} intensity={1.2} color="#f8f1e2" />
      <pointLight position={[-3, -2, 2]} intensity={1.1} color="#8b5cf6" />
      <pointLight position={[3, 2, 1]} intensity={0.8} color="#d4a85f" />

      <Float speed={1.15} rotationIntensity={0.12} floatIntensity={0.22}>
        <mesh position={[-0.6, 0.25, 0]}>
          <sphereGeometry args={[1.35, 96, 96]} />
          <MeshDistortMaterial
            color="#d4a85f"
            emissive="#6d28d9"
            emissiveIntensity={0.12}
            roughness={0.18}
            metalness={0.55}
            distort={0.28}
            speed={1.4}
          />
        </mesh>
      </Float>

      <Float speed={1.35} rotationIntensity={0.18} floatIntensity={0.35}>
        <mesh position={[1.45, -0.55, -1.2]} scale={0.8}>
          <icosahedronGeometry args={[0.9, 1]} />
          <meshStandardMaterial
            color="#1a2027"
            emissive="#8b5cf6"
            emissiveIntensity={0.22}
            roughness={0.34}
            metalness={0.64}
          />
        </mesh>
      </Float>

      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[0.9, 1.1, -1.5]} rotation={[0.4, 0.3, 0.2]} scale={0.7}>
          <torusKnotGeometry args={[0.42, 0.14, 128, 16]} />
          <meshStandardMaterial
            color="#111418"
            emissive="#67e8f9"
            emissiveIntensity={0.15}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </Float>

      <group ref={dustRef}>
        <Sparkles
          count={140}
          scale={[7.2, 4.8, 3.6]}
          size={1.8}
          speed={0.18}
          opacity={0.42}
          color="#d4a85f"
        />
      </group>
    </group>
  );
}

export default function HeroScene({ className }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const dpr = useMemo(() => (isDesktop ? [1, 1.6] : [1, 1.2]), [isDesktop]);

  if (!isDesktop) {
    return (
      <div
        className={className}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(212,168,95,0.22), transparent 35%), radial-gradient(circle at 70% 70%, rgba(139,92,246,0.18), transparent 30%), linear-gradient(180deg, rgba(20,24,29,0.72), rgba(11,13,16,0))"
        }}
      />
    );
  }

  return (
    <div className={className}>
      <Canvas dpr={dpr} camera={{ position: [0, 0, 5.4], fov: 42 }}>
        <Suspense fallback={null}>
          <FloatingForms />
        </Suspense>
      </Canvas>
    </div>
  );
}
