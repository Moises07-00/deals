import React, { useRef, useState } from 'react';
import { Photo, User, Contact, PhotoReactionType } from '../types';

interface GalleryProps {
  currentUser: User;
  contacts: Contact[];
  photos: Photo[];
  onAddPhoto: (file: File) => Promise<void>;
  onDeletePhoto: (photoId: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ currentUser, contacts, photos, onAddPhoto, onDeletePhoto }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewingReactions, setViewingReactions] = useState<PhotoReactionType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      await onAddPhoto(e.target.files[0]);
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const myPhotos = photos.filter(p => p.ownerId === currentUser.phone);

  const getReactionIcon = (type: PhotoReactionType) => {
    switch(type) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'dislike': return '👎';
    }
  };

  const getReactorsName = (count: number) => {
    // Generate dummy names based on contacts for demo purposes
    if (count === 0) return [];
    
    return Array.from({ length: Math.min(count, 15) }).map((_, i) => {
      // Use existing contacts or fallback
      const contact = contacts[i % contacts.length];
      return contact ? contact.name : `Usuario ${i + 1}`;
    });
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    setViewingReactions(null);
    setShowDeleteConfirm(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhoto) {
      onDeletePhoto(selectedPhoto.id);
      closeLightbox();
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const toggleReactionView = (e: React.MouseEvent, type: PhotoReactionType) => {
    e.stopPropagation();
    if (viewingReactions === type) {
      setViewingReactions(null);
    } else {
      setViewingReactions(type);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Upload Header */}
      <div className="p-4 bg-white shadow-sm z-10">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors shadow-sm active:scale-95 ${isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-primary hover:bg-indigo-700'} text-white`}
        >
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Subiendo...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Subir Foto</span>
            </>
          )}
        </button>
      </div>

      {/* Photo Grid */}
      <div className="flex-1 overflow-y-auto p-1">
        {myPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg className="h-12 w-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Aún no has subido fotos</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {myPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className="relative aspect-[3/4] group overflow-hidden bg-gray-200 rounded-sm cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.url} 
                  alt="Gallery" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Reaction Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-1 py-1 flex justify-around items-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-blue-400">👍</span>
                    <span className="text-[8px] text-white font-medium">{photo.reactions.like}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-red-500">❤️</span>
                    <span className="text-[8px] text-white font-medium">{photo.reactions.love}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-300">👎</span>
                    <span className="text-[8px] text-white font-medium">{photo.reactions.dislike}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95 animate-fade-in" onClick={closeLightbox}>
          
          {/* Top Left: Delete Button */}
          <div className="absolute top-4 left-4 z-50">
             <button 
              className="text-red-500 bg-black/20 hover:bg-white/10 p-2 rounded-full transition-colors backdrop-blur-sm"
              onClick={handleDeleteClick}
              title="Eliminar foto"
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Top Right: Close Button */}
          <div className="absolute top-4 right-4 z-50">
            <button 
              className="text-white bg-black/20 hover:bg-white/10 p-2 rounded-full transition-colors backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={cancelDelete}>
              <div className="bg-white rounded-xl p-6 shadow-2xl w-64 text-center transform scale-100 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-3">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg leading-6 font-bold text-gray-900">¿Eliminar Foto?</h3>
                  <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
                </div>
                <div className="flex justify-center space-x-3 mt-5">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                  >
                    No
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Si
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Large Image */}
          <img 
            src={selectedPhoto.url} 
            alt="Full view" 
            className="max-w-full max-h-[75vh] object-contain transition-all duration-300"
            onClick={(e) => e.stopPropagation()} 
          />

          {/* Bottom Bar */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-8 px-6"
            onClick={(e) => e.stopPropagation()}
          >
             {/* List of Reactors Overlay */}
             {viewingReactions && (
              <div className="absolute bottom-24 left-4 right-4 bg-white/95 backdrop-blur rounded-xl p-4 shadow-2xl animate-slide-up max-h-60 overflow-y-auto">
                <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                  <h3 className="text-gray-900 font-bold flex items-center">
                    <span className="text-2xl mr-2">{getReactionIcon(viewingReactions)}</span>
                    Reacciones
                  </h3>
                  <button onClick={() => setViewingReactions(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {selectedPhoto.reactions[viewingReactions] === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-2">Nadie ha reaccionado así todavía.</p>
                ) : (
                  <ul className="space-y-2">
                    {getReactorsName(selectedPhoto.reactions[viewingReactions]).map((name, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {name.charAt(0)}
                        </div>
                        <span className="text-gray-800 font-medium">{name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex justify-around items-end">
              <button 
                onClick={(e) => toggleReactionView(e, 'like')}
                className={`flex flex-col items-center space-y-1 transition-all ${viewingReactions === 'like' ? 'scale-110 opacity-100' : 'opacity-80 hover:opacity-100'}`}
              >
                <span className="text-3xl drop-shadow-lg">👍</span>
                <span className="text-white text-sm font-medium">{selectedPhoto.reactions.like}</span>
              </button>

              <button 
                onClick={(e) => toggleReactionView(e, 'love')}
                className={`flex flex-col items-center space-y-1 transition-all ${viewingReactions === 'love' ? 'scale-110 opacity-100' : 'opacity-80 hover:opacity-100'}`}
              >
                <span className="text-3xl drop-shadow-lg">❤️</span>
                <span className="text-white text-sm font-medium">{selectedPhoto.reactions.love}</span>
              </button>

              <button 
                onClick={(e) => toggleReactionView(e, 'dislike')}
                className={`flex flex-col items-center space-y-1 transition-all ${viewingReactions === 'dislike' ? 'scale-110 opacity-100' : 'opacity-80 hover:opacity-100'}`}
              >
                <span className="text-3xl drop-shadow-lg">👎</span>
                <span className="text-white text-sm font-medium">{selectedPhoto.reactions.dislike}</span>
              </button>
            </div>
            <p className="text-center text-gray-400 text-xs mt-4">Toca una reacción para ver quién reaccionó</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;