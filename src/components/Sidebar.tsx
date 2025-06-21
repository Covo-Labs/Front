import Link from 'next/link';
import { useState, useEffect } from 'react';
import { theme, getHeadingStyle } from '@/styles/theme';

interface Room {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  created_by: string;
  last_message?: {
    content: string;
    created_at: string;
  };
}

interface Invite {
  id: string;
  room_id: string;
  invited_by: string;
  invited_username: string;
  status: string;
  rooms: {
    name: string;
  };
}

interface SidebarProps {
  rooms: Room[];
  invites: Invite[];
  user: any;
  onAcceptInvite: (inviteId: string) => void;
  onLogout: () => void;
  onShowCreateModal: () => void;
  onOpenOptions: (conversation: { id: string; name: string }) => void;
  open?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  loading?: boolean;
}

export function Sidebar({ rooms, invites, user, onAcceptInvite, onLogout, onShowCreateModal, onOpenOptions, open, onClose, onToggle, loading }: SidebarProps) {
  // Use external state if provided, otherwise use internal state
  const [internalOpen, setInternalOpen] = useState(true);
  const isOpen = open !== undefined ? open : internalOpen;

  const toggleSidebar = () => {
    if (onToggle) {
      onToggle();
    } else if (onClose) {
      onClose();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => {
            if (onClose) {
              onClose();
            } else {
              setInternalOpen(false);
            }
          }}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 flex flex-col border-r border-gray-100
        ${!isOpen ? 'md:hidden' : ''}
      `} style={{ backgroundColor: theme.colors.background.app }}>
        <div className="p-6 border-b border-gray-100" style={{ backgroundColor: theme.colors.background.app }}>
          <div className="flex items-center justify-between mb-6">
            <h1 
              className="text-gray-900 tracking-tight"
              style={getHeadingStyle(2)}
            >
              Conversations
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={onShowCreateModal}
                className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
                aria-label="New conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-3 py-2 border border-gray-100 rounded-lg bg-gray-50 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Invitations section */}
          {invites.length > 0 && (
            <div className="border-b border-gray-100 bg-gray-50">
              <div className="px-4 py-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Invitations</h2>
              </div>
              {invites.map((invite) => (
                <div key={invite.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{invite.rooms.name}</p>
                    <p className="text-xs text-gray-400">Invited by {invite.invited_by}</p>
                  </div>
                  <button
                    onClick={() => onAcceptInvite(invite.id)}
                    className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 focus:outline-none"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Conversations list */}
          {loading ? (
            <div className="flex items-center justify-center py-8 transition-opacity duration-300">
              <img src="/loading.svg" alt="Loading" className="h-8 w-8" />
            </div>
          ) : (
            <div className="transition-opacity duration-300">
              {rooms.map((room) => (
                <div key={room.id} className="group flex items-center px-6 py-4 hover:opacity-20 transition-opacity border-b border-gray-50">
                  <Link
                    href={`/chat/${room.id}`}
                    className="flex-1 min-w-0"
                    onClick={() => {
                      // Close sidebar on mobile when clicking a conversation
                      if (window.innerWidth < 768) {
                        if (onClose) {
                          onClose();
                        } else {
                          setInternalOpen(false);
                        }
                      }
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-gray-900 truncate">{room.name}</span>
                      {room.last_message && (
                        <span className="text-xs text-gray-400 truncate mt-1">{room.last_message.content}</span>
                      )}
                    </div>
                  </Link>
                  <button
                    className="ml-2 p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Conversation options"
                    onClick={() => onOpenOptions({ id: room.id, name: room.name })}
                    tabIndex={0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100" style={{ backgroundColor: theme.colors.background.app }}>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-900 truncate">{user?.username}</span>
              <span className="block text-xs text-gray-400 truncate">{user?.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}