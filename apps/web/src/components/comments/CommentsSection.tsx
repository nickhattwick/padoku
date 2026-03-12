import { useState } from 'react';
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from '../../api/queries';
import type { Comment } from '@paddock/shared';

interface CommentsSectionProps {
  workItemId: string;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than a minute
  if (diff < 60000) return 'just now';
  // Less than an hour
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  // Less than a day
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  // Less than a week
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  // Otherwise show date
  return date.toLocaleDateString();
};

const CommentItem = ({
  comment,
  onDelete,
  onUpdate,
}: {
  comment: Comment;
  onDelete: () => void;
  onUpdate: (content: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleSave = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onUpdate(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="group flex gap-3 py-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.user_picture ? (
          <img
            src={comment.user_picture}
            alt={comment.user_name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
            {(comment.user_name || 'A')[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">
            {comment.user_name || 'Anonymous'}
          </span>
          <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
          {comment.updated_at > comment.created_at && (
            <span className="text-xs text-gray-600">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const CommentsSection = ({ workItemId }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const { data: comments = [], isLoading } = useComments(workItemId);
  const createMutation = useCreateComment();
  const updateMutation = useUpdateComment();
  const deleteMutation = useDeleteComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createMutation.mutateAsync({ workItemId, content: newComment.trim() });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteMutation.mutateAsync({ workItemId, commentId });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleUpdate = async (commentId: string, content: string) => {
    try {
      await updateMutation.mutateAsync({ workItemId, commentId, content });
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-700">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-3"
      >
        <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          💬 Comments
          {comments.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-gray-700 rounded-full">
              {comments.length}
            </span>
          )}
        </h3>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <>
          {/* Comments list */}
          {isLoading ? (
            <div className="text-center text-gray-500 py-4">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 py-4 text-sm">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="divide-y divide-gray-800 mb-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onDelete={() => handleDelete(comment.id)}
                  onUpdate={(content) => handleUpdate(comment.id, content)}
                />
              ))}
            </div>
          )}

          {/* New comment form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || createMutation.isPending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createMutation.isPending ? '...' : 'Post'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CommentsSection;
