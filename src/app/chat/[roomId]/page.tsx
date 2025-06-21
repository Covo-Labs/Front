'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { io } from 'socket.io-client';
import Link from 'next/link';
import { theme, getHeadingStyle } from '@/styles/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Message } from '@/components/chat/Message';
import { Sidebar } from '@/components/Sidebar';
import { ConversationOptionsModal } from '@/components/ConversationOptionsModal';
import { InviteModal } from '@/components/InviteModal';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    username: string;
  };
}

interface Room {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  created_by: string;
}

interface User {
  id: string;
  username: string;
  email: string;
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

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', is_private: true });
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<{ id: string; name: string } | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [roomsLoading, setRoomsLoading] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRoom = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ROOM(roomId)), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoom(data);
      } else {
        router.push('/rooms');
      }
    } catch {
      console.error('Unable to fetch room details');
    }
  }, [roomId, router]);

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ROOM_MESSAGES(roomId)), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.reverse());
      }
    } catch {
      console.error('Unable to fetch messages');
    }
  }, [roomId]);

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
      }
    } catch {
      console.error('Failed to fetch rooms');
    } finally {
      setRoomsLoading(false);
    }
  }, [router]);

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
      console.error('Failed to fetch invites');
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
        fetchRooms();
        fetchInvites();
      }
    } catch {
      console.error('Failed to accept invite');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ROOM_MESSAGES(roomId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
      }
    } catch {
    }
  };

  const handleInvite = () => {
    setInviteModalOpen(true);
    setInviteError('');
  };

  const handleInviteUser = async (username: string) => {
    setInviteLoading(true);
    setInviteError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ROOM_INVITE(roomId)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      if (response.ok) {
        setInviteModalOpen(false);
        setInviteLoading(false);
        setInviteError('');
      } else {
        const data = await response.json();
        setInviteError(data.error || 'Failed to send invitation');
        setInviteLoading(false);
      }
    } catch {
      setInviteError('Unable to send invitation');
      setInviteLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setCreating(true);
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
        setCreating(false);
        fetchRooms();
      } else {
        const data = await response.json();
        setModalError(data.error || 'Failed to create conversation');
        setCreating(false);
      }
    } catch {
      setModalError('Unable to create conversation');
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
        if (roomId === id) router.push('/rooms');
      } else {
        const data = await response.json();
        setOptionsError(data.error || 'Failed to delete conversation');
      }
    } catch {
      setOptionsError('Unable to delete conversation');
    }
    setOptionsLoading(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchRoom();
    fetchMessages();
    fetchRooms();
    fetchInvites();

    const token = localStorage.getItem('token');
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
    // Remove trailing slash to prevent double slashes in Socket.IO connection
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const newSocket = io(cleanBaseUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      extraHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      newSocket.emit('join_room', { room_id: roomId });
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('new_message', (message: Message) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, message]);
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leave_room', { room_id: roomId });
        newSocket.disconnect();
      }
    };
  }, [roomId, router, fetchRoom, fetchMessages, fetchRooms]);

  if (!room) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: theme.colors.background.app }}>
        <div className="text-center transition-opacity duration-300 opacity-100">
          <Image src="/loading.svg" alt="Loading" className="h-24 w-24 mx-auto" width={96} height={96} />
        </div>
      </div>
    );
  }

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
        loading={roomsLoading}
      />
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-gray-900"
                style={getHeadingStyle(4)}
              >
                {room.name}
              </h1>
              <p className="text-sm text-gray-500">{room.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleInvite}
                variant="secondary"
                className="p-2"
                title="Invite users"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </Button>
              <Link
                href="/rooms"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to conversations"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <Message
              key={message.id}
              content={message.content}
              username={message.users.username}
              timestamp={message.created_at}
              isOwnMessage={message.user_id === user?.id}
              isAI={message.user_id === '00000000-0000-0000-0000-000000000000'}
              userId={message.user_id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-base mb-4 text-gray-900 placeholder-gray-500"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className={`flex items-center justify-center h-12 w-12 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 border-0
                ${!newMessage.trim() ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{ backgroundColor: theme.colors.background.message.user, color: '#fff' }}
              variant="primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5l16.5-5.5-5.5 16.5-2.5-7-7-2.5z" />
              </svg>
            </Button>
          </form>
        </div>
      </div>
      <ConversationOptionsModal
        open={optionsModalOpen}
        onClose={handleCloseOptions}
        conversation={selectedConversation}
        onRename={handleRenameConversation}
        onDelete={handleDeleteConversation}
        loading={optionsLoading}
        error={optionsError}
      />
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
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Conversation'}
                </button>
              </div>
              {modalError && <p className="mt-4 text-red-600 text-sm">{modalError}</p>}
            </form>
          </div>
        </div>
      )}
      <InviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInviteUser}
        loading={inviteLoading}
        error={inviteError}
      />
    </div>
  );
} 