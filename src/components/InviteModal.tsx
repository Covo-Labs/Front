import React, { useState, useEffect } from 'react';
import { getHeadingStyle } from '@/styles/theme';
import { theme } from '@/styles/theme';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (username: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function InviteModal({ open, onClose, onInvite, loading = false, error = '' }: InviteModalProps) {
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (open) {
      setUsername('');
      setLocalError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!username.trim()) {
      setLocalError('Please enter a username.');
      return;
    }
    await onInvite(username.trim());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h2 
          className="text-gray-900 mb-4"
          style={getHeadingStyle(4)}
        >
          Invite to Conversation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="invite-username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="invite-username"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
              placeholder="Enter username to invite"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          {(localError || error) && <p className="text-red-600 text-sm text-center">{localError || error}</p>}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
              disabled={loading}
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
                if (!loading) {
                  e.currentTarget.style.backgroundColor = theme.colors.modal.hover;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.modal.primary;
              }}
              disabled={loading}
            >
              {loading ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 