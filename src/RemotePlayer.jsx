import { useEffect, useRef } from "react";
import { RigidBody } from "@react-three/rapier";
import { Foot_ball } from "./components/Foot_ball";
import * as THREE from "three";

export function RemotePlayer({ position = [0, 1, 0], walk = false, shirt ,co}) {
  const bodyRef = useRef();
  const smoothPos = useRef(new THREE.Vector3(...position));
  const rotationRef = useRef(new THREE.Quaternion());

  useEffect(() => {
    if (!bodyRef.current) return;

    const curr = new THREE.Vector3(...position);
    smoothPos.current.lerp(curr, 0.3); // smoother transition
    const delta = new THREE.Vector3().subVectors(smoothPos.current, curr);
    const distance = delta.length();

    if (distance > 0.001) {
      const axis = new THREE.Vector3().crossVectors(delta, new THREE.Vector3(0, 1, 0)).normalize();
      const angle = distance / 0.5;
      const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      rotationRef.current.multiply(q);
    }

    bodyRef.current.setNextKinematicTranslation({
      x: smoothPos.current.x,
      y: smoothPos.current.y,
      z: smoothPos.current.z,
    });

    bodyRef.current.setNextKinematicRotation({
      x: rotationRef.current.x,
      y: rotationRef.current.y,
      z: rotationRef.current.z,
      w: rotationRef.current.w,
    });
  }, [position]);

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders="ball"
      enabledRotations={[1, 1, 1]}
      name={shirt}
      
    >
      <group scale={0.5}>
        <Foot_ball shirt={shirt} walk={walk} />
          {co==1 &&  <pointLight  intensity={30} decay={1} distance={5} color={shirt} />}
     
      </group>
    </RigidBody>
  );
}
