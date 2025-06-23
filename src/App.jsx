// src/App.jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useLocation } from 'react-router-dom';
import './App.css'; 
import { Experience } from './Experience';
import { Suspense, useEffect, useState } from 'react';
import {Physics} from "@react-three/rapier"
import { PlayerInfo } from './Contant/PlayerInfo';
import { socket } from "./server";
export default function App() {
  
    const location = useLocation();
  const room = location.state[0];
  console.log(location,"iiiiiiiiiiiiiii");
  const co=location.state[1];
  return (<>
          <div className="app" style={{backgroundColor:co%2 === 0 ? 'wheat' :  '#121314'}}>

          <Canvas camera={{ position: [0, 3, 8], fov: 70 }}>
              <Suspense>
                <Physics >
                  <Experience room={room} co={co}/>
                </Physics>
              </Suspense>
          </Canvas>
          </div>
        <div className='contant'>
             <PlayerInfo room={room}/>
        </div>
        </>
  );
}

