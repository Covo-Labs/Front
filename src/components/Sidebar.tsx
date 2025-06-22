import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { theme } from '@/styles/theme';

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

interface User {
  id: string;
  username: string;
  email: string;
}

interface SidebarProps {
  rooms: Room[];
  invites: Invite[];
  user: User | null;
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
          onClick={onClose}
        />
      )}
      <div className={`
        h-screen flex flex-col
        fixed md:relative
        z-50
        transition-all duration-300 ease-in-out
        border-r border-gray-200
        overflow-hidden
        ${isOpen ? 'w-72' : 'w-0'}
      `} style={{ backgroundColor: theme.colors.background.app }}>
        <div className="p-6" style={{ backgroundColor: theme.colors.background.app }}>
          <div className="flex items-center justify-between mb-6">
            <Link
              href={`/rooms`}>
              <svg
                width="30"
                height="30"
                viewBox="0 0 264.58333 264.58333"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m 91.926066,99.035695 c -0.416763,23.740255 -3.525568,64.668965 3.515975,74.921495 7.526099,10.95804 20.959809,4.2855 26.957909,10.49202 7.80984,8.08122 4.63704,24.00091 5.75633,31.01166 0.86472,5.41617 4.27024,11.3763 11.1334,12.11578 5.78444,0.62326 15.58083,1.30189 15.50979,-19.85188 -0.0513,-15.3031 -1.55689,-37.44166 -7.78627,-42.78995 -11.20309,-9.61854 -22.07022,5.21707 -27.15131,-19.21497 -2.15648,-10.3693 0.28464,-68.82443 0.14436,-77.866061 -0.3398,-21.901284 4.66006,-30.982293 14.90077,-30.783736 9.27799,0.179894 13.01285,7.559334 12.90331,31.434368 -0.0272,5.94865 -0.48783,22.945314 -0.69561,48.736809 -0.14124,17.52348 5.42401,22.11749 11.7512,22.72312 9.62278,0.92107 15.58196,-6.05829 15.74508,-21.21469 0.20234,-18.799783 0.38594,-43.438781 0.38594,-43.438781"
                  fill="none"
                  stroke="#44302d"
                  strokeWidth="16"
                  strokeLinecap="round"
                >
                </path>
              </svg>
            </Link>
            <div className="flex items-center space-x-">
              <button
                onClick={onShowCreateModal}
                className="p-1 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors"
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
                  <path d="M9 4v16" />
                  <path d="M15 10l-2 2l2 2" />
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
            <div className="bg-gray-50">
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
              <Image src="/loading.svg" alt="Loading" width={32} height={32} className="h-8 w-8" />
            </div>
          ) : (
            <div className="transition-opacity duration-300">
              {rooms.map((room) => (
                <div key={room.id} className="group flex items-center px-6 py-2 hover:opacity-20 transition-opacity">
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
        <div className="p-6" style={{ backgroundColor: theme.colors.background.app }}>
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