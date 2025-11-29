import React from 'react';
import { Post, Contact, User, ReactionType } from '../types';

interface AnnouncementFeedProps {
  posts: Post[];
  contacts: Contact[];
  currentUser: User;
  onReact: (postId: string, reaction: ReactionType) => void;
  onInterest: (contactPhone: string) => void;
}

const AnnouncementFeed: React.FC<AnnouncementFeedProps> = ({ posts, contacts, currentUser, onReact, onInterest }) => {
  const getAuthor = (senderId: string) => {
    if (senderId === currentUser.phone) {
      return { name: 'Tú', avatarColor: 'bg-gray-400' };
    }
    const contact = contacts.find(c => c.phone === senderId);
    return contact || { name: 'Desconocido', avatarColor: 'bg-gray-300' };
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getReactionClass = (isActive: boolean, type: ReactionType) => {
    const baseClass = "flex items-center space-x-1 px-3 py-1 rounded-md transition-all duration-200 active:scale-95 transform";
    
    if (!isActive) {
      const hoverColors = {
        like: "hover:text-blue-600 hover:bg-blue-50",
        dislike: "hover:text-red-600 hover:bg-red-50",
        great: "hover:text-yellow-600 hover:bg-yellow-50"
      };
      return `${baseClass} text-gray-500 ${hoverColors[type]}`;
    }

    const activeColors = {
      like: "text-blue-600 bg-blue-50 font-semibold scale-105 shadow-sm",
      dislike: "text-red-600 bg-red-50 font-semibold scale-105 shadow-sm",
      great: "text-yellow-600 bg-yellow-50 font-semibold scale-105 shadow-sm"
    };
    return `${baseClass} ${activeColors[type]}`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100 p-4 space-y-4">
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <p>No hay noticias recientes</p>
        </div>
      ) : (
        posts.map((post) => {
          const author = getAuthor(post.senderId);
          const isMe = post.senderId === currentUser.phone;
          
          return (
            <div key={post.id} className="bg-white rounded-lg shadow p-4 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-full ${author.avatarColor} flex items-center justify-center text-white font-bold`}>
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{author.name}</h3>
                    <p className="text-xs text-gray-500">{formatTime(post.timestamp)}</p>
                  </div>
                </div>
                {!isMe && (
                   <button
                    onClick={() => onInterest(post.senderId)}
                    className="text-xs font-semibold text-primary bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors active:bg-indigo-200"
                   >
                     Me interesa
                   </button>
                )}
              </div>
              
              <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.text}</p>
              
              <div className="border-t border-gray-100 pt-3 flex justify-around">
                <button 
                  onClick={() => onReact(post.id, 'like')}
                  className={getReactionClass(post.userReaction === 'like', 'like')}
                >
                  <span className={`text-lg transition-transform ${post.userReaction === 'like' ? 'scale-110' : ''}`}>👍</span>
                  <span className="text-xs">Me gusta ({post.reactions.like})</span>
                </button>
                <button 
                  onClick={() => onReact(post.id, 'dislike')}
                  className={getReactionClass(post.userReaction === 'dislike', 'dislike')}
                >
                  <span className={`text-lg transition-transform ${post.userReaction === 'dislike' ? 'scale-110' : ''}`}>👎</span>
                  <span className="text-xs">No me gusta ({post.reactions.dislike})</span>
                </button>
                <button 
                  onClick={() => onReact(post.id, 'great')}
                  className={getReactionClass(post.userReaction === 'great', 'great')}
                >
                  <span className={`text-lg transition-transform ${post.userReaction === 'great' ? 'scale-110' : ''}`}>🤩</span>
                  <span className="text-xs">¡Genial! ({post.reactions.great})</span>
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AnnouncementFeed;