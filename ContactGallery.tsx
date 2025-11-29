import React, { useState } from 'react';
import { Photo } from '../types';

interface ContactGalleryProps {
  photos: Photo[];
  contactName: string;
  onClose: () => void;
}

const ContactGallery: React.FC<ContactGalleryProps> = ({ photos, contactName, onClose }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full h-[80vh] flex flex-col">
          
          {/* Header */}
          <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Galería de {contactName}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-1 bg-slate-50">
            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                <svg className="h-12 w-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>{contactName} no ha subido fotos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {photos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className="relative aspect-[3/4] group overflow-hidden bg-gray-200 cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img 
                      src={photo.url} 
                      alt={`Foto de ${contactName}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Mini Reaction Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 flex justify-center space-x-2">
                       <span className="text-[10px] text-white">❤️ {(photo.reactions.like || 0) + (photo.reactions.love || 0) + (photo.reactions.dislike || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black bg-opacity-95 animate-fade-in" onClick={() => setSelectedPhoto(null)}>
          
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-50">
            <button 
              className="text-white bg-black/20 hover:bg-white/10 p-2 rounded-full transition-colors backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image */}
          <img 
            src={selectedPhoto.url} 
            alt="Full view" 
            className="max-w-full max-h-[75vh] object-contain"
            onClick={(e) => e.stopPropagation()} 
          />

          {/* Reactions Footer (Read Only) */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-8 px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-around items-end">
              <div className="flex flex-col items-center space-y-1 opacity-90">
                <span className="text-3xl drop-shadow-lg">👍</span>
                <span className="text-white text-sm font-medium">{selectedPhoto.reactions.like}</span>
              </div>

              <div className="flex flex-col items-center space-y-1 opacity-90">
                <span className="text-3xl drop-shadow-lg">❤️</span>
                <span className="text-white text-sm font-medium">{selectedPhoto.reactions.love}</span>
              </div>

              <div className="flex flex-col items-center space-y-1 opacity-90">
                <span className="text-3xl drop-shadow-lg">👎</span>
                <span className="text-white text-sm font-medium">{selectedPhoto.reactions.dislike}</span>
              </div>
            </div>
            {/* Disclaimer text explaining they can't see details */}
            <p className="text-center text-gray-500 text-[10px] mt-4 uppercase tracking-widest">
              Reacciones (Vista pública)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactGallery;