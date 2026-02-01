import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, Photo } from '../types';
import { Share } from '@capacitor/share';

interface PhotoAlbumProps {
  language: Language;
  photos: Photo[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onOpenParentGate: (callback: () => void) => void;
}

const PhotoAlbum: React.FC<PhotoAlbumProps> = ({ 
  language, 
  photos, 
  onClose, 
  onDelete,
  onOpenParentGate
}) => {
  const isHebrew = language === Language.HEBREW;

  const handleShare = async (photo: Photo) => {
    try {
      await Share.share({
        title: isHebrew ? 'הסלפי שלי עם הארנב' : 'My selfie with the bunny',
        text: isHebrew ? 'תראו איזה יפה הצטלמתי עם הארנב שלי!' : 'Look at my cute selfie with my bunny!',
        files: [photo.url],
      });
    } catch (e) {
      console.error("Sharing failed", e);
    }
  };

  const handleDeleteClick = (id: string) => {
    // Request parent gate before deletion
    onOpenParentGate(() => {
      onDelete(id);
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(isHebrew ? 'he-IL' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[550] bg-slate-100 flex flex-col p-6 safe-area-inset-top safe-area-inset-bottom"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl border-2 border-purple-100 rotate-3">
            📸
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {isHebrew ? 'אלבום התמונות' : 'Photo Album'}
            </h2>
            <p className="text-sm text-slate-500 font-bold">
              {photos.length} {isHebrew ? 'רגעים קסומים' : 'Magic moments'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-2xl hover:bg-slate-300 transition-all"
        >
          ✕
        </button>
      </div>

      {/* Grid */}
      {photos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 text-center">
          <div className="w-32 h-32 bg-white rounded-3xl shadow-inner mb-6 flex items-center justify-center text-6xl opacity-20 border-4 border-dashed border-slate-200">
            🖼️
          </div>
          <p className="text-xl font-bold">
            {isHebrew ? 'האלבום עדיין ריק' : 'Album is empty'}
          </p>
          <p className="text-sm">
            {isHebrew ? 'זה הזמן להצטלם עם הארנב!' : 'Time to take a photo with the bunny!'}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-8 custom-scrollbar pr-2 pb-24">
          <AnimatePresence>
            {photos.map((photo) => (
              <motion.div 
                key={photo.id}
                layout
                initial={{ rotate: -2, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-white p-4 pb-12 shadow-2xl rounded-sm border border-slate-200 relative group polaroid-frame"
              >
                {/* Photo Area */}
                <div className="aspect-square bg-slate-100 overflow-hidden mb-4 border border-slate-100">
                  <img 
                    src={photo.url} 
                    className="w-full h-full object-cover grayscale-[20%] sepia-[10%] group-hover:grayscale-0 transition-all duration-500" 
                    alt="Selfie" 
                  />
                </div>
                
                {/* Caption / Date */}
                <div className="text-center font-handwriting text-slate-600 text-lg">
                  {formatDate(photo.timestamp)}
                </div>

                {/* Polaroid Shadow Overlay */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.05)]" />

                {/* Overlays (Hidden by default) */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleShare(photo)}
                    className="w-12 h-12 bg-purple-600 rounded-full text-white shadow-xl flex items-center justify-center text-xl active:scale-90"
                    title={isHebrew ? 'שתף' : 'Share'}
                  >
                    📤
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(photo.id)}
                    className="w-12 h-12 bg-red-500 rounded-full text-white shadow-xl flex items-center justify-center text-xl active:scale-90"
                    title={isHebrew ? 'מחק' : 'Delete'}
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-slate-200 bg-slate-100/80 backdrop-blur-sm">
        <button 
          onClick={onClose}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-xl rounded-2xl shadow-[0_8px_0_rgb(126,34,206)] active:translate-y-1 active:shadow-none transition-all"
        >
          {isHebrew ? 'חזרה לארנב' : 'Back to Bunny'}
        </button>
      </div>

      <style>{`
        .polaroid-frame {
          box-shadow: 0 10px 25px rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
        }
        .polaroid-frame:hover {
          transform: translateY(-5px) rotate(1deg);
        }
        .font-handwriting {
          font-family: 'Brush Script MT', cursive;
        }
      `}</style>
    </motion.div>
  );
};

export default PhotoAlbum;
