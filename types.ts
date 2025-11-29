export interface User {
  name: string;
  phone: string;
  password?: string; // Optional for mock data
}

export interface Message {
  id: string;
  text: string;
  imageUrl?: string;
  timestamp: Date;
  senderId: string; // 'me' or contact phone
  receiverId: string;
}

export interface Contact {
  name: string;
  phone: string;
  avatarColor: string;
  status: 'pending' | 'connected';
}

export interface ChatPreview {
  contact: Contact;
  lastMessage: Message | null;
}

export type ReactionType = 'like' | 'dislike' | 'great';

export interface Post {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  reactions: Record<ReactionType, number>;
  userReaction?: ReactionType;
}

export type PhotoReactionType = 'like' | 'love' | 'dislike';

export interface Photo {
  id: string;
  ownerId: string;
  url: string;
  reactions: Record<PhotoReactionType, number>;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}