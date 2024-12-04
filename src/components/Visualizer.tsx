import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface VisualizerProps {
  analyser: AnalyserNode | null
  type: 'bars' | 'wave' | 'circular'
  quality: string
}

export const Visualizer: React.FC<VisualizerProps> = ({ analyser, type, quality }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const lineRef = useRef<THREE.Line>(null)
  const circleRef = useRef<THREE.Line>(null)
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  const barCount = quality === 'low' ? 64 : quality === 'high' ? 256 : 128;
  const barWidth = 0.03
  const barSpacing = 0.01

  const wavePoints = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(barCount * 3)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [barCount])

  const circlePoints = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array((barCount + 1) * 3)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [barCount])

  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: 0x00ff00 }), [])
  const circleMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: 0xff00ff }), [])

  useFrame((state) => {
    if (!analyser) return

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(dataArray)

    const time = state.clock.getElapsedTime()

    if (type === 'bars' && meshRef.current) {
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] / 255
        const scale = value * 3 + 0.1
        const hue = (i / barCount + time * 0.1) % 1
        
        tempObject.position.set(
          (i - barCount / 2) * (barWidth + barSpacing),
          scale / 2 - 0.5,
          Math.sin(time * 2 + i * 0.1) * 0.1
        )
        tempObject.scale.set(barWidth, scale, 0.1)
        tempObject.updateMatrix()
        
        meshRef.current.setMatrixAt(i, tempObject.matrix)
        
        tempColor.setHSL(hue, 0.8, 0.5)
        meshRef.current.setColorAt(i, tempColor)
      }

      meshRef.current.instanceMatrix.needsUpdate = true
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    } else if (type === 'wave' && lineRef.current) {
      const positions = wavePoints.attributes.position.array as Float32Array
      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] / 255
        positions[i * 3] = (i / barCount) * 4 - 2
        positions[i * 3 + 1] = value * 2 - 1
        positions[i * 3 + 2] = 0
      }
      wavePoints.attributes.position.needsUpdate = true
    } else if (type === 'circular' && circleRef.current) {
      const positions = circlePoints.attributes.position.array as Float32Array
      for (let i = 0; i <= barCount; i++) {
        const value = dataArray[i % barCount] / 255
        const angle = (i / barCount) * Math.PI * 2
        const radius = value * 1.5 + 0.5
        positions[i * 3] = Math.cos(angle) * radius
        positions[i * 3 + 1] = Math.sin(angle) * radius
        positions[i * 3 + 2] = 0
      }
      circlePoints.attributes.position.needsUpdate = true
    }
  })

  return (
    <>
      {type === 'bars' && (
        <instancedMesh ref={meshRef} args={[undefined, undefined, barCount]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshPhongMaterial />
        </instancedMesh>
      )}
      {type === 'wave' && (
        <line ref={lineRef}>
          <bufferGeometry attach="geometry" {...wavePoints} />
          <primitive object={lineMaterial} attach="material" />
        </line>
      )}
      {type === 'circular' && (
        <line ref={circleRef}>
          <bufferGeometry attach="geometry" {...circlePoints} />
          <primitive object={circleMaterial} attach="material" />
        </line>
      )}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </>
  )
}

