import { RigidBody } from '@react-three/rapier';
import CubeController from './CubeController';
import {socket} from './server';
import { RemotePlayer } from './RemotePlayer';
import { useEffect } from 'react';
import { useState } from 'react';
import * as THREE from 'three'; 
import { Map1 } from './components/Map1';
import { Castle } from './components/Castle';
import { Medieval } from './components/Medieval';
const Mapseting=({room})=>{
  if(room==0){
    console.log("i am o",room);
    
    return(<><RigidBody  name='floor' type="fixed" colliders="trimesh">
      <group scale={5}>
        <Castle/>
        {/* <Medieval/> */}
      </group>
      </RigidBody></>)
  }
  else if(room==1){
    console.log("i am 1");
    return(<><RigidBody name='floor' type="fixed" colliders="trimesh">
      <group scale={5}>
        <Castle/>
        {/* <Medieval/> */}
      </group>
      </RigidBody></>)
  }
  else if(room==2){console.log("i am 2",room);
    return(<><RigidBody name='floor' type="fixed" colliders="trimesh">
      <group scale={5}>
        {/* <Castle/> */}
        <Medieval/>
      </group>
      </RigidBody></>)
  }
 else{
    return(<><RigidBody name='floor' type="fixed" colliders="trimesh">
      <group scale={4}>
        {/* <Castle/> */}
        <Medieval/>
      </group>
      </RigidBody></>)
  }
}
export const Experience=({room,co})=>{
   const [r,setR]=useState(co);
  console.log(r,"begining")
  const [details,setDetails]=useState(room.detalis);
  
 useEffect(() => {
  const updateRoom = (data) => {
    setDetails(data.detalis);
    
    // console.log(r,data);
    
  };
  socket.on('room-update', updateRoom);
  return () => socket.off('room-update', updateRoom);
}, []);

  // console.log(room,socket.id,room.roomname);
    return (<>
    <ambientLight intensity={co%2 === 0 ? 1: 0.2} />
      <directionalLight position={[5, 10, 7]} intensity={1.2} />
      {socket.id && <CubeController id={socket.id} roomname={room.roomname} detalis={details[socket.id]} room={room} co={co%2}/>}
      {Object.entries(details).map(([playerId, data]) => (
  playerId === socket.id ? null : (
    <RemotePlayer key={playerId} position={data.state} walk={data.walk} shirt={data.color} co={co%2}/>
  )
))}
 <Mapseting key={r} room={r} />

    </>)
}