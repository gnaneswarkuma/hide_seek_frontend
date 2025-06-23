import React from 'react'
import { useGLTF } from '@react-three/drei'
import { MeshStandardMaterial } from 'three'

export function Foot_ball({ shirt = "red", ...props }) {
  const { nodes, materials } = useGLTF('/models/foot_ball.glb')


  const shirtMaterial = new MeshStandardMaterial({ color: shirt })

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Object_4.geometry} material={shirtMaterial} />
      <mesh geometry={nodes.Object_5.geometry} material={materials['Material.008']} />
    </group>
  )
}

useGLTF.preload('/models/foot_ball.glb')

