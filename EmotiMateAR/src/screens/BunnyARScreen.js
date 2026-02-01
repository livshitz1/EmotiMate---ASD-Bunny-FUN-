import React from 'react';
import { ViroARSceneNavigator } from '@viro-community/react-viro';
import BunnyARScene from '../scenes/BunnyARScene';

export default function BunnyARScreen() {
  return <ViroARSceneNavigator initialScene={{ scene: BunnyARScene }} />;
}
