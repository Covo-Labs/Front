import { theme } from '@/styles/theme';
import React from 'react';

interface MessageProps {
  content: React.ReactNode;
  username: string;
  timestamp: string;
  isOwnMessage: boolean;
  isAI?: boolean;
  userId?: string;
  id?: string;
  loading?: boolean;
}

export function Message({ content, username, timestamp, isOwnMessage, isAI = false, userId, loading = false }: MessageProps) {
  // Get a consistent color for each user based on their ID
  const getUserColor = (id: string) => {
    if (!id) return theme.colors.background.message.users[0];
    // Convert the first 8 characters of the UUID to a number and use it to select a color
    const colorIndex = parseInt(id.slice(0, 8), 16) % theme.colors.background.message.users.length;
    return theme.colors.background.message.users[colorIndex];
  };

  const messageColor = isAI 
    ? theme.colors.background.message.ai 
    : getUserColor(userId || '');

  if (isAI) {
    return (
      <div className="flex justify-center my-4">
        <div className="w-full rounded-lg px-4 py-2 bg-gray-100 text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-800">
              Covo
            </span>
            {!loading && timestamp && (
              <span className="text-xs text-gray-500">
                {new Date(timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center space-x-1 py-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-gray-800">{content}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%]
          rounded-lg px-4 py-2
          text-white
          ${isOwnMessage ? '' : ''}
        `}
        style={isOwnMessage ? { backgroundColor: theme.colors.background.message.user } : !isAI ? { backgroundColor: messageColor } : undefined}
      >
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium">
            {isOwnMessage ? 'You' : username}
          </span>
          {timestamp && (
            <span className="text-xs opacity-75">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
} 