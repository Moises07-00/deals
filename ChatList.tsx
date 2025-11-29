import React, { useState, useMemo } from 'react';
import { Contact, Message, ChatPreview, User, Post, ReactionType, Photo } from '../types';
import AddContactModal from './AddContactModal';
import CreatePostModal from './CreatePostModal';
import AnnouncementFeed from './AnnouncementFeed';
import Gallery from './Gallery';
import NewChatModal from './NewChatModal';

interface ChatListProps {
  currentUser: User;
  contacts: Contact[];
  messages: Message[];
  posts: Post[];
  photos: Photo[];
  onSelectChat: (contact: Contact) => void;
  onAddContact: (contact: Contact, initialMessage?: string) => void;
  onAddPost: (text: string) => void;
  onAddPhoto: (file: File) => Promise<void>;
  onDeletePhoto: (photoId: string) => void;
  onReactToPost: (postId: string, reaction: ReactionType) => void;
}

const ChatList: React.FC<ChatListProps> = ({ 
  currentUser, 
  contacts, 
  messages, 
  posts,
  photos,
  onSelectChat, 
  onAddContact,
  onAddPost,
  onAddPhoto,
  onDeletePhoto,
  onReactToPost,
}) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'announcements' | 'gallery'>('messages');
  const [searchTerm, setSearchTerm] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Derive chat history from messages and contacts
  const chats: ChatPreview[] = useMemo(() => {
    return contacts.map(contact => {
      // Find last message exchanged with this contact
      const contactMessages = messages.filter(m => 
        (m.senderId === contact.phone && m.receiverId === currentUser.phone) ||
        (m.senderId === currentUser.phone && m.receiverId === contact.phone)
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // If contact is pending, but we sent a welcome message, we still show it in list
      if (contactMessages.length === 0) return null;

      return {
        contact,
        lastMessage: contactMessages[0]
      };
    })
    .filter((chat): chat is ChatPreview => chat !== null) // Filter out nulls (contacts with no messages)
    .sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [contacts, messages, currentUser.phone]);

  const filteredChats = chats.filter(chat => 
    chat.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.contact.phone.includes(searchTerm)
  );

  const formatTime = (dateStr: Date) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleInterest = (contactPhone: string) => {
    const contact = contacts.find(c => c.phone === contactPhone);
    if (contact && contact.status === 'connected') {
      setActiveTab('messages');
      onSelectChat(contact);
    }
  };

  const handleSelectChatFromList = (contact: Contact) => {
    if (contact.status === 'connected') {
      onSelectChat(contact);
    } else {
      alert("Debes esperar a que el contacto acepte tu solicitud.");
    }
  };

  const handleNewChatSelection = (contact: Contact) => {
    setIsNewChatModalOpen(false);
    onSelectChat(contact);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4 overflow-x-auto no-scrollbar w-full">
            <h1 
              onClick={() => setActiveTab('messages')}
              className={`text-xl font-bold cursor-pointer whitespace-nowrap transition-colors ${activeTab === 'messages' ? 'text-gray-800 border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Mensajes
            </h1>
            <h1 
              onClick={() => setActiveTab('announcements')}
              className={`text-xl font-bold cursor-pointer whitespace-nowrap transition-colors ${activeTab === 'announcements' ? 'text-gray-800 border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Noticias
            </h1>
            <h1 
              onClick={() => setActiveTab('gallery')}
              className={`text-xl font-bold cursor-pointer whitespace-nowrap transition-colors ${activeTab === 'gallery' ? 'text-gray-800 border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Galería
            </h1>
          </div>
        </div>
        
        {/* Search Bar - Only for messages */}
        {activeTab === 'messages' && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder="Buscar contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Content Area */}
      {activeTab === 'messages' ? (
        <>
          <div className="p-4 bg-white border-b border-gray-100">
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-all active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Agregar Nuevo Contacto</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-20">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <p>No se encontraron conversaciones</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredChats.map(({ contact, lastMessage }) => (
                  <li 
                    key={contact.phone} 
                    onClick={() => handleSelectChatFromList(contact)}
                    className={`px-4 py-3 transition-colors ${contact.status === 'pending' ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50 cursor-pointer active:bg-gray-100'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 h-12 w-12 rounded-full ${contact.avatarColor} flex items-center justify-center text-white font-bold text-lg relative`}>
                        {contact.name.charAt(0).toUpperCase()}
                        {contact.status === 'pending' && (
                          <span className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border-2 border-white">
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className="text-base font-semibold text-gray-900 truncate flex items-center">
                            {contact.name}
                            {contact.status === 'pending' && <span className="ml-2 text-xs text-yellow-600 font-normal">(Pendiente)</span>}
                          </p>
                          {lastMessage && (
                            <p className="text-xs text-gray-500">
                              {formatTime(lastMessage.timestamp)}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {lastMessage 
                            ? (lastMessage.senderId === currentUser.phone ? `Tú: ${lastMessage.text}` : lastMessage.text) 
                            : <span className="text-secondary italic">Nueva conversación</span>
                          }
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* New Chat FAB */}
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="absolute bottom-6 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-105 active:scale-95 z-20"
            aria-label="Nuevo mensaje"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        </>
      ) : activeTab === 'announcements' ? (
        // Announcements Tab
        <>
          <AnnouncementFeed 
            posts={posts} 
            contacts={contacts} 
            currentUser={currentUser}
            onReact={onReactToPost}
            onInterest={handleInterest}
          />
          
          {/* Create Post FAB */}
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="absolute bottom-6 right-6 h-14 w-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-105 active:scale-95 z-20"
            aria-label="Crear publicación"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </>
      ) : (
        // Gallery Tab
        <Gallery 
          currentUser={currentUser}
          contacts={contacts}
          photos={photos}
          onAddPhoto={onAddPhoto}
          onDeletePhoto={onDeletePhoto}
        />
      )}

      {/* Modals */}
      {isContactModalOpen && (
        <AddContactModal 
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          onAdd={onAddContact}
          currentUser={currentUser}
        />
      )}

      {isPostModalOpen && (
        <CreatePostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onPost={onAddPost}
        />
      )}

      {isNewChatModalOpen && (
        <NewChatModal
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
          contacts={contacts}
          onSelectContact={handleNewChatSelection}
        />
      )}
    </div>
  );
};

export default ChatList;