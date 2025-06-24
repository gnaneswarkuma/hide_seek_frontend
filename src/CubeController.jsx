import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { socket } from './server';
import { Foot_ball } from './components/Foot_ball';

export default function CubeController({ id, roomname, detalis, room, co }) {
  const targetColorRef = useRef(room.detalis[room.players[0]].color);
  const kkRef = useRef(0);
  const collisionEnabledRef = useRef(true);
  const rigidBodyRef = useRef();
  const characterRef = useRef();
  const smoothedLookTarget = useRef(new THREE.Vector3());
  const prevPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const { camera } = useThree();

  const [position, setPosition] = useState([0, 1, 0]);
  const [k, setK] = useState(0);
  const [keys, setKeys] = useState({});
  const angleRef = useRef(0);
  const isMouseDown = useRef(false);
  const isGrounded = useRef(true);
  const [walk, useWalk] = useState(false);
  const [check, setCheck] = useState("didn't scored this round");

  const SPEED = 5;
  const CAMERA_LERP = 0.1;
  const JUMP_FORCE = 7;

  useEffect(() => {
    rigidBodyRef.current?.setTranslation({
      x: detalis.state[0],
      y: detalis.state[1],
      z: detalis.state[2],
    }, false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      kkRef.current = (kkRef.current + 1) % room.players.length;
      const newTarget = room.detalis[room.players[kkRef.current]]?.color;
      if (newTarget && newTarget !== targetColorRef.current) {
        targetColorRef.current = newTarget;
        collisionEnabledRef.current = true;
        socket.emit("newtarget", { roomname, newTarget });
        setCheck("didn't scored this round");
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const down = (e) => setKeys((k) => ({ ...k, [e.code]: true }));
    const up = (e) => setKeys((k) => ({ ...k, [e.code]: false }));
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useEffect(() => {
    const onMouseDown = () => (isMouseDown.current = true);
    const onMouseUp = () => (isMouseDown.current = false);
    const onMouseMove = (e) => {
      if (isMouseDown.current) {
        angleRef.current -= e.movementX * 0.002;
      }
    };

    let lastTouchX = null;

    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isMouseDown.current = true;
        lastTouchX = e.touches[0].clientX;
      }
    };

    const onTouchMove = (e) => {
      if (!isMouseDown.current || e.touches.length !== 1) return;
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - lastTouchX;
      angleRef.current -= deltaX * 0.002;
      lastTouchX = touchX;
    };

    const onTouchEnd = () => {
      isMouseDown.current = false;
      lastTouchX = null;
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  useFrame(() => {
    const body = rigidBodyRef.current;
    const chara = characterRef.current;
    if (!body || !chara) return;

    const angle = angleRef.current;
    const input = new THREE.Vector3();

    if (keys['KeyW']) input.z += 1;
    if (keys['KeyS']) input.z -= 1;
    if (keys['KeyA']) input.x += 1;
    if (keys['KeyD']) input.x -= 1;

    input.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    const vel = input.multiplyScalar(SPEED);
    const currentY = body.linvel().y;

    body.setLinvel({ x: vel.x, y: currentY, z: vel.z }, true);

    const moving = Math.abs(vel.x) > 0.01 || Math.abs(vel.z) > 0.01;
    useWalk(moving);

    if (moving) {
      const axis = new THREE.Vector3(vel.z, 0, -vel.x).normalize();
      const speed = Math.min(vel.length(), SPEED);
      const angle = speed * 0.03;
      const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      chara.quaternion.slerp(deltaQuat.multiply(chara.quaternion), 0.3);
    }

    if (keys['Space'] && isGrounded.current) {
      body.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true);
      isGrounded.current = false;
    }

    const pos = body.translation();
    setPosition([pos.x, pos.y, pos.z]);

    // ✅ Reset position if out of bounds
    if (pos.y < -5 || pos.x < -20 || pos.z < -20) {
      body.setTranslation({ x: 0, y: 15, z: 0 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    const camOffset = new THREE.Vector3(-Math.sin(angle) * 3, 2.3, -Math.cos(angle) * 3);
    const camTarget = new THREE.Vector3(pos.x, pos.y, pos.z).add(camOffset);
    camera.position.lerp(camTarget, CAMERA_LERP);

    const lookTarget = new THREE.Vector3(pos.x, pos.y + 1, pos.z);
    smoothedLookTarget.current.lerp(lookTarget, CAMERA_LERP);
    camera.lookAt(smoothedLookTarget.current);

    const prev = prevPositionRef.current;
    const dx = Math.abs(prev.x - pos.x);
    const dy = Math.abs(prev.y - pos.y);
    const dz = Math.abs(prev.z - pos.z);
    const THRESHOLD = 0.01;

    if (dx > THRESHOLD || dy > THRESHOLD || dz > THRESHOLD) {
      socket.emit("update-position", {
        roomname,
        id,
        position: [pos.x, pos.y, pos.z],
      });
      prevPositionRef.current = { x: pos.x, y: pos.y, z: pos.z };
      setK(0);
    } else {
      if (k === 0) {
        socket.emit("no-update", { roomname, id });
        setK(1);
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders="ball"
      enabledRotations={[false, false, false]}
      linearDamping={4}
      name={detalis.color}
      onCollisionEnter={(e) => {
        isGrounded.current = true;
        if (!collisionEnabledRef.current) return;
        const currentTarget = targetColorRef.current;
        if (e.rigidBodyObject.name === currentTarget) {
          socket.emit("score", { id, roomname });
          collisionEnabledRef.current = false;
          console.log("✅ Scored!", currentTarget);
          setCheck("✅ Scored!");
        }
      }}
    >
      <group ref={characterRef} scale={0.5}>
        <Foot_ball shirt={detalis.color} walk={walk} />
        {co === 1 && <pointLight intensity={30} decay={1} distance={5} color={detalis.color} />}
      </group>
    </RigidBody>
  );
}
