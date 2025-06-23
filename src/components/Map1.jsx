import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import "../App.css"
// import { Experience } from './Experience';
import { Suspense } from 'react';
// import {Physics} from "@react-three/rapier"
import { Castle } from './Castle';

import { Medieval } from './Medieval';
export const Map1=()=>{
    return (<>
      
        <div className='app'>
          <Canvas camera={{ position: [0, 3, 8], fov: 70 }}>
              <OrbitControls/>
              <ambientLight intensity={0.001}/>
              <Suspense>
                <Castle/>
              {/* <Medieval/> */}
              </Suspense>
              <Environment preset='night'/>
          </Canvas>
        </div>
        
      
    </>)
}


