import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../core/context/AuthContext";
import { db } from "../../core/services/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment,
  doc,
} from "firebase/firestore";
import { FaRegThumbsUp, FaThumbsUp, FaReply } from "react-icons/fa";
import "./CommentSection.css";

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const { currentUser } = useAuth();

  const loadComments = useCallback(async () => {
    try {
      const commentsRef = collection(db, "posts", postId, "comments");
      const q = query(
        commentsRef,
        where("parentId", "==", null),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const commentsList = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const comment = { id: doc.id, ...doc.data() };
          // Alt yorumları yükle
          const repliesQuery = query(
            collection(db, "posts", postId, "comments"),
            where("parentId", "==", doc.id),
            orderBy("createdAt", "asc")
          );
          const repliesSnapshot = await getDocs(repliesQuery);
          comment.replies = repliesSnapshot.docs.map((reply) => ({
            id: reply.id,
            ...reply.data(),
          }));
          return comment;
        })
      );
      setComments(commentsList);
    } catch (error) {
      console.error("Yorumlar yüklenirken hata:", error);
      setError("Yorumlar yüklenirken bir hata oluştu.");
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Yorum yapmak için giriş yapmalısınız.");
      return;
    }

    if (!newComment.trim()) {
      setError("Lütfen bir yorum yazın.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const commentData = {
        content: newComment.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName,
        authorPhotoURL: currentUser.photoURL,
        parentId: replyTo,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "posts", postId, "comments"), commentData);

      // Post'un yorum sayısını güncelle
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: increment(1),
      });

      setNewComment("");
      setReplyTo(null);
      loadComments();
    } catch (error) {
      console.error("Yorum eklenirken hata:", error);
      setError("Yorum eklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!currentUser) {
      setError("Beğenmek için giriş yapmalısınız.");
      return;
    }

    try {
      const commentRef = doc(db, "posts", postId, "comments", commentId);
      await updateDoc(commentRef, {
        likes: increment(1),
      });
      loadComments();
    } catch (error) {
      console.error("Beğeni eklenirken hata:", error);
      setError("Beğeni eklenirken bir hata oluştu.");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const renderComment = (comment) => (
    <div
      key={comment.id}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
    >
      <div className="flex items-start">
        {/* Sol kenar - upvote/downvote */}
        <div className="flex flex-col items-center mr-3">
          <button
            onClick={() => handleLike(comment.id)}
            className={`p-1 rounded-full ${
              comment.likes > 0
                ? "text-primary-600 bg-primary-50"
                : "text-gray-400 hover:text-primary-500 hover:bg-gray-100"
            } transition-colors`}
            aria-label="Yorumu beğen"
          >
            {comment.likes > 0 ? (
              <FaThumbsUp size={14} />
            ) : (
              <FaRegThumbsUp size={14} />
            )}
          </button>
          <span
            className={`text-xs font-medium my-1 ${
              comment.likes > 0 ? "text-primary-600" : "text-gray-500"
            }`}
          >
            {comment.likes}
          </span>
        </div>

        {/* Yorum içeriği */}
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <img
              src={comment.authorPhotoURL}
              alt={comment.authorName}
              className="w-6 h-6 rounded-full mr-2"
            />
            <div className="flex items-center text-sm">
              <span className="font-medium text-gray-900 mr-2">
                {comment.authorName}
              </span>
              <span className="text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>

          <div className="text-gray-800 mb-3">{comment.content}</div>

          <div className="flex space-x-4">
            <button
              onClick={() => setReplyTo(comment.id)}
              className="inline-flex items-center text-xs text-gray-500 hover:text-primary-600"
            >
              <FaReply className="mr-1" />
              <span>Yanıtla</span>
            </button>
          </div>

          {/* Yanıt formu */}
          {replyTo === comment.id && (
            <div className="mt-3 pl-3 border-l-2 border-gray-200">
              <form
                onSubmit={(e) => handleSubmit(e, comment.id)}
                className="space-y-3"
              >
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  rows="3"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Gönderiliyor..." : "Yanıtla"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Alt yorumlar */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <img
                      src={reply.authorPhotoURL}
                      alt={reply.authorName}
                      className="w-5 h-5 rounded-full mr-2"
                    />
                    <div className="flex items-center text-xs">
                      <span className="font-medium text-gray-900 mr-2">
                        {reply.authorName}
                      </span>
                      <span className="text-gray-500">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-800 text-sm">{reply.content}</div>
                  <div className="flex space-x-4 mt-2">
                    <button
                      onClick={() => handleLike(reply.id)}
                      className="inline-flex items-center text-xs text-gray-500 hover:text-primary-600"
                    >
                      {reply.likes > 0 ? (
                        <FaThumbsUp
                          className="mr-1 text-primary-600"
                          size={12}
                        />
                      ) : (
                        <FaRegThumbsUp className="mr-1" size={12} />
                      )}
                      <span>{reply.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 overflow-hidden">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Yorumlar ({comments.length})
      </h3>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Ana yorum formu */}
      {currentUser ? (
        <div className="mb-8">
          <form onSubmit={(e) => handleSubmit(e, null)} className="space-y-4">
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Düşüncelerinizi paylaşın..."
                className="w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                rows="4"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Gönderiliyor..." : "Yorum Yap"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Yorum yapmak için{" "}
                <a href="/login" className="font-medium underline">
                  giriş yapın
                </a>{" "}
                veya{" "}
                <a href="/register" className="font-medium underline">
                  kayıt olun
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Yorumlar */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map(renderComment)
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Henüz yorum yapılmamış. İlk yorumu siz yapın!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
