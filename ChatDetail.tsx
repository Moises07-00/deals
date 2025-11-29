import React, { useState, useEffect, useRef } from 'react';
import { Contact, Message, User, Photo } from '../types';
import ContactGallery from './ContactGallery';

interface ChatDetailProps {
  currentUser: User;
  contact: Contact;
  messages: Message[];
  photos: Photo[];
  onSendMessage: (text: string, imageUrl?: string) => void;
  onBack: () => void;
}

const ChatDetail: React.FC<ChatDetailProps> = ({ 
  currentUser, 
  contact, 
  messages, 
  photos,
  onSendMessage, 
  onBack 
}) => {
  const [inputText, setInputText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const relevantMessages = messages.filter(m => 
    (m.senderId === currentUser.phone && m.receiverId === contact.phone) ||
    (m.senderId === contact.phone && m.receiverId === currentUser.phone)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Filter photos belonging to this contact
  const contactPhotos = photos.filter(p => p.ownerId === contact.phone);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [relevantMessages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendImage = () => {
    if (previewImage) {
      onSendMessage(inputText, previewImage);
      setPreviewImage(null);
      setInputText('');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center space-x-3 z-10 sticky top-0">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className={`h-10 w-10 rounded-full ${contact.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">{contact.name}</h2>
          <p className="text-xs text-gray-500">{contact.phone}</p>
        </div>
        
        {/* Gallery Button */}
        <button 
          onClick={() => setIsGalleryOpen(true)}
          className="p-2 text-gray-500 hover:text-primary hover:bg-indigo-50 rounded-full transition-colors"
          title="Ver Galería"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {relevantMessages.length === 0 && (
          <div className="text-center mt-8 opacity-50">
            <p className="text-sm text-gray-500">Comienza la conversación con {contact.name}</p>
          </div>
        )}
        
        {relevantMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.phone;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                  isMe 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.imageUrl && (
                  <img 
                    src={msg.imageUrl} 
                    alt="Enviado" 
                    className="rounded-lg mb-2 max-w-full h-auto object-cover" 
                  />
                )}
                {msg.text && <p>{msg.text}</p>}
                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white px-4 py-3 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          {/* Image Input Trigger */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageSelect}
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-gray-800 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
            placeholder="Escribe un mensaje..."
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-primary text-white rounded-full shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="h-5 w-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden animate-fade-in">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Enviar Foto</h3>
              <div className="aspect-[3/4] w-full bg-gray-100 rounded-lg overflow-hidden mb-4">
                 <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
              </div>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary mb-4"
                placeholder="Agregar un comentario..."
              />
              <div className="flex space-x-3">
                <button 
                  onClick={() => { setPreviewImage(null); setInputText(''); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSendImage}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  Enviar Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Gallery Modal */}
      {isGalleryOpen && (
        <ContactGallery 
          photos={contactPhotos}
          contactName={contact.name}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatDetail;