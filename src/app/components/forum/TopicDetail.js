import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  // eslint-disable-next-line no-unused-vars
  ArrowUpIcon,
  // eslint-disable-next-line no-unused-vars
  ArrowDownIcon,
  // eslint-disable-next-line no-unused-vars
  ChatBubbleLeftIcon,
  ShareIcon,
  FlagIcon,
  // eslint-disable-next-line no-unused-vars
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../core/context/AuthContext";
import { getTopic, addReply } from "../../shared/services/forumService";
import { createReport } from "../../shared/services/reportService";

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
        Yorum yazmak için <Link to="/login" className="text-blue-600">giriş yapın</Link>
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

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const topicData = await getTopic(id);
        setTopic(topicData);
        setLikes(topicData.likes || 0);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  const handleUpvote = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      // Simulated upvote logic
      // TODO: Implement actual upvote mechanism in your backend service
      setLikes(prev => prev + 1);
    } catch (error) {
      console.error("Upvote failed:", error);
    }
  };

  const handleDownvote = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      // Simulated downvote logic
      // TODO: Implement actual downvote mechanism in your backend service
      setLikes(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Downvote failed:", error);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement actual bookmark logic in your service
  };

  const handleReplySubmit = async (content) => {
    if (!currentUser) return;

    const reply = {
      content,
      author: {
        id: currentUser.uid,
        username: currentUser.displayName,
        avatar: currentUser.photoURL
      },
      createdAt: new Date()
    };

    try {
      await addReply(id, reply);
      setTopic(prev => ({
        ...prev,
        replies: [...(prev.replies || []), reply]
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

    try {
      const reply = {
        content: newComment,
        author: {
          id: currentUser.uid,
          username: currentUser.displayName,
          avatar: currentUser.photoURL,
        },
      };

      await addReply(id, reply);
      setNewComment("");
      // Refresh topic to show new comment
      const updatedTopic = await getTopic(id);
      setTopic(updatedTopic);
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
        reporterId: currentUser.uid,
        reason: 'inappropriate',
        description: 'Kullanıcı tarafından uygunsuz içerik olarakişaretlendi'
      });
      alert("Konu başarıyla raporlandı.");
    } catch (err) {
      console.error("Topic reporting failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 min-h-screen">
        Bir hata oluştu: {error.message}
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center min-h-screen">
        Konu bulunamadı.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Voting Section */}
        <div className="flex items-center space-x-4 mb-4">
          <button 
            onClick={handleUpvote}
            className="text-gray-500 hover:text-green-500 transition"
          >
            <ArrowUpIcon className="h-6 w-6" />
          </button>
          <span className="text-lg font-semibold">{likes}</span>
          <button 
            onClick={handleDownvote}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <ArrowDownIcon className="h-6 w-6" />
          </button>
          <button 
            onClick={handleBookmark}
            className={`text-gray-500 ${isBookmarked ? 'text-blue-500' : ''} hover:text-blue-500 transition`}
          >
            <BookmarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Topic Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {topic.title}
            </h1>
            <div className="flex items-center text-gray-600">
              <img 
                src={topic.author?.avatar || '/default-avatar.png'} 
                alt={topic.author?.username} 
                className="w-8 h-8 rounded-full mr-2"
              />
              <span>{topic.author?.username}</span>
              <span className="mx-2">•</span>
              <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleReportTopic}
              className="text-gray-500 hover:text-red-500 transition"
              title="Konuyu Raporla"
            >
              <FlagIcon className="h-6 w-6" />
            </button>
            <button 
              className="text-gray-500 hover:text-blue-500 transition"
              title="Paylaş"
            >
              <ShareIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Topic Content */}
        <div className="prose max-w-none mb-8">
          <p>{topic.content}</p>
        </div>

        {/* Tags */}
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex space-x-2 mb-6">
            {topic.tags.map((tag) => (
              <span 
                key={tag} 
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">
            Yorumlar ({topic.replies?.length || 0})
          </h2>

          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              className="w-full border rounded-lg p-4 mb-2"
              rows={4}
              required
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Yorumu Gönder
            </button>
          </form>

          {/* Comments List */}
          {topic.replies && topic.replies.length > 0 ? (
            topic.replies.map((reply) => (
              <div 
                key={reply.id} 
                className="border-b pb-4 mb-4 last:border-b-0"
              >
                <div className="flex items-center mb-2">
                  <img 
                    src={reply.author?.avatar || '/default-avatar.png'} 
                    alt={reply.author?.username} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="font-medium">{reply.author?.username}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <p>{reply.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">
              Henüz yorum yapılmamış.
            </p>
          )}
        </div>
      </div>
      <ReplyInput onSubmit={handleReplySubmit} />
    </div>
  );
};

export default TopicDetail;