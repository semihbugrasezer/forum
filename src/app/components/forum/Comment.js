import React, { useState } from "react";
import { useAuth } from "../../core/context/AuthContext";
import { toggleCommentLike } from "../../../lib/actions/likes";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

const Comment = ({ comment, topicId }) => {
  const [likes, setLikes] = useState(comment.like_count || 0);
  const [isLiked, setIsLiked] = useState(comment.user_has_liked || false);
  const { currentUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      const result = await toggleCommentLike(comment.id, topicId);
      if (result.success) {
        setIsLiked(!isLiked);
        setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Comment like failed:", error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();

    if (!currentUser || !replyContent.trim()) return;

    // Logic to submit reply will go here
    setShowReplyForm(false);
    setReplyContent("");
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: tr,
      });
    } catch (error) {
      return "bilinmeyen tarih";
    }
  };

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0">
      <div className="flex">
        {/* Voting Column */}
        <div className="flex flex-col items-center mr-4">
          <button
            onClick={handleLike}
            className={`p-1 rounded hover:bg-gray-100 ${
              isLiked ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <ArrowUpIcon className="h-5 w-5" />
          </button>
          <span className="text-xs font-medium my-1">{likes}</span>
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <img
              src={comment.user_avatar || "/default-avatar.png"}
              alt={comment.user_name}
              className="h-6 w-6 rounded-full mr-2"
            />
            <div className="flex flex-wrap items-center">
              <span className="font-medium text-sm mr-2">
                {comment.user_name}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-800 mb-3">{comment.content}</div>

          <div className="flex items-center space-x-4 text-xs">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-gray-500 hover:text-blue-500"
            >
              Yanıtla
            </button>
            <button className="text-gray-500 hover:text-red-500">
              <FlagIcon className="h-4 w-4 inline-block mr-1" />
              Rapor Et
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
              <form onSubmit={handleReply}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="2"
                  required
                ></textarea>
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                  >
                    Yanıtla
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Nested replies would go here */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-gray-100">
              {comment.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} topicId={topicId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
