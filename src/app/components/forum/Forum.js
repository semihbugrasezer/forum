import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../core/context/AuthContext";
import { HeartIcon } from "@heroicons/react/24/outline";
import { getTopicById, addReply } from "../../shared/services/forumService";

const Forum = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [topic, setTopic] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await getTopicById(id);
        setTopic(data);
      } catch (error) {
        console.error("Konu yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      const reply = {
        content: newReply,
        author: {
          id: currentUser.uid,
          name: currentUser.displayName || "Anonim",
          avatar:
            currentUser.photoURL ||
            `https://i.pravatar.cc/150?u=${currentUser.uid}`,
        },
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      await addReply(id, reply);
      setTopic((prev) => ({
        ...prev,
        replies: [...prev.replies, reply],
      }));
      setNewReply("");
    } catch (error) {
      console.error("Yanıt eklenirken hata oluştu:", error);
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (!topic) {
    return <div>Konu bulunamadı.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{topic.title}</h1>
        <div
          className="prose prose-blue max-w-none"
          dangerouslySetInnerHTML={{ __html: topic.content }}
        />
      </div>

      <div className="space-y-4">
        {topic.replies.map((reply) => (
          <div key={reply.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-4">
              <img
                src={reply.author.avatar}
                alt={reply.author.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">
                    {reply.author.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-700">{reply.content}</p>
                <div className="mt-4 flex items-center space-x-4">
                  <button className="flex items-center text-sm text-gray-500 hover:text-blue-600">
                    <HeartIcon className="h-4 w-4 mr-1" />
                    {reply.likes}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentUser && (
        <form onSubmit={handleReplySubmit} className="mt-6">
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            placeholder="Yanıtınızı yazın..."
          />
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Yanıt Gönder
          </button>
        </form>
      )}
    </div>
  );
};

export default Forum;
