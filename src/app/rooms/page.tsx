'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { ConversationOptionsModal } from '@/components/ConversationOptionsModal';
import { theme, getHeadingStyle } from '@/styles/theme';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import Image from 'next/image';

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

export default function ConversationsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    is_private: true
  });
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [firstMessage, setFirstMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<{ id: string; name: string } | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const toggleSidebar = () => {
    console.log('Toggle sidebar called, current state:', sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  const fetchRooms = useCallback(async () => {
    try {
      setRoomsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.ROOMS), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        router.push('/login');
      }
    } catch {
      setError('Unable to fetch conversations');
    } finally {
      setRoomsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchRooms();
    fetchInvites();
  }, [router, fetchRooms]);

  // Handle responsive state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        // On desktop, keep the current state (don't auto-open)
        // This allows users to close it and keep it closed
      }
    };

    // Set initial state based on screen size
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchInvites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.INVITES), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvites(data);
      }
    } catch {
      setError('Unable to fetch invitations');
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.INVITE_ACCEPT(inviteId)), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh both rooms and invites
        fetchRooms();
        fetchInvites();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to accept invitation');
      }
    } catch {
      setError('Unable to accept invitation');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ROOMS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRoom)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewRoom({ name: '', is_private: true });
        fetchRooms();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create conversation');
      }
    } catch {
      setError('Unable to create conversation');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // New conversation creation flow
  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstMessage.trim()) return;
    setCreating(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Create a new room (use first message as name, or fallback)
      const roomName = firstMessage.length > 32 ? firstMessage.slice(0, 32) + '...' : firstMessage;
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ROOMS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: roomName, is_private: true })
      });
      if (response.ok) {
        const room = await response.json();
        // Send the first message
        await fetch(buildApiUrl(API_ENDPOINTS.ROOM_MESSAGES(room.id)), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: firstMessage })
        });
        setFirstMessage('');
        setCreating(false);
        router.push(`/chat/${room.id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create conversation');
        setCreating(false);
      }
    } catch {
      setError('Unable to create conversation');
      setCreating(false);
    }
  };

  const handleOpenOptions = (conversation: { id: string; name: string }) => {
    setSelectedConversation(conversation);
    setOptionsModalOpen(true);
    setOptionsError('');
  };

  const handleCloseOptions = () => {
    setOptionsModalOpen(false);
    setSelectedConversation(null);
    setOptionsError('');
  };

  const handleRenameConversation = async (id: string, newName: string) => {
    setOptionsLoading(true);
    setOptionsError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ROOM(id)), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      });
      if (response.ok) {
        fetchRooms();
        handleCloseOptions();
      } else {
        const data = await response.json();
        setOptionsError(data.error || 'Failed to rename conversation');
      }
    } catch {
      setOptionsError('Unable to rename conversation');
    }
    setOptionsLoading(false);
  };

  const handleDeleteConversation = async (id: string) => {
    setOptionsLoading(true);
    setOptionsError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ROOM(id)), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        fetchRooms();
        handleCloseOptions();
        // Optionally, redirect if the deleted conversation is open
      } else {
        const data = await response.json();
        setOptionsError(data.error || 'Failed to delete conversation');
      }
    } catch {
      setOptionsError('Unable to delete conversation');
    }
    setOptionsLoading(false);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: theme.colors.background.app }}>
      <Sidebar
        rooms={rooms}
        invites={invites}
        user={user}
        onAcceptInvite={handleAcceptInvite}
        onLogout={handleLogout}
        onShowCreateModal={() => setShowCreateModal(true)}
        onOpenOptions={handleOpenOptions}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={toggleSidebar}
        loading={roomsLoading}
      />
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center relative" style={{ backgroundColor: theme.colors.background.app }}>
        {/* Mobile menu button */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors z-20"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Centered form */}
        <form onSubmit={handleStartConversation} className="w-full max-w-lg mx-auto flex flex-col items-center relative z-10 px-4 -mt-64">
          {/* Covo Logo */}
          <Image 
            src="/covo.svg" 
            alt="Covo" 
            width={256}
            height={256}
            className="h-64 w-64 mb-4"
          />
          <h1 
            className="mb-4 md:mb-6 text-center text-gray-900"
            style={getHeadingStyle(1)}
          >
            Working on Something?
          </h1>
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base mb-4 text-gray-900 placeholder-gray-500"
            placeholder="Lets figure it out together..."
            value={firstMessage}
            onChange={e => setFirstMessage(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (firstMessage.trim() && !creating) {
                  handleStartConversation(e as React.FormEvent);
                }
              }
            }}
            disabled={creating}
          />
          {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}
        </form>
        
        {/* Bottom third with landscape SVG - absolutely positioned */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 m-0 p-0 z-0">
          <Image 
            src="/landscape.svg" 
            alt="Landscape" 
            width={1920}
            height={1080}
            className="w-full h-full object-cover m-0 p-0"
          />
        </div>
      </div>
      {/* Create conversation modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 
              className="text-gray-900 mb-4"
              style={getHeadingStyle(2)}
            >
              New Conversation
            </h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Conversation Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: theme.colors.modal.primary,
                    '--tw-ring-color': theme.colors.modal.primary
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.modal.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.modal.primary;
                  }}
                >
                  Create Conversation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConversationOptionsModal
        open={optionsModalOpen}
        onClose={handleCloseOptions}
        conversation={selectedConversation}
        onRename={handleRenameConversation}
        onDelete={handleDeleteConversation}
        loading={optionsLoading}
        error={optionsError}
      />
    </div>
  );
} 