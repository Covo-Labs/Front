import React, { useState } from 'react';
import { getHeadingStyle } from '@/styles/theme';
import { theme } from '@/styles/theme';

interface Conversation {
  id: string;
  name: string;
}

interface ConversationOptionsModalProps {
  open: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function ConversationOptionsModal({
  open,
  onClose,
  conversation,
  onRename,
  onDelete,
  loading = false,
  error = ''
}: ConversationOptionsModalProps) {
  const [newName, setNewName] = useState(conversation?.name || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  React.useEffect(() => {
    setNewName(conversation?.name || '');
    setConfirmDelete(false);
  }, [conversation, open]);

  if (!open || !conversation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h2 
          className="text-gray-900 mb-4"
          style={getHeadingStyle(4)}
        >
          Conversation Options
        </h2>
        <div className="mb-6">
          <label htmlFor="rename" className="block text-sm font-medium text-gray-700 mb-1">
            Rename Conversation
          </label>
          <input
            id="rename"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            disabled={loading}
          />
          <button
            className="mt-3 w-full px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
            style={{ 
              backgroundColor: theme.colors.modal.primary,
              '--tw-ring-color': theme.colors.modal.primary
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              if (!loading && newName.trim() && newName !== conversation.name) {
                e.currentTarget.style.backgroundColor = theme.colors.modal.hover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.modal.primary;
            }}
            disabled={loading || !newName.trim() || newName === conversation.name}
            onClick={() => onRename(conversation.id, newName)}
          >
            Save
          </button>
        </div>
        <div className="mb-6">
          <button
            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: theme.colors.modal.light,
              color: theme.colors.modal.danger,
              '--tw-ring-color': theme.colors.modal.danger
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#FEE2E2'; // Light red background
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.modal.light;
            }}
            onClick={() => setConfirmDelete(true)}
            disabled={loading}
          >
            Delete Conversation
          </button>
        </div>
        {confirmDelete && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700 mb-2">Are you sure you want to delete this conversation? This action cannot be undone.</p>
            <div className="flex space-x-2">
              <button
                className="flex-1 px-4 py-2 text-white rounded hover:bg-red-700"
                style={{ backgroundColor: theme.colors.modal.danger }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.modal.dangerHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.modal.danger;
                }}
                onClick={() => onDelete(conversation.id)}
                disabled={loading}
              >
                Confirm Delete
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                onClick={() => setConfirmDelete(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {error && <p className="mt-2 text-red-600 text-sm text-center">{error}</p>}
        <button
          className="mt-2 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none"
          onClick={onClose}
          disabled={loading}
        >
          Close
        </button>
      </div>
    </div>
  );
} 