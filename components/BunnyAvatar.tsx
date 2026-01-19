import React from 'react';
import { Emotion } from '../types';

interface BunnyAvatarProps {
  emotion: Emotion;
  imageUrl: string | null;
  isLoading: boolean;
}

const BunnyAvatar: React.FC<BunnyAvatarProps> = ({ emotion, imageUrl, isLoading }) => {
  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-purple-100">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 bg-opacity-80 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-purple-600 font-bold animate-pulse">הארנב מתכונן...</p>
        </div>
      )}
      
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={`Bunny feeling ${emotion}`} 
          className="w-full h-full object-cover transition-opacity duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-purple-50">
           {/* Fallback visual if generation fails or initial load */}
           <div className="text-center">
             <div className="text-9xl mb-4">🐰</div>
             <p className="text-xl text-purple-400 font-bold">{emotion}</p>
           </div>
        </div>
      )}
      
      {/* Emotion Badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-purple-100">
        <span className="text-lg font-bold text-purple-800">מצב רוח: {emotion}</span>
      </div>
    </div>
  );
};

export default BunnyAvatar;