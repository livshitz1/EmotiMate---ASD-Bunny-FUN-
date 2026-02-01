import React, { useRef } from 'react';
import {
  ViroARScene,
  ViroText,
  Viro3DObject,
  ViroAmbientLight,
  ViroARPlaneSelector,
} from '@viro-community/react-viro';

export default function BunnyARScene() {
  const bunnyRef = useRef(null);

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={500} />
      <ViroARPlaneSelector>
        <Viro3DObject
          ref={bunnyRef}
          source={require('../../assets/models/bunny_temp.glb')}
          position={[0, 0, -1]}
          scale={[0.3, 0.3, 0.3]}
          type="GLB"
          onClick={() => {
            console.log("הארנב נלחץ!");
          }}
        />
      </ViroARPlaneSelector>

      <ViroText
        text="הארנב מחכה לגזר 🥕"
        position={[0, 0.3, -1]}
        style={{ fontSize: 20, color: '#fff' }}
      />
    </ViroARScene>
  );
}
