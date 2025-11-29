import React from 'react';
import { Contact } from '../types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, contacts, onSelectContact }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full h-[80vh] flex flex-col">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-white">
              Mis Contactos
            </h3>
            <button onClick={onClose} className="text-indigo-200 hover:text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-0">
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                <p>No tienes contactos agregados.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {contacts.map((contact) => (
                  <li 
                    key={contact.phone} 
                    onClick={() => contact.status === 'connected' && onSelectContact(contact)}
                    className={`px-4 py-3 flex items-center space-x-3 transition-colors ${
                      contact.status === 'connected' 
                        ? 'hover:bg-gray-50 cursor-pointer active:bg-gray-100' 
                        : 'opacity-60 cursor-not-allowed bg-gray-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${contact.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contact.phone}
                      </p>
                    </div>
                    <div>
                      {contact.status === 'pending' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pendiente
                        </span>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;