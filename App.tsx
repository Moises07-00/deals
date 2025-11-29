import React, { useState, useCallback } from 'react';
import ChatList from './components/ChatList';
import ChatDetail from './components/ChatDetail';
import NotificationToast from './components/NotificationToast';
import { User, Contact, Message, Post, ReactionType, Photo, Notification } from './types';

// Mock initial data so the app isn't completely empty
const MOCK_USER: User = {
  name: 'Usuario Principal',
  phone: '5555555555',
  password: ''
};

const INITIAL_CONTACTS: Contact[] = [
  {
    name: 'Soporte Técnico',
    phone: '000-000',
    avatarColor: 'bg-blue-500',
    status: 'connected'
  }
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: '¡Bienvenido a GeminiMsg! Aquí podrás chatear y ver noticias.',
    timestamp: new Date(),
    senderId: '000-000',
    receiverId: '5555555555'
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    senderId: '000-000',
    text: 'Estamos lanzando la versión beta de la aplicación. ¡Esperamos que les guste!',
    timestamp: new Date(),
    reactions: { like: 5, dislike: 0, great: 2 }
  }
];

const App: React.FC = () => {
  // --- STATE ---
  // Start directly with a logged-in user
  const [currentUser] = useState<User>(MOCK_USER);

  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [photos, setPhotos] = useState<Photo[]>([]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- HANDLERS ---

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAddContact = (newContact: Contact, initialMessage?: string) => {
    const contactWithStatus = { ...newContact, status: 'pending' } as Contact;
    
    setContacts(prev => {
      if (prev.find(c => c.phone === newContact.phone)) return prev;
      return [contactWithStatus, ...prev];
    });

    if (initialMessage && currentUser) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: initialMessage,
        timestamp: new Date(),
        senderId: currentUser.phone,
        receiverId: newContact.phone
      };
      setMessages(prev => [...prev, newMessage]);
    }

    addNotification(`Solicitud enviada a ${newContact.name}.`, 'info');

    setTimeout(() => {
        const accepted = Math.random() < 0.8;
        if (accepted) {
            setContacts(prev => prev.map(c => 
                c.phone === newContact.phone ? { ...c, status: 'connected' } : c
            ));
            addNotification(`${newContact.name} aceptó tu solicitud.`, 'success');
        } else {
            setContacts(prev => prev.filter(c => c.phone !== newContact.phone));
            setMessages(prev => prev.filter(m => 
                !(m.receiverId === newContact.phone && m.senderId === currentUser?.phone)
            ));
            addNotification(`${newContact.name} rechazó tu solicitud.`, 'error');
        }
    }, 4000);
  };

  const handleSendMessage = (text: string, imageUrl?: string) => {
    if (!currentUser || !activeContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      imageUrl,
      timestamp: new Date(),
      senderId: currentUser.phone,
      receiverId: activeContact.phone
    };

    setMessages(prev => [...prev, newMessage]);

    // Simple auto-reply simulation for testing
    if (activeContact.phone === '000-000') {
      setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Gracias por tu mensaje. Un agente te atenderá pronto.',
          timestamp: new Date(),
          senderId: activeContact.phone,
          receiverId: currentUser.phone
        };
        setMessages(prev => [...prev, reply]);
      }, 1000);
    }
  };

  const handleAddPost = (text: string) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Date.now().toString(),
      senderId: currentUser.phone,
      text,
      timestamp: new Date(),
      reactions: { like: 0, dislike: 0, great: 0 }
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleAddPhoto = async (file: File): Promise<void> => {
    if (!currentUser) return;

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setTimeout(() => {
                    const newPhoto: Photo = {
                        id: Date.now().toString(),
                        ownerId: currentUser.phone,
                        url: e.target?.result as string,
                        reactions: { like: 0, love: 0, dislike: 0 }
                    };
                    setPhotos(prev => [newPhoto, ...prev]);
                    resolve();
                }, 1500);
            } else {
                resolve();
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleReaction = (postId: string, reaction: ReactionType) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const currentReaction = post.userReaction;
        const counts = { ...post.reactions };
        let newUserReaction: ReactionType | undefined = reaction;

        if (currentReaction === reaction) {
          counts[reaction] = Math.max(0, counts[reaction] - 1);
          newUserReaction = undefined;
        } else {
          counts[reaction]++;
          if (currentReaction) {
            counts[currentReaction] = Math.max(0, counts[currentReaction] - 1);
          }
        }

        return {
          ...post,
          reactions: counts,
          userReaction: newUserReaction
        };
      }
      return post;
    }));
  };

  const visiblePosts = posts.filter(p => {
    if (!currentUser) return false;
    if (p.senderId === currentUser.phone) return true;
    const contact = contacts.find(c => c.phone === p.senderId);
    return contact?.status === 'connected';
  });

  const visiblePhotos = photos.filter(p => {
    if (!currentUser) return false;
    if (p.ownerId === currentUser.phone) return true;
    const contact = contacts.find(c => c.phone === p.ownerId);
    return contact?.status === 'connected';
  });

  return (
    <div className="flex justify-center bg-gray-200 h-screen w-full relative">
      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />
      
      <div className="w-full max-w-md bg-white shadow-xl h-full overflow-hidden flex flex-col">
        {activeContact ? (
          <ChatDetail 
            currentUser={currentUser}
            contact={activeContact}
            messages={messages}
            photos={visiblePhotos}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveContact(null)}
          />
        ) : (
          <ChatList 
            currentUser={currentUser}
            contacts={contacts}
            messages={messages}
            posts={visiblePosts}
            photos={visiblePhotos}
            onSelectChat={setActiveContact}
            onAddContact={handleAddContact}
            onAddPost={handleAddPost}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
            onReactToPost={handleReaction}
          />
        )}
      </div>
    </div>
  );
};

export default App;