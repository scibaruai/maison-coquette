import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PerfumeModelProps {
    scrollFraction: number;
    mouse: { x: number; y: number };
}

const PerfumeModel: React.FC<PerfumeModelProps> = ({ scrollFraction, mouse }) => {
    const groupRef = useRef<THREE.Group>(null);
    const capRef = useRef<THREE.Mesh>(null);
    const bowRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Points>(null);

    // 1. Materials Configuration
    const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: 0xFFC0CB, // Beautiful soft pink
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        transmission: 0.6, // Glass transparency look
        thickness: 0.5,
        transparent: true,
        opacity: 0.9
    }), []);

    const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: 0xD4AF37, // Metallic gold
        roughness: 0.15,
        metalness: 0.95
    }), []);

    // 2. Custom Label Texture (Maison Coquette text)
    const labelTexture = useMemo(() => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = 512;
        tempCanvas.height = 256;
        const ctx = tempCanvas.getContext("2d");
        if (!ctx) return new THREE.Texture();
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 512, 256);
        
        // Gold borders
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 12;
        ctx.strokeRect(6, 6, 500, 244);
        ctx.strokeStyle = "#2B1B1E";
        ctx.lineWidth = 3;
        ctx.strokeRect(18, 18, 476, 220);
        
        // Text
        ctx.fillStyle = "#2B1B1E";
        ctx.font = "italic bold 64px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Maison", 256, 90);
        ctx.fillText("Coquette", 256, 170);
        
        const texture = new THREE.CanvasTexture(tempCanvas);
        texture.needsUpdate = true;
        return texture;
    }, []);

    const labelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        map: labelTexture,
        roughness: 0.3,
        metalness: 0.1,
        side: THREE.DoubleSide
    }), [labelTexture]);

    // 3. Dynamic Fragrance Mist Spray Particles (only showing when scrolling)
    const particleCount = 40;
    const [particlePositions, particleVelocities] = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            // Spawn at bottle neck coordinates
            positions[idx] = 0;
            positions[idx + 1] = 1.0; 
            positions[idx + 2] = 0;
            
            // Random upward velocity and outward spread
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5;
            velocities[idx] = Math.cos(angle) * 0.4 * speed; // X speed
            velocities[idx + 1] = 0.8 * speed;             // Y speed (upwards)
            velocities[idx + 2] = Math.sin(angle) * 0.4 * speed; // Z speed
        }
        return [positions, velocities];
    }, []);

    // 4. Animation Frame Hook
    useFrame((state) => {
        if (!groupRef.current) return;

        // Auto-rotation + cursor tracking tilt
        const targetRotY = state.clock.getElapsedTime() * 0.12 + mouse.x * 0.4;
        const targetRotX = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05 + mouse.y * 0.4;
        
        groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
        groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;

        // Scroll animations: Cap floats upwards, Bow floats slightly
        if (capRef.current) {
            capRef.current.position.y = 1.45 + scrollFraction * 2.0;
            capRef.current.rotation.y += 0.01;
        }
        if (bowRef.current) {
            bowRef.current.position.y = 1.1 + scrollFraction * 0.8;
            bowRef.current.rotation.z += 0.005;
        }

        // Animate gold fragrance mist particles rising/expanding
        if (particlesRef.current) {
            const posAttr = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
            const positions = posAttr.array as Float32Array;

            for (let i = 0; i < particleCount; i++) {
                const idx = i * 3;
                // Move particle according to velocity multiplied by scroll fraction
                // At scroll=0, particles are hidden near neck. As scroll increases, they rise
                positions[idx] = particleVelocities[idx] * scrollFraction * 2.0;
                positions[idx + 1] = 1.0 + particleVelocities[idx + 1] * scrollFraction * 2.0;
                positions[idx + 2] = particleVelocities[idx + 2] * scrollFraction * 2.0;
            }
            posAttr.needsUpdate = true;
        }

        // Parallax depth offset
        groupRef.current.position.y = -scrollFraction * 1.5;
        groupRef.current.position.z = -scrollFraction * 1.0;
    });

    return (
        <group ref={groupRef} position={[0, -0.4, 0]}>
            {/* Main Body (rounded glass bottle) */}
            <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
                <cylinderGeometry args={[1.2, 1.2, 2.0, 32]} />
                <primitive object={glassMaterial} attach="material" />
            </mesh>

            {/* Bottle Neck (smaller glass cylinder) */}
            <mesh position={[0, 1.0, 0]} castShadow>
                <cylinderGeometry args={[0.5, 0.5, 0.4, 32]} />
                <primitive object={glassMaterial} attach="material" />
            </mesh>

            {/* Golden Cap (upper lid) */}
            <mesh ref={capRef} position={[0, 1.45, 0]} castShadow>
                <cylinderGeometry args={[0.6, 0.6, 0.5, 32]} />
                <primitive object={goldMaterial} attach="material" />
            </mesh>

            {/* Decorative Golden Ribbon/Bow */}
            <mesh ref={bowRef} position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[0.4, 0.08, 16, 100]} />
                <primitive object={goldMaterial} attach="material" />
            </mesh>

            {/* Dynamic Label */}
            <mesh position={[0, -0.2, 0]} castShadow>
                <cylinderGeometry args={[1.21, 1.21, 0.8, 32, 1, true, Math.PI - (Math.PI * 0.4) / 2, Math.PI * 0.4]} />
                <primitive object={labelMaterial} attach="material" />
            </mesh>

            {/* Gold backing segment behind white label */}
            <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[1.205, 1.205, 0.84, 32, 1, true, Math.PI - (Math.PI * 0.42) / 2, Math.PI * 0.42]} />
                <primitive object={goldMaterial} attach="material" />
            </mesh>

            {/* Gold Fragrance Spray Mist Points */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[particlePositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color={0xD4AF37}
                    size={0.07}
                    transparent
                    opacity={scrollFraction * 0.8}
                />
            </points>
        </group>
    );
};

// Background ambient floating sparkles
const AmbientSparkles: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const count = 40;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 8; // X
            positions[i + 1] = (Math.random() - 0.5) * 8; // Y
            positions[i + 2] = (Math.random() - 0.5) * 8; // Z
        }
        return positions;
    }, []);

    useFrame(() => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.001;
            pointsRef.current.rotation.x += 0.0005;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color={0xD4AF37}
                size={0.06}
                transparent
                opacity={0.4}
            />
        </points>
    );
};

interface PerfumeSceneProps {
    scrollFraction: number;
    mouse: { x: number; y: number };
}

const PerfumeScene: React.FC<PerfumeSceneProps> = ({ scrollFraction, mouse }) => {
    return (
        <div style={{ width: '100%', height: '100%', outline: 'none' }}>
            <Canvas
                camera={{ position: [0, 0.4, 5.8], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.4} castShadow />
                <directionalLight position={[-5, -3, 2]} intensity={0.8} color="#ffb7c5" />
                
                <PerfumeModel scrollFraction={scrollFraction} mouse={mouse} />
                <AmbientSparkles />
            </Canvas>
        </div>
    );
};

export default PerfumeScene;
