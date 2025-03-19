import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  FlagIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../core/context/AuthContext";
import { getTopic, addReply } from "../../shared/services/forumService";
import { createReport } from "../../shared/services/reportService";
import { toggleTopicLike } from "../../../lib/actions/likes";
import { createComment } from "../../../lib/actions/comments";
import Comment from "./Comment";

const ReplyInput = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (content.trim() && onSubmit) {
      onSubmit(content);
      setContent("");
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-gray-100 p-4 text-center rounded-lg">
        Yorum yazmak için{" "}
        <Link to="/login" className="text-blue-600">
          giriş yapın
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Yorumunuzu yazın..."
        className="w-full border rounded-lg p-4 min-h-[120px]"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
      >
        Gönder
      </button>
    </form>
  );
};

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [topic, setTopic] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const topicData = await getTopic(id);
        setTopic(topicData);
        setLikes(topicData.likes || 0);
        setComments(topicData.comments || []);

        // Check if user has liked this topic
        if (topicData.user_has_liked && currentUser) {
          setIsLiked(true);
        }

        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id, currentUser]);

  const handleUpvote = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const result = await toggleTopicLike(id);
      if (result.success) {
        setIsLiked(!isLiked);
        setLikes((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1));
      }
    } catch (err) {
      console.error("Beğeni işlemi sırasında hata oluştu:", err);
    }
  };

  const handleReply = async (reply) => {
    try {
      await addReply(id, reply);
      setTopic((prev) => ({
        ...prev,
        replies: [...(prev.replies || []), reply],
      }));
    } catch (error) {
      console.error("Yanıt eklenemedi:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const result = await createComment({
        content: newComment,
        topic_id: id,
      });

      if (result.success) {
        setNewComment("");
        // Reload topic to get updated comments
        const updatedTopic = await getTopic(id);
        setTopic(updatedTopic);
        setComments(updatedTopic.comments || []);
      }
    } catch (err) {
      console.error("Comment adding failed:", err);
    }
  };

  const handleReportTopic = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      await createReport({
        topicId: id,
        reason: "Uygunsuz içerik",
      });
      alert("Konu başarıyla rapor edildi.");
    } catch (error) {
      console.error("Rapor oluşturulamadı:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-5 w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded mb-5"></div>
          <div className="h-8 bg-gray-200 rounded mb-3 w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          Konu yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {/* Topic Header */}
        <div className="p-6">
          <div className="flex items-start">
            {/* Voting */}
            <div className="flex flex-col items-center mr-4">
              <button
                onClick={handleUpvote}
                className={`p-1 rounded hover:bg-gray-100 ${
                  isLiked ? "text-blue-500" : "text-gray-400"
                }`}
              >
                <ArrowUpIcon className="h-6 w-6" />
              </button>
              <span className="font-medium text-sm my-1">{likes}</span>
            </div>

            {/* Topic Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {topic.title}
              </h1>
              <div className="prose max-w-none mb-4">{topic.content}</div>

              {topic.image_url && (
                <div className="mt-4 mb-4">
                  <img
                    src={topic.image_url}
                    alt={topic.title}
                    className="rounded-lg max-h-96 mx-auto"
                  />
                </div>
              )}

              {/* Meta information */}
              <div className="flex items-center text-sm text-gray-500 mt-4">
                <img
                  src={topic.user_avatar || "/default-avatar.png"}
                  alt={topic.user_name}
                  className="h-6 w-6 rounded-full mr-2"
                />
                <span className="mr-3">{topic.user_name}</span>
                <span>
                  {new Date(topic.created_at).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Actions */}
        <div className="bg-gray-50 px-6 py-3 flex justify-between border-t border-gray-100">
          <div className="flex space-x-4">
            <button className="flex items-center text-gray-500 hover:text-blue-500">
              <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
              <span>{topic.comment_count || comments.length || 0} Yorum</span>
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleReportTopic}
              className="flex items-center text-gray-500 hover:text-red-500"
            >
              <FlagIcon className="h-5 w-5 mr-1" />
              <span>Rapor Et</span>
            </button>
            <button className="flex items-center text-gray-500 hover:text-blue-500">
              <ShareIcon className="h-5 w-5 mr-1" />
              <span>Paylaş</span>
            </button>
            <button
              className="flex items-center text-gray-500 hover:text-yellow-500"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <BookmarkIcon
                className={`h-5 w-5 mr-1 ${
                  isBookmarked ? "fill-yellow-500 text-yellow-500" : ""
                }`}
              />
              <span>Kaydet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 p-6">
        <h3 className="text-lg font-medium mb-4">Yorum Yap</h3>
        <form onSubmit={handleAddComment}>
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorumunuzu buraya yazın..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              required
            ></textarea>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Gönder
            </button>
          </div>
        </form>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-6">
            Yorumlar ({topic.comment_count || comments.length || 0})
          </h3>

          {comments.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Bu konuya henüz yorum yapılmamış. İlk yorumu siz yapın!
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <Comment key={comment.id} comment={comment} topicId={id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;
